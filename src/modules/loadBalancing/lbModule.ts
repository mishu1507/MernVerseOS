import type { ModuleConfig, SystemNode, Connection } from "../../engine/types/system.types";

const nodes: SystemNode[] = [
    {
        id: "traffic",
        name: "Incoming Traffic",
        icon: "🚗",
        category: "client",
        runtime: "event-loop",
        position: { x: 50, y: 200 },
        state: "idle",
        metadata: { requests: "10k req/sec" },
        explanation: "What: The aggregate stream of users trying to access the application. Why: A single server cannot handle infinite traffic; we need a way to spread this load. Breaks without it: Users would experience timeouts as the single server becomes saturated.",
    },
    {
        id: "lb",
        name: "Load Balancer (Nginx)",
        icon: "⚖️",
        category: "middleware",
        runtime: "event-loop",
        position: { x: 250, y: 200 },
        state: "idle",
        metadata: { algorithm: "Round Robin" },
        explanation: "What: A high-performance reverse proxy that distributes traffic across multiple backend instances. Why: Ensures no single server is overwhelmed and provides a single entry point for all traffic. Breaks without it: You'd have to give users different IP addresses for each server instance.",
    },
    {
        id: "node-1",
        name: "Node.js Instance 1",
        icon: "🟢",
        category: "service",
        runtime: "event-loop",
        position: { x: 450, y: 50 },
        state: "idle",
        metadata: { cpu: "40%" },
        explanation: "What: One of several identical application servers running the code. Why: Horizontal scaling—adding more servers is often easier than making one server massive. Breaks without it: You lose redundancy; if this server crashes, the whole app is down.",
    },
    {
        id: "node-2",
        name: "Node.js Instance 2",
        icon: "🟢",
        category: "service",
        runtime: "event-loop",
        position: { x: 450, y: 200 },
        state: "idle",
        metadata: { cpu: "42%" },
        explanation: "What: A second application server instance. Why: Increases total capacity and provides immediate backup if another instance fails. Breaks without it: Reduced capacity and higher risk of total outage.",
    },
    {
        id: "node-3",
        name: "Node.js Instance 3",
        icon: "🟡",
        category: "service",
        runtime: "event-loop",
        position: { x: 450, y: 350 },
        state: "blocked",
        metadata: { cpu: "98%", status: "Degraded" },
        explanation: "What: An instance that is currently struggling with high CPU or memory usage. Why: Real-world systems often have 'sick' nodes that need to be detected and isolated. Breaks without it: Requests sent here would fail, hurting the overall success rate of the app.",
    },
    {
        id: "monitor",
        name: "Health Monitor",
        icon: "🏥",
        category: "service",
        runtime: "event-loop",
        position: { x: 250, y: 360 },
        state: "idle",
        metadata: { check: "HTTP /health" },
        explanation: "What: A background service that periodically pings all instances to ensure they are healthy. Why: Automates the process of removing dead or slow servers from the rotation. Breaks without it: The load balancer would continue sending traffic to crashed servers.",
    },
    {
        id: "redis",
        name: "Shared Redis",
        icon: "⚡",
        category: "database",
        runtime: "blocking",
        position: { x: 700, y: 200 },
        state: "idle",
        metadata: { storage: "Session data" },
        explanation: "What: A central distributed store that all Node.js instances can talk to. Why: Because requests are distributed, a user's session must be available to ALL servers, not just one. Breaks without it: Users would get logged out every time the load balancer sends them to a different server instance.",
    }
];

const connections: Connection[] = [
    { id: "c1", source: "traffic", target: "lb", protocol: "http", latency: 5, reason: "User request arrives" },
    { id: "c2", source: "lb", target: "node-1", protocol: "http", latency: 2, reason: "Route to health instance" },
    { id: "c3", source: "lb", target: "node-2", protocol: "http", latency: 2, reason: "Route to healthy instance" },
    { id: "c4", source: "lb", target: "node-3", protocol: "http", latency: 20, reason: "Route to degraded instance (Slow!)" },
    { id: "c5", source: "monitor", target: "lb", protocol: "internal", latency: 1, reason: "Report unhealthy node" },
    { id: "c6", source: "node-1", target: "redis", protocol: "http", latency: 5, reason: "Access shared session" },
    { id: "c7", source: "node-2", target: "redis", protocol: "http", latency: 5, reason: "Access shared session" }
];

export function getLoadBalancingModuleConfig(): ModuleConfig {
    return {
        moduleId: "load-balancing",
        nodes,
        connections,
        initialPackets: [
            {
                id: "pkt_lb",
                protocol: "http",
                payload: "",
                label: "Load Balanced Request",
                sourceNodeId: "traffic",
                targetNodeId: "lb",
                currentNodeId: "traffic",
                path: ["traffic"],
                progress: 0,
                status: "pending",
                createdAt: Date.now(),
            },
        ],
        whyModePrompts: [
            {
                question: "If you use in-memory sessions (req.session) without Redis, what happens to a user as they click around in a load-balanced environment?",
                options: [
                    { label: "The Load Balancer perfectly remembers which user belongs to which server", isCorrect: false },
                    { label: "The user will randomly get logged out when their request hits a different server", isCorrect: true },
                    { label: "Sessions are automatically synced between different Node.js processes", isCorrect: false },
                    { label: "The browser stores the full session data itself", isCorrect: false },
                ],
                correctIndex: 1,
                explanation: "Each Node.js process has its own isolated memory. If Instance A has the session but Instance B doesn't, a user routed to B will appear unauthenticated. Shared storage like Redis or using JWTs solves this problem.",
                connectionId: "c6",
                nodeId: "redis",
            }
        ],
        learningStory: {
            title: "The Airport Check-in Desks",
            content: "Load balancing is like an airport check-in line. Instead of one long line for one desk, there's a queue manager (Load Balancer) who sends the next passenger to whichever desk is free...",
            analogy: "Like multiple checkout counters at a grocery store.",
            lookFor: "Watch how the 'Health Monitor' node reports back to the 'Load Balancer' to stop traffic from hitting the 'Sick' Instance 3."
        }
    };
}
