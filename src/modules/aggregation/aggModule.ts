import type { ModuleConfig, SystemNode, Connection } from "../../engine/types/system.types";

const nodes: SystemNode[] = [
    {
        id: "app",
        name: "Application",
        icon: "📱",
        category: "service",
        runtime: "event-loop",
        position: { x: 50, y: 150 },
        state: "idle",
        metadata: { action: "Sending Pipeline Request" },
        explanation: "What: The entry point where the aggregation query is initiated by the application. Why: Complex data processing is offloaded to the database engine rather than being done in JS. Breaks without it: You'd have to pull all raw data into Node.js, consuming massive memory and CPU for manual filtering.",
    },
    {
        id: "match",
        name: "$match Stage",
        icon: "🔍",
        category: "middleware",
        runtime: "blocking",
        position: { x: 200, y: 150 },
        state: "idle",
        metadata: { filter: "{ status: 'active' }" },
        explanation: "What: Filters the documents to pass only those that match the specified condition(s). Why: Reducing the dataset as early as possible optimizes the rest of the pipeline. Breaks without it: Subsequent stages (like $lookup) would process irrelevant documents, severely killing performance.",
    },
    {
        id: "lookup",
        name: "$lookup Stage",
        icon: "🔗",
        category: "middleware",
        runtime: "blocking",
        position: { x: 350, y: 150 },
        state: "idle",
        metadata: { join: "Orders -> Users" },
        explanation: "What: Performs a left outer join to an unsharded collection in the same database. Why: Allows merging related data from different collections into a single result stream. Breaks without it: You would need multiple round-trip queries to the DB and manual application-side weaving of data.",
    },
    {
        id: "group",
        name: "$group Stage",
        icon: "📁",
        category: "middleware",
        runtime: "blocking",
        position: { x: 500, y: 150 },
        state: "idle",
        metadata: { accumulate: "{ total: { $sum: '$amount' } }" },
        explanation: "What: Groups input documents by a specified identifier expression and applies accumulator expressions. Why: Essential for computing totals, averages, or counts across categories of data. Breaks without it: Analytical queries would require processing every single document in the application layer.",
    },
    {
        id: "project",
        name: "$project Stage",
        icon: "✂️",
        category: "middleware",
        runtime: "blocking",
        position: { x: 650, y: 150 },
        state: "idle",
        metadata: { fields: "{ name: 1, total: 1, _id: 0 }" },
        explanation: "What: Reshapes each document in the stream; can include, exclude, or add new fields. Why: Reduces the payload size sent over the network by removing unnecessary fields. Breaks without it: The database returns full oversized documents, wasting bandwidth and client memory.",
    },
    {
        id: "sort",
        name: "$sort Stage",
        icon: "📉",
        category: "middleware",
        runtime: "blocking",
        position: { x: 800, y: 150 },
        state: "idle",
        metadata: { order: "{ total: -1 }" },
        explanation: "What: Reorders the documents in the stream based on the sort criteria. Why: Providing ordered data (e.g., top 10 customers) directly from the engine is far more efficient than client-side sorting. Breaks without it: Large datasets would be slow to organize for display in the UI.",
    },
    {
        id: "limit",
        name: "$limit/$skip",
        icon: "🛑",
        category: "database",
        runtime: "blocking",
        position: { x: 950, y: 150 },
        state: "idle",
        metadata: { size: "top 20" },
        explanation: "What: Caps the number of documents passed to the next stage or final result. Why: Essential for pagination and preventing the engine from returning millions of results at once. Breaks without it: One large query could crash the application or timeout the connection due to payload size.",
    }
];

const connections: Connection[] = [
    { id: "c1", source: "app", target: "match", protocol: "db-query", latency: 10, reason: "Start pipeline" },
    { id: "c2", source: "match", target: "lookup", protocol: "internal", latency: 5, reason: "Filter results" },
    { id: "c3", source: "lookup", target: "group", protocol: "internal", latency: 20, reason: "Join other collection" },
    { id: "c4", source: "group", target: "project", protocol: "internal", latency: 15, reason: "Aggregate data" },
    { id: "c5", source: "project", target: "sort", protocol: "internal", latency: 5, reason: "Reshape document" },
    { id: "c6", source: "sort", target: "limit", protocol: "internal", latency: 5, reason: "Order documents" },
    { id: "c7", source: "limit", target: "app", protocol: "db-query", latency: 10, reason: "Return final result" }
];

export function getAggregationModuleConfig(): ModuleConfig {
    return {
        moduleId: "aggregation",
        nodes,
        connections,
        initialPackets: [
            {
                id: "pkt_agg",
                protocol: "db-query",
                label: "Aggregation Pipeline",
                payload: "[{$match},{$lookup},{$group},{$project},{$sort},{$limit}]",
                sourceNodeId: "app",
                targetNodeId: "match",
                currentNodeId: "app",
                path: ["app"],
                progress: 0,
                status: "pending",
                createdAt: Date.now(),
            },
        ],
        whyModePrompts: [
            {
                question: "Your aggregation pipeline is very slow. You have $match and $lookup stages. How should you order them?",
                options: [
                    { label: "It doesn't matter, MongoDB optimizes it automatically", isCorrect: false },
                    { label: "Put $lookup first to get all data, then $match to filter", isCorrect: false },
                    { label: "Put $match BEFORE $lookup to reduce the number of documents being joined", isCorrect: true },
                    { label: "Put $match at the very end to ensure all results are correct", isCorrect: false },
                ],
                correctIndex: 2,
                explanation: "$lookup is an expensive operation (joining collections). By matched/filtering documents first, you ensure the database only performs joins on the relevant subset of data, significantly improving performance.",
                connectionId: "c2",
                nodeId: "match",
            }
        ],
        learningStory: {
            title: "The Factory Assembly Line",
            content: "Aggregation is like a factory assembly line. Raw data goes in at one end, and it gets filtered, combined, and transformed through various stations until the final product emerges...",
            analogy: "Like a literal assembly line in a car factory.",
            lookFor: "Notice how each stage significantly transforms the 'Payload' of the packet before it moves to the next node."
        }
    };
}
