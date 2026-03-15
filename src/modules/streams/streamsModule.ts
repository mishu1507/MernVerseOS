import type { ModuleConfig, SystemNode, Connection } from "../../engine/types/system.types";

const nodes: SystemNode[] = [
    {
        id: "source",
        name: "Data Source",
        icon: "💿",
        category: "database",
        runtime: "blocking",
        position: { x: 60, y: 200 },
        state: "idle",
        metadata: {},
        explanation: "The data source is any producer of data — a file on disk, database result set, HTTP response, or network socket. It can be arbitrarily large (gigabytes of logs, a video file, infinite sensor data). Reading the entire source into memory at once would exhaust RAM. Streams process data chunk by chunk — a 10GB log file can be processed with constant ~64KB memory usage.",
    },
    {
        id: "readable",
        name: "Readable Stream",
        icon: "🌊",
        category: "service",
        runtime: "event-loop",
        position: { x: 260, y: 200 },
        state: "idle",
        metadata: {},
        explanation: "A Readable stream emits data events with chunks of data then an end event when finished. Two modes: flowing (data events fire automatically) and paused (you call .read() manually). If the consumer is slower than the producer the buffer fills — this is the backpressure problem. Readable streams abstract the source — whether file, network, or database the API is identical.",
    },
    {
        id: "transform",
        name: "Transform Stream",
        icon: "🔄",
        category: "middleware",
        runtime: "event-loop",
        position: { x: 460, y: 200 },
        state: "idle",
        metadata: {},
        explanation: "Transform streams are both Readable and Writable — they consume chunks, transform them, and output new chunks. Built-in transforms: zlib (compression), crypto (encryption), text encoders. Transforms enable pipe-based processing: readFile.pipe(gzip).pipe(encrypt).pipe(writeFile) — the file is compressed and encrypted while being read without loading it into memory.",
    },
    {
        id: "backpressure",
        name: "Backpressure Control",
        icon: "🚰",
        category: "middleware",
        runtime: "event-loop",
        position: { x: 460, y: 360 },
        state: "idle",
        metadata: {},
        explanation: "Backpressure occurs when the writable stream cannot consume data as fast as the readable produces it. The writable internal buffer fills up. Node .pipe() handles this automatically — it pauses the readable when the writable buffer is full and resumes when drained. Without backpressure management memory spikes until OOM crash.",
    },
    {
        id: "writable",
        name: "Writable Stream",
        icon: "📝",
        category: "service",
        runtime: "event-loop",
        position: { x: 680, y: 200 },
        state: "idle",
        metadata: {},
        explanation: "Writable streams consume chunks — writing to a file, sending HTTP response bytes, writing to stdout. .write(chunk) returns false when the internal buffer is full (signal to pause the readable). Writable streams abstract the destination — same API whether writing to disk, network, or memory.",
    }
];

const connections: Connection[] = [
    { id: "c1", source: "source", target: "readable", protocol: "internal", latency: 5, reason: "fs.createReadStream creates a Readable that emits 64KB chunks. The file is NOT loaded into memory — only the current chunk exists." },
    { id: "c2", source: "readable", target: "transform", protocol: "internal", latency: 5, reason: "readable.pipe(transform) — each chunk flows from readable to transform. Transform processes (gzip/parse/encrypt) and emits new chunks downstream." },
    { id: "c3", source: "transform", target: "backpressure", protocol: "internal", latency: 5, reason: "Transform checks if writable can accept more data. If writable.write() returns false backpressure kicks in — readable.pause() called automatically by .pipe()." },
    { id: "c4", source: "backpressure", target: "writable", protocol: "internal", latency: 5, reason: "Backpressure balanced. Chunks flow to the writable destination at a controlled rate — no memory overflow." },
    { id: "c5", source: "readable", target: "writable", protocol: "internal", latency: 10, reason: "Fast path: readable.pipe(writable) with no transform. Direct chunk flow with automatic backpressure management." }
];

export function getStreamsModuleConfig(): ModuleConfig {
    return {
        moduleId: "streams",
        nodes,
        connections,
        initialPackets: [
            {
                id: "pkt_stream",
                protocol: "internal",
                label: "Stream Pipeline",
                payload: "fs.createReadStream('10GB.csv').pipe(gzip).pipe(res)",
                sourceNodeId: "source",
                targetNodeId: "readable",
                currentNodeId: "source",
                path: ["source"],
                progress: 0,
                status: "pending",
                createdAt: Date.now(),
            }
        ],
        whyModePrompts: [
            {
                question: "You use fs.readFile() to read a 2GB log file and send it as HTTP response. What happens?",
                options: [
                    { label: "Works fine — Node.js handles large files automatically", isCorrect: false },
                    { label: "Server crashes — entire 2GB is loaded into RAM then sent. Memory exhausted.", isCorrect: true },
                    { label: "Node.js streams it automatically", isCorrect: false },
                    { label: "The request times out", isCorrect: false },
                ],
                correctIndex: 1,
                explanation: "fs.readFile() loads the ENTIRE file into a Buffer in memory before calling your callback. A 2GB file = 2GB RAM usage plus copy to HTTP response buffer = 4GB peak. Server crashes with JavaScript heap out of memory. Fix: fs.createReadStream('./file').pipe(res) — streams 64KB chunks directly to the response without ever holding more than 64KB in memory.",
                connectionId: "c1",
                nodeId: "readable",
            }
        ],
        learningStory: {
            title: "The Water Pipeline",
            content: "Streams are like water pipes. Instead of filling a massive tank with all the water first then transporting the tank, streams flow water continuously through pipes. The Readable stream is the water source (tap), Transform streams are water treatment filters, and the Writable stream is your glass. Backpressure is like a float valve — it slows the tap when the glass is nearly full.",
            analogy: "Watching Netflix vs downloading first. Netflix streams video chunks — your device never holds the entire movie, just the current few seconds. This is exactly what Node.js streams do for files and data.",
            lookFor: "Notice the Backpressure Control node — it is the traffic cop of the stream. When the Writable cannot keep up it signals slow down upstream. Without it the Transform node would accumulate data until memory explodes!"
        }
    };
}
