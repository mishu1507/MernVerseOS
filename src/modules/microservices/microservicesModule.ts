// ========================================
// Microservices Module - Level 2-3 Engineering Depth
// Gateway patterns, service mesh, circuit breaker, saga
// ========================================

import type { ModuleConfig, SystemNode, Connection } from "../../engine/types/system.types";

const nodes: SystemNode[] = [
    {
        id: "client",
        name: "Client",
        icon: "🌐",
        category: "client",
        runtime: "event-loop",
        position: { x: 50, y: 200 },
        state: "idle",
        metadata: { request: "POST /order" },
        explanation: "The user initiates a request. They don't know there are 20 services behind the scenes; they only see one API.",
    },
    {
        id: "gateway",
        name: "API Gateway",
        icon: "🚪",
        category: "gateway",
        runtime: "event-loop",
        position: { x: 220, y: 200 },
        state: "idle",
        metadata: { checks: "Auth, Rate-Limit" },
        explanation: "The GATEWAY is the bodyguard. It checks if you are allowed in (Auth), ensures you aren't spamming (Rate Limit), and sends you to the right team.",
    },
    {
        id: "order-svc",
        name: "Order Service",
        icon: "📦",
        category: "service",
        runtime: "event-loop",
        position: { x: 450, y: 100 },
        state: "idle",
        metadata: { tech: "Node.js/Exp", db: "PostgreSQL" },
        explanation: "The ORDER TEAM only cares about orders. They have their own database. If the Inventory team breaks their code, the Order team's code still runs perfectly - this is Fault Isolation.",
    },
    {
        id: "inventory-svc",
        name: "Inventory Service",
        icon: "🏬",
        category: "service",
        runtime: "event-loop",
        position: { x: 450, y: 300 },
        state: "idle",
        metadata: { tech: "Go", db: "MongoDB" },
        explanation: "The INVENTORY TEAM manages stock. Because they are a separate microservice, they chose MongoDB because it fits their data better. Microservices let teams pick the best tool for their specific job.",
    },
    {
        id: "breaker",
        name: "Circuit Breaker",
        icon: "⚡",
        category: "middleware",
        runtime: "event-loop",
        position: { x: 600, y: 300 },
        state: "idle",
        metadata: { threshold: "50% failure" },
        explanation: "If the Inventory service gets slow, the Circuit Breaker 'pops' like a fuse. This prevents the Order service from waiting forever and crashing too. It saves the rest of the system.",
    },
    {
        id: "queue",
        name: "Message Queue",
        icon: "📬",
        category: "queue",
        runtime: "event-loop",
        position: { x: 650, y: 100 },
        state: "idle",
        metadata: { pattern: "Pub/Sub" },
        explanation: "Instead of waiting for shipping to finish, the Order service just 'drops a letter' in the Queue and tells the user 'Success!'. Shipping will pick it up whenever they are ready. This is ASYNC logic.",
    },
    {
        id: "shipping-svc",
        name: "Shipping Service",
        icon: "🚚",
        category: "service",
        runtime: "event-loop",
        position: { x: 800, y: 100 },
        state: "idle",
        metadata: { action: "Print Label" },
        explanation: "Shipping checks the queue periodically. They don't even know the Order service exists! They only know how to read from the queue and print labels.",
    }
];

const connections: Connection[] = [
    {
        id: "c1", source: "client", target: "gateway", protocol: "http", latency: 20,
        reason: "The request enters through the Gatekeeper (API Gateway).",
    },
    {
        id: "c2", source: "gateway", target: "order-svc", protocol: "http", latency: 10,
        reason: "Gateway verifies permissions and routes the packet to the Order Service.",
    },
    {
        id: "c3", source: "order-svc", target: "inventory-svc", protocol: "http", latency: 15,
        reason: "The Order service checks stock by calling the Inventory microservice.",
    },
    {
        id: "c4", source: "inventory-svc", target: "breaker", protocol: "http", latency: 5,
        reason: "Before responding, we check the Circuit Breaker to ensure the connection isn't failing or slow.",
    },
    {
        id: "c5", source: "breaker", target: "queue", protocol: "queue", latency: 10,
        reason: "Stock confirmed! We drop a message in the Queue for async tasks like Shipping.",
    },
    {
        id: "c6", source: "queue", target: "shipping-svc", protocol: "queue", latency: 30,
        reason: "The Shipping service picks up the task from the queue to process it independently.",
    }
];

export function getMicroservicesModuleConfig(): ModuleConfig {
    return {
        moduleId: "microservices",
        nodes,
        connections,
        initialPackets: [
            {
                id: "pkt_micro",
                protocol: "http",
                payload: "GET /api/v1/dashboard",
                label: "Dashboard Request",
                currentNodeId: "client",
                sourceNodeId: "client",
                targetNodeId: "gateway",
                path: ["client"],
                progress: 0,
                status: "pending",
                createdAt: Date.now(),
            },
        ],
        whyModePrompts: [
            // ... (keeping existing prompts)
            {
                question: "The Inventory service is crashed. Why is the Order service still running fine?",
                options: [
                    { label: "Because the developer fixed it", isCorrect: false },
                    { label: "Fault Isolation: they are separate processes with separate databases. One failing doesn't kill the other.", isCorrect: true },
                    { label: "The gateway fixed the error", isCorrect: false },
                    { label: "Microservices never crash", isCorrect: false },
                ],
                correctIndex: 1,
                explanation: "This is the 'Holy Grail' of microservices. By splitting the app into small pieces, a bug in the Inventory team's code doesn't bring down the whole company's checkout process.",
                connectionId: "c3",
                nodeId: "inventory-svc",
            },
            {
                question: "Why does the Order service ‘drop a message’ in a queue instead of calling Shipping directly?",
                options: [
                    { label: "To save on network costs", isCorrect: false },
                    { label: "Async Decoupling: The Order service doesn't have to wait for labels to print. It can serve the next user immediately.", isCorrect: true },
                    { label: "Because Shipping doesn't have an API", isCorrect: false },
                    { label: "To encrypt the data", isCorrect: false },
                ],
                correctIndex: 1,
                explanation: "Queues allow systems to be 'event-driven'. The Order service finishes its job in 5ms and moves on. Shipping can take its time (5 seconds) without making the user wait at the checkout screen.",
                connectionId: "c5",
                nodeId: "queue",
            }
        ],
        learningStory: {
            title: "The Lego Castle Project",
            content: "Microservices is like when you and your friends build a giant Lego castle together. Instead of everyone working on the same big pile of bricks, one friend builds the Towers, another builds the Gate, and you build the Dragon. If you drop your Dragon and it breaks, the Towers and the Gate are still perfectly fine! We just fix the Dragon and keep playing.",
            analogy: "A group of specialists (like a baker, a butcher, and a gardener) instead of one person trying to do everything alone. If the baker is sick, you can still buy carrots!",
            lookFor: "Watch how a single request from the 'Client' splits into different paths. Notice how the 'Order Service' doesn't wait for 'Shipping'-it just drops a message in the 'Queue' and moves on!"
        }
    };
}
