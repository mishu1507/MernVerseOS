// ========================================
// Express Module - Level 3 Engineering Depth
// next() mechanics, error middleware, header locking, async flow
// ========================================

import type { ModuleConfig, SystemNode, Connection } from "../../engine/types/system.types";

const nodes: SystemNode[] = [
    {
        id: "http-parser",
        name: "HTTP Parser",
        icon: "📨",
        category: "gateway",
        runtime: "event-loop",
        position: { x: 60, y: 180 },
        state: "idle",
        metadata: { library: "llhttp (Node.js)", parses: "method, url, headers, body" },
        explanation: "What: Raw TCP bytes arrive and are parsed by llhttp (Node.js HTTP parser) into a structured request object. It extracts method, URL, headers, and streams the body. Why: HTTP is a text protocol - the parser converts it into something JavaScript can work with. Breaks when: Malformed requests (invalid headers, oversized payloads) - configure maxHeaderSize and request body limits.",
    },
    {
        id: "req-object",
        name: "Request Object",
        icon: "📋",
        category: "service",
        runtime: "event-loop",
        position: { x: 200, y: 60 },
        state: "idle",
        metadata: { fields: "req.method, req.url, req.headers, req.params, req.query, req.body" },
        explanation: "What: Express wraps the raw Node.js IncomingMessage into a rich Request object with helpers: req.params (route params), req.query (query string), req.body (parsed body), req.cookies, req.ip. Why: Raw HTTP is inconvenient - Express adds a convenience layer. Breaks when: req.body is undefined because you forgot body-parser middleware. Express does NOT parse bodies by default - you need express.json() or express.urlencoded().",
    },
    {
        id: "route-matcher",
        name: "Route Matcher",
        icon: "🔍",
        category: "service",
        runtime: "event-loop",
        position: { x: 200, y: 300 },
        state: "idle",
        metadata: { algorithm: "linear scan, first match wins", supports: "string, regex, :param" },
        explanation: "What: Express scans routes in registration ORDER. For each route, it checks: does the method match? Does the path match (using path-to-regexp)? First match wins. Why: Registration order IS priority. If you register a catch-all /* before specific routes, it catches everything. Breaks when: Routes are in wrong order (catch-all before specific), or when you register the same route twice (first one always wins). Also: route params (:id) are greedy - /users/:id matches /users/anything.",
    },
    {
        id: "middleware-stack",
        name: "Middleware Stack",
        icon: "📚",
        category: "middleware",
        runtime: "event-loop",
        position: { x: 380, y: 60 },
        state: "idle",
        metadata: { structure: "array of functions", execution: "sequential, via next()" },
        explanation: "What: Middleware is an ordered array of functions. Each receives (req, res, next). They execute sequentially - each must call next() to pass control, or send a response to end the chain. Why: This is Express's core architecture - it composes behavior through chaining. CORS, auth, logging, parsing are all middleware. Breaks when: Middleware is registered in the wrong order. Example: if CORS middleware runs AFTER your route handler, CORS headers are never set. Order of app.use() calls is the execution order.",
    },
    {
        id: "next-dispatcher",
        name: "next() Dispatcher",
        icon: "➡️",
        category: "service",
        runtime: "event-loop",
        position: { x: 380, y: 180 },
        state: "idle",
        metadata: { behavior: "advances to next middleware/handler" },
        explanation: "What: Calling next() tells Express to move to the next middleware or route handler in the stack. Calling next('route') skips remaining middleware in the current route and jumps to the next route. Calling next(err) jumps directly to error-handling middleware. Why: next() is the control flow mechanism - without it, Express can't chain middleware. Breaks when: next() is never called AND no response is sent - the request HANGS forever. The client eventually times out. This is the #1 Express debugging issue for beginners. Also: calling next() AFTER sending a response causes 'headers already sent' errors.",
    },
    {
        id: "body-parser",
        name: "Body Parser",
        icon: "📦",
        category: "middleware",
        runtime: "event-loop",
        position: { x: 380, y: 300 },
        state: "idle",
        metadata: { types: "application/json, application/x-www-form-urlencoded, multipart/form-data" },
        explanation: "What: Reads the request body stream, buffers it, and parses it based on Content-Type. express.json() parses JSON bodies, express.urlencoded() handles form data. Why: HTTP body is a stream, not a string - you must fully read and parse it before using req.body. Breaks when: Content-Type header doesn't match the actual body format, or body exceeds size limits (default: 100KB for JSON). For file uploads, use multer - express.json() can't handle multipart.",
    },
    {
        id: "auth-middleware",
        name: "Auth Middleware",
        icon: "🔐",
        category: "middleware",
        runtime: "event-loop",
        position: { x: 560, y: 60 },
        state: "idle",
        metadata: { checks: "JWT, API key, session cookie" },
        explanation: "What: Validates authentication credentials on the request. Extracts token from Authorization header or cookies, verifies signature and expiration. Attaches user data to req.user. Why: Auth middleware runs BEFORE your handler - unauthenticated requests are rejected early, saving resources. Breaks when: Auth middleware is registered AFTER some routes - those routes are unprotected. Always use app.use(authMiddleware) before protected route definitions.",
    },
    {
        id: "handler",
        name: "Route Handler",
        icon: "⚙️",
        category: "service",
        runtime: "event-loop",
        position: { x: 560, y: 180 },
        state: "idle",
        metadata: { receives: "(req, res) with all middleware transformations applied" },
        explanation: "What: Your business logic. By the time it runs, the request has been parsed, authenticated, and validated by middleware. The handler queries databases, processes data, and builds the response. Why: Handlers should be thin - heavy logic belongs in service layers. Breaks when: Async errors in handlers are unhandled. In Express 4, async function errors DON'T trigger error middleware - you must wrap in try/catch or use express-async-errors. Express 5 fixes this.",
    },
    {
        id: "error-middleware",
        name: "Error Middleware",
        icon: "🚨",
        category: "middleware",
        runtime: "event-loop",
        position: { x: 560, y: 300 },
        state: "idle",
        metadata: { signature: "(err, req, res, next)", detection: "Express checks function.length === 4" },
        explanation: "What: Error-handling middleware has FOUR parameters: (err, req, res, next). Express identifies error handlers by checking function.length === 4 - this is why you MUST include all 4, even if unused. Why: Centralizes error handling. When any middleware calls next(err) or throws, Express skips all normal middleware and jumps to the first error handler. Breaks when: You use (err, req, res) with only 3 params - Express treats it as normal middleware and never calls it for errors. Also: arrow functions with default params can change function.length - use regular functions for error handlers.",
    },
    {
        id: "res-builder",
        name: "Response Builder",
        icon: "🏗️",
        category: "service",
        runtime: "event-loop",
        position: { x: 740, y: 180 },
        state: "idle",
        metadata: { methods: "res.json(), res.send(), res.status(), res.set(), res.cookie()" },
        explanation: "What: The Response object provides methods to build and send the HTTP response. res.status() sets the status code, res.set() sets headers, res.json() serializes data and sends it. Why: Express abstracts raw HTTP response handling - you don't need to manually write headers and chunked transfer encoding. Breaks when: Headers are set AFTER res.send()/res.json() - response headers are 'locked' once the body starts streaming. ERR_HTTP_HEADERS_SENT is the error. Also: calling res.json() twice sends two responses - the second throws.",
    },
    {
        id: "response",
        name: "HTTP Response",
        icon: "📤",
        category: "client",
        runtime: "event-loop",
        position: { x: 740, y: 60 },
        state: "idle",
        metadata: {},
        explanation: "What: The serialized response (status line + headers + body) is written to the TCP socket and sent back to the client. Why: HTTP is request-response - exactly one response per request. Breaks when: No response is ever sent - client times out. Or when the connection drops mid-response (client disconnected). Listen for req.on('close') to detect abandoned requests and cancel expensive operations.",
    },
];

const connections: Connection[] = [
    {
        id: "c1", source: "http-parser", target: "req-object", protocol: "http", latency: 5,
        reason: "Raw TCP bytes are parsed into a Request object. llhttp extracts method, URL, and headers.",
    },
    {
        id: "c2", source: "req-object", target: "route-matcher", protocol: "http", latency: 5,
        reason: "Once the Request object is structured, Express scans routes in registration order to find a match.",
    },
    {
        id: "c3", source: "route-matcher", target: "middleware-stack", protocol: "http", latency: 5,
        reason: "Route matched. Express now begins the middleware chain starting with the global stack.",
    },
    {
        id: "c4", source: "middleware-stack", target: "next-dispatcher", protocol: "http", latency: 5,
        reason: "Middleware executes and calls next() to advance. If next() isn't called, the request stops here.",
    },
    {
        id: "c5", source: "next-dispatcher", target: "body-parser", protocol: "http", latency: 10,
        reason: "next() leads to the Body Parser. It buffers and parses the request stream based on Content-Type.",
    },
    {
        id: "c6", source: "body-parser", target: "auth-middleware", protocol: "http", latency: 5,
        reason: "With the body available, Auth middleware verifies the JWT or session headers.",
    },
    {
        id: "c7", source: "auth-middleware", target: "handler", protocol: "http", latency: 5,
        reason: "Auth cleared. Control reaches the logic handler where business rules are applied.",
    },
    {
        id: "c8", source: "handler", target: "error-middleware", protocol: "http", latency: 5,
        reason: "Handler wraps execution in try/catch. Any errors trigger next(err) and jump to Error Middleware.",
    },
    {
        id: "c9", source: "error-middleware", target: "res-builder", protocol: "http", latency: 5,
        reason: "Error handled or skipped. The Response Builder sets headers and serializes output.",
    },
    {
        id: "c10", source: "res-builder", target: "response", protocol: "http", latency: 30,
        reason: "Final bytes are sent back over the wire. Exactly one response per request.",
    },
];

export function getExpressModuleConfig(): ModuleConfig {
    return {
        moduleId: "express",
        nodes,
        connections,
        initialPackets: [
            {
                id: "pkt_req",
                protocol: "http",
                payload: "POST /api/users { name: 'Alice' }",
                label: "POST Request",
                currentNodeId: "http-parser",
                sourceNodeId: "http-parser",
                targetNodeId: "req-object",
                path: ["http-parser"],
                progress: 0,
                status: "pending",
                createdAt: Date.now(),
            },
        ],
        whyModePrompts: [
            {
                question: "Middleware function runs but never calls next() and never sends a response. What happens?",
                options: [
                    { label: "Express automatically moves to the next middleware after a timeout", isCorrect: false },
                    { label: "The request hangs forever - the client eventually times out", isCorrect: true },
                    { label: "Express throws an error and calls error middleware", isCorrect: false },
                    { label: "The middleware is skipped", isCorrect: false },
                ],
                correctIndex: 1,
                explanation: "Express has NO timeout mechanism for middleware. If you don't call next() and don't send a response, the request hangs indefinitely. The client eventually times out with no error on the server side. This is the #1 Express debugging issue.",
                connectionId: "c4",
                nodeId: "next-dispatcher",
            },
            {
                question: "You define error-handling middleware as (err, req, res) => { ... } - with 3 parameters. What happens?",
                options: [
                    { label: "It works fine - Express detects the 'err' parameter name", isCorrect: false },
                    { label: "Express treats it as normal middleware - it's NEVER called for errors", isCorrect: true },
                    { label: "Express throws a configuration error at startup", isCorrect: false },
                    { label: "It handles errors but also runs for normal requests", isCorrect: false },
                ],
                correctIndex: 1,
                explanation: "Express identifies error handlers by checking function.length === 4. With only 3 params, it's treated as normal middleware. You MUST include all 4 parameters: (err, req, res, next), even if you don't use 'next'. This is one of Express's most subtle gotchas.",
                connectionId: "c8",
                nodeId: "handler",
            },
            {
                question: "The handler calls res.json(data), then later tries to set a header. What happens?",
                options: [
                    { label: "The header is added to the response normally", isCorrect: false },
                    { label: "ERR_HTTP_HEADERS_SENT - headers are locked after the body starts sending", isCorrect: true },
                    { label: "The header is queued for the next response", isCorrect: false },
                    { label: "Express ignores the header silently", isCorrect: false },
                ],
                correctIndex: 1,
                explanation: "HTTP sends headers BEFORE the body. Once res.send(), res.json(), or res.write() is called, headers are flushed to the socket and can't be modified. This commonly happens when you accidentally send two responses (e.g., res.json() in both a try and finally block).",
                connectionId: "c9",
                nodeId: "res-builder",
            },
            {
                question: "An async route handler throws an error: async (req, res) => { throw new Error('fail'); }. Does error middleware catch it?",
                options: [
                    { label: "Yes - Express automatically catches async errors", isCorrect: false },
                    { label: "No - in Express 4, unhandled async rejections crash the process", isCorrect: true },
                    { label: "Express retries the handler", isCorrect: false },
                    { label: "The error is logged but the response is sent normally", isCorrect: false },
                ],
                correctIndex: 1,
                explanation: "Express 4 does NOT catch errors from async functions. They become unhandled promise rejections. Fix: wrap handlers in try/catch, use express-async-errors package, or upgrade to Express 5 which handles async errors natively.",
                connectionId: "c7",
                nodeId: "auth-middleware",
            },
        ],
        learningStory: {
            title: "The Polite Waiter",
            content: "Express is the 'E' in MERN! It acts like a waiter in a restaurant. When you (the client) ask for a 'Pizza' (a request), Express takes your order, checks if the kitchen is open (middleware), and brings the pizza back to your table (response). Without the waiter, you'd have to go into the kitchen yourself and it would be a mess!",
            analogy: "A waiter taking orders and bringing food. They make sure you washed your hands (auth) before you eat!",
            lookFor: "Watch the 'Route Matcher' and 'Middleware Stack' nodes. Notice how they look at the packet labels and decide which 'Auth' or 'Body Parser' check to run before letting it reach the 'Handler'."
        }
    };
}
