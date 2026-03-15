import type { ModuleConfig, SystemNode, Connection } from "../../engine/types/system.types";

const nodes: SystemNode[] = [
    {
        id: "mongos",
        name: "Mongos (Router)",
        icon: "🚦",
        category: "gateway",
        runtime: "event-loop",
        position: { x: 400, y: 60 },
        state: "idle",
        metadata: {},
        explanation: "Mongos is the query router. Your MERN app connects to Mongos just like a normal MongoDB instance. It holds no data. Instead it consults the Config Servers to know which Shard contains the data you are looking for. It then routes the query to the correct shard and merges results. Applications remain 'shard-unaware'.",
    },
    {
        id: "config-servers",
        name: "Config Servers",
        icon: "📂",
        category: "database",
        runtime: "blocking",
        position: { x: 60, y: 150 },
        state: "idle",
        metadata: {},
        explanation: "Config Servers store the metadata for the sharded cluster: which ranges of data (chunks) live on which shards. They are always a Replica Set. If config servers are down the cluster can still process reads but cannot split chunks or move data. They are the 'brain' that directs the Mongos routers.",
    },
    {
        id: "shard-1",
        name: "Shard A (Replica Set)",
        icon: "🧱",
        category: "database",
        runtime: "threaded",
        position: { x: 200, y: 350 },
        state: "idle",
        metadata: {},
        explanation: "A Shard is a subset of the data. Each shard is itself a Replica Set for high availability. Sharding scales WRITES by distributing the data across multiple machines. If your table has 1 billion rows Shard A might store 1-500 million and Shard B stores 501 million - 1 billion. This is horizontal scaling.",
    },
    {
        id: "shard-2",
        name: "Shard B (Replica Set)",
        icon: "🧱",
        category: "database",
        runtime: "threaded",
        position: { x: 600, y: 350 },
        state: "idle",
        metadata: {},
        explanation: "Shard B handles the other half of the data. By adding more shards (C, D, E...) you can scale capacity and throughput almost infinitely. Sharding is the ultimate solution when a single server (even the biggest one available) cannot handle your application's data size or write volume.",
    },
    {
        id: "shard-key",
        name: "Shard Key: user_id",
        icon: "🔑",
        category: "middleware",
        runtime: "event-loop",
        position: { x: 400, y: 200 },
        state: "idle",
        metadata: {},
        explanation: "The Shard Key determines how data is distributed. A good shard key has high cardinality (many unique values) and causes an even distribution. If you shard by 'country' and 90% of users are from the USA Shard A (USA) will be overloaded while others are idle — this is a 'Hot Shard'. user_id or a hashed key is usually best.",
    }
];

const connections: Connection[] = [
    { id: "c1", source: "mongos", target: "config-servers", protocol: "db-query", latency: 5, reason: "Query arrives. Mongos checks Config Servers metadata: 'Where does user_id: 123 live?'" },
    { id: "c2", source: "config-servers", target: "shard-key", protocol: "internal", latency: 2, reason: "Metadata returned: 'user_id ranges 1-500 are on Shard A, 501-1000 are on Shard B.'" },
    { id: "c3", source: "shard-key", target: "shard-1", protocol: "db-query", latency: 10, reason: "Query: find user_id: 123. Mongos routes directly to Shard A. Targeted query — very efficient." },
    { id: "c4", source: "shard-key", target: "shard-2", protocol: "db-query", latency: 15, reason: "Query: find user_id: 850. Routed to Shard B. Parallel processing across shards scales bottleneck." },
    { id: "c5", source: "shard-1", target: "mongos", protocol: "internal", latency: 5, reason: "Shard A returns result to Mongos router. Mongos returns it to the client. Seamless experience." }
];

export function getShardingModuleConfig(): ModuleConfig {
    return {
        moduleId: "sharding",
        nodes,
        connections,
        initialPackets: [
            {
                id: "pkt_shard",
                protocol: "http",
                label: "Global Query",
                payload: "db.users.find({ user_id: 123 })",
                sourceNodeId: "mongos",
                targetNodeId: "config-servers",
                currentNodeId: "mongos",
                path: ["mongos"],
                progress: 0,
                status: "pending",
                createdAt: Date.now(),
            }
        ],
        whyModePrompts: [
            {
                question: "You perform a query on a field that is NOT the shard key. What happens?",
                options: [
                    { label: "It fails with an error", isCorrect: false },
                    { label: "Mongos must send the query to EVERY shard (Scatter-Gather). This is much slower.", isCorrect: true },
                    { label: "MongoDB indexes it automatically across shards", isCorrect: false },
                    { label: "The Config Server finds it for you", isCorrect: false },
                ],
                correctIndex: 1,
                explanation: "This is a 'Scatter-Gather' query. Because Mongos doesn't know which shard has the data it must ask all of them. The total time is the time of the slowest shard plus overhead. For high-performance apps aim for 95%+ of queries to include the Shard Key so they can be 'Targeted' to a single shard.",
                connectionId: "c3",
                nodeId: "shard-1",
            }
        ],
        learningStory: {
            title: "The Massive Library",
            content: "Sharding is like a library getting too big for one building. You split the books into two buildings: Building A (Authors A-M) and Building B (Authors N-Z). The librarian (Mongos) stands at a desk out front. When you ask for a book by 'Zola' the librarian checks their map (Config Servers), sees 'Z' is in Building B, and sends you there. If you ask for 'red books' the librarian has to check BOTH buildings.",
            analogy: "horizontal scaling vs vertical scaling. Vertical scaling is buying a bigger filing cabinet. Horizontal scaling (Sharding) is buying ten more cabinets and hiring people to coordinate them. One cabinet eventually fills up; ten cabinets can hold everything.",
            lookFor: "Notice how the Shard Key node directs traffic. Watch what happens when a query arrives — it's like a fork in the road. Without sharding ALL that traffic would hit one single database node. With it the load is halved (or more)!"
        }
    };
}
