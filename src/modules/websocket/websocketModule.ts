// ========================================
// WebSocket Module - Level 2-3 Engineering Depth
// Protocol handshake, framing, heartbeat, rooms, scaling
// ========================================

import type { ModuleConfig, SystemNode, Connection } from "../../engine/types/system.types";

const nodes: SystemNode[] = [
    {
        id: "client",
        name: "Client",
        icon: "🌐",
        category: "client",
        runtime: "event-loop",
        position: { x: 60, y: 200 },
        state: "idle",
        metadata: { api: "new WebSocket('wss://...')" },
        explanation: "What: The client creates a WebSocket connection using the browser's WebSocket API. The connection starts as an HTTP request with special headers. Why: WebSocket provides full-duplex communication - both sides can send data at any time without waiting. HTTP is half-duplex (request then response). Breaks when: You use ws:// instead of wss:// in production - unencrypted WebSocket traffic can be intercepted. Always use WSS (WebSocket Secure, over TLS).",
    },
    {
        id: "http-upgrade",
        name: "HTTP Upgrade",
        icon: "🔄",
        category: "middleware",
        runtime: "event-loop",
        position: { x: 200, y: 80 },
        state: "idle",
        metadata: { headers: "Upgrade: websocket, Connection: Upgrade, Sec-WebSocket-Key", status: "101 Switching Protocols" },
        explanation: "What: The WebSocket handshake starts as a regular HTTP GET with 'Upgrade: websocket' and 'Connection: Upgrade' headers plus a random Sec-WebSocket-Key. The server responds with 101 and a Sec-WebSocket-Accept (SHA-1 hash of key + magic GUID). Why: Starting as HTTP allows WebSocket to work through firewalls and proxies that only allow HTTP. The key exchange prevents caching proxies from replaying connections. Breaks when: A reverse proxy (nginx) doesn't forward Upgrade headers - the handshake fails silently. Configure: proxy_set_header Upgrade $http_upgrade;",
    },
    {
        id: "ws-server",
        name: "WS Server",
        icon: "🔌",
        category: "service",
        runtime: "event-loop",
        position: { x: 200, y: 320 },
        state: "idle",
        metadata: { library: "ws, Socket.IO, µWebSockets", perConnection: "socket object + event listeners" },
        explanation: "What: The WebSocket server (ws library, Socket.IO, or µWebSockets) manages persistent TCP connections. Each connected client gets a socket object. The server tracks all active sockets in memory. Why: Unlike HTTP (stateless), WebSocket connections are stateful - the server knows WHO is connected. This enables server-initiated push. Breaks when: Too many concurrent connections exhaust memory. Each socket uses ~10-50KB. 100K connections = 1-5GB RAM. Use µWebSockets for high-connection scenarios (uses less memory per connection).",
    },
    {
        id: "frame-parser",
        name: "Frame Parser",
        icon: "📦",
        category: "service",
        runtime: "event-loop",
        position: { x: 380, y: 80 },
        state: "idle",
        metadata: { format: "2-14 byte header + payload", opcodes: "text(0x1), binary(0x2), close(0x8), ping(0x9), pong(0xA)" },
        explanation: "What: WebSocket data travels as 'frames' - small packets with a 2-14 byte header containing opcode (message type), payload length, and masking key. Frames can be text, binary, ping/pong, or close. Why: The lightweight frame format has minimal overhead (~2 bytes for messages under 126 bytes). Compare: HTTP adds ~800 bytes of headers per request. For real-time data (game state, stock prices), this 400x reduction in overhead matters. Breaks when: Message fragmentation isn't handled - large messages are split across multiple frames. Also: client-to-server frames MUST be masked (XOR with masking key); unmasked frames cause connection termination.",
    },
    {
        id: "heartbeat",
        name: "Heartbeat (Ping/Pong)",
        icon: "💓",
        category: "middleware",
        runtime: "event-loop",
        position: { x: 380, y: 200 },
        state: "idle",
        metadata: { interval: "30s typically", purpose: "detect dead connections" },
        explanation: "What: The server periodically sends Ping frames (opcode 0x9). Clients respond with Pong. If no Pong is received within the timeout, the server closes the connection and cleans up resources. Why: TCP connections can die silently (client loses network, browser tab closes uncleanly). Without heartbeat, the server holds 'zombie' sockets that consume memory and file descriptors. Breaks when: Heartbeat interval is too aggressive (battery drain on mobile) or too lenient (zombie connections accumulate). Also: some corporate proxies terminate idle connections after 60s - heartbeat keeps the connection alive.",
    },
    {
        id: "event-handler",
        name: "Event Router",
        icon: "⚡",
        category: "service",
        runtime: "event-loop",
        position: { x: 380, y: 320 },
        state: "idle",
        metadata: { pattern: "socket.on('event', handler)", protocol: "event-driven, not request/response" },
        explanation: "What: Incoming messages are routed to event handlers. Socket.IO uses named events (socket.on('chat:message', fn)), raw ws uses message types. Handlers are event-driven - they fire when data arrives, not on a poll cycle. Why: Event-driven architecture is natural for real-time: a handler for 'user:typing', one for 'chat:message', one for 'user:disconnect'. Each concern is isolated. Breaks when: You put heavy computation in a handler - it blocks the event loop and stalls ALL other WebSocket connections. Offload to worker threads.",
    },
    {
        id: "rooms",
        name: "Rooms / Channels",
        icon: "🏠",
        category: "service",
        runtime: "event-loop",
        position: { x: 560, y: 80 },
        state: "idle",
        metadata: { api: "socket.join('room'), io.to('room').emit()", maxPerSocket: "unlimited" },
        explanation: "What: Rooms (Socket.IO) or channels organize sockets into groups. socket.join('game:123') adds the user to a room. io.to('game:123').emit('update', data) sends to everyone in that room. A socket can be in multiple rooms. Why: Without rooms, you'd broadcast to ALL connected users. Rooms enable targeted messaging: only users in 'chat:general' get chat messages. This is functionally pub/sub. Breaks when: You have thousands of rooms with few users each - room management overhead increases. Also: rooms are server-local by default - scaling to multiple servers requires a Redis adapter.",
    },
    {
        id: "broadcast",
        name: "Broadcast",
        icon: "📡",
        category: "gateway",
        runtime: "event-loop",
        position: { x: 560, y: 200 },
        state: "idle",
        metadata: { modes: "broadcast (all), to (room), emit (single), except (exclude sender)" },
        explanation: "What: Broadcast sends data to multiple sockets. Modes: io.emit() (ALL connected), io.to('room').emit() (room members), socket.broadcast.emit() (all EXCEPT sender). Why: Different use cases need different scopes. A chat message broadcasts to the room, a typing indicator skips the sender (they know they're typing), a system alert goes to everyone. Breaks when: You broadcast to ALL connections when you should use rooms - unnecessary data transfer and CPU for serialization. For 10K connections, each broadcast serializes the payload 10K times.",
    },
    {
        id: "subscribers",
        name: "Subscribers",
        icon: "👥",
        category: "client",
        runtime: "event-loop",
        position: { x: 560, y: 320 },
        state: "idle",
        metadata: { delivery: "real-time push, no polling", reconnection: "automatic with backoff" },
        explanation: "What: Subscribed clients receive broadcast messages in real-time - typically within 1-10ms on a local network. Socket.IO clients have built-in reconnection with exponential backoff. Why: Push eliminates polling latency and wasted bandwidth. Instead of asking 'anything new?' every second (1 req/s per client), the server pushes only when there IS something new. Breaks when: A client reconnects after a network drop and misses messages sent during the outage. Solution: use message queues or store recent messages and send them on reconnect (event replay).",
    },
];

const connections: Connection[] = [
    {
        id: "c1", source: "client", target: "http-upgrade", protocol: "http", latency: 30,
        reason: "Client sends GET / HTTP/1.1 with Upgrade:websocket and Connection:Upgrade headers. This is the WebSocket handshake - it starts as HTTP to pass through firewalls and proxies, then upgrades to the WebSocket protocol.",
    },
    {
        id: "c2", source: "http-upgrade", target: "ws-server", protocol: "websocket", latency: 5,
        reason: "Server responds 101 Switching Protocols with Sec-WebSocket-Accept. The TCP connection is now full-duplex WebSocket. From this point, no more HTTP headers - data flows as lightweight binary frames.",
    },
    {
        id: "c3", source: "ws-server", target: "frame-parser", protocol: "websocket", latency: 5,
        reason: "Incoming data is parsed as WebSocket frames. The frame header (2-14 bytes) contains opcode, payload length, and masking key. Text frames (opcode 0x1) contain UTF-8 data. Binary frames (0x2) carry raw bytes.",
    },
    {
        id: "c4", source: "frame-parser", target: "heartbeat", protocol: "websocket", latency: 5,
        reason: "Ping/Pong frames (opcodes 0x9/0xA) are handled by the heartbeat system. Regular data frames pass through to the event router. This separation ensures heartbeat processing doesn't interfere with application logic.",
    },
    {
        id: "c5", source: "heartbeat", target: "event-handler", protocol: "websocket", latency: 5,
        reason: "Data frame arrives at the event router. The message is deserialized (JSON.parse for text frames) and matched to the appropriate handler. socket.on('chat:message') fires for messages with that event name.",
    },
    {
        id: "c6", source: "event-handler", target: "rooms", protocol: "websocket", latency: 5,
        reason: "Handler decides the message scope. For a chat message, it routes to the room: io.to('chat:general').emit('message', data). The rooms system looks up which sockets are in 'chat:general'.",
    },
    {
        id: "c7", source: "rooms", target: "broadcast", protocol: "websocket", latency: 5,
        reason: "Room resolution complete - the broadcast system has the list of target sockets. It serializes the payload once and writes it to each socket's send buffer. Serialization is the bottleneck for large broadcasts.",
    },
    {
        id: "c8", source: "broadcast", target: "subscribers", protocol: "websocket", latency: 10,
        reason: "Each subscriber receives the message via their persistent WebSocket connection. No HTTP overhead, no connection establishment - just the frame payload. Delivery is near-instant (<10ms on local network).",
    },
];

export function getWebSocketModuleConfig(): ModuleConfig {
    return {
        moduleId: "websockets",
        nodes,
        connections,
        initialPackets: [
            {
                id: "pkt_ws",
                protocol: "websocket",
                payload: "socket.emit('chat:message', { text: 'Hello', room: 'general' })",
                label: "WS Chat Message",
                currentNodeId: "client",
                sourceNodeId: "client",
                targetNodeId: "http-upgrade",
                path: ["client"],
                progress: 0,
                status: "pending",
                createdAt: Date.now(),
            },
        ],
        whyModePrompts: [
            {
                question: "Why does WebSocket start with an HTTP request instead of connecting directly?",
                options: [
                    { label: "WebSocket is just a wrapper around HTTP", isCorrect: false },
                    { label: "The HTTP Upgrade handshake allows WebSocket to pass through firewalls and proxies that only allow HTTP", isCorrect: true },
                    { label: "Browsers don't support non-HTTP connections", isCorrect: false },
                    { label: "HTTP is required by the TCP specification", isCorrect: false },
                ],
                correctIndex: 1,
                explanation: "WebSocket 'piggybacks' on HTTP for the handshake to work with existing infrastructure (firewalls, proxies, load balancers). After the 101 response, the protocol switches - it's no longer HTTP. The Sec-WebSocket-Key exchange prevents replay attacks by caching proxies.",
                connectionId: "c1",
                nodeId: "http-upgrade",
            },
            {
                question: "The server has 10,000 connected WebSocket clients. A client disconnects without sending a close frame (network drop). How does the server detect this?",
                options: [
                    { label: "The server detects it immediately via TCP", isCorrect: false },
                    { label: "Ping/Pong heartbeat - if the client doesn't respond to Ping within the timeout, the server closes the socket", isCorrect: true },
                    { label: "The client automatically reconnects and the server notices", isCorrect: false },
                    { label: "It doesn't - the connection stays open forever", isCorrect: false },
                ],
                correctIndex: 1,
                explanation: "TCP doesn't detect network drops instantly - a silently disconnected client leaves a 'zombie' socket consuming memory and file descriptors. Periodic Ping/Pong (every 30s) detects dead connections within the timeout window. Without heartbeat, zombie sockets accumulate until the server runs out of resources.",
                connectionId: "c4",
                nodeId: "heartbeat",
            },
            {
                question: "You need to scale your WebSocket server to 3 instances behind a load balancer. What problem occurs?",
                options: [
                    { label: "WebSocket doesn't work with load balancers", isCorrect: false },
                    { label: "Each server only knows its OWN connected sockets - broadcasting from server A doesn't reach clients on server B", isCorrect: true },
                    { label: "Clients can't reconnect to a different server", isCorrect: false },
                    { label: "No problem - it works automatically", isCorrect: false },
                ],
                correctIndex: 1,
                explanation: "Rooms and broadcasts are server-local. If User A is on Server 1 and User B is on Server 2, broadcasting from Server 1 doesn't reach Server 2. Solution: use a Redis adapter (socket.io-redis) - publish/subscribe across servers so all instances share broadcast events.",
                connectionId: "c7",
                nodeId: "rooms",
            },
        ],
        learningStory: {
            title: "The Magic Telephone",
            content: "WebSockets are like a magic telephone line that stays open forever! Usually, the internet is like writing a letter (HTTP)-you send a question, wait for a mail carrier, and get an answer later. But with WebSockets, both you and the server have phones to your ears and can talk to each other at the same time, as much as you want!",
            analogy: "A walkie-talkie where you can keep the button pressed and talk back and forth instantly, instead of waiting for a slow mail carrier.",
            lookFor: "Look at the 'Full Duplex' connections. Unlike standard arrows, these stay 'glowing' to show the line is open, letting 'Broadcast' events fly out to 'Subscribers' instantly!"
        }
    };
}
