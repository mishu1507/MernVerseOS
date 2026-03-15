import type { ModuleConfig, SystemNode, Connection } from "../../engine/types/system.types";

const nodes: SystemNode[] = [
    {
        id: "sync-code",
        name: "Synchronous Code",
        icon: "📝",
        category: "service",
        runtime: "blocking",
        position: { x: 60, y: 220 },
        state: "idle",
        metadata: {},
        explanation: "Synchronous code executes line by line. When it hits a slow operation (file read, DB query, network request) the entire thread STOPS and waits. A 2-second DB query in Node.js blocks ALL other requests — 1000 users wait for one query.",
    },
    {
        id: "async-fn",
        name: "async function",
        icon: "🔮",
        category: "service",
        runtime: "event-loop",
        position: { x: 260, y: 120 },
        state: "idle",
        metadata: {},
        explanation: "Adding async before a function declaration does two things: it allows await to be used inside, and it wraps the return value in a Promise automatically. Even return 42 becomes Promise.resolve(42). async/await is syntactic sugar over Promises — same behavior, dramatically more readable code.",
    },
    {
        id: "await-keyword",
        name: "await expression",
        icon: "⏸️",
        category: "middleware",
        runtime: "event-loop",
        position: { x: 260, y: 320 },
        state: "idle",
        metadata: {},
        explanation: "await pauses the execution of the async function until the Promise resolves. Critically it ONLY pauses the current function — the event loop is completely free to run other code. await db.findUser() looks synchronous but is not — it yields control back to Node.js while the DB query runs on a thread.",
    },
    {
        id: "event-loop-free",
        name: "Event Loop (Free)",
        icon: "🔄",
        category: "service",
        runtime: "event-loop",
        position: { x: 480, y: 220 },
        state: "idle",
        metadata: {},
        explanation: "While an async function is paused at an await the event loop is completely free. Node.js uses this time to process other incoming requests, fire timers, and handle I/O completions. This is why Node.js can handle thousands of concurrent connections with one thread.",
    },
    {
        id: "try-catch",
        name: "try / catch",
        icon: "🛡️",
        category: "middleware",
        runtime: "event-loop",
        position: { x: 680, y: 120 },
        state: "idle",
        metadata: {},
        explanation: "With async/await you handle errors using try/catch blocks — no more nested .catch() chains. If an awaited Promise rejects it throws an error that try/catch captures. An unhandled rejected Promise crashes Node.js in modern versions.",
    },
    {
        id: "parallel-await",
        name: "Promise.all()",
        icon: "⚡",
        category: "service",
        runtime: "event-loop",
        position: { x: 680, y: 320 },
        state: "idle",
        metadata: {},
        explanation: "Promise.all() runs multiple Promises in PARALLEL and waits for all of them. await Promise.all([getUser(), getPosts(), getComments()]) fires all three simultaneously and waits for the slowest one. Sequential awaits waste time: each 100ms call sequential = 300ms total, parallel = 100ms total.",
    }
];

const connections: Connection[] = [
    { id: "c1", source: "sync-code", target: "async-fn", protocol: "internal", latency: 5, reason: "Problem identified: synchronous code blocks. Solution: wrap in async function to enable non-blocking execution." },
    { id: "c2", source: "async-fn", target: "await-keyword", protocol: "internal", latency: 5, reason: "Inside async function await is placed before Promise-returning calls. Execution appears to pause here — but only this function pauses." },
    { id: "c3", source: "await-keyword", target: "event-loop-free", protocol: "internal", latency: 5, reason: "While awaiting the async function is suspended. The event loop is RELEASED — Node.js processes other requests, timers, and I/O during this wait." },
    { id: "c4", source: "event-loop-free", target: "try-catch", protocol: "internal", latency: 50, reason: "Promise resolved! Async function resumes from the await point. If Promise rejected execution jumps to the catch block." },
    { id: "c5", source: "event-loop-free", target: "parallel-await", protocol: "internal", latency: 5, reason: "Performance optimization: instead of awaiting sequentially group independent Promises with Promise.all() to run them concurrently." },
    { id: "c6", source: "try-catch", target: "async-fn", protocol: "internal", latency: 5, reason: "Error handled gracefully. Function returns its resolved value. The Promise returned by the async function resolves for the caller." }
];

export function getAsyncAwaitModuleConfig(): ModuleConfig {
    return {
        moduleId: "async-await",
        nodes,
        connections,
        initialPackets: [
            {
                id: "pkt_async",
                protocol: "internal",
                label: "Async Function",
                payload: "async function fetchUserData()",
                sourceNodeId: "sync-code",
                targetNodeId: "async-fn",
                currentNodeId: "sync-code",
                path: ["sync-code"],
                progress: 0,
                status: "pending",
                createdAt: Date.now(),
            }
        ],
        whyModePrompts: [
            {
                question: "const user = await getUser(); const posts = await getPosts(user.id); Each takes 200ms. How long does this take?",
                options: [
                    { label: "200ms — they run in parallel", isCorrect: false },
                    { label: "400ms — sequential awaits wait one at a time", isCorrect: true },
                    { label: "100ms — async is faster than sync", isCorrect: false },
                    { label: "Depends on the network", isCorrect: false },
                ],
                correctIndex: 1,
                explanation: "Sequential awaits run one after another: 200ms + 200ms = 400ms. If getPosts does not depend on user data use Promise.all: const [user, posts] = await Promise.all([getUser(), getPosts()]); — both fire simultaneously, total = 200ms. This is one of the most common Node.js performance mistakes.",
                connectionId: "c5",
                nodeId: "parallel-await",
            }
        ],
        learningStory: {
            title: "The Chef Who Never Waits",
            content: "In the old synchronous world a chef would put pasta on to boil then STAND THERE watching it for 10 minutes before doing anything else. With async/await the chef puts the pasta on (starts the async operation), writes await pasta in their notepad, and immediately goes to chop vegetables. When the pasta is done a timer fires and the chef returns to that task.",
            analogy: "A doctor using a pager. They send a blood test to the lab (async operation), give the patient a pager number (the Promise), and go see other patients. When the lab is done the pager buzzes (Promise resolves) and the doctor resumes with that patient.",
            lookFor: "Watch the Event Loop (Free) node — it stays active even while the await-keyword node is paused. This is the core of Node.js non-blocking I/O. Also check the Promise.all() node — see how it handles multiple operations simultaneously!"
        }
    };
}
