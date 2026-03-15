import type { ModuleConfig, SystemNode, Connection } from "../../engine/types/system.types";

const nodes: SystemNode[] = [
    {
        id: "client",
        name: "Browser Client",
        icon: "🌐",
        category: "client",
        runtime: "event-loop",
        position: { x: 50, y: 150 },
        state: "idle",
        metadata: { action: "Sending Auth Request" },
        explanation: "What: The user's browser making an authenticated request to the secured API. Why: The client needs data specific to who is logged in. Breaks without it: No authenticated actions would be triggered by actual users.",
    },
    {
        id: "cookie",
        name: "Cookie (httpOnly)",
        icon: "🍪",
        category: "database",
        runtime: "event-loop",
        position: { x: 250, y: 50 },
        state: "idle",
        metadata: { info: "Session ID" },
        explanation: "What: A browser storage mechanism where an httpOnly cookie stores a random Session ID string. Why: httpOnly cookies are automatically sent with every request and cannot be read by JavaScript (preventing XSS). Breaks without it: You'd have to manually attach a token to every request, and XSS could steal it.",
    },
    {
        id: "session-store",
        name: "Session Store (Redis)",
        icon: "🗄",
        category: "database",
        runtime: "blocking",
        position: { x: 450, y: 50 },
        state: "idle",
        metadata: { info: "ID -> UserData" },
        explanation: "What: A fast, in-memory database on the server holding the actual user session data, keyed by the Session ID. Why: The server needs to look up who owns the Session ID the browser sent. Redis is ideal because it's fast and shared across instances. Breaks without it: The server wouldn't know who the random string belongs to, rendering the cookie useless.",
    },
    {
        id: "local-storage",
        name: "localStorage",
        icon: "💾",
        category: "database",
        runtime: "event-loop",
        position: { x: 250, y: 250 },
        state: "idle",
        metadata: { info: "JWT String" },
        explanation: "What: The browser's local key-value store, holding the JWT string explicitly. Why: JWTs must be manually read by JS and attached as a 'Bearer' header; they don't send automatically like cookies. Breaks without it: The token is lost on page refresh.",
    },
    {
        id: "jwt-verify",
        name: "JWT Verification",
        icon: "✅",
        category: "service",
        runtime: "event-loop",
        position: { x: 450, y: 250 },
        state: "idle",
        metadata: { info: "Crypto Signature Check" },
        explanation: "What: Server middleware that checks the cryptographic signature of the JWT using the secret key, without database lookup. Why: Ensures the payload was forged by the server and hasn't been tampered with. Breaks without it: Anyone could forge a payload saying 'userId: admin' and the server would trust it.",
    },
    {
        id: "server",
        name: "API Server",
        icon: "🚂",
        category: "service",
        runtime: "event-loop",
        position: { x: 650, y: 150 },
        state: "idle",
        metadata: { action: "Serve Protected Route" },
        explanation: "What: The backend finalizing access to the protected route after verifying identity through either path. Why: Actually returns the sensitive data. Breaks without it: No response data would be served.",
    }
];

const connections: Connection[] = [
    {
        id: "c1", source: "client", target: "cookie", protocol: "internal", latency: 5,
        reason: "Browser auto-attaches cookie",
    },
    {
        id: "c2", source: "cookie", target: "session-store", protocol: "http", latency: 15,
        reason: "Server looks up session ID in Redis",
    },
    {
        id: "c3", source: "session-store", target: "server", protocol: "internal", latency: 5,
        reason: "Session valid, user attached to req",
    },
    {
        id: "c4", source: "client", target: "local-storage", protocol: "internal", latency: 5,
        reason: "JS reads token to add Auth header",
    },
    {
        id: "c5", source: "local-storage", target: "jwt-verify", protocol: "http", latency: 10,
        reason: "Server verifies JWT signature statelessly",
    },
    {
        id: "c6", source: "jwt-verify", target: "server", protocol: "internal", latency: 5,
        reason: "Token valid, user attached to req",
    }
];

export function getSessionsJwtModuleConfig(): ModuleConfig {
    return {
        moduleId: "sessions-jwt",
        nodes,
        connections,
        initialPackets: [
            {
                id: "pkt_session_auth",
                protocol: "http",
                payload: "",
                label: "Auth Request",
                sourceNodeId: "client",
                targetNodeId: "cookie", // starts going down the cookie path
                currentNodeId: "client",
                path: ["client"],
                progress: 0,
                status: "pending",
                createdAt: Date.now(),
            },
            {
                id: "pkt_jwt_auth",
                protocol: "http",
                payload: "",
                label: "Auth Request",
                sourceNodeId: "client",
                targetNodeId: "local-storage", // starts going down the localstorage path simultaneously
                currentNodeId: "client",
                path: ["client"],
                progress: 0,
                status: "pending",
                createdAt: Date.now(),
            }
        ],
        whyModePrompts: [
            {
                question: "An attacker steals a user's phone. How do you instantly log them out globally?",
                options: [
                    { label: "For JWT: change the secret. For Sessions: nothing.", isCorrect: false },
                    { label: "Both can be instantly logged out with no extra infrastructure.", isCorrect: false },
                    { label: "For Sessions: delete the ID from Redis (instant). For JWT: you cannot revoke it until expiry without adding a Redis blacklist.", isCorrect: true },
                    { label: "For JWT: issue a 'delete token' command to the phone.", isCorrect: false },
                ],
                correctIndex: 2,
                explanation: "Because sessions check the database (Redis) on EVERY request, deleting a session is instantly effective. Because JWTs are stateless and rely only on math to verify the signature, the server doesn't know it's revoked unless you introduce a stateful blacklist, defeating the purpose of being stateless.",
                connectionId: "c5",
                nodeId: "jwt-verify",
            }
        ],
        learningStory: {
            title: "ID Badge vs. Signed Letter",
            content: "Sessions are like a coat check ticket... [Full story content]",
            analogy: "Session is an ID badge checked against a central database. JWT is a notarized, sealed letter that the guard can verify by looking at the wax stamp, without calling HQ.",
            lookFor: "Notice how the session path MUST stop at the database (Redis) to work, while the JWT path skips the database entirely relying only on math."
        }
    };
}
