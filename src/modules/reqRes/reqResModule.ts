import type { ModuleConfig, SystemNode, Connection } from "../../engine/types/system.types";

const nodes: SystemNode[] = [
    {
        id: "browser",
        name: "Browser",
        icon: "🌐",
        category: "client",
        runtime: "event-loop",
        position: { x: 50, y: 150 },
        state: "idle",
        metadata: { action: "User typed mernverse.com" },
        explanation: "What: The browser initiates the request. Why: It's the client interface representing the user. Breaks without it: No requests would ever start in this web context. The web browser translates user intent into network requests.",
    },
    {
        id: "dns",
        name: "DNS Resolver",
        icon: "🌍",
        category: "service",
        runtime: "event-loop",
        position: { x: 200, y: 150 },
        state: "idle",
        metadata: { record: "A record -> 192.168.1.10" },
        explanation: "What: Resolves the human-readable domain name (mernverse.com) to a machine-routable IP address. Why: The Internet routes packets via IP addresses, not domain names. Breaks without it: You'd have to memorize and type '198.51.100.1' into the URL bar to reach the server.",
    },
    {
        id: "tcp",
        name: "TCP Handshake",
        icon: "🤝",
        category: "middleware",
        runtime: "event-loop",
        position: { x: 350, y: 150 },
        state: "idle",
        metadata: { protocol: "TCP/IP TLS 1.3" },
        explanation: "What: Performs the SYN/SYN-ACK/ACK network handshake to establish a reliable connection. Why: HTTP over TCP requires an established reliable socket connection before any data packets can be transmitted. Breaks without it: The server and client wouldn't have a reliable, ordered communication channel.",
    },
    {
        id: "server",
        name: "Server (Node/Express)",
        icon: "🚂",
        category: "service",
        runtime: "event-loop",
        position: { x: 500, y: 150 },
        state: "idle",
        metadata: { status: "Listening on port 443" },
        explanation: "What: The backend web server running Node.js and Express. Why: It receives the structured HTTP request, processes routing, and prepares to return content. Breaks without it: There would be no backend logic to dynamically respond to user requests.",
    },
    {
        id: "cache",
        name: "Cache Layer",
        icon: "⚡",
        category: "database",
        runtime: "event-loop",
        position: { x: 650, y: 150 },
        state: "idle",
        metadata: { cacheHit: "Miss or Hit" },
        explanation: "What: An intermediary or internal caching system checking for pre-computed responses. Why: Delivering cached data prevents querying databases or regenerating static HTML, speeding up the response. Breaks without it: The system handles all requests fresh, hurting performance at scale.",
    },
    {
        id: "http-response",
        name: "HTTP Response",
        icon: "📦",
        category: "middleware",
        runtime: "event-loop",
        position: { x: 800, y: 150 },
        state: "idle",
        metadata: { status: "200 OK", body: "HTML/JSON" },
        explanation: "What: Formats the payload into an HTTP-compliant response with headers and body. Why: The browser expects data in recognized formats (HTML/JSON) with appropriate status codes (like 200/404). Breaks without it: Clients wouldn't understand the raw bits sent back from the logic layer.",
    },
    {
        id: "render",
        name: "Browser Render",
        icon: "🎨",
        category: "client",
        runtime: "event-loop",
        position: { x: 950, y: 150 },
        state: "idle",
        metadata: { action: "DOM Construction" },
        explanation: "What: The browser parsing the HTML/CSS/JS response and painting the UI. Why: Users consume visual pages, not JSON or raw HTTP payloads. Breaks without it: The screen would just show raw text code instead of an interactive application.",
    }
];

const connections: Connection[] = [
    {
        id: "c1", source: "browser", target: "dns", protocol: "http", latency: 10,
        reason: "domain name lookup",
    },
    {
        id: "c2", source: "dns", target: "tcp", protocol: "http", latency: 10,
        reason: "IP resolved, open connection",
    },
    {
        id: "c3", source: "tcp", target: "server", protocol: "http", latency: 20,
        reason: "request sent through TLS tunnel",
    },
    {
        id: "c4", source: "server", target: "cache", protocol: "internal", latency: 5,
        reason: "check for cached response",
    },
    {
        id: "c5", source: "cache", target: "http-response", protocol: "internal", latency: 5,
        reason: "build response",
    },
    {
        id: "c6", source: "http-response", target: "render", protocol: "http", latency: 20,
        reason: "response received",
    }
];

export function getReqResModuleConfig(): ModuleConfig {
    return {
        moduleId: "req-res",
        nodes,
        connections,
        initialPackets: [
            {
                id: "pkt_req",
                protocol: "http",
                payload: "",
                label: "HTTP Request",
                sourceNodeId: "browser",
                targetNodeId: "dns",
                currentNodeId: "browser",
                path: ["browser"],
                progress: 0,
                status: "pending",
                createdAt: Date.now(),
            },
        ],
        whyModePrompts: [
            {
                question: "How many round trips to the server does a fresh HTTPS connection take before sending any real data?",
                options: [
                    { label: "1 (just the HTTP request)", isCorrect: false },
                    { label: "0 (it sends data immediately)", isCorrect: false },
                    { label: "3-4 (including DNS lookup, TCP handshake, TLS handshake)", isCorrect: true },
                    { label: "7 (OSI model layers)", isCorrect: false },
                ],
                correctIndex: 2,
                explanation: "Before sending an HTTP request, the client must resolve DNS (1 trip), establish a TCP connection (1.5 trips), and perform a TLS handshake (1-2 trips) to encrypt the channel. This results in 3-4 round trips on a cold load.",
                connectionId: "c2",
                nodeId: "tcp",
            },
            {
                question: "If a response has 'Cache-Control: max-age=3600', what happens on the next request within that hour?",
                options: [
                    { label: "The browser makes a request and the server responds immediately without logic", isCorrect: false },
                    { label: "The browser uses its local cache and makes NO network request", isCorrect: true },
                    { label: "The browser sends a request but the server returns a 304 Not Modified", isCorrect: false },
                    { label: "The request routes to a CDN instead of the origin server", isCorrect: false },
                ],
                correctIndex: 1,
                explanation: "A max-age header instructs the browser's local cache. Within that time window, the browser satisfies the request entirely locally, saving a full network round trip.",
                connectionId: "c6",
                nodeId: "render",
            }
        ],
        learningStory: {
            title: "The Web's Postal System",
            content: "Request and Response is the fundamental cycle of the internet... [Full story content provided dynamically or from external bank]",
            analogy: "Like mailing a letter. You look up the address in a phonebook (DNS), hand it to the postman (TCP), it gets routed to the recipient's house (Server), and they write you a letter back.",
            lookFor: "Observe the packet traveling step-by-step from the browser, doing the DNS lookup before even touching the server."
        }
    };
}
