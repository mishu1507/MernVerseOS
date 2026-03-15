import type { ModuleConfig, SystemNode, Connection } from "../../engine/types/system.types";

const nodes: SystemNode[] = [
    {
        id: "primary",
        name: "Primary Node",
        icon: "👑",
        category: "database",
        runtime: "blocking",
        position: { x: 280, y: 80 },
        state: "idle",
        metadata: {},
        explanation: "The Primary is the only node in a Replica Set that accepts WRITES. It records all changes in its Oplog (Operations Log). While it also handles reads by default, for high-traffic apps you can offload reads to secondaries. If the Primary fails the Secondaries automatically hold an election to choose a new Primary — this is High Availability.",
    },
    {
        id: "secondary-1",
        name: "Secondary 1",
        icon: "💾",
        category: "database",
        runtime: "blocking",
        position: { x: 60, y: 320 },
        state: "idle",
        metadata: {},
        explanation: "Secondaries maintain a copy of the Primary data. They constantly pull new entries from the Primary Oplog and apply them (Asynchronous Replication). Secondaries can serve READ requests with a 'secondaryPreferred' read preference. This scales read throughput linearly. Note: data on secondaries might be slightly out of date (Eventual Consistency).",
    },
    {
        id: "secondary-2",
        name: "Secondary 2",
        icon: "💾",
        category: "database",
        runtime: "blocking",
        position: { x: 500, y: 320 },
        state: "idle",
        metadata: {},
        explanation: "A second replica for redundancy. A standard production Replica Set (PSS) has 1 Primary and 2 Secondaries. This ensures the cluster survives the loss of any single node while maintaining a majority (2 out of 3) required for safe writes and elections. Replicas should be in different availability zones or regions for Disaster Recovery.",
    },
    {
        id: "oplog",
        name: "Oplog (Op Log)",
        icon: "📜",
        category: "middleware",
        runtime: "event-loop",
        position: { x: 280, y: 220 },
        state: "idle",
        metadata: {},
        explanation: "The Oplog is a capped collection in the 'local' database that stores all write operations. It is the 'source of truth' for replication. Secondaries tail this log and apply the same operations. If a secondary falls too far behind the Oplog (because it was offline for too long) it must perform a full initial sync which is slow — always size your Oplog large enough.",
    },
    {
        id: "read-pref",
        name: "Read Preference",
        icon: "⚖️",
        category: "gateway",
        runtime: "event-loop",
        position: { x: 720, y: 200 },
        state: "idle",
        metadata: {},
        explanation: "Read Preference determines WHERE the driver sends read queries. 'primary' (default, most consistent), 'secondary' (offload work, eventual consistency), 'nearest' (lowest latency). Using secondaries for reads is the primary way to scale read-heavy MERN apps. But beware 'Read-Your-Own-Writes' issues if the secondary replication is lagging.",
    }
];

const connections: Connection[] = [
    { id: "c1", source: "primary", target: "oplog", protocol: "internal", latency: 2, reason: "Write operation arrives at Primary. Successful write is recorded in the Oplog buffer immediately." },
    { id: "c2", source: "oplog", target: "secondary-1", protocol: "db-query", latency: 5, reason: "Secondary 1 tails the Oplog and pulls new write operations to apply to its own local data copy." },
    { id: "c3", source: "oplog", target: "secondary-2", protocol: "db-query", latency: 5, reason: "Secondary 2 also pulls the same Oplog entries. Replication happens in parallel to all secondaries." },
    { id: "c4", source: "read-pref", target: "primary", protocol: "http", latency: 10, reason: "Client uses 'primary' read preference. Query goes to Primary for maximum consistency." },
    { id: "c5", source: "read-pref", target: "secondary-1", protocol: "http", latency: 10, reason: "Client uses 'secondary' read preference. Query offloaded to Secondary 1 to save Primary CPU." }
];

export function getReplicationModuleConfig(): ModuleConfig {
    return {
        moduleId: "replication",
        nodes,
        connections,
        initialPackets: [
            {
                id: "pkt_repl",
                protocol: "db-query",
                label: "Write Op",
                payload: "db.users.insertOne({ name: 'Alice' })",
                sourceNodeId: "primary",
                targetNodeId: "oplog",
                currentNodeId: "primary",
                path: ["primary"],
                progress: 0,
                status: "pending",
                createdAt: Date.now(),
            }
        ],
        whyModePrompts: [
            {
                question: "The Primary node crashes. What happens to the cluster?",
                options: [
                    { label: "The database goes offline until fixed", isCorrect: false },
                    { label: "Secondaries hold an election and one becomes the new Primary automatically", isCorrect: true },
                    { label: "MongoDB restarts the node automatically", isCorrect: false },
                    { label: "Writes are stopped but reads continue on secondaries", isCorrect: false },
                ],
                correctIndex: 1,
                explanation: "This is 'Failover'. MongoDB Replica Sets use a consensus algorithm (Raft-like). When secondaries detect that the primary is unreachable they vote. One secondary is elected primary. This usually happens in under 20 seconds. Your MERN app handles this via the MongoDB driver which automatically reconnects to the new Primary.",
                connectionId: "c2",
                nodeId: "secondary-1",
            }
        ],
        learningStory: {
            title: "The King and the Apprentices",
            content: "Replication is like a master chef (Primary) and two apprentices (Secondaries). Only the chef is allowed to write down new recipes (Writes). The apprentices watch the chef's notebook (Oplog) and copy everything into their own books. If the chef gets sick one of the apprentices steps up to be the new head chef. Customers (Reads) can ask either the chef or the apprentices for the recipes.",
            analogy: "A synchronized backup. One computer is your main workspace (Primary). Two other computers (Secondaries) are constantly syncing your files. If your main computer breaks you just switch to a backup and keep working. The Oplog is like the 'history' or 'undo' log that tells the backups exactly what changed.",
            lookFor: "Watch the Oplog node! It's the bridge. Notice how writes ONLY go to the Primary, but reads (via Read Preference) can fan out to any node. This is the difference between scaling writes (hard) and scaling reads (easy)!"
        }
    };
}
