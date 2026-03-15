import type { ModuleConfig, SystemNode, Connection } from "../../engine/types/system.types";

const nodes: SystemNode[] = [
    {
        id: "main-thread",
        name: "Main Thread (V8)",
        icon: "🔄",
        category: "service",
        runtime: "event-loop",
        position: { x: 60, y: 200 },
        state: "idle",
        metadata: {},
        explanation: "The main Node.js thread runs JavaScript and manages the event loop. It handles all HTTP requests, DB callbacks, and timer events. CPU-intensive work (image resizing, bcrypt, large JSON parse) running on the main thread blocks the event loop and makes the server unresponsive to ALL other requests during processing.",
    },
    {
        id: "cpu-task",
        name: "CPU-Heavy Task",
        icon: "🔥",
        category: "service",
        runtime: "blocking",
        position: { x: 260, y: 80 },
        state: "idle",
        metadata: {},
        explanation: "CPU-bound tasks are computations that keep the processor busy with no I/O waiting — just pure computation. Unlike async I/O (which can be offloaded to libuv), CPU work genuinely occupies the JS thread. Running bcrypt with cost factor 14, processing a 50MB JSON, or encoding a video on the main thread stops the server for seconds.",
    },
    {
        id: "worker-pool",
        name: "Worker Thread Pool",
        icon: "🧵",
        category: "service",
        runtime: "threaded",
        position: { x: 480, y: 80 },
        state: "idle",
        metadata: {},
        explanation: "Worker Threads create separate V8 JavaScript instances in true OS threads. Each worker has its own event loop, memory heap, and can execute CPU-intensive code without affecting the main thread. Communication is via message passing (postMessage/onmessage). A pool of 4 workers on a 4-core machine can process 4 heavy tasks simultaneously.",
    },
    {
        id: "message-channel",
        name: "Message Channel",
        icon: "📨",
        category: "middleware",
        runtime: "event-loop",
        position: { x: 480, y: 320 },
        state: "idle",
        metadata: {},
        explanation: "Main thread and workers communicate via message passing. Data is serialized (structured clone algorithm) when passed — not shared by reference. For large binary data (image buffers) use Transferable objects (ArrayBuffer) to transfer ownership without copying. Message passing prevents race conditions.",
    },
    {
        id: "result-back",
        name: "Result → Main Thread",
        icon: "✅",
        category: "service",
        runtime: "event-loop",
        position: { x: 700, y: 200 },
        state: "idle",
        metadata: {},
        explanation: "When the worker finishes the CPU task it sends the result back to the main thread via postMessage. The main thread receives this as an event and resolves the waiting Promise. Pattern: const result = await runInWorker(heavyTask, data). Always handle error and exit events on the worker.",
    }
];

const connections: Connection[] = [
    { id: "c1", source: "main-thread", target: "cpu-task", protocol: "internal", latency: 5, reason: "CPU-heavy request arrives. If processed on main thread ALL other requests would block for the duration." },
    { id: "c2", source: "cpu-task", target: "worker-pool", protocol: "internal", latency: 5, reason: "Task dispatched to a Worker Thread. Main thread immediately continues handling other requests." },
    { id: "c3", source: "worker-pool", target: "message-channel", protocol: "internal", latency: 200, reason: "Worker executes CPU-intensive code on a separate OS thread. Main thread is completely free — serving hundreds of other requests." },
    { id: "c4", source: "message-channel", target: "result-back", protocol: "internal", latency: 5, reason: "Worker sends completed result via postMessage. Serialized data travels through the message channel back to the main thread." },
    { id: "c5", source: "result-back", target: "main-thread", protocol: "internal", latency: 5, reason: "Main thread receives result via message event. Waiting Promise resolves. Response sent to client. Event loop never blocked." }
];

export function getWorkerThreadsModuleConfig(): ModuleConfig {
    return {
        moduleId: "worker-threads",
        nodes,
        connections,
        initialPackets: [
            {
                id: "pkt_worker",
                protocol: "http",
                label: "CPU Task",
                payload: "POST /api/resize-image (5MB file)",
                sourceNodeId: "main-thread",
                targetNodeId: "cpu-task",
                currentNodeId: "main-thread",
                path: ["main-thread"],
                progress: 0,
                status: "pending",
                createdAt: Date.now(),
            }
        ],
        whyModePrompts: [
            {
                question: "bcrypt.hashSync(password, 14) is called in a route handler. What happens to other users?",
                options: [
                    { label: "Nothing — bcrypt is async internally", isCorrect: false },
                    { label: "All other requests are blocked for ~2 seconds while bcrypt runs on the main thread", isCorrect: true },
                    { label: "Node.js automatically offloads it to a thread", isCorrect: false },
                    { label: "Only the current request is affected", isCorrect: false },
                ],
                correctIndex: 1,
                explanation: "bcrypt.hashSync is SYNCHRONOUS CPU work — it runs directly on the main thread. At cost factor 14 it takes ~2 seconds. During those 2 seconds Node.js cannot process any other requests. Solution: use bcrypt.hash() (async version which uses libuv thread pool) or run it in a Worker Thread for explicit control.",
                connectionId: "c2",
                nodeId: "worker-pool",
            }
        ],
        learningStory: {
            title: "The Expert Contractor",
            content: "The main Node.js thread is like a highly skilled project manager — great at coordinating dozens of tasks simultaneously but bad at doing manual heavy labor. Worker Threads are specialist contractors. When a CPU-heavy job comes in the manager does not do it themselves — they hand it to a contractor and immediately go back to managing other projects. When the contractor finishes they report back.",
            analogy: "A restaurant analogy: the waiter (main thread) takes orders and coordinates the dining room efficiently. Heavy kitchen prep (CPU tasks) goes to specialized cooks (worker threads). The waiter never stops serving tables to chop vegetables.",
            lookFor: "Watch the main thread — it dispatches to the Worker Pool and IMMEDIATELY becomes available again. The worker processes in the background. This is true parallelism in Node.js!"
        }
    };
}
