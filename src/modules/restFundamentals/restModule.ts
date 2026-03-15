import type { ModuleConfig, SystemNode, Connection } from "../../engine/types/system.types";

const nodes: SystemNode[] = [
    {
        id: "client",
        name: "REST Client",
        icon: "📱",
        category: "client",
        runtime: "reactive",
        position: { x: 60, y: 220 },
        state: "idle",
        metadata: {},
        explanation: "The REST client constructs HTTP requests following REST conventions: verb (GET/POST/PUT/PATCH/DELETE) + resource URL (/api/users/123) + headers (Content-Type, Authorization) + optional JSON body. REST clients and servers are completely decoupled — any client that speaks HTTP can use the API.",
    },
    {
        id: "resource-url",
        name: "Resource URL Router",
        icon: "🗺️",
        category: "service",
        runtime: "event-loop",
        position: { x: 280, y: 100 },
        state: "idle",
        metadata: {},
        explanation: "REST URLs are nouns (resources) never verbs. /users/123 is correct. /getUser/123 violates REST. The HTTP method (verb) describes the action: GET /users = list, POST /users = create, DELETE /users/123 = remove. Consistent URL design lets developers predict endpoints without documentation.",
    },
    {
        id: "http-methods",
        name: "HTTP Methods",
        icon: "📋",
        category: "middleware",
        runtime: "event-loop",
        position: { x: 280, y: 340 },
        state: "idle",
        metadata: {},
        explanation: "HTTP methods have semantic meanings: GET is safe (no side effects) and idempotent (same result every time). POST creates resources — NOT idempotent (sending twice creates two records). PUT replaces the entire resource. PATCH updates specific fields. DELETE removes. These semantics enable caching, retry logic, and API predictability.",
    },
    {
        id: "status-codes",
        name: "HTTP Status Codes",
        icon: "🔢",
        category: "service",
        runtime: "event-loop",
        position: { x: 500, y: 220 },
        state: "idle",
        metadata: {},
        explanation: "Status codes communicate results: 2xx = success (200 OK, 201 Created, 204 No Content), 3xx = redirect, 4xx = client error (400 Bad Request, 401 Unauthorized, 404 Not Found, 429 Too Many Requests), 5xx = server error. APIs that always return 200 even for errors break caching, monitoring, and client error handling.",
    },
    {
        id: "stateless",
        name: "Stateless Constraint",
        icon: "📦",
        category: "middleware",
        runtime: "event-loop",
        position: { x: 500, y: 100 },
        state: "idle",
        metadata: {},
        explanation: "REST is stateless — the server stores NO session state between requests. Every request must be self-contained: include auth token (JWT/API key), all required parameters, and context. Statelessness enables horizontal scaling — any server instance can handle any request. No sticky sessions, no shared memory between instances.",
    },
    {
        id: "json-response",
        name: "JSON Response",
        icon: "📊",
        category: "service",
        runtime: "event-loop",
        position: { x: 720, y: 220 },
        state: "idle",
        metadata: {},
        explanation: "REST APIs conventionally return JSON. A well-designed response envelope includes: data (the resource), error (if failed), and meta (pagination, timestamps). Headers include Content-Type: application/json and appropriate cache headers. Inconsistent response structures across endpoints are a major API usability problem.",
    }
];

const connections: Connection[] = [
    { id: "c1", source: "client", target: "resource-url", protocol: "http", latency: 10, reason: "Client constructs URL using noun-based resource paths: GET /api/users/123 — not GET /api/getUser?id=123. Noun URLs are the foundation of REST." },
    { id: "c2", source: "client", target: "http-methods", protocol: "http", latency: 10, reason: "HTTP method defines the action: GET=read, POST=create, PUT=replace, PATCH=update, DELETE=remove. URL stays the same, verb changes the intent." },
    { id: "c3", source: "resource-url", target: "stateless", protocol: "http", latency: 5, reason: "Each request to a resource URL must be stateless — carry its own auth token, not rely on server-side sessions." },
    { id: "c4", source: "http-methods", target: "status-codes", protocol: "http", latency: 5, reason: "Server processes the method and returns appropriate status: POST /users → 201 Created. DELETE /users/999 → 404 Not Found." },
    { id: "c5", source: "stateless", target: "json-response", protocol: "http", latency: 5, reason: "Stateless processing complete. Server constructs JSON response without referencing any session state." },
    { id: "c6", source: "status-codes", target: "json-response", protocol: "http", latency: 5, reason: "Status code set. JSON body assembled. Response sent: { status: 201, data: { id: 123, name: Alice } }." }
];

export function getRestFundamentalsModuleConfig(): ModuleConfig {
    return {
        moduleId: "rest-fundamentals",
        nodes,
        connections,
        initialPackets: [
            {
                id: "pkt_rest",
                protocol: "http",
                label: "REST Request",
                payload: "GET /api/users/123",
                sourceNodeId: "client",
                targetNodeId: "resource-url",
                currentNodeId: "client",
                path: ["client"],
                progress: 0,
                status: "pending",
                createdAt: Date.now(),
            }
        ],
        whyModePrompts: [
            {
                question: "You call POST /api/checkout twice due to a network retry. What is the risk?",
                options: [
                    { label: "Nothing — POST is idempotent", isCorrect: false },
                    { label: "The order is created TWICE — POST is not idempotent. Use idempotency keys to prevent duplicate orders.", isCorrect: true },
                    { label: "The second request returns 304", isCorrect: false },
                    { label: "The server ignores duplicate requests automatically", isCorrect: false },
                ],
                correctIndex: 1,
                explanation: "POST is NOT idempotent — calling it N times creates N resources. Payment APIs solve this with idempotency keys: a unique ID sent in the request header. If the server already processed that key it returns the original response without creating a duplicate. Stripe and PayPal use this pattern.",
                connectionId: "c2",
                nodeId: "http-methods",
            }
        ],
        learningStory: {
            title: "The Universal Language of the Web",
            content: "REST is a set of rules that makes APIs predictable. Just like traffic laws mean you can drive any road anywhere in the world, REST means any developer can use your API without a tutorial. Nouns in URLs, verbs as HTTP methods, and numbers for outcomes — three simple rules that power the entire web.",
            analogy: "A restaurant menu. The URL is the item (/pizza), the HTTP method is the action (ORDER it, RETURN it, MODIFY the toppings), and the status code is the response (200: here is your pizza, 404: we do not have that, 503: kitchen is down).",
            lookFor: "Notice the two parallel paths — Resource URL and HTTP Methods. Both are required for a valid REST request. Watch how Status Codes node maps to JSON Response — the status code is set BEFORE the body is written!"
        }
    };
}
