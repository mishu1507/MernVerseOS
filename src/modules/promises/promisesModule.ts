import type { ModuleConfig, SystemNode, Connection } from "../../engine/types/system.types";

const nodes: SystemNode[] = [
    {
        id: "executor",
        name: "Promise Executor",
        icon: "⚙️",
        category: "service",
        runtime: "event-loop",
        position: { x: 50, y: 150 },
        state: "idle",
        metadata: { action: "new Promise((resolve, reject) => {...})" },
        explanation: "What: The executor function runs synchronously when the Promise is constructed. Why: It kicks off the asynchronous operation (like fetching data or reading a file). Breaks without it: The promise would never start doing any actual work to eventually resolve or reject.",
    },
    {
        id: "pending",
        name: "PENDING State",
        icon: "⏳",
        category: "database",
        runtime: "event-loop",
        position: { x: 200, y: 150 },
        state: "idle",
        metadata: { status: "Waiting for completion" },
        explanation: "What: The initial state of a Promise. Why: Represents that an operation is ongoing and the final value is not yet available. Breaks without it: You wouldn't be able to attach handlers (.then/.catch) to an operation that hasn't finished yet.",
    },
    {
        id: "async-work",
        name: "Async Operation",
        icon: "🛠",
        category: "middleware",
        runtime: "event-loop",
        position: { x: 350, y: 150 },
        state: "idle",
        metadata: { info: "Event loop handoff" },
        explanation: "What: The actual background task happening in the OS or Web APIs (e.g., setTimeout, fetch). Why: Node.js/browser offloads this work to avoid blocking the main thread. Breaks without it: Everything would run synchronously, freezing the UI or server.",
    },
    {
        id: "fulfilled",
        name: "FULFILLED State",
        icon: "✅",
        category: "client",
        runtime: "event-loop",
        position: { x: 500, y: 50 },
        state: "idle",
        metadata: { result: "Success Value" },
        explanation: "What: The state when resolve() is called. Why: Signals that the async operation was successful and carries the resulting value. Breaks without it: There would be no way to differentiate a success from a failure.",
    },
    {
        id: "rejected",
        name: "REJECTED State",
        icon: "❌",
        category: "database",
        runtime: "event-loop",
        position: { x: 500, y: 250 },
        state: "idle",
        metadata: { error: "Reason/Error" },
        explanation: "What: The state when reject() is called or an exception is thrown. Why: Signals that the async operation failed and carries the error reason. Breaks without it: Unhandled exceptions would crash the program instead of being safely handled.",
    },
    {
        id: "microtask",
        name: "Microtask Queue",
        icon: "⚡",
        category: "service",
        runtime: "event-loop",
        position: { x: 650, y: 150 },
        state: "idle",
        metadata: { priority: "Highest Priority Queue" },
        explanation: "What: A special priority queue in the event loop where Promise callbacks (.then/.catch) are placed. Why: Microtasks run immediately after the current synchronous code finishes, before any other async events (like setTimeout). Breaks without it: Promise resolution order would be unpredictable and mixed with slower tasks.",
    },
    {
        id: "then-chain",
        name: ".then() Chain",
        icon: "🔗",
        category: "middleware",
        runtime: "event-loop",
        position: { x: 800, y: 50 },
        state: "idle",
        metadata: { handler: "onFulfilled" },
        explanation: "What: The success handler attached to the Promise. Each .then() returns a NEW Promise. Why: Allows sequential chaining of async operations, avoiding callback hell. Breaks without it: You couldn't use the resolved value to trigger the next step of logic.",
    },
    {
        id: "catch-handler",
        name: ".catch() Handler",
        icon: "🛡",
        category: "database",
        runtime: "event-loop",
        position: { x: 800, y: 250 },
        state: "idle",
        metadata: { handler: "onRejected" },
        explanation: "What: The error handler attached to the Promise chain. Why: Centralizes error handling so a single .catch() at the end can catch errors from anywhere in the chain above it. Breaks without it: Errors would be swallowed 'unhandled promise rejection', making debugging impossible.",
    }
];

const connections: Connection[] = [
    {
        id: "c1", source: "executor", target: "pending", protocol: "internal", latency: 5,
        reason: "Promise creation initializes pending state",
    },
    {
        id: "c2", source: "pending", target: "async-work", protocol: "internal", latency: 5,
        reason: "Offloading work to Web APIs/Libuv",
    },
    {
        id: "c3", source: "async-work", target: "fulfilled", protocol: "internal", latency: 20,
        reason: "success path",
    },
    {
        id: "c4", source: "async-work", target: "rejected", protocol: "internal", latency: 20,
        reason: "failure path",
    },
    {
        id: "c5", source: "fulfilled", target: "microtask", protocol: "internal", latency: 5,
        reason: "Success queues .then() callback",
    },
    {
        id: "c6", source: "rejected", target: "microtask", protocol: "internal", latency: 5,
        reason: "Failure queues .catch() callback",
    },
    {
        id: "c7", source: "microtask", target: "then-chain", protocol: "internal", latency: 5,
        reason: "Event loop executes microtask (success)",
    },
    {
        id: "c8", source: "microtask", target: "catch-handler", protocol: "internal", latency: 5,
        reason: "Event loop executes microtask (error)",
    }
];

export function getPromisesModuleConfig(): ModuleConfig {
    return {
        moduleId: "promises",
        nodes,
        connections,
        initialPackets: [
            {
                id: "pkt_prom",
                protocol: "internal",
                payload: "",
                label: "Promise Created",
                sourceNodeId: "executor",
                targetNodeId: "pending",
                currentNodeId: "executor",
                path: ["executor"],
                progress: 0,
                status: "pending",
                createdAt: Date.now(),
            },
        ],
        whyModePrompts: [
            {
                question: "What is the console.log output order for: console.log('A'); Promise.resolve().then(() => console.log('B')); console.log('C');",
                options: [
                    { label: "A, B, C", isCorrect: false },
                    { label: "A, C, B", isCorrect: true },
                    { label: "B, A, C", isCorrect: false },
                    { label: "C, A, B", isCorrect: false },
                ],
                correctIndex: 1,
                explanation: "Synchronous code (A, C) always runs first. Then the call stack clears. The JS engine then checks the Microtask queue, where the resolved Promise callback (B) is waiting, and executes it.",
                connectionId: "c7",
                nodeId: "microtask",
            },
            {
                question: "If you have: promise.then(() => { fetch('/data'); }).then(res => console.log(res)), what does res evaluate to?",
                options: [
                    { label: "The fetch response object", isCorrect: false },
                    { label: "A pending promise", isCorrect: false },
                    { label: "undefined", isCorrect: true },
                    { label: "A settled promise", isCorrect: false },
                ],
                correctIndex: 2,
                explanation: "Because there is no 'return' statement inside the first .then(), it implicitly returns undefined. The next .then() in the chain immediately receives 'undefined' without waiting for the fetch to finish.",
                connectionId: "c7",
                nodeId: "then-chain",
            }
        ],
        learningStory: {
            title: "The Waiting Room Ticket",
            content: "A Promise is like a restaurant buzzer. You place an order (executor), and they hand you a buzzer (PENDING state). You can go sit down or talk to friends instead of waiting at the counter. When the food is ready, it buzzes (FULFILLED), and you go get your food (.then).",
            analogy: "Like a restaurant pager/buzzer.",
            lookFor: "Notice how actions sit in the 'Microtask Queue' waiting for their turn on the main thread."
        }
    };
}
