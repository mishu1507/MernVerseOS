import type { ModuleConfig, SystemNode, Connection } from "../../engine/types/system.types";

const nodes: [SystemNode, ...SystemNode[]] = [
    {
        id: "origin",
        name: "Client Request",
        icon: "🌐",
        category: "client",
        runtime: "reactive",
        position: { x: 60, y: 220 },
        state: "idle",
        metadata: {},
        explanation: "The journey begins here. A user submits a form or clicks a button. Errors can happen at any stage: network timeout, validation failure, database error, or code bug. Proper error handling means catching these and letting the user know 'Something went wrong, please try again' instead of a white screen or a spinning loader.",
    },
    {
        id: "try-catch-1",
        name: "Backend: try/catch",
        icon: "🛡️",
        category: "middleware",
        runtime: "event-loop",
        position: { x: 280, y: 100 },
        state: "idle",
        metadata: {},
        explanation: "The first line of defense. Wrap your controller logic in try/catch. If an error occurs (DB is down, JWT is invalid) the catch block executes. This prevents the entire server from crashing. NEVER use a catch block and just leave it empty — always log the error and send a response!",
    },
    {
        id: "logger",
        name: "Error Logger (Winston)",
        icon: "📝",
        category: "service",
        runtime: "event-loop",
        position: { x: 280, y: 340 },
        state: "idle",
        metadata: {},
        explanation: "When an error happens LOG IT. Winston or Pino log the error message, the stack trace, and the context (userId, request body). In production these logs go to a central system (ELK, Datadog). Without logging you are flying blind — you'll know users are frustrated but you won't know WHY.",
    },
    {
        id: "error-middleware",
        name: "Global Error Middleware",
        icon: "🚰",
        category: "gateway",
        runtime: "event-loop",
        position: { x: 500, y: 220 },
        state: "idle",
        metadata: {},
        explanation: "In Express/Node a special middleware (err, req, res, next) catches any error passed via next(err). This is where you format the response: hide internal stack traces from the user (Security!) but include 4xx/5xx status codes and user-friendly messages. It's the last stop before the response goes back to the client.",
    },
    {
        id: "frontend-catch",
        name: "Frontend: Axios catch()",
        icon: "🎣",
        category: "client",
        runtime: "reactive",
        position: { x: 720, y: 100 },
        state: "idle",
        metadata: {},
        explanation: "The backend error response arrives. Axios detects the 4xx/5xx status and throws an error. Your frontend code must catch this: .catch(err => { setError(err.message) }). This is where you turn technical error codes into UI elements like red toast notifications or error banners.",
    },
    {
        id: "error-boundary",
        name: "React Error Boundary",
        icon: "🧱",
        category: "client",
        runtime: "reactive",
        position: { x: 720, y: 340 },
        state: "idle",
        metadata: {},
        explanation: "If a component crashes during RENDER (e.g. trying to read property of null), the Error Boundary catches it. This prevents the whole React app from unmounting. It shows a 'fallback UI' instead of a broken page. Use this to isolate flaky parts of your app like third-party widgets.",
    }
];

const connections: Connection[] = [
    { id: "c1", source: "origin", target: "try-catch-1", protocol: "http", latency: 5, reason: "Request arrives at backend. Logic enters protected try/catch block." },
    { id: "c2", source: "try-catch-1", target: "logger", protocol: "internal", latency: 2, reason: "Error happens! logger.error() records the full stack trace for developers." },
    { id: "c3", source: "try-catch-1", target: "error-middleware", protocol: "internal", latency: 2, reason: "Error passed to next(err). Global middleware now takes over formatting." },
    { id: "c4", source: "error-middleware", target: "frontend-catch", protocol: "http", latency: 20, reason: "Formatted JSON error {message: 'Access Denied'} sent to browser with 403 status." },
    { id: "c5", source: "frontend-catch", target: "error-boundary", protocol: "internal", latency: 5, reason: "Frontend receives the error. If UI rendering fails while showing error, the Boundary catches it." }
];

export function getErrorFlowModuleConfig(): ModuleConfig {
    return {
        moduleId: "error-handling",
        nodes,
        connections,
        initialPackets: [
            {
                id: "pkt_err",
                protocol: "http",
                label: "Failed Request",
                payload: "GET /api/private-data (No Token)",
                sourceNodeId: "origin",
                targetNodeId: "try-catch-1",
                currentNodeId: "origin",
                path: ["origin"],
                progress: 0,
                status: "pending",
                createdAt: Date.now(),
            }
        ],
        whyModePrompts: [
            {
                question: "Why should you NOT send the full error stack trace to the frontend in production?",
                options: [
                    { label: "It makes the JSON response too large", isCorrect: false },
                    { label: "It leaks server file paths, database structure, and library versions to attackers", isCorrect: true },
                    { label: "React cannot display multi-line strings", isCorrect: false },
                    { label: "Browsers often block stack traces for security", isCorrect: false },
                ],
                correctIndex: 1,
                explanation: "Stack traces are for DEVELOPERS, not users. They reveal your server's internal directory structure (e.g., /home/user/project/...) and the exact line numbers where bugs occur. Attackers can use this info to find vulnerabilities. Global Error Middleware should strip stack traces in production and only send a generic message or a unique error ID for cross-referencing logs.",
                connectionId: "c3",
                nodeId: "error-middleware",
            }
        ],
        learningStory: {
            title: "The Safety Net System",
            content: "Error handling is like a series of safety nets in a circus. The acrobat (your code) is performing a difficult trick. If they fall, the first net (try/catch) catches them. If that net breaks, there is a giant padded floor (Global Middleware). Finally, the announcer tells the audience there will be a brief intermission (UI Toast Notification) instead of everyone panicking.",
            analogy: "A car's dashboard lights. When the engine has a problem, it doesn't just stop instantly on the highway. Instead, a sensor (logger) records the fault, a 'Check Engine' light (frontend catch) turns on, and the car enters 'limp mode' so you can safely pull over. You get a clear signal instead of a total mystery.",
            lookFor: "Trace the path from the error source to the UI. Notice how the error gets 'sanitized' at the Middleware node before reaching the client. This is the balance between being helpful to the user and staying secure!"
        }
    };
}
