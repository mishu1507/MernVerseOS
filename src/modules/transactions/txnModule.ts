import type { ModuleConfig, SystemNode, Connection } from "../../engine/types/system.types";

const nodes: SystemNode[] = [
    {
        id: "start-txn",
        name: "session.startTransaction()",
        icon: "🎬",
        category: "service",
        runtime: "event-loop",
        position: { x: 60, y: 220 },
        state: "idle",
        metadata: {},
        explanation: "In MongoDB transactions require a session. session.startTransaction() begins a logical unit of work. ACID properties now apply to multiple operations across multiple collections. Transactions are only available on Replica Sets and Sharded Clusters — not standalone instances. They have a 60-second default execution time limit.",
    },
    {
        id: "op-1",
        name: "Op 1: Update Balance",
        icon: "💰",
        category: "database",
        runtime: "blocking",
        position: { x: 260, y: 100 },
        state: "idle",
        metadata: {},
        explanation: "First operation: subtract $100 from User A. The change is made in the session but NOT visible to other users yet (Isolation). If the server crashes now or the transaction is aborted this change is automatically rolled back. Always use the { session } option in every Mongoose operation within the transaction.",
    },
    {
        id: "op-2",
        name: "Op 2: Create Ledger",
        icon: "📜",
        category: "database",
        runtime: "blocking",
        position: { x: 260, y: 340 },
        state: "idle",
        metadata: {},
        explanation: "Second operation: add $100 to User B ledger. Both operations must either both succeed or both fail (Atomicity). This prevents money from disappearing or appearing out of thin air. Transactions in MongoDB use multi-document snapshots to ensure a consistent view of data for the duration of the transaction.",
    },
    {
        id: "conflict-check",
        name: "Write Conflict Check",
        icon: "⚔️",
        category: "middleware",
        runtime: "event-loop",
        position: { x: 500, y: 220 },
        state: "idle",
        metadata: {},
        explanation: "MongoDB uses optimistic concurrency. If another operation modified User A while this transaction was running a 'Write Conflict' error occurs. Your code MUST be prepared to catch this and RETRY. Mongoose withTransaction() helper handles retries automatically. High-contention workloads struggle with transactions due to these conflicts.",
    },
    {
        id: "commit-txn",
        name: "session.commitTransaction()",
        icon: "✅",
        category: "service",
        runtime: "event-loop",
        position: { x: 720, y: 100 },
        state: "idle",
        metadata: {},
        explanation: "Commit makes all changes permanent and visible to everyone (Durability). This is the final step. Only after commit is complete is the transaction 'finished'. If this fails (e.g. network error) the entire set of changes must be aborted and retried. A successful commit returns the updated state to the application.",
    },
    {
        id: "abort-txn",
        name: "session.abortTransaction()",
        icon: "🛑",
        category: "service",
        runtime: "event-loop",
        position: { x: 720, y: 340 },
        state: "idle",
        metadata: {},
        explanation: "If ANY operation fails or a conflict is detected call abort. MongoDB rolls back ALL changes made during the session as if they never happened. This ensures data consistency. Never leave a session open — always end it with finally { session.endSession() }.",
    }
];

const connections: Connection[] = [
    { id: "c1", source: "start-txn", target: "op-1", protocol: "internal", latency: 5, reason: "Transaction session started. First operation: update sender balance with { session } option." },
    { id: "c2", source: "op-1", target: "op-2", protocol: "internal", latency: 5, reason: "First op successful in session. Second operation: update receiver ledger with { session } option." },
    { id: "c3", source: "op-2", target: "conflict-check", protocol: "internal", latency: 5, reason: "Operations queued. Checking if any other concurrent writes modified the same documents (Optimistic Concurrency Control)." },
    { id: "c4", source: "conflict-check", target: "commit-txn", protocol: "db-query", latency: 20, reason: "No conflicts! Commit all changes atomically. Data is now persistent and visible to other clients." },
    { id: "c5", source: "conflict-check", target: "abort-txn", protocol: "internal", latency: 5, reason: "Conflict detected or operation failed! Abort transaction. All changes rolled back to previous state." },
    { id: "c6", source: "commit-txn", target: "start-txn", protocol: "internal", latency: 5, reason: "Transaction complete. Session ended. Ready for next unit of work." }
];

export function getTransactionsModuleConfig(): ModuleConfig {
    return {
        moduleId: "transactions",
        nodes,
        connections,
        initialPackets: [
            {
                id: "pkt_txn",
                protocol: "db-query",
                label: "Muni-Doc Txn",
                payload: "Transfer $100 from A to B",
                sourceNodeId: "start-txn",
                targetNodeId: "op-1",
                currentNodeId: "start-txn",
                path: ["start-txn"],
                progress: 0,
                status: "pending",
                createdAt: Date.now(),
            }
        ],
        whyModePrompts: [
            {
                question: "You update User A balance, then User B balance. Server crashes between the two. What happens WITHOUT a transaction?",
                options: [
                    { label: "MongoDB rolls it back automatically", isCorrect: false },
                    { label: "User A balance is decreased, User B is NOT increased. Money has vanished.", isCorrect: true },
                    { label: "The crash prevents any data from being saved", isCorrect: false },
                    { label: "It works fine — MongoDB is ACID by default", isCorrect: false },
                ],
                correctIndex: 1,
                explanation: "Without a transaction multi-document updates are NOT atomic. If the server crashes after the first update but before the second you have a 'partial failure' — the most dangerous state for data consistency. Transactions ensure either BOTH updates happen or NEITHER happens, even if the server crashes or network fails.",
                connectionId: "c2",
                nodeId: "op-2",
            }
        ],
        learningStory: {
            title: "The Bank Transfer Promise",
            content: "Transactions are the foundation of trust in data. Imagine a bank transfer: you take money out of one account and put it in another. If the power goes out halfway money cannot just disappear. A transaction is a 'all or nothing' contract. You do all the work in a private notebook (the session), and only when every step is correct do you copy it into the permanent ledger (the commit).",
            analogy: "An 'Undo' button that lasts until you click 'Save'. You can make 10 changes to a document, and if you mess up the 11th you can discard EVERYTHING. If you are happy you click Save and all 10 become permanent together.",
            lookFor: "Watch the Conflict Check node — it is the heart of MongoDB's optimistic approach. It doesn't lock documents (which would be slow); it just checks at the end if someone else touched them. If they did, it aborts and the client retries. This is why error handling in transactions is so important!"
        }
    };
}
