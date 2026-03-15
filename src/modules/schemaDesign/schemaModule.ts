import type { ModuleConfig, SystemNode, Connection } from "../../engine/types/system.types";

const nodes: SystemNode[] = [
    {
        id: "requirements",
        name: "Query Requirements",
        icon: "📋",
        category: "service",
        runtime: "event-loop",
        position: { x: 60, y: 200 },
        state: "idle",
        metadata: {},
        explanation: "In MongoDB schema design starts with your QUERIES — how does the application access data? What is read together? What is written together? What grows unboundedly? Unlike SQL (normalize first optimize later) MongoDB schema design is query-driven. The same data can be modeled in dozens of ways — the correct way depends on your access patterns.",
    },
    {
        id: "mongoose-schema",
        name: "Mongoose Schema",
        icon: "📜",
        category: "service",
        runtime: "event-loop",
        position: { x: 280, y: 80 },
        state: "idle",
        metadata: {},
        explanation: "Mongoose schemas define field types, validators, defaults, and middleware. The schema is enforced at the application level — MongoDB itself stores whatever you send. Application-level schema gives flexibility (fields can vary across documents) while still enforcing business rules. Treat the schema as a contract between services.",
    },
    {
        id: "indexes-design",
        name: "Index Planning",
        icon: "🗂️",
        category: "database",
        runtime: "blocking",
        position: { x: 280, y: 320 },
        state: "idle",
        metadata: {},
        explanation: "Design indexes alongside the schema — not as an afterthought. For every query pattern identify which fields need indexes. Compound indexes follow the prefix rule: { a, b, c } supports queries on (a) or (a,b) or (a,b,c) but NOT (b) alone. Adding indexes to a production collection uses background option to avoid locking.",
    },
    {
        id: "relationships",
        name: "Relationship Strategy",
        icon: "🔗",
        category: "service",
        runtime: "event-loop",
        position: { x: 500, y: 200 },
        state: "idle",
        metadata: {},
        explanation: "Decide how related data is connected: embedded documents (denormalized, faster reads) or referenced ObjectIds (normalized, requires lookup). Embedding is MongoDB superpower — one document contains everything needed, zero joins. But embedding unbounded arrays is dangerous (16MB document limit per document).",
    },
    {
        id: "validation-schema",
        name: "Schema Validation",
        icon: "✅",
        category: "middleware",
        runtime: "event-loop",
        position: { x: 700, y: 80 },
        state: "idle",
        metadata: {},
        explanation: "Mongoose validators (required, minlength, match) run before saving. MongoDB 3.6+ supports JSON Schema validation at the database level — rejects documents not matching the schema regardless of which client writes them. Database-level validation is the last line of defense if a non-Mongoose client writes directly.",
    },
    {
        id: "document-stored",
        name: "MongoDB Document",
        icon: "🍃",
        category: "database",
        runtime: "blocking",
        position: { x: 700, y: 320 },
        state: "idle",
        metadata: {},
        explanation: "The final BSON document stored in MongoDB. ObjectId (_id) is automatically generated — 12 bytes encoding timestamp plus machine plus process plus counter. ObjectId timestamp component means documents are roughly sorted by creation time for free. Using custom _id values like email can cause hot-spotting in sharded clusters.",
    }
];

const connections: Connection[] = [
    { id: "c1", source: "requirements", target: "mongoose-schema", protocol: "internal", latency: 5, reason: "Query patterns defined. Build Mongoose schema: which fields exist, their types, which are required, which need defaults, what validations apply." },
    { id: "c2", source: "requirements", target: "indexes-design", protocol: "internal", latency: 5, reason: "Queries identified. Plan indexes: find by email needs email index. find by status sorted by createdAt needs compound { status, createdAt } index." },
    { id: "c3", source: "mongoose-schema", target: "relationships", protocol: "internal", latency: 5, reason: "Schema fields defined. Decide: should related data be embedded or referenced? Answer depends on read patterns and data size." },
    { id: "c4", source: "indexes-design", target: "relationships", protocol: "internal", latency: 5, reason: "Index plan informs relationship strategy — if you always query users with their latest 3 orders embedding those 3 orders avoids a lookup plus index." },
    { id: "c5", source: "relationships", target: "validation-schema", protocol: "internal", latency: 5, reason: "Structure decided. Add validators: required fields, string lengths, enum values, custom cross-field validation." },
    { id: "c6", source: "validation-schema", target: "document-stored", protocol: "db-query", latency: 15, reason: "All validations pass. Mongoose serializes to BSON and sends insertOne command to MongoDB. Document stored with auto-generated ObjectId." }
];

export function getSchemaDesignModuleConfig(): ModuleConfig {
    return {
        moduleId: "schema-design",
        nodes,
        connections,
        initialPackets: [
            {
                id: "pkt_schema",
                protocol: "internal",
                label: "Schema Design",
                payload: "Designing User and Posts schema",
                sourceNodeId: "requirements",
                targetNodeId: "mongoose-schema",
                currentNodeId: "requirements",
                path: ["requirements"],
                progress: 0,
                status: "pending",
                createdAt: Date.now(),
            }
        ],
        whyModePrompts: [
            {
                question: "A user document has an orders array that grows by 1 every time they buy something. What is wrong?",
                options: [
                    { label: "Nothing — arrays in MongoDB are efficient", isCorrect: false },
                    { label: "The document will eventually exceed MongoDB 16MB limit as orders accumulate over years", isCorrect: true },
                    { label: "Arrays slow down queries", isCorrect: false },
                    { label: "MongoDB does not support arrays in documents", isCorrect: false },
                ],
                correctIndex: 1,
                explanation: "Unbounded arrays are a classic MongoDB anti-pattern. A user with 10 years of purchase history could have thousands of orders. Each order has items, addresses, timestamps — documents will eventually hit the 16MB limit. Solution: separate Orders collection with a userId reference field.",
                connectionId: "c3",
                nodeId: "relationships",
            }
        ],
        learningStory: {
            title: "The Architect Blueprint",
            content: "Schema design in MongoDB is like architectural blueprinting. You do not design a house by listing every material first — you design it around how people LIVE in it. Which rooms are used together? What grows (kids bedrooms)? What is fixed (load-bearing walls)? MongoDB schema design works the same way: design around how data is ACCESSED not how it is structured abstractly.",
            analogy: "A recipe card box vs a filing cabinet. Recipe cards (embedded documents) put all related info in one place — perfect for things you always read together. A filing cabinet with cross-references (normalized with references) is better when the same ingredient list would appear in thousands of recipes.",
            lookFor: "The two parallel paths from Query Requirements — one leads to Schema definition, one to Index planning. Both happen simultaneously! A schema without planned indexes is incomplete — they are two sides of the same design decision."
        }
    };
}
