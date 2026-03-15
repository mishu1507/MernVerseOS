import type { ModuleConfig, SystemNode, Connection } from "../../engine/types/system.types";

const nodes: SystemNode[] = [
    {
        id: "client",
        name: "REST Client",
        icon: "🌐",
        category: "client",
        runtime: "event-loop",
        position: { x: 50, y: 150 },
        state: "idle",
        metadata: { method: "POST, GET, PUT, DELETE" },
        explanation: "What: The consumer of the API (browser, Postman, mobile app) sending an HTTP request. Why: Initiates the CRUD action based on user intent. Breaks without it: There would be no external triggers for CRUD operations on the server.",
    },
    {
        id: "router",
        name: "Express Router",
        icon: "🛤",
        category: "middleware",
        runtime: "event-loop",
        position: { x: 200, y: 150 },
        state: "idle",
        metadata: { route: "app.post('/users')" },
        explanation: "What: Maps the incoming URL and HTTP method to the specific controller function. Why: Acts as a traffic cop ensuring a GET /users request doesn't mistakenly trigger a delete operation. Breaks without it: The server wouldn't know which function to call for different URLs.",
    },
    {
        id: "validator",
        name: "Validation Layer",
        icon: "✅",
        category: "middleware",
        runtime: "event-loop",
        position: { x: 350, y: 150 },
        state: "idle",
        metadata: { schema: "Joi / Zod schema" },
        explanation: "What: Checks the incoming req.body/params against a strict schema before processing. Why: Never trust client data; ensuring required fields and correct data types prevents bad data from entering the database. Breaks without it: You risk NoSQL injection, missing data crashing the app, or garbage data stored in DB.",
    },
    {
        id: "controller",
        name: "CRUD Controller",
        icon: "🧠",
        category: "service",
        runtime: "event-loop",
        position: { x: 500, y: 150 },
        state: "idle",
        metadata: { action: "Extract data & call model" },
        explanation: "What: The core business logic function that handles the request, interacts with the model, and shapes the response. Why: Separating logic from routing makes code testable and readable. Breaks without it: You'd have massive, unmaintainable routes file mixing HTTP handling with database logic.",
    },
    {
        id: "mongoose",
        name: "Mongoose Model",
        icon: "🧩",
        category: "service",
        runtime: "event-loop",
        position: { x: 650, y: 150 },
        state: "idle",
        metadata: { method: "User.create()" },
        explanation: "What: The ODM (Object Document Mapper) representing the MongoDB collection as a JavaScript class. Why: Provides a strict schema, validation, and easy-to-use methods (findById, create) over raw DB driver queries. Breaks without it: You'd write complex raw BSON queries and lose application-level data validation.",
    },
    {
        id: "mongodb",
        name: "MongoDB",
        icon: "🍃",
        category: "database",
        runtime: "blocking",
        position: { x: 800, y: 150 },
        state: "idle",
        metadata: { operation: "InsertDocument" },
        explanation: "What: The actual NoSQL database storing the BSON documents. Why: Provides persistent storage for the application data. Breaks without it: All user data would be ephemeral and lost the moment the Node.js process restarted.",
    }
];

const connections: Connection[] = [
    {
        id: "c1", source: "client", target: "router", protocol: "http", latency: 10,
        reason: "HTTP verb (POST /users)",
    },
    {
        id: "c2", source: "router", target: "validator", protocol: "internal", latency: 5,
        reason: "input check",
    },
    {
        id: "c3", source: "validator", target: "controller", protocol: "internal", latency: 5,
        reason: "passed validation",
    },
    {
        id: "c4", source: "controller", target: "mongoose", protocol: "internal", latency: 5,
        reason: "model method call",
    },
    {
        id: "c5", source: "mongoose", target: "mongodb", protocol: "db-query", latency: 20,
        reason: "BSON operation to DB",
    },
    {
        id: "c6", source: "mongodb", target: "client", protocol: "http", latency: 20,
        reason: "response with status code 201 Created",
    }
];

export function getCrudModuleConfig(): ModuleConfig {
    return {
        moduleId: "crud",
        nodes,
        connections,
        initialPackets: [
            {
                id: "pkt_crud",
                protocol: "http",
                label: "CREATE User",
                payload: 'POST /users {"name":"Alice"}',
                sourceNodeId: "client",
                targetNodeId: "router",
                currentNodeId: "client",
                path: ["client"],
                progress: 0,
                status: "pending",
                createdAt: Date.now(),
            },
        ],
        whyModePrompts: [
            {
                question: "When using User.findByIdAndUpdate(id, { age: 30 }), by default, what does Mongoose return?",
                options: [
                    { label: "The document BEFORE the update was applied", isCorrect: true },
                    { label: "The newly updated document", isCorrect: false },
                    { label: "A boolean indicating success", isCorrect: false },
                    { label: "null", isCorrect: false },
                ],
                correctIndex: 0,
                explanation: "By default, findByIdAndUpdate returns the ORIGINAL document. To get the newly updated document returned instead, you must pass the { new: true } option flag as the third argument.",
                connectionId: "c5",
                nodeId: "mongoose",
            }
        ],
        learningStory: {
            title: "The Library Card System",
            content: "CRUD stands for Create, Read, Update, Delete. It's the four fundamental ways you interact with persistent storage...",
            analogy: "Like a librarian: creating a new card, reading a member's record, updating their address, or deleting a lost card.",
            lookFor: "Watch how a single POST request maps all the way through validation down to a database document insert."
        }
    };
}
