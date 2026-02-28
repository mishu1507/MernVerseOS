import type { ModuleConfig, SystemNode, Connection } from "../../engine/types/system.types";

const nodes: SystemNode[] = [
    {
        id: "m",
        name: "MongoDB (M)",
        icon: "🍃",
        category: "database",
        runtime: "blocking",
        position: { x: 100, y: 300 },
        state: "idle",
        metadata: { "Type": "NoSQL Database", "Data": "BSON/JSON" },
        explanation: "The Foundation. Stores data in flexible, JSON-like documents. Because it uses BSON under the hood, it seamlessly pairs with JavaScript environments like Node and React.",
    },
    {
        id: "e",
        name: "Express (E)",
        icon: "🚂",
        category: "service",
        runtime: "event-loop",
        position: { x: 350, y: 300 },
        state: "idle",
        metadata: { "Type": "Web Framework", "Role": "Routing & Middleware" },
        explanation: "The Router. Express is a minimal web framework that sits on top of Node.js. It handles incoming HTTP requests, runs them through middleware, and routes them to your database or frontend.",
    },
    {
        id: "r",
        name: "React (R)",
        icon: "⚛",
        category: "client",
        runtime: "reactive",
        position: { x: 600, y: 150 },
        state: "idle",
        metadata: { "Type": "Frontend Library", "Paradigm": "Declarative UI" },
        explanation: "The MERN View. React renders the user interface in the browser using a Virtual DOM. It 'reacts' to state changes and re-renders components efficiently.",
    },
    {
        id: "a",
        name: "Angular (A)",
        icon: "🅰️",
        category: "client",
        runtime: "reactive",
        position: { x: 600, y: 450 },
        state: "idle",
        metadata: { "Type": "Frontend Framework", "Paradigm": "MVC/MVVM" },
        explanation: "The MEAN View. Angular is a full-fledged frontend framework maintained by Google. It uses TypeScript out of the box and provides a robust structure for enterprise applications.",
    },
    {
        id: "n",
        name: "Node.js (N)",
        icon: "🟢",
        category: "gateway",
        runtime: "event-loop",
        position: { x: 850, y: 300 },
        state: "idle",
        metadata: { "Type": "JS Runtime", "Engine": "V8" },
        explanation: "The Engine. Node.js executes JavaScript outside the browser. In reality, it runs Express! It's the unifying layer that allows full-stack JavaScript development.",
    }
];

const connections: Connection[] = [
    {
        id: "c-me", source: "m", target: "e", protocol: "db-query", latency: 20,
        reason: "Express connects to MongoDB (usually via Mongoose) to pull data.",
    },
    {
        id: "c-er", source: "e", target: "r", protocol: "http", latency: 15,
        reason: "The Express API serves JSON data to the React frontend (MERN stack).",
    },
    {
        id: "c-ea", source: "e", target: "a", protocol: "websocket", latency: 15,
        reason: "The Express API serves JSON data to the Angular frontend (MEAN stack).",
    },
    {
        id: "c-rn", source: "r", target: "n", protocol: "http", latency: 10,
        reason: "React interacts with Node.js backends for SSR (Next.js) or real-time sockets.",
    },
    {
        id: "c-an", source: "a", target: "n", protocol: "websocket", latency: 10,
        reason: "Angular interacts with Node.js via HTTP/WebSockets for dynamic operations.",
    },
];

export function getIntroModuleConfig(): ModuleConfig {
    return {
        moduleId: "intro",
        nodes,
        connections,
        initialPackets: [
            {
                id: "pkt_mern",
                protocol: "http",
                payload: "M-E-R-N Flow",
                label: "MERN Scenario",
                currentNodeId: "m",
                sourceNodeId: "m",
                targetNodeId: "e",
                path: ["m"],
                progress: 0,
                status: "pending",
                createdAt: Date.now(),
            },
            {
                id: "pkt_mean",
                protocol: "websocket",
                payload: "M-E-A-N Flow",
                label: "MEAN Scenario",
                currentNodeId: "m",
                sourceNodeId: "m",
                targetNodeId: "e",
                path: ["m"],
                progress: 0,
                status: "pending",
                createdAt: Date.now() + 1500, // delay second packet
            },
        ],
        whyModePrompts: [
            {
                question: "Why do we group Express and Node together in these stacks?",
                options: [
                    { label: "They are the same exact technology.", isCorrect: false },
                    { label: "Node is the runtime that executes JavaScript on the server, while Express is the router/framework built on top of it.", isCorrect: true },
                    { label: "They both run inside the Google Chrome browser.", isCorrect: false },
                    { label: "Express is the database while Node is the frontend.", isCorrect: false },
                ],
                correctIndex: 1,
                explanation: "Although drawn as a flow here, Express actually RUNS inside Node.js. Node is the C++ engine (V8) wrapper, and Express is the JS code providing the web server API.",
                connectionId: "c-er",
                nodeId: "e",
            }
        ],
        learningStory: {
            title: "MERN vs MEAN",
            content: "You asked to see how M goes to E, branches to A or R, and ends at N! Here is the literal flowchart of the acronym. M (MongoDB) connects to E (Express), which branches out to either A (Angular) or R (React) for the frontend. Finally, N (Node) powers everything behind the scenes.",
            analogy: "Think of M as the warehouse, E as the delivery truck, A/R as the retail storefront, and N as the shipping company's corporate rules making everything possible.",
            lookFor: "Watch two different packets flow: one takes the top MERN path, the other takes the bottom MEAN path."
        }
    };
}
