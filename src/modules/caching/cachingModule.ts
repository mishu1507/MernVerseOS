// ========================================
// Caching Strategy Module - Level 2-3 Engineering Depth
// Cache-aside, TTL, eviction, thundering herd, consistency
// ========================================

import type { ModuleConfig, SystemNode, Connection } from "../../engine/types/system.types";

const nodes: SystemNode[] = [
    {
        id: "app",
        name: "Application",
        icon: "⚡",
        category: "service",
        runtime: "event-loop",
        position: { x: 50, y: 200 },
        state: "idle",
        metadata: { role: "Orchestrator" },
        explanation: "The Application needs data. It orchestrates the flow between the fast cache and the slow database.",
    },
    {
        id: "cache",
        name: "Redis (Fast Cache)",
        icon: "🔴",
        category: "database",
        runtime: "event-loop",
        position: { x: 250, y: 100 },
        state: "idle",
        metadata: { storage: "in-memory" },
        explanation: "REDIS is the Fast Memory. We check here first. If the data is here (HIT), we return in 1ms. If not (MISS), we have to go the long way around to the database.",
    },
    {
        id: "mongo",
        name: "MongoDB (Slow Disk)",
        icon: "🍃",
        category: "database",
        runtime: "blocking",
        position: { x: 250, y: 300 },
        state: "idle",
        metadata: { storage: "on-disk" },
        explanation: "MONGODB is the Persistent Source of Truth. It's slower (10-100ms) because it has to read from disk. We only come here if the cache is empty.",
    },
    {
        id: "save-path",
        name: "Cache Refill",
        icon: "📥",
        category: "middleware",
        runtime: "event-loop",
        position: { x: 450, y: 300 },
        state: "idle",
        metadata: { operation: "SET key value" },
        explanation: "Once we get data from the slow database, we save a copy in the fast Redis cache so the NEXT person doesn't have to wait.",
    },
    {
        id: "response",
        name: "Final Response",
        icon: "📤",
        category: "service",
        runtime: "event-loop",
        position: { x: 600, y: 200 },
        state: "idle",
        metadata: { result: "delivered" },
        explanation: "Whether fast or slow, the user eventually gets their data. This completes the cycle.",
    }
];

const connections: Connection[] = [
    {
        id: "c1", source: "app", target: "cache", protocol: "http", latency: 5,
        reason: "Checking the fast memory (Redis) first to save time.",
    },
    {
        id: "c2", source: "cache", target: "mongo", protocol: "db-query", latency: 50,
        reason: "⚠️ CACHE MISS! The data wasn't in Redis, so we're forced to query the slow disk database.",
    },
    {
        id: "c3", source: "mongo", target: "save-path", protocol: "db-query", latency: 5,
        reason: "Database returned the data. We're now moving to update the cache for the future.",
    },
    {
        id: "c4", source: "save-path", target: "response", protocol: "db-query", latency: 5,
        reason: "Saving the DB result into Redis, then returning to user.",
    },
    {
        id: "c5", source: "cache", target: "response", protocol: "http", latency: 5,
        reason: "FAST PATH: Data found in Redis, returning in 1ms!",
    }
];

export function getCachingModuleConfig(): ModuleConfig {
    return {
        moduleId: "caching",
        nodes,
        connections,
        initialPackets: [
            {
                id: "pkt_miss",
                protocol: "db-query",
                payload: "GET /api/user/123",
                label: "Conceptual MISS Path",
                currentNodeId: "app",
                sourceNodeId: "app",
                targetNodeId: "cache",
                path: ["app"],
                progress: 0,
                status: "pending",
                createdAt: Date.now(),
            },
        ],
        whyModePrompts: [
            {
                question: "We just missed the cache. Why do we go to MongoDB now?",
                options: [
                    { label: "Because Redis is broken", isCorrect: false },
                    { label: "Because MongoDB is the 'Source of Truth' that has all the persistent data", isCorrect: true },
                    { label: "Because we have extra time to spare", isCorrect: false },
                    { label: "Because the user requested it specifically", isCorrect: false },
                ],
                correctIndex: 1,
                explanation: "MongoDB stays on disk and is reliable. Redis is fast but only keep what we tell it to. If it's not in Redis, we MUST check the source of truth.",
                connectionId: "c3",
                nodeId: "mongo",
            },
            {
                question: "Why do we save the result back into Redis after fetching from MongoDB?",
                options: [
                    { label: "To back up the database", isCorrect: false },
                    { label: "To make the NEXT request faster by turning a MISS into a HIT", isCorrect: true },
                    { label: "Because Redis commands are mandatory", isCorrect: false },
                    { label: "To clear the database memory", isCorrect: false },
                ],
                correctIndex: 1,
                explanation: "This is 'Lazy Loading'. We populate the cache only when needed. Now the next user will get the data from Redis in 1ms instead of 100ms!",
                connectionId: "c5",
                nodeId: "cache",
            }
        ],
        learningStory: {
            title: "The Brain's Pocket",
            content: "Caching is like a 'pocket' for your brain. Imagine you are building a puzzle and you need a blue piece. The 'Cache' is the piece right in your hand (super fast!). The 'Database' is the big box of pieces on the floor (slower to reach). If the piece is in your hand, that's a CACHE HIT! If you have to reach for the floor, that's a CACHE MISS.",
            analogy: "Keeping your favorite candy bar in your pocket (cache) versus walking to the store to buy one (database). One takes 1 second, the other takes 20 minutes!",
            lookFor: "Watch the 'Redis' node. If the packet bounces off it and goes straight to 'Response', it's a 'HIT'. If the packet has to go down to 'MongoDB', it's a 'MISS'!"
        }
    };
}
