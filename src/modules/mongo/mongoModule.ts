// ========================================
// MongoDB Module - Level 3 Engineering Depth
// Query planner, execution plan, WiredTiger, cursor, projection
// ========================================

import type { ModuleConfig, SystemNode, Connection } from "../../engine/types/system.types";

const nodes: SystemNode[] = [
    {
        id: "app",
        name: "Application",
        icon: "⚡",
        category: "service",
        runtime: "event-loop",
        position: { x: 60, y: 200 },
        state: "idle",
        metadata: { driver: "Mongoose or native MongoDB driver" },
        explanation: "What: Your Node.js app constructs a query using the MongoDB driver API (e.g., db.users.find({ email: 'x' })). The driver validates the query shape and adds default options. Why: The driver is your interface to MongoDB - it handles connection pooling, retries, and BSON serialization. Breaks when: Connection pool is exhausted (default: 5 connections). If all connections are busy, new queries queue up. Increase maxPoolSize for high-throughput apps.",
    },
    {
        id: "conn-pool",
        name: "Connection Pool",
        icon: "🔗",
        category: "middleware",
        runtime: "event-loop",
        position: { x: 200, y: 80 },
        state: "idle",
        metadata: { default: 5, max: 100, options: "maxPoolSize, minPoolSize, maxIdleTimeMS" },
        explanation: "What: The driver maintains a pool of TCP connections to MongoDB. Instead of opening a new connection per query (expensive: ~5ms TCP handshake + auth), it reuses existing ones. Why: Connection reuse eliminates TCP and auth overhead. Each connection can handle one query at a time - the pool size limits concurrency. Breaks when: Pool exhaustion - if you have 5 connections and 100 concurrent queries, 95 wait. Also breaks when connections go stale (maxIdleTimeMS). Monitor with db.serverStatus().connections.",
    },
    {
        id: "query-parser",
        name: "Query Parser",
        icon: "📝",
        category: "service",
        runtime: "blocking",
        position: { x: 200, y: 320 },
        state: "idle",
        metadata: { serialization: "JavaScript → BSON", validates: "field names, operator syntax" },
        explanation: "What: The query is serialized from JavaScript objects to BSON (Binary JSON). MongoDB validates the query shape: are operators valid ($gt, $in, $regex)? Are field paths legal? Why: BSON is more efficient than JSON - it's typed (distinguishes int32 from int64 from double) and can be traversed without full deserialization. Breaks when: Invalid operators or malformed queries are sent. Also: $regex without an index causes a COLLSCAN. $where and $expr with complex expressions bypass query optimization.",
    },
    {
        id: "query-planner",
        name: "Query Planner",
        icon: "🧠",
        category: "service",
        runtime: "blocking",
        position: { x: 380, y: 80 },
        state: "idle",
        metadata: { algorithm: "candidate plan evaluation", cache: "plan cache stores winning plans" },
        explanation: "What: The query planner evaluates MULTIPLE candidate execution plans. For each usable index, it creates a plan. It runs candidates in parallel for a brief trial period, then picks the plan that produces results with the least work. The winning plan is cached. Why: Different indexes suit different queries. {email: 1} is perfect for find({email: 'x'}) but useless for find({age: {$gt: 25}}). The planner evaluates this automatically. Breaks when: The plan cache becomes stale after bulk data changes. Use planCacheClear() if query performance suddenly degrades after large writes.",
    },
    {
        id: "index-selection",
        name: "Index Selection",
        icon: "📑",
        category: "database",
        runtime: "blocking",
        position: { x: 380, y: 200 },
        state: "idle",
        metadata: { type: "B-Tree", compound: "prefix rule applies", covered: "all fields in index = no doc fetch" },
        explanation: "What: If the planner chooses an index, it performs an IXSCAN - walking the B-Tree index to find matching entries in O(log n). B-Trees keep data sorted, enabling range queries ($gt, $lt) efficiently. Why: Without an index, MongoDB must read EVERY document (COLLSCAN, O(n)). With an index on 1M docs: IXSCAN ~20 comparisons vs COLLSCAN ~1M reads. Breaks when: Compound index prefix rule is violated. Index {a:1, b:1} supports queries on (a), (a,b) - but NOT queries filtering only on (b). The leftmost prefix must match. Also: too many indexes slow down writes - each insert updates every index.",
    },
    {
        id: "exec-plan",
        name: "Execution Plan",
        icon: "📊",
        category: "service",
        runtime: "blocking",
        position: { x: 380, y: 320 },
        state: "idle",
        metadata: { stages: "IXSCAN | COLLSCAN → FETCH → SORT → PROJECTION", inspect: "explain()" },
        explanation: "What: The execution plan is the concrete strategy: which index to use (or COLLSCAN), whether to fetch documents, how to sort, where to apply projection. Use .explain('executionStats') to see it. Why: The plan reveals WHY a query is slow. Look for: totalDocsExamined vs nReturned (if examining 100K docs to return 10, you need a better index). Breaks when: You don't check explain() and assume indexes are being used. Common surprise: MongoDB can CHOOSE COLLSCAN over IXSCAN if the index selectivity is poor (e.g., boolean field index with 50/50 distribution).",
    },
    {
        id: "wiredtiger",
        name: "WiredTiger Cache",
        icon: "🧊",
        category: "database",
        runtime: "blocking",
        position: { x: 560, y: 80 },
        state: "idle",
        metadata: { defaultSize: "50% of RAM - 1GB", eviction: "dirty pages flushed at thresholds" },
        explanation: "What: WiredTiger is MongoDB's storage engine. It maintains an in-memory cache of frequently accessed data pages. Cache size defaults to 50% of system RAM minus 1GB. Why: Disk I/O is ~100x slower than memory access. If your working set fits in cache, queries are extremely fast. Cache misses cause disk reads. Breaks when: Working set exceeds cache size - cache eviction storms cause latency spikes. Monitor with db.serverStatus().wiredTiger.cache. Also: dirty page ratio above 20% means writes are faster than checkpointing - add more IOPS.",
    },
    {
        id: "doc-scan",
        name: "Document Scan",
        icon: "🔍",
        category: "database",
        runtime: "blocking",
        position: { x: 560, y: 200 },
        state: "idle",
        metadata: { complexity: "COLLSCAN = O(n), IXSCAN+FETCH = O(log n) + O(k)" },
        explanation: "What: If no suitable index exists, MongoDB performs a COLLSCAN - reading every document in the collection from disk or cache, checking each against the query filter. Why: Without structural guidance (an index), there's no shortcut - every document must be examined. On 1M documents, this means 1M reads. Breaks when: Collection grows beyond cache size. A COLLSCAN on cold data means 1M disk reads - this can take minutes. Even cached COLLSCANs are slow because of the sheer number of comparisons. Always index fields you filter on.",
    },
    {
        id: "cursor",
        name: "Cursor",
        icon: "📄",
        category: "service",
        runtime: "blocking",
        position: { x: 560, y: 320 },
        state: "idle",
        metadata: { firstBatch: "101 docs or 16MB", timeout: "10 min idle", command: "getMore" },
        explanation: "What: MongoDB returns results through a cursor - an iterable pointer to the result set. The first batch is 101 documents (or 16MB, whichever is smaller). Subsequent batches are fetched via getMore commands. Why: Returning millions of documents at once would exhaust memory. Cursors stream results in manageable batches. Breaks when: Cursor times out after 10 minutes of idle time (noCursorTimeout option to override). Also: if the collection is modified during iteration, cursor behavior depends on the storage engine - some cursors can return duplicates or skip documents.",
    },
    {
        id: "projection",
        name: "Projection",
        icon: "✂️",
        category: "service",
        runtime: "blocking",
        position: { x: 740, y: 80 },
        state: "idle",
        metadata: { include: "{ name: 1, email: 1, _id: 0 }", covered: "no FETCH needed if all in index" },
        explanation: "What: Projection specifies which fields to include/exclude in the result. { name: 1, email: 1, _id: 0 } returns ONLY name and email. Why: Less data = faster network transfer and less memory usage. Critical optimization for large documents. Best case: a 'covered query' where ALL projected fields are in the index - MongoDB skips the FETCH stage entirely. Breaks when: You mix inclusion and exclusion (except for _id). {name: 1, age: 0} is invalid. Also: without projection, MongoDB returns the entire document - including that 500KB embedded array you don't need.",
    },
    {
        id: "result-stream",
        name: "Result Stream",
        icon: "📡",
        category: "service",
        runtime: "event-loop",
        position: { x: 740, y: 200 },
        state: "idle",
        metadata: { format: "BSON → JavaScript objects", batching: "streamed in batches" },
        explanation: "What: Results are deserialized from BSON to JavaScript objects and streamed back to your application. The driver handles buffering, batching, and type conversion (BSON types → JS types). Why: BSON supports types JavaScript doesn't natively (Decimal128, ObjectId, Timestamp). The driver maps these to JS equivalents or wrapper classes. Breaks when: Type coercion causes issues - BSON int64 can't be precisely represented as JS Number (max safe integer: 2^53). Use BigInt or string representations for large numbers.",
    },
    {
        id: "app-return",
        name: "Application (return)",
        icon: "✅",
        category: "service",
        runtime: "event-loop",
        position: { x: 740, y: 320 },
        state: "idle",
        metadata: {},
        explanation: "What: The query callback fires with the result documents. Your application processes them - transform, aggregate, or send as API response. Why: The async callback pattern ensures the event loop wasn't blocked during the entire query lifecycle. Breaks when: You load all results into memory for a large collection. Use .cursor() or .stream() for processing large datasets to avoid memory exhaustion.",
    },
];

const connections: Connection[] = [
    {
        id: "c1", source: "app", target: "conn-pool", protocol: "db-query", latency: 5,
        reason: "Query is sent to the connection pool. The driver picks an idle connection.",
    },
    {
        id: "c2", source: "conn-pool", target: "query-parser", protocol: "db-query", latency: 5,
        reason: "Connection acquired. The query is serialized to BSON format.",
    },
    {
        id: "c3", source: "query-parser", target: "query-planner", protocol: "db-query", latency: 5,
        reason: "BSON query arrives at the server. The planner evaluates multiple candidate plans to find the most efficient route.",
    },
    {
        id: "c4", source: "query-planner", target: "exec-plan", protocol: "db-query", latency: 5,
        reason: "The winning plan is cached and formatted as an Execution Plan, showing exactly how MongoDB will find the data.",
    },
    {
        id: "c5", source: "exec-plan", target: "index-selection", protocol: "db-query", latency: 10,
        reason: "The plan attempts an IXSCAN first, prioritizing available B-Tree indexes for O(log n) lookups.",
    },
    {
        id: "c6", source: "index-selection", target: "doc-scan", protocol: "db-query", latency: 10,
        reason: "If the index is missing or poor, it falls back to a Document Scan (COLLSCAN), forcing it to read every document.",
    },
    {
        id: "c7", source: "doc-scan", target: "wiredtiger", protocol: "db-query", latency: 50,
        reason: "Whether via index or full scan, the actual data pages are fetched from the WiredTiger cache or disk.",
    },
    {
        id: "c8", source: "wiredtiger", target: "cursor", protocol: "db-query", latency: 5,
        reason: "Matched documents are streamed into a Cursor, which batches results (first 101 docs) to avoid memory overload.",
    },
    {
        id: "c9", source: "cursor", target: "projection", protocol: "db-query", latency: 5,
        reason: "The cursor runs the documents through Projection, stripping away unrequested fields to save bandwidth.",
    },
    {
        id: "c10", source: "projection", target: "result-stream", protocol: "db-query", latency: 5,
        reason: "The lightweight documents are streamed back over the network and deserialized to JavaScript objects.",
    },
    {
        id: "c11", source: "result-stream", target: "app-return", protocol: "db-query", latency: 5,
        reason: "Data arrives at the application! The callback completes and the loop continues.",
    },
];

export function getMongoModuleConfig(): ModuleConfig {
    return {
        moduleId: "mongodb",
        nodes,
        connections,
        initialPackets: [
            {
                id: "pkt_query",
                protocol: "db-query",
                payload: "db.users.find({ email: 'alice@dev.io' }).project({ name: 1, email: 1 })",
                label: "find() + projection",
                currentNodeId: "app",
                sourceNodeId: "app",
                targetNodeId: "conn-pool",
                path: ["app"],
                progress: 0,
                status: "pending",
                createdAt: Date.now(),
            },
        ],
        whyModePrompts: [
            {
                question: "The query planner evaluates multiple plans. How does it choose the winner?",
                options: [
                    { label: "Always picks the plan with the newest index", isCorrect: false },
                    { label: "Runs candidate plans in parallel for a trial period and picks the one that produces results with the least work", isCorrect: true },
                    { label: "Always prefers IXSCAN over COLLSCAN regardless of data distribution", isCorrect: false },
                    { label: "Uses a random selection for load balancing", isCorrect: false },
                ],
                correctIndex: 1,
                explanation: "MongoDB's query planner runs a 'trial period' where candidate plans race. The plan that returns a batch of results with the fewest 'works' (internal cost metric) wins. The winning plan is cached for the query shape. Notably, MongoDB CAN choose COLLSCAN over IXSCAN if the index is poorly selective (e.g., boolean field).",
                connectionId: "c4",
                nodeId: "query-planner",
            },
            {
                question: "You have index { firstName: 1, lastName: 1, age: 1 }. Which query can use this index?",
                options: [
                    { label: "find({ lastName: 'Smith' }) - filtering on the second field", isCorrect: false },
                    { label: "find({ age: { $gt: 25 } }) - filtering on the third field", isCorrect: false },
                    { label: "find({ firstName: 'Alice', lastName: 'Smith' }) - filtering on the first two fields", isCorrect: true },
                    { label: "find({ lastName: 'Smith', age: 30 }) - filtering on the last two fields", isCorrect: false },
                ],
                correctIndex: 2,
                explanation: "The compound index prefix rule: index { a, b, c } supports queries on (a), (a,b), or (a,b,c) - but NOT (b), (c), or (b,c). The leftmost prefix must be present. A query on { lastName, age } skips firstName, so the index can't be used efficiently. This is the most common compound index mistake.",
                connectionId: "c6",
                nodeId: "index-selection",
            },
            {
                question: "A query returns 10 documents but explain() shows totalDocsExamined: 100,000. What does this mean?",
                options: [
                    { label: "Normal behavior - MongoDB always checks all documents for safety", isCorrect: false },
                    { label: "The query is using COLLSCAN or a poorly selective index - it reads 100K docs to find 10 matches", isCorrect: true },
                    { label: "The cache is cold and needs warming", isCorrect: false },
                    { label: "The projection is causing extra reads", isCorrect: false },
                ],
                correctIndex: 1,
                explanation: "totalDocsExamined >> nReturned is the clearest sign of a missing or inefficient index. MongoDB read 100,000 documents to return only 10. With a proper index, it would examine close to 10 documents. Use explain('executionStats') to identify this pattern and add the appropriate index.",
                connectionId: "c7",
                nodeId: "exec-plan",
            },
            {
                question: "Your query only needs 'name' and 'email', but the documents also have a 500KB 'activity_log' array. How do you optimize?",
                options: [
                    { label: "Filter with $where to skip large documents", isCorrect: false },
                    { label: "Use projection: { name: 1, email: 1, _id: 0 } - only send the fields you need", isCorrect: true },
                    { label: "Cache the results on the application server", isCorrect: false },
                    { label: "Use aggregation pipeline instead of find()", isCorrect: false },
                ],
                correctIndex: 1,
                explanation: "Projection reduces the data transferred over the network. Without it, each document sends 500KB of activity_log you don't need. Best case: if {name: 1, email: 1} are all in an index, MongoDB performs a 'covered query' - it skips document fetch entirely and serves results directly from the index.",
                connectionId: "c10",
                nodeId: "cursor",
            },
        ],
        learningStory: {
            title: "The Super Organized Library",
            content: "MongoDB is like a giant library where instead of just throwing books in a pile, we use a special index (like a map) to find exactly where 'Alice' lives in 0.001 seconds! MERN and MEAN are just different 'tools' on top of this library. MERN uses 'React' (the fun visual stuff), while MEAN uses 'Angular' (the serious structured stuff).",
            analogy: "A filing cabinet with labeled folders. Without labels (indexes), you'd have to look at every single paper in the cabinet to find one name (COLLSCAN)!",
            lookFor: "Observe the 'Index Selection' node. When it's active, the data packet skips the long 'Document Scan' (COLLSCAN) and jumps straight to the data. That's the power of MERN's database!"
        }
    };
}
