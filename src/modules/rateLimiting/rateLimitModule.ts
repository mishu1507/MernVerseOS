import type { ModuleConfig, SystemNode, Connection } from "../../engine/types/system.types";

const nodes: SystemNode[] = [
    {
        id: "clients",
        name: "Incoming Requests",
        icon: "🌍",
        category: "client",
        runtime: "reactive",
        position: { x: 60, y: 220 },
        state: "idle",
        metadata: {},
        explanation: "Requests arrive from various sources — legitimate users, scrapers, bots, and malicious actors. Without rate limiting a single client can send thousands of requests per second overwhelming your server and exhausting database connections.",
    },
    {
        id: "identifier",
        name: "Client Identifier",
        icon: "🏷️",
        category: "middleware",
        runtime: "event-loop",
        position: { x: 280, y: 100 },
        state: "idle",
        metadata: {},
        explanation: "Before checking limits identify who is making the request: IP address for unauthenticated routes, user ID from JWT for authenticated routes (more arrow-precise since IPs can be shared in corporate NAT), or API keys for third-party integrations. IP-only rate limiting fails when all 500 employees in an office share one public IP.",
    },
    {
        id: "algorithm",
        name: "Rate Limit Algorithm",
        icon: "⚖️",
        category: "service",
        runtime: "event-loop",
        position: { x: 280, y: 340 },
        state: "idle",
        metadata: {},
        explanation: "Different algorithms handle traffic bursts differently. Fixed Window resets counter every 60s — allows burst at window boundary. Sliding Window counts requests in last 60s — smoother. Token Bucket allows short bursts up to bucket capacity then steady rate — most user-friendly. Leaky Bucket smooths out bursts with constant output rate.",
    },
    {
        id: "redis-counter",
        name: "Redis Counter",
        icon: "🔴",
        category: "database",
        runtime: "event-loop",
        position: { x: 500, y: 220 },
        state: "idle",
        metadata: {},
        explanation: "Redis stores per-client request counters with TTL. INCR is atomic — even with thousands of concurrent requests the counter is always accurate. EXPIRE automatically cleans up old counters. In-memory rate limiting breaks with multiple server instances (each has its own counter). Redis is shared across all instances — a user hitting any of your 5 servers contributes to the same global counter.",
    },
    {
        id: "allowed",
        name: "Request Allowed",
        icon: "✅",
        category: "service",
        runtime: "event-loop",
        position: { x: 720, y: 100 },
        state: "idle",
        metadata: {},
        explanation: "Request is within limits. Include rate limit headers in the response: X-RateLimit-Limit (max requests), X-RateLimit-Remaining (remaining in window), X-RateLimit-Reset (Unix timestamp when counter resets). These headers let API consumers build smart retry logic — they know exactly when they can make the next request.",
    },
    {
        id: "blocked",
        name: "429 Too Many Requests",
        icon: "🚫",
        category: "middleware",
        runtime: "event-loop",
        position: { x: 720, y: 340 },
        state: "idle",
        metadata: {},
        explanation: "When the limit is exceeded return HTTP 429 Too Many Requests with a Retry-After header indicating when the client can retry. 429 is the correct semantic status code — clients know to back off and retry, not keep hammering. Make error responses consistent with the rest of your API error format.",
    }
];

const connections: Connection[] = [
    { id: "c1", source: "clients", target: "identifier", protocol: "http", latency: 5, reason: "Every request is first identified: extract IP, check Authorization header for JWT to get userId, or read API key header." },
    { id: "c2", source: "identifier", target: "algorithm", protocol: "internal", latency: 5, reason: "Identifier key ready. Choose algorithm based on endpoint sensitivity: strict sliding window for /login, lenient token bucket for /api/data." },
    { id: "c3", source: "algorithm", target: "redis-counter", protocol: "db-query", latency: 5, reason: "INCR user:123:requests:1706745600. GET current count. Compare against limit. All atomic — race-condition safe." },
    { id: "c4", source: "redis-counter", target: "allowed", protocol: "internal", latency: 5, reason: "Counter is within limit. Request allowed. Attach rate limit headers to response: X-RateLimit-Remaining: 47." },
    { id: "c5", source: "redis-counter", target: "blocked", protocol: "internal", latency: 5, reason: "Counter exceeds limit. Return 429 immediately. No database or business logic touched — fast rejection saves server resources." }
];

export function getRateLimitingModuleConfig(): ModuleConfig {
    return {
        moduleId: "rate-limiting",
        nodes,
        connections,
        initialPackets: [
            {
                id: "pkt_rate",
                protocol: "http",
                label: "Rate Limited Request",
                payload: "POST /api/login (attempt 6 of 5 allowed)",
                sourceNodeId: "clients",
                targetNodeId: "identifier",
                currentNodeId: "clients",
                path: ["clients"],
                progress: 0,
                status: "pending",
                createdAt: Date.now(),
            }
        ],
        whyModePrompts: [
            {
                question: "You rate limit by IP. 500 employees at a company share one public IP. One employee hits the limit. What happens?",
                options: [
                    { label: "Only that employee is blocked — IP tracking is per-device", isCorrect: false },
                    { label: "All 500 employees are blocked — they share the same IP address", isCorrect: true },
                    { label: "The company IP is whitelisted automatically", isCorrect: false },
                    { label: "The rate limit applies per browser session", isCorrect: false },
                ],
                correctIndex: 1,
                explanation: "IP-based rate limiting fails for shared IPs. Solutions: use user ID from JWT for authenticated routes, use API keys per client application, or implement a combination: IP limit plus user ID limit. For unauthenticated endpoints like /login IP is often the only option — consider implementing progressive delays instead of hard blocks.",
                connectionId: "c1",
                nodeId: "identifier",
            }
        ],
        learningStory: {
            title: "The Club Bouncer",
            content: "Rate limiting is the bouncer at a club. Everyone is welcome — but you can only enter 100 times per hour. The bouncer stamps your hand (Redis counter) each time you enter. At stamp 101 they say Come back in 45 minutes (429 plus Retry-After). This prevents one person from monopolizing the space while keeping it pleasant for everyone else.",
            analogy: "A post office stamp machine. Each person gets N stamps per day. Normal users never notice the limit. Bots sending thousands of requests immediately hit the ceiling. The Redis counter is the stamp ledger — shared across all post office counters (server instances).",
            lookFor: "Watch the two outcome paths from Redis Counter — Allowed (green path) vs Blocked (red path). The blocked path returns immediately WITHOUT touching your database or business logic — this is the performance benefit of early rejection!"
        }
    };
}
