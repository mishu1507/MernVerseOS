// ========================================
// The Ultimate MERN/MEAN Struggle Map
// Comprehensive High-Depth indexing of computer science "Hard Parts"
// ========================================

import type { ModuleConfig, SystemNode, Connection } from "../../engine/types/system.types";

const nodes: SystemNode[] = [
    // --- Frontend Pitfalls ---
    {
        id: "hydration-swamp",
        name: "Hydration Mismatch",
        icon: "💧",
        category: "client",
        runtime: "event-loop",
        position: { x: 50, y: 50 },
        state: "idle",
        metadata: { mern: "React", mean: "Angular" },
        explanation: "Why it's hard: The server sends HTML, and the browser tries to 'guess' how the JS attaches to it. If the server says 'Time is 10:00' but the browser says 'Time is 10:01', the whole page might reset. Solution: Use useEffect for client-only data or suppressHydrationWarning.",
    },
    {
        id: "rxjs-observables",
        name: "RxJS Observables",
        icon: "〰️",
        category: "client",
        runtime: "event-loop",
        position: { x: 250, y: 50 },
        state: "idle",
        metadata: { mean: "Angular", concept: "Streams" },
        explanation: "Why it's hard: Unlike Promises (one-shot), Observables are streams of data that never end. You have to 'unsubscribe' or you'll create a Memory Leak. It's 'Functional Reactive Programming' which is a totally different way of thinking than 'if/else' logic.",
    },
    {
        id: "state-management",
        name: "State Complexity",
        icon: "🌳",
        category: "client",
        runtime: "event-loop",
        position: { x: 450, y: 50 },
        state: "idle",
        metadata: { mern: "Redux/Zustand", mean: "Services" },
        explanation: "Why it's hard: When should a piece of data be 'Global' vs 'Local'? If you put everything in Redux, your app becomes slow. If you put nothing there, you get 'Prop Drilling' (passing data through 10 layers manually). Solution: Use Context or Signals for lightweight state.",
    },

    // --- Data & Logic Pitfalls ---
    {
        id: "race-conditions",
        name: "Race Conditions",
        icon: "🏎️",
        category: "middleware",
        runtime: "event-loop",
        position: { x: 50, y: 200 },
        state: "idle",
        metadata: { type: "Async Bug", impact: "Data Corruption" },
        explanation: "Why it's hard: You start Request A, then Request B. If B finishes first, it might overwrite the newer data from A. This happens often in search bars where old results pop up after new ones. Solution: Use 'AbortController' to cancel old requests.",
    },
    {
        id: "optimistic-ui",
        name: "Optimistic UI",
        icon: "🤞",
        category: "middleware",
        runtime: "event-loop",
        position: { x: 250, y: 200 },
        state: "idle",
        metadata: { ux: "Instant Feel", risk: "Rollback" },
        explanation: "Why it's hard: When a user clicks 'Like', you show the heart as red IMMEDIATELY before the server says OK. If the server fails, you have to 'pop' it back to gray. Managing this 'Undo' logic is where most apps get buggy.",
    },
    {
        id: "cors-hell",
        name: "CORS Hell",
        icon: "🛡️",
        category: "gateway",
        runtime: "event-loop",
        position: { x: 450, y: 200 },
        state: "idle",
        metadata: { security: "Browser based", header: "Origin Match" },
        explanation: "Why it's hard: CORS is NOT a server security feature; it's a browser security feature. It doesn't stop attackers (they use curl), it only stops YOUR browser from talking to YOUR server if the headers aren't perfect.",
    },

    // --- Backend & Database Pitfalls ---
    {
        id: "acid-transactions",
        name: "ACID Transactions",
        icon: "🔗",
        category: "database",
        runtime: "blocking",
        position: { x: 50, y: 350 },
        state: "idle",
        metadata: { mongo: "v4.0+", risk: "Partial Updates" },
        explanation: "Why it's hard: MongoDB is 'Schema-less', but that doesn't mean data is easy! If you update a User and their Order, but the power goes out mid-way, you have a broken database. You need 'Transactions' to ensure both happen or NEITHER happens.",
    },
    {
        id: "aggregation-pipeline",
        name: "Aggregation $lookup",
        icon: "⚗️",
        category: "database",
        runtime: "blocking",
        position: { x: 250, y: 350 },
        state: "idle",
        metadata: { type: "Compute", risk: "O(n^2) complexity" },
        explanation: "Why it's hard: $lookup is how Mongo 'joins' collections (like SQL). But it is SLOW if you don't have the target field indexed. It turns a 1ms query into a 10-second server crasher very easily.",
    },
    {
        id: "memory-leaks",
        name: "Memory Leaks",
        icon: "🧠",
        category: "service",
        runtime: "event-loop",
        position: { x: 450, y: 350 },
        state: "idle",
        metadata: { node: "Heap management", danger: "Crash" },
        explanation: "Why it's hard: In Node.js, if you keep a reference to a Large Object inside a closure or a Global variable, the 'Garbage Collector' can't throw it away. Eventually, your 'Heap' overflows and the server dies (OOM - Out of Memory).",
    },

    // --- Modern Architecture ---
    {
        id: "micro-frontends",
        name: "Micro-Frontends",
        icon: "🏗️",
        category: "gateway",
        runtime: "event-loop",
        position: { x: 250, y: 480 },
        state: "idle",
        metadata: { tech: "Module Federation", challenge: "Shared Deps" },
        explanation: "Why it's hard: Having 5 different teams work on one website! Team A uses React 18, Team B uses Angular. Getting them to share the Same Page without crashing is the ultimate architecture boss battle.",
    },
];

const connections: Connection[] = [
    {
        id: "c1", source: "hydration-swamp", target: "rxjs-observables", protocol: "http", latency: 5,
        reason: "Struggle 1: Client 'wakes up' with Hydration, but then you have to manage its async state with Streams (Observables).",
    },
    {
        id: "c2", source: "rxjs-observables", target: "state-management", protocol: "http", latency: 5,
        reason: "Struggle 2: Streams feed into the Global Store. Balancing 'Local' vs 'Global' state is where architecture often breaks.",
    },
    {
        id: "c3", source: "state-management", target: "optimistic-ui", protocol: "http", latency: 5,
        reason: "Struggle 3: To make state feel instant, we use Optimistic UI, but managing the 'Undo' logic is complex.",
    },
    {
        id: "c4", source: "optimistic-ui", target: "race-conditions", protocol: "http", latency: 5,
        reason: "Struggle 4: Instant updates cause Race Conditions if Request A finishes after Request B. You need request sequencing.",
    },
    {
        id: "c5", source: "race-conditions", target: "cors-hell", protocol: "http", latency: 5,
        reason: "Struggle 5: Even if your logic is perfect, the Browser might block the request via CORS if headers don't match exactly.",
    },
    {
        id: "c6", source: "cors-hell", target: "memory-leaks", protocol: "http", latency: 5,
        reason: "Struggle 6: On the server, keeping too many requests in fly or holding onto global references leads to silent Memory Leaks.",
    },
    {
        id: "c7", source: "memory-leaks", target: "aggregation-pipeline", protocol: "http", latency: 10,
        reason: "Struggle 7: Heavy server logic often comes from unoptimized DB queries. $lookup joins are slow without indexes.",
    },
    {
        id: "c8", source: "aggregation-pipeline", target: "acid-transactions", protocol: "db-query", latency: 20,
        reason: "Struggle 8: Aggregating data is one thing; making sure multi-document updates are ACID-safe is the ultimate DB challenge.",
    },
    {
        id: "c9", source: "acid-transactions", target: "micro-frontends", protocol: "http", latency: 15,
        reason: "Struggle 9: Finally, scaling all this across multiple teams requires Micro-Frontends, where shared deps and state clash.",
    },
];

export function getIndexingModuleConfig(): ModuleConfig {
    return {
        moduleId: "indexing",
        nodes,
        connections,
        initialPackets: [
            {
                id: "pkt_struggle_1",
                protocol: "http",
                payload: "Understanding the Minefield",
                label: "MERN/MEAN Struggle",
                currentNodeId: "hydration-swamp",
                sourceNodeId: "hydration-swamp",
                targetNodeId: "rxjs-observables",
                path: ["hydration-swamp"],
                progress: 0,
                status: "pending",
                createdAt: Date.now(),
            },
        ],
        whyModePrompts: [
            {
                question: "Why does failing to 'Unsubscribe' in MEAN (Angular) cause a Memory Leak?",
                options: [
                    { label: "The browser limits subscriptions", isCorrect: false },
                    { label: "The subscription keeps the component in memory even after it is closed", isCorrect: true },
                    { label: "RxJS is just slow", isCorrect: false },
                    { label: "Angular doesn't have a garbage collector", isCorrect: false },
                ],
                correctIndex: 1,
                explanation: "An Observable setup (especially an interval or a global event) will keep holding a reference to your component's 'this'. If you don't unsubscribe, that component stays in the heap forever, eventually crashing the app.",
                connectionId: "c2",
                nodeId: "memory-leaks",
            },
            {
                question: "In a 'Race Condition', what happens if an old search query finishes AFTER a newer one?",
                options: [
                    { label: "The browser automatically ignores the old one", isCorrect: false },
                    { label: "The old (incorrect) results will overwrite the newer (correct) results on screen", isCorrect: true },
                    { label: "The server returns an error", isCorrect: false },
                    { label: "The code crashes", isCorrect: false },
                ],
                correctIndex: 1,
                explanation: "This is the 'Last One Wins' problem. Without logic to cancel old requests (AbortController), the stale data will arrive late and replace the fresh data, confusing the user.",
                connectionId: "c3",
                nodeId: "race-conditions",
            }
        ],
        learningStory: {
            title: "The Developer's Minefield",
            content: "Welcome to the 'Hard Parts' of MERN and MEAN. This isn't just about 'Hello World'-it's about why your app crashes when 1,000 users join, or why the search bar shows the wrong name. We've mapped out the most common struggles: from the 'Hydration Swamp' where server and client fight over HTML, to 'CORS Hell' where security headers break your local dev environment.",
            analogy: "Like a map of a dark forest. Instead of just walking in and falling into a pit (Race Conditions), you can see exactly where the traps are hidden and how to build a bridge over them.",
            lookFor: "Watch the 'Race Condition' node. Notice how a packet can leave there and accidentally collide with state management. Also, observe the 'Memory Leak' node-it's the silent killer of Node.js servers!"
        }
    };
}
