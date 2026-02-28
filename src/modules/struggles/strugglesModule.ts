import type { ModuleConfig, SystemNode, Connection } from "../../engine/types/system.types";

const nodes: SystemNode[] = [
    {
        id: "cors",
        name: "CORS Errors",
        icon: "🚫",
        category: "gateway",
        runtime: "event-loop",
        position: { x: 100, y: 150 },
        state: "idle",
        metadata: { "Type": "Browser Security", "Fix": "cors middleware" },
        explanation: "Cross-Origin Resource Sharing. Browsers block frontend code (React on port 3000) from requesting data from an API on a different port (Express on 5000) unless the server explicitly allows it using CORS headers.",
    },
    {
        id: "async",
        name: "Async / Promises",
        icon: "⏳",
        category: "service",
        runtime: "event-loop",
        position: { x: 350, y: 150 },
        state: "idle",
        metadata: { "Type": "JS Concurrency", "Fix": "async/await" },
        explanation: "JavaScript doesn't wait for database calls to finish. If you don't use 'await' or '.then()', your code will move on, returning undefined or empty data before the database responds.",
    },
    {
        id: "state",
        name: "React Re-renders",
        icon: "⚛",
        category: "client",
        runtime: "reactive",
        position: { x: 600, y: 150 },
        state: "idle",
        metadata: { "Type": "React Hooks", "Fix": "useEffect dependencies" },
        explanation: "Infinite loops! Setting state inside a render function or having flawed useEffect dependency arrays will cause React to render, set state, render, set state... until the browser crashes.",
    },
    {
        id: "rxjs",
        name: "RxJS / Observables",
        icon: "🅰️",
        category: "client",
        runtime: "reactive",
        position: { x: 850, y: 150 },
        state: "idle",
        metadata: { "Type": "Angular Streams", "Fix": "subscribe/unsubscribe" },
        explanation: "The hardest part of Angular. Instead of Promises, Angular uses streams of data over time. You have to 'subscribe' to get data, and 'unsubscribe' to prevent memory leaks.",
    },
    {
        id: "jwt",
        name: "JWT Auth Flow",
        icon: "🔐",
        category: "service",
        runtime: "blocking",
        position: { x: 850, y: 350 },
        state: "idle",
        metadata: { "Type": "Security", "Fix": "HttpOnly Cookies" },
        explanation: "Stateless authentication. Developers struggle with where to store the token (localStorage is vulnerable to XSS; HttpOnly cookies are better) and how to handle token expiration (Refresh tokens).",
    },
    {
        id: "mongo",
        name: "Mongo Aggregation",
        icon: "🍃",
        category: "database",
        runtime: "blocking",
        position: { x: 600, y: 350 },
        state: "idle",
        metadata: { "Type": "NoSQL Queries", "Fix": "aggregate pipeline" },
        explanation: "Because MongoDB is NoSQL, there are no 'JOIN' tables. To combine data from two collections (like Users and Posts), you must use complex '$lookup' aggregations, which have a steep learning curve.",
    }
];

const connections: Connection[] = [
    {
        id: "c1", source: "cors", target: "async", protocol: "http", latency: 15,
        reason: "Once past CORS, your frontend hits an Async database route.",
    },
    {
        id: "c2", source: "async", target: "state", protocol: "websocket", latency: 20,
        reason: "Async data comes back to React, triggering state changes.",
    },
    {
        id: "c3", source: "state", target: "rxjs", protocol: "http", latency: 15,
        reason: "After struggling in React, the developer tries Angular's observables instead.",
    },
    {
        id: "c4", source: "rxjs", target: "jwt", protocol: "http", latency: 15,
        reason: "Angular Observables intercepting HTTP requests to attach JWT tokens.",
    },
    {
        id: "c5", source: "jwt", target: "mongo", protocol: "db-query", latency: 25,
        reason: "Verified tokens query MongoDB using complex aggregations.",
    }
];

export function getStrugglesModuleConfig(): ModuleConfig {
    return {
        moduleId: "struggles",
        nodes,
        connections,
        initialPackets: [
            {
                id: "pkt_struggle1",
                protocol: "http",
                payload: "Navigating Struggles...",
                label: "Hard Parts Flow",
                currentNodeId: "cors",
                sourceNodeId: "cors",
                targetNodeId: "async",
                path: ["cors"],
                progress: 0,
                status: "pending",
                createdAt: Date.now(),
            }
        ],
        whyModePrompts: [
            {
                question: "Why does the browser throw a CORS error when your React app tries to fetch from your Express server on localhost?",
                options: [
                    { label: "Because React does not support HTTP requests.", isCorrect: false },
                    { label: "Because they are running on different ports, which the browser considers different 'Origins'.", isCorrect: true },
                    { label: "Because the Express server is offline.", isCorrect: false },
                    { label: "Because MongoDB is blocking the request.", isCorrect: false },
                ],
                correctIndex: 1,
                explanation: "Browsers enforce the Same-Origin Policy. Since React is usually on localhost:3000 and Express on localhost:5000, they are technically different origins. Express must use the 'cors' package to add headers allowing React to read the response.",
                connectionId: "c1",
                nodeId: "cors",
            }
        ],
        learningStory: {
            title: "The Wall of Struggles",
            content: "Every developer learning the MERN / MEAN stack hits these specific walls. CORS blocks your API, Async code runs out of order, infinite re-renders crash React, and RxJS streams confuse Angular devs. Finally making it to the backend means dealing with Auth flows and Mongo Aggregations!",
            analogy: "It's like an obstacle course. You must jump the CORS hurdle, navigate the Async maze, balance on the State tightrope, switch to Angular streams, wrap it in JWT security, and finally decipher the Mongo Aggregation puzzle to become a Full-Stack Engineer.",
            lookFor: "Follow along on the continuous mega-flow of stack struggles."
        }
    };
}
