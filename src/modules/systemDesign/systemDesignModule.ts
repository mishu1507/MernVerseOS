import type { ModuleConfig, SystemNode, Connection } from "../../engine/types/system.types";

const nodes: [SystemNode, ...SystemNode[]] = [
    {
        id: "user-base",
        name: "Global Users",
        icon: "👥",
        category: "client",
        runtime: "reactive",
        position: { x: 60, y: 220 },
        state: "idle",
        metadata: {},
        explanation: "As your MERN app grows from 10 users to 10 million, 'Scale' becomes the primary challenge. Scaling isn't just about bigger servers; it's about changing the ARCHITECTURE. You move from a single 'Monolith' to distributed components that can fail independently without taking down the entire system.",
    },
    {
        id: "cdn",
        name: "CDN (Content Delivery)",
        icon: "⚡",
        category: "gateway",
        runtime: "event-loop",
        position: { x: 280, y: 100 },
        state: "idle",
        metadata: {},
        explanation: "CDNs (like Cloudflare or AWS CloudFront) cache your React static files (JS, CSS, Images) in servers physically close to users. This offloads 90% of traffic from your main server and reduces latency. A user in Tokyo gets files from a Tokyo CDN node instead of waiting for a round-trip to a server in New York.",
    },
    {
        id: "lb",
        name: "Load Balancer (Nginx)",
        icon: "⚖️",
        category: "gateway",
        runtime: "event-loop",
        position: { x: 280, y: 340 },
        state: "idle",
        metadata: {},
        explanation: "The entrance to your backend. The Load Balancer receives all traffic and spreads it across multiple identical Node.js server instances. If one server crashes, the LB detects it (Health Check) and stops sending traffic there. This is 'Horizontal Scaling' — instead of a bigger server, you just add MORE small servers.",
    },
    {
        id: "microservice",
        name: "Stateless API Tier",
        icon: "🚀",
        category: "service",
        runtime: "event-loop",
        position: { x: 500, y: 220 },
        state: "idle",
        metadata: {},
        explanation: "Your backend servers must be 'Stateless'. This means they don't store user sessions in memory; they use JWTs or a shared Redis session store. This allows the Load Balancer to send User A's first request to Server 1 and their second request to Server 2 without any issues. Statelessness is the key to unlimited scaling.",
    },
    {
        id: "cache",
        name: "Distributed Cache (Redis)",
        icon: "🔴",
        category: "database",
        runtime: "event-loop",
        position: { x: 720, y: 100 },
        state: "idle",
        metadata: {},
        explanation: "Database queries are often the bottleneck. Redis caches common results (like 'top 10 trending posts') in-memory. An in-memory cache is 100x faster than a disk-based DB like MongoDB. Using a cache reduces the load on your database, allowing it to handle more UNIQUE writes while Redis handles the common reads.",
    },
    {
        id: "db-scale",
        name: "DB: Sharding/Replica",
        icon: "🧱",
        category: "database",
        runtime: "blocking",
        position: { x: 720, y: 340 },
        state: "idle",
        metadata: {},
        explanation: "The final layer. We use Replication for read-scaling and Sharding for write-scaling. By splitting the data across shards (horizontal) and having multiple read-replicas, the database can handle enormous volumes. This is where MERN apps like Uber or Airbnb store petabytes of data.",
    }
];

const connections: Connection[] = [
    { id: "c1", source: "user-base", target: "cdn", protocol: "http", latency: 5, reason: "Browser requests 'index.html'. CDN serves it from local cache in 20ms. Server not even touched." },
    { id: "c2", source: "user-base", target: "lb", protocol: "http", latency: 20, reason: "API request for dynamic data. Hits the Load Balancer public IP." },
    { id: "c3", source: "lb", target: "microservice", protocol: "http", latency: 5, reason: "LB picks the least-busy server and routes the request. Multi-server parallelism!" },
    { id: "c4", source: "microservice", target: "cache", protocol: "internal", latency: 2, reason: "Server checks Redis: 'Is this data already cached?' If yes, returns immediately. Save DB cpu!" },
    { id: "c5", source: "microservice", target: "db-scale", protocol: "db-query", latency: 15, reason: "Cache miss! Fetching from sharded MongoDB cluster. Horizontal data scaling at work!" }
];

export function getSystemDesignModuleConfig(): ModuleConfig {
    return {
        moduleId: "system-design",
        nodes,
        connections,
        initialPackets: [
            {
                id: "pkt_sys",
                protocol: "http",
                label: "Client Request",
                payload: "GET /api/feed (10M Users scale)",
                sourceNodeId: "user-base",
                targetNodeId: "cdn",
                currentNodeId: "user-base",
                path: ["user-base"],
                progress: 0,
                status: "pending",
                createdAt: Date.now(),
            }
        ],
        whyModePrompts: [
            {
                question: "What is the main advantage of 'Horizontal Scaling' over 'Vertical Scaling'?",
                options: [
                    { label: "Vertical is actually better for most apps", isCorrect: false },
                    { label: "Horizontal has no theoretical upper limit; you can keep adding servers. Vertical is limited by the biggest single machine you can buy.", isCorrect: true },
                    { label: "Horizontal is always cheaper", isCorrect: false },
                    { label: "Vertical requires more code changes", isCorrect: false },
                ],
                correctIndex: 1,
                explanation: "Vertical Scaling (making one server bigger) is limited by physics and high costs. Eventually, there is no bigger CPU to buy. Horizontal Scaling (adding many small servers) allows for virtually infinite growth and provides high availability — if one server fails, the others keep running. This is why all modern massive platforms (YouTube, Netflix) use horizontal scaling.",
                connectionId: "c3",
                nodeId: "lb",
            }
        ],
        learningStory: {
            title: "Scaling the Pizza Shop",
            content: "System Design is like growing a pizza shop. A single shop (Vertical) can only grow so big until the oven is full. Scaling means opening 100 franchise locations (Horizontal). You need a central phone number (Load Balancer) to route calls to the nearest shop, a warehouse for ingredients (CDN/Cache) so shops don't have to grow everything, and a central accounting system (Sharded DB) to keep track of it all.",
            analogy: "A highway system. Scaling isn't making cars faster (Vertical); it's adding more lanes (Horizontal) and building local access roads (CDNs) so traffic doesn't bottle-neck at the city center. System design is the blueprint for the entire city, not just the car engine.",
            lookFor: "Notice how the traffic fans out from the Load Balancer and filters through the Cache before hitting the DB. This multi-layered defense is what keeps large systems stable under pressure!"
        }
    };
}
