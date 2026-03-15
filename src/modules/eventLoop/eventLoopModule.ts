// ========================================
// Event Loop Module - Level 3 Engineering Depth
// Internal phases, microtask/macrotask queues, libuv thread pool
// ========================================

import { EventLoopEngine } from "../../engine/eventLoop/eventLoopEngine";
import { SimulationEngine } from "../../engine/runtime/simulationEngine";
import type { ModuleConfig, SystemNode, Connection } from "../../engine/types/system.types";

const nodes: SystemNode[] = [
    {
        id: "call-stack",
        name: "Call Stack",
        icon: "📚",
        category: "service",
        runtime: "event-loop",
        position: { x: 80, y: 180 },
        state: "idle",
        metadata: { maxDepth: "~15,000 frames" },
        explanation: "What: The call stack is a LIFO data structure that tracks function execution. Each function call pushes a frame; each return pops one. Why: JavaScript is single-threaded - only ONE function runs at a time. Breaks when: Deep recursion exceeds the stack limit (RangeError: Maximum call stack size exceeded). Also, any synchronous code here blocks EVERYTHING - no I/O, no timers, no callbacks can run until the stack is empty.",
    },
    {
        id: "web-apis",
        name: "Web APIs / libuv",
        icon: "🔧",
        category: "service",
        runtime: "threaded",
        position: { x: 300, y: 60 },
        state: "idle",
        metadata: { runtime: "C++ layer" },
        explanation: "What: Browser provides Web APIs (setTimeout, fetch, DOM events). Node.js uses libuv (C library) for async I/O. These run OUTSIDE the JS thread. Why: JavaScript can't do I/O itself - it delegates to the system. Breaks when: You confuse 'async' with 'parallel' - setTimeout(fn, 0) doesn't run immediately, it queues a macrotask.",
    },
    {
        id: "thread-pool",
        name: "Thread Pool (libuv)",
        icon: "🧵",
        category: "queue",
        runtime: "threaded",
        position: { x: 540, y: 60 },
        state: "idle",
        metadata: { defaultThreads: 4, maxThreads: 1024, env: "UV_THREADPOOL_SIZE" },
        explanation: "What: libuv maintains a thread pool (default: 4 threads) for operations that can't use OS-level async I/O: fs operations, DNS lookups, crypto. Why: Not all I/O is truly async at the OS level - file system operations on most OSes are blocking, so libuv uses threads. Breaks when: All 4 threads are busy (e.g., 4 concurrent fs.readFile calls). The 5th call WAITS until a thread frees up. Fix: set UV_THREADPOOL_SIZE=16 for I/O-heavy apps.",
    },
    {
        id: "io-operation",
        name: "I/O Operation",
        icon: "💾",
        category: "database",
        runtime: "blocking",
        position: { x: 540, y: 180 },
        state: "idle",
        metadata: {},
        explanation: "What: The actual disk read, network request, or database query executing on a system thread or via OS async I/O (epoll/kqueue/IOCP). Why: This work happens completely outside JavaScript's control - it runs in C/C++ land. Breaks when: Disk is slow, network has high latency, or the database is overloaded. Node.js can't speed this up - but it CAN serve other requests while waiting.",
    },
    {
        id: "microtask-queue",
        name: "Microtask Queue",
        icon: "⚡",
        category: "queue",
        runtime: "event-loop",
        position: { x: 80, y: 340 },
        state: "idle",
        metadata: { priority: "HIGHEST", sources: "Promise.then, queueMicrotask, process.nextTick" },
        explanation: "What: Microtasks are processed IMMEDIATELY after the current operation completes, BEFORE any macrotask. Sources: Promise.resolve().then(), queueMicrotask(), process.nextTick() (Node.js). Why: Promises need deterministic timing - they must resolve before any I/O callback runs. Breaks when: Recursive microtasks starve the event loop. Example: a .then() that schedules another .then() infinitely - setTimeout callbacks will NEVER fire. process.nextTick() is even more dangerous because it runs before Promises.",
    },
    {
        id: "macrotask-queue",
        name: "Macrotask Queue",
        icon: "📥",
        category: "queue",
        runtime: "event-loop",
        position: { x: 300, y: 340 },
        state: "idle",
        metadata: { priority: "NORMAL", sources: "setTimeout, setInterval, I/O, setImmediate" },
        explanation: "What: Macrotasks are the standard callback queue. Sources: setTimeout, setInterval, I/O callbacks, setImmediate (Node.js). One macrotask runs per event loop iteration. Why: Macrotasks give the event loop room to breathe - between each macrotask, ALL microtasks are drained. Breaks when: You assume setTimeout(fn, 0) runs 'immediately' - it doesn't. It runs AFTER: (1) the current call stack empties, (2) ALL microtasks drain, (3) any pending I/O. Minimum delay is ~1ms in Node, ~4ms in browsers.",
    },
    {
        id: "timer-phase",
        name: "Timer Phase",
        icon: "⏰",
        category: "service",
        runtime: "event-loop",
        position: { x: 540, y: 340 },
        state: "idle",
        metadata: { handles: "setTimeout, setInterval" },
        explanation: "What: First phase of each event loop iteration. Checks if any setTimeout/setInterval timers have expired and runs their callbacks. Why: Timers are checked first because they represent scheduled work with explicit deadlines. Breaks when: Heavy I/O or CPU work delays timer execution. setTimeout(fn, 100) guarantees a MINIMUM delay of 100ms, not exactly 100ms. If the poll phase takes 200ms, your timer fires at 200ms.",
    },
    {
        id: "poll-phase",
        name: "Poll Phase",
        icon: "📡",
        category: "service",
        runtime: "event-loop",
        position: { x: 740, y: 340 },
        state: "idle",
        metadata: { handles: "I/O callbacks, incoming connections" },
        explanation: "What: The poll phase retrieves new I/O events from the OS (epoll on Linux, kqueue on macOS, IOCP on Windows). It executes I/O callbacks and can BLOCK here if there's nothing else to do. Why: This is where Node spends most of its time - waiting for I/O to complete. It's highly efficient because the OS does the waiting, not JavaScript. Breaks when: A callback in the poll phase does heavy computation - it blocks all subsequent I/O processing. Keep poll callbacks fast.",
    },
    {
        id: "check-phase",
        name: "Check Phase",
        icon: "✅",
        category: "service",
        runtime: "event-loop",
        position: { x: 740, y: 180 },
        state: "idle",
        metadata: { handles: "setImmediate" },
        explanation: "What: Runs setImmediate() callbacks. Always fires AFTER the poll phase completes. Why: setImmediate guarantees execution in the next iteration of the event loop, after I/O. This is different from setTimeout(fn, 0) which fires in the timer phase. Breaks when: You confuse setImmediate with setTimeout(fn, 0). Inside an I/O callback, setImmediate ALWAYS fires before setTimeout(fn, 0). Outside I/O, the order is non-deterministic.",
    },
    {
        id: "response",
        name: "Response Sent",
        icon: "📤",
        category: "client",
        runtime: "event-loop",
        position: { x: 740, y: 60 },
        state: "idle",
        metadata: {},
        explanation: "What: After the callback completes and the response is built, Node sends it back via the OS network stack. Why: The response is just another I/O operation - it's non-blocking. Breaks when: You try to send multiple responses for the same request (ERR_HTTP_HEADERS_SENT), or you never send a response (client timeout).",
    },
];

const connections: Connection[] = [
    {
        id: "c1", source: "call-stack", target: "web-apis", protocol: "http", latency: 5,
        reason: "JavaScript hands off async tasks like setTimeout() or fs.readFile() to Web APIs / libuv. The call stack continues operating synchronously.",
    },
    {
        id: "c2", source: "web-apis", target: "thread-pool", protocol: "http", latency: 10,
        reason: "libuv delegates the blocking operation (e.g., file system read) to one of its background worker threads.",
    },
    {
        id: "c3", source: "thread-pool", target: "io-operation", protocol: "http", latency: 100,
        reason: "The background thread executes the actual blocking I/O operation without blocking the JavaScript main thread.",
    },
    {
        id: "c4", source: "io-operation", target: "microtask-queue", protocol: "http", latency: 5,
        reason: "Operation completes. Before checking regular callbacks, the event loop ensures all high-priority Promises (microtasks) are resolved first.",
    },
    {
        id: "c5", source: "microtask-queue", target: "macrotask-queue", protocol: "http", latency: 5,
        reason: "Microtasks are completely drained. The callback for our I/O operation is now placed into the macrotask queue.",
    },
    {
        id: "c6", source: "macrotask-queue", target: "timer-phase", protocol: "http", latency: 5,
        reason: "The event loop starts its iteration by checking the timer phase for any expired setTimeout/setInterval callbacks.",
    },
    {
        id: "c7", source: "timer-phase", target: "poll-phase", protocol: "http", latency: 5,
        reason: "After timers, it moves to the poll phase to execute any queued I/O callbacks, like the one we just received.",
    },
    {
        id: "c8", source: "poll-phase", target: "check-phase", protocol: "http", latency: 5,
        reason: "Following the poll phase, the event loop runs any setImmediate callbacks waiting in the check phase.",
    },
    {
        id: "c9", source: "check-phase", target: "response", protocol: "http", latency: 5,
        reason: "The callback execution concludes, and the network stack sends the final response back to the client.",
    },
];

export function getEventLoopModuleConfig(): ModuleConfig {
    return {
        moduleId: "event-loop",
        nodes,
        connections,
        initialPackets: [
            {
                id: "pkt_async",
                protocol: "http",
                payload: "fs.readFile('./data.json', callback)",
                label: "Async I/O Request",
                currentNodeId: "call-stack",
                sourceNodeId: "call-stack",
                targetNodeId: "web-apis",
                path: ["call-stack"],
                progress: 0,
                status: "pending",
                createdAt: Date.now(),
            },
        ],
        whyModePrompts: [
            {
                question: "fs.readFile() was called. Where does the actual file reading happen?",
                options: [
                    { label: "On the JavaScript main thread (call stack)", isCorrect: false },
                    { label: "In libuv's thread pool - one of the default 4 threads", isCorrect: true },
                    { label: "In the microtask queue", isCorrect: false },
                    { label: "In the browser's Web APIs", isCorrect: false },
                ],
                correctIndex: 1,
                explanation: "File system operations are blocking at the OS level, so libuv delegates them to a thread pool (default: 4 threads). Network I/O uses OS async APIs instead. If all 4 threads are busy, the 5th fs call waits.",
                connectionId: "c2",
                nodeId: "web-apis",
            },
            {
                question: "Both a Promise.then() callback and a setTimeout(fn, 0) are queued. Which runs first?",
                options: [
                    { label: "setTimeout - timers are checked first in the event loop", isCorrect: false },
                    { label: "They run in the order they were queued", isCorrect: false },
                    { label: "Promise.then - microtasks ALWAYS run before macrotasks", isCorrect: true },
                    { label: "It's random / non-deterministic", isCorrect: false },
                ],
                correctIndex: 2,
                explanation: "Microtasks (Promises, process.nextTick) have absolute priority over macrotasks (setTimeout, I/O). After EVERY call stack operation, the entire microtask queue is drained before the event loop moves to the next macrotask. This is deterministic, not random.",
                connectionId: "c6",
                nodeId: "microtask-queue",
            },
            {
                question: "A recursive process.nextTick() is called inside itself. What happens?",
                options: [
                    { label: "It runs once per event loop iteration - safe and controlled", isCorrect: false },
                    { label: "It starves the event loop - no I/O or timers can ever execute", isCorrect: true },
                    { label: "Node.js detects the loop and throws an error", isCorrect: false },
                    { label: "It fills the macrotask queue and slows down", isCorrect: false },
                ],
                correctIndex: 1,
                explanation: "process.nextTick() is a microtask with the HIGHEST priority - it runs before even Promise callbacks. Recursive nextTick creates an infinite microtask loop: the event loop never advances to I/O or timers. Your server becomes completely unresponsive. Use setImmediate() instead for safe recursion.",
                connectionId: "c5",
                nodeId: "call-stack",
            },
            {
                question: "setTimeout(fn, 100) is set. The poll phase takes 200ms processing I/O. When does the timer fire?",
                options: [
                    { label: "Exactly at 100ms - timers are precise", isCorrect: false },
                    { label: "At ~200ms - after the poll phase completes and the loop circles back to timers", isCorrect: true },
                    { label: "It interrupts the poll phase at 100ms", isCorrect: false },
                    { label: "It never fires because poll phase has priority", isCorrect: false },
                ],
                correctIndex: 1,
                explanation: "setTimeout guarantees a MINIMUM delay, not an exact one. The event loop can't interrupt the poll phase mid-callback. It finishes poll, then checks timers at the start of the next iteration. If poll took 200ms, your '100ms' timer fires at ~200ms. This is why 'setTimeout(fn, 0)' often fires after 1-4ms, not 0ms.",
                connectionId: "c8",
                nodeId: "timer-phase",
            },
        ],
        learningStory: {
            title: "The Relay Race",
            content: "The Event Loop is what makes Node.js (the 'N' in MERN) super fast! Imagine a relay race where one runner (the main thread) is very fast but can't carry heavy things. When they get a heavy box (like reading a big file), they don't stop! They hand the box to a teammate (libuv), keep running, and just pick up the result later.",
            analogy: "A chef (Node.js) who has a helper (libuv). The chef doesn't wait for the water to boil; they tell the helper to watch it and go start chopping onions. When the water boils, the helper shouts 'Done!'",
            lookFor: "Watch the 'Call Stack' and the 'Event Loop' circle. Notice how the relay race never stops-even while 'I/O Operations' are working in the background on other threads!"
        }
    };
}

/**
 * Creates a managed Event Loop scenario that drives the EventLoopEngine
 * alongside the SimulationEngine for coordinated visualization.
 */
export class EventLoopModule {
    private engine = new EventLoopEngine();
    private simEngine: SimulationEngine;

    constructor(simEngine: SimulationEngine) {
        this.simEngine = simEngine;
    }

    initialize(): void {
        this.engine.reset();
        this.simEngine.loadModule(getEventLoopModuleConfig());
        this.simEngine.log("info", "Event Loop module loaded - async I/O simulation ready.");
        this.simEngine.addTimelineEvent("Module Loaded", "Event Loop simulation initialized");
    }

    runScenario(): void {
        this.engine.pushToCallStack("handleRequest()");
        this.simEngine.log("info", "→ handleRequest() pushed to Call Stack");
        this.simEngine.addTimelineEvent("Call Stack", "handleRequest() pushed");

        this.engine.addToPendingIO("fs.readFile()");
        this.simEngine.log("warn", "→ fs.readFile() offloaded to libuv thread pool (async)");
        this.simEngine.addTimelineEvent("Thread Pool", "fs.readFile() dispatched");

        this.engine.popFromCallStack();
        this.simEngine.log("info", "← handleRequest() popped - call stack empty, event loop free");

        this.engine.completeIO("fs.readFile()");
        this.simEngine.log("success", "✓ fs.readFile() complete → callback queued in macrotask queue");
        this.simEngine.addTimelineEvent("I/O Complete", "Callback moved to macrotask queue");

        const promoted = this.engine.tick();
        if (promoted) {
            this.simEngine.log("info", `🔄 Event Loop tick → "${promoted}" promoted to Call Stack`);
            this.simEngine.addTimelineEvent("Event Loop Tick", `${promoted} moved to Call Stack`);
        }
    }

    getState() {
        return this.engine.getState();
    }

    reset(): void {
        this.engine.reset();
    }
}
