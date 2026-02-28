// ========================================
// Mission Definitions - Real debugging challenges
// ========================================

import type { Mission } from '../engine/types/system.types';

// ---- Mission 1: Slow API ----

export const MISSION_SLOW_API: Mission = {
    id: 'slow-api',
    title: 'Your API is slow. Find why.',
    description: 'Users report 3-second response times on the dashboard endpoint. The database has 50,000 user records.',
    briefing: 'The /api/dashboard endpoint aggregates data from the Users collection. Response times have degraded from 50ms to 3000ms as the dataset grew. Something is fundamentally wrong with how this query executes. Inspect the simulation - watch where time is spent.',
    difficulty: 'beginner',
    moduleId: 'mongodb',
    category: 'Performance',
    hints: [
        'Watch the packet flow - notice how long the Collection node takes compared to the Index Engine.',
        'The query filters by email, but the path goes directly to collection scan. Is the index being used?',
        'Run db.users.find({ email: "x" }).explain() - look for COLLSCAN vs IXSCAN.',
    ],
    whatWentWrong: 'The application queries by a field that has no index. MongoDB performs a COLLSCAN - reading ALL 50,000 documents to find matches. This is O(n) instead of O(log n).',
    howToFix: 'Create an index on the query field: db.users.createIndex({ email: 1 }). This enables an IXSCAN (index scan) which is orders of magnitude faster.',
    successExplanation: 'Indexes are B-Tree data structures that MongoDB maintains alongside your data. Without them, every query is a full table scan. Always index fields you filter, sort, or join on. Use explain() to verify your queries use indexes.',
    solutionOptions: [
        { label: 'Add an index on the email field', isCorrect: true, feedback: 'Exactly. Indexing allows MongoDB to skip scanning all documents and find the data in O(log n) time.' },
        { label: 'Vertical scaling (Add more CPU)', isCorrect: false, feedback: 'Adding more CPU might help slightly, but the O(n) scan will still be the bottleneck as data grows.' },
        { label: 'Shard the database', isCorrect: false, feedback: 'Sharding is for horizontal scale. A single-node COLLSCAN is a design issue that should be solved with an index first.' },
    ],
    brokenConfig: {
        moduleId: 'mongodb',
        nodes: [
            { id: 'app', name: 'Application', icon: '⚡', category: 'service', runtime: 'event-loop', position: { x: 80, y: 180 }, state: 'idle', metadata: {}, explanation: 'App sends a find() query. No index exists on the query field.' },
            { id: 'driver', name: 'Mongo Driver', icon: '🔌', category: 'middleware', runtime: 'event-loop', position: { x: 280, y: 180 }, state: 'idle', metadata: {}, explanation: 'Driver sends query to MongoDB. The query planner will choose COLLSCAN because no index matches the filter field.' },
            { id: 'collection', name: 'Users (50K docs)', icon: '📁', category: 'database', runtime: 'blocking', position: { x: 500, y: 180 }, state: 'idle', metadata: { documents: 50000, indexes: ['_id'] }, explanation: '⚠️ COLLSCAN - scanning ALL 50,000 documents one by one. This is extremely slow. There is no index on the email field.' },
            { id: 'result', name: 'Query Result', icon: '📊', category: 'service', runtime: 'event-loop', position: { x: 720, y: 180 }, state: 'idle', metadata: {}, explanation: 'Result finally arrives after scanning the entire collection. 3000ms for a simple lookup.' },
        ],
        connections: [
            { id: 'c1', source: 'app', target: 'driver', protocol: 'db-query', latency: 5, reason: 'App calls db.users.find({ email: "user@test.com" })' },
            { id: 'c2', source: 'driver', target: 'collection', protocol: 'db-query', latency: 200, reason: '⚠️ No index available - MongoDB must scan EVERY document (COLLSCAN). This takes 3000ms on 50K docs.' },
            { id: 'c3', source: 'collection', target: 'result', protocol: 'db-query', latency: 200, reason: 'After scanning all documents, matching ones are returned. Slow path.' },
            { id: 'c4', source: 'result', target: 'app', protocol: 'db-query', latency: 5, reason: 'Result sent back to application. Total time: ~3000ms.' },
        ],
        initialPackets: [
            { id: 'pkt_slow', protocol: 'db-query', payload: 'db.users.find({ email: "user@test.com" })', label: 'Slow Query', currentNodeId: 'app', sourceNodeId: 'app', targetNodeId: 'driver', path: ['app'], progress: 0, status: 'pending', createdAt: Date.now() },
        ],
    },
    fixedConfig: {
        moduleId: 'mongodb',
        nodes: [
            { id: 'app', name: 'Application', icon: '⚡', category: 'service', runtime: 'event-loop', position: { x: 80, y: 180 }, state: 'idle', metadata: {}, explanation: 'App sends the same find() query. Now an index exists on email.' },
            { id: 'driver', name: 'Mongo Driver', icon: '🔌', category: 'middleware', runtime: 'event-loop', position: { x: 280, y: 180 }, state: 'idle', metadata: {}, explanation: 'Driver sends query. The query planner sees an index on email and chooses IXSCAN.' },
            { id: 'index', name: 'B-Tree Index', icon: '📑', category: 'database', runtime: 'blocking', position: { x: 500, y: 100 }, state: 'idle', metadata: { type: 'B-Tree', field: 'email' }, explanation: '✅ IXSCAN - B-Tree index lookup in O(log n). Finds the document reference instantly.' },
            { id: 'collection', name: 'Users (50K docs)', icon: '📁', category: 'database', runtime: 'blocking', position: { x: 500, y: 260 }, state: 'idle', metadata: { documents: 50000, indexes: ['_id', 'email'] }, explanation: 'Index points directly to the matching document. No need to scan all 50K docs.' },
            { id: 'result', name: 'Query Result', icon: '📊', category: 'service', runtime: 'event-loop', position: { x: 720, y: 180 }, state: 'idle', metadata: {}, explanation: 'Result arrives in ~2ms instead of 3000ms. Indexes make a massive difference.' },
        ],
        connections: [
            { id: 'c1', source: 'app', target: 'driver', protocol: 'db-query', latency: 5, reason: 'Same query, same data - but now with an index.' },
            { id: 'c2', source: 'driver', target: 'index', protocol: 'db-query', latency: 5, reason: '✅ Query planner uses IXSCAN. B-Tree lookup: O(log 50000) ≈ 16 comparisons.' },
            { id: 'c3', source: 'index', target: 'collection', protocol: 'db-query', latency: 5, reason: 'Index returns the document location. Fetch the actual document by reference.' },
            { id: 'c4', source: 'collection', target: 'result', protocol: 'db-query', latency: 5, reason: 'Document fetched directly. No scanning needed.' },
            { id: 'c5', source: 'result', target: 'app', protocol: 'db-query', latency: 5, reason: 'Result returned in ~2ms. That\'s 1500x faster than the COLLSCAN.' },
        ],
        initialPackets: [
            { id: 'pkt_fast', protocol: 'db-query', payload: 'db.users.find({ email: "user@test.com" })', label: 'Fast Query', currentNodeId: 'app', sourceNodeId: 'app', targetNodeId: 'driver', path: ['app'], progress: 0, status: 'pending', createdAt: Date.now() },
        ],
    },
};

// ---- Mission 2: Login Failing ----

export const MISSION_LOGIN_FAILING: Mission = {
    id: 'login-failing',
    title: 'User login failing intermittently.',
    description: 'Some users can log in fine, others get 401 errors randomly. No code changes were deployed recently.',
    briefing: 'The auth flow works for most users, but about 20% of login attempts fail with 401 Unauthorized. The password hashing and JWT generation are correct. The issue is in the flow - something is being skipped.',
    difficulty: 'intermediate',
    moduleId: 'auth',
    category: 'Security',
    hints: [
        'Watch the packet carefully - does it always pass through token validation?',
        'The broken config routes some traffic around the token validator. What happens when validation is skipped?',
        'In a real system, this could happen if your auth middleware isn\'t applied to all routes, or if a load balancer routes some traffic to an unprotected endpoint.',
    ],
    whatWentWrong: 'The auth middleware is not consistently applied. Some request paths bypass token validation entirely, allowing unauthenticated requests to reach protected routes - or rejecting valid tokens because they\'re checked with the wrong key.',
    howToFix: 'Ensure auth middleware is applied globally or to ALL protected routes. Use app.use(authMiddleware) before route definitions, not selectively on some routes.',
    successExplanation: 'Middleware ordering in Express is critical. If auth middleware is registered AFTER some routes, those routes are unprotected. Always register auth middleware early. In microservices, use an API gateway for consistent auth.',
    solutionOptions: [
        { label: 'Apply auth middleware globally via app.use()', isCorrect: true, feedback: 'Correct! This ensures that every request passes through the validation logic before reaching any handler.' },
        { label: 'Increasing JWT expiration time', isCorrect: false, feedback: 'Expiration is not the issue; some requests are skipping the check entirely.' },
        { label: 'Rotate the JWT secret key', isCorrect: false, feedback: 'Rotating keys won\'t fix missing middleware configuration.' },
    ],
    brokenConfig: {
        moduleId: 'auth',
        nodes: [
            { id: 'client', name: 'Client', icon: '🌐', category: 'client', runtime: 'event-loop', position: { x: 80, y: 180 }, state: 'idle', metadata: {}, explanation: 'Client sends login request. Credentials are correct.' },
            { id: 'auth-server', name: 'Auth Server', icon: '🔐', category: 'service', runtime: 'event-loop', position: { x: 280, y: 80 }, state: 'idle', metadata: {}, explanation: 'Auth server receives the request. It should validate credentials and issue a token.' },
            { id: 'user-db', name: 'User Database', icon: '🗄', category: 'database', runtime: 'blocking', position: { x: 480, y: 80 }, state: 'idle', metadata: {}, explanation: 'User found in DB, password hash matches.' },
            { id: 'jwt-gen', name: 'JWT Generator', icon: '🎫', category: 'service', runtime: 'event-loop', position: { x: 480, y: 280 }, state: 'idle', metadata: {}, explanation: 'JWT is generated correctly with the right secret.' },
            { id: 'protected-api', name: 'Protected API', icon: '🛡', category: 'service', runtime: 'event-loop', position: { x: 680, y: 180 }, state: 'idle', metadata: {}, explanation: '⚠️ Protected API is reached WITHOUT token validation. Some routes skip the auth middleware.' },
        ],
        connections: [
            { id: 'c1', source: 'client', target: 'auth-server', protocol: 'http', latency: 30, reason: 'Login request sent.' },
            { id: 'c2', source: 'auth-server', target: 'user-db', protocol: 'db-query', latency: 50, reason: 'Looking up user by email.' },
            { id: 'c3', source: 'user-db', target: 'jwt-gen', protocol: 'http', latency: 10, reason: 'User found, generating JWT.' },
            { id: 'c4', source: 'jwt-gen', target: 'protected-api', protocol: 'http', latency: 5, reason: '⚠️ Token goes directly to the API - token validation middleware is MISSING from this route.' },
            { id: 'c5', source: 'protected-api', target: 'client', protocol: 'http', latency: 30, reason: '⚠️ 401 - the route doesn\'t recognize the token because validation never ran.' },
        ],
        initialPackets: [
            { id: 'pkt_login', protocol: 'http', payload: 'POST /api/login', label: 'Login Attempt', currentNodeId: 'client', sourceNodeId: 'client', targetNodeId: 'auth-server', path: ['client'], progress: 0, status: 'pending', createdAt: Date.now() },
        ],
    },
    fixedConfig: {
        moduleId: 'auth',
        nodes: [
            { id: 'client', name: 'Client', icon: '🌐', category: 'client', runtime: 'event-loop', position: { x: 80, y: 180 }, state: 'idle', metadata: {}, explanation: 'Client sends login request.' },
            { id: 'auth-server', name: 'Auth Server', icon: '🔐', category: 'service', runtime: 'event-loop', position: { x: 280, y: 80 }, state: 'idle', metadata: {}, explanation: 'Auth server validates credentials.' },
            { id: 'user-db', name: 'User Database', icon: '🗄', category: 'database', runtime: 'blocking', position: { x: 480, y: 80 }, state: 'idle', metadata: {}, explanation: 'DB lookup succeeds.' },
            { id: 'jwt-gen', name: 'JWT Generator', icon: '🎫', category: 'service', runtime: 'event-loop', position: { x: 480, y: 280 }, state: 'idle', metadata: {}, explanation: 'JWT generated with correct secret.' },
            { id: 'token-validator', name: 'Token Validator', icon: '✅', category: 'middleware', runtime: 'event-loop', position: { x: 580, y: 180 }, state: 'idle', metadata: {}, explanation: '✅ Token validator middleware runs on ALL protected routes. It verifies the JWT signature and expiration.' },
            { id: 'protected-api', name: 'Protected API', icon: '🛡', category: 'service', runtime: 'event-loop', position: { x: 720, y: 180 }, state: 'idle', metadata: {}, explanation: '✅ Token validated - request proceeds to the protected handler.' },
        ],
        connections: [
            { id: 'c1', source: 'client', target: 'auth-server', protocol: 'http', latency: 30, reason: 'Login request.' },
            { id: 'c2', source: 'auth-server', target: 'user-db', protocol: 'db-query', latency: 50, reason: 'User lookup.' },
            { id: 'c3', source: 'user-db', target: 'jwt-gen', protocol: 'http', latency: 10, reason: 'Generate JWT.' },
            { id: 'c4', source: 'jwt-gen', target: 'token-validator', protocol: 'http', latency: 5, reason: '✅ Token passes through validation middleware first.' },
            { id: 'c5', source: 'token-validator', target: 'protected-api', protocol: 'http', latency: 5, reason: '✅ Token verified - request authorized.' },
            { id: 'c6', source: 'protected-api', target: 'client', protocol: 'http', latency: 30, reason: '200 OK - protected resource returned.' },
        ],
        initialPackets: [
            { id: 'pkt_login', protocol: 'http', payload: 'POST /api/login', label: 'Login Attempt', currentNodeId: 'client', sourceNodeId: 'client', targetNodeId: 'auth-server', path: ['client'], progress: 0, status: 'pending', createdAt: Date.now() },
        ],
    },
};

// ---- Mission 3: Mongo Full Scan ----

export const MISSION_MONGO_FULL_SCAN: Mission = {
    id: 'mongo-full-scan',
    title: 'Mongo query scanning entire collection.',
    description: 'A simple aggregation pipeline is taking 8 seconds. The collection has 100K documents.',
    briefing: 'The analytics dashboard runs an aggregation pipeline: $match → $group → $sort. The $match stage filters by date range (createdAt >= 30 days ago). Despite having only 5K matching documents, the query processes all 100K. The explain() output shows COLLSCAN.',
    difficulty: 'intermediate',
    moduleId: 'mongodb',
    category: 'Data',
    hints: [
        'The $match stage is the bottleneck. It scans every document to check the date range.',
        'MongoDB can only use indexes in the $match stage if the $match is the FIRST stage in the pipeline.',
        'Create a compound index on { createdAt: 1 } to speed up the date range filter.',
    ],
    whatWentWrong: 'No index exists on the createdAt field. The $match stage performs a COLLSCAN across all 100K documents. Aggregation pipelines can only use indexes in the first $match stage.',
    howToFix: 'Create an index: db.analytics.createIndex({ createdAt: 1 }). Always put $match as the first pipeline stage and ensure the filtered field is indexed.',
    successExplanation: 'MongoDB\'s aggregation pipeline optimizer can push $match stages early and use indexes - but ONLY if the field is indexed. For time-series data, consider a compound index like { createdAt: 1, category: 1 } to cover common query patterns.',
    solutionOptions: [
        { label: 'Add an index on the createdAt field', isCorrect: true, feedback: 'Yes. $match stages in aggregations need indexes just like find() queries to avoid COLLSCAN.' },
        { label: 'Move $match to the end of the pipeline', isCorrect: false, feedback: 'No! Moving $match later makes it process even MORE data before filtering.' },
        { label: 'Use a $project stage before $match', isCorrect: false, feedback: 'Projecting won\'t stop the full scan of the collection; filtering must happen early with an index.' },
    ],
    brokenConfig: {
        moduleId: 'mongodb',
        nodes: [
            { id: 'app', name: 'Analytics API', icon: '📊', category: 'service', runtime: 'event-loop', position: { x: 80, y: 180 }, state: 'idle', metadata: {}, explanation: 'API runs an aggregation pipeline for the last 30 days of data.' },
            { id: 'driver', name: 'Mongo Driver', icon: '🔌', category: 'middleware', runtime: 'event-loop', position: { x: 280, y: 180 }, state: 'idle', metadata: {}, explanation: 'Driver sends the aggregation pipeline. No index hint provided.' },
            { id: 'collection', name: 'Analytics (100K)', icon: '📁', category: 'database', runtime: 'blocking', position: { x: 500, y: 180 }, state: 'idle', metadata: { documents: 100000, indexes: ['_id'] }, explanation: '⚠️ $match stage performs COLLSCAN - checking createdAt on ALL 100K documents. Only 5K match, but all are scanned.' },
            { id: 'result', name: 'Aggregation Result', icon: '📐', category: 'service', runtime: 'event-loop', position: { x: 720, y: 180 }, state: 'idle', metadata: {}, explanation: 'Result arrives after 8 seconds of scanning. The $group and $sort ran fast - the bottleneck was $match.' },
        ],
        connections: [
            { id: 'c1', source: 'app', target: 'driver', protocol: 'db-query', latency: 5, reason: 'Sends aggregation: [{ $match: { createdAt: { $gte: 30daysAgo } } }, { $group: {...} }, { $sort: {...} }]' },
            { id: 'c2', source: 'driver', target: 'collection', protocol: 'db-query', latency: 250, reason: '⚠️ COLLSCAN on createdAt. No index → must read every document and check the date. 8 seconds.' },
            { id: 'c3', source: 'collection', target: 'result', protocol: 'db-query', latency: 50, reason: '$group and $sort run on the 5K matching docs. Fast, but the scan before it was the bottleneck.' },
            { id: 'c4', source: 'result', target: 'app', protocol: 'db-query', latency: 5, reason: 'Total pipeline time: ~8000ms. Unacceptable.' },
        ],
        initialPackets: [
            { id: 'pkt_agg', protocol: 'db-query', payload: 'aggregate([{$match}, {$group}, {$sort}])', label: 'Slow Aggregation', currentNodeId: 'app', sourceNodeId: 'app', targetNodeId: 'driver', path: ['app'], progress: 0, status: 'pending', createdAt: Date.now() },
        ],
    },
    fixedConfig: {
        moduleId: 'mongodb',
        nodes: [
            { id: 'app', name: 'Analytics API', icon: '📊', category: 'service', runtime: 'event-loop', position: { x: 80, y: 180 }, state: 'idle', metadata: {}, explanation: 'Same aggregation pipeline - but now an index exists on createdAt.' },
            { id: 'driver', name: 'Mongo Driver', icon: '🔌', category: 'middleware', runtime: 'event-loop', position: { x: 280, y: 180 }, state: 'idle', metadata: {}, explanation: 'Driver sends the pipeline. Query planner detects the index.' },
            { id: 'index', name: 'createdAt Index', icon: '📑', category: 'database', runtime: 'blocking', position: { x: 480, y: 100 }, state: 'idle', metadata: { type: 'B-Tree', field: 'createdAt' }, explanation: '✅ IXSCAN on { createdAt: 1 }. B-Tree index finds all docs in the date range in O(log n). Only reads 5K matching docs.' },
            { id: 'collection', name: 'Analytics (100K)', icon: '📁', category: 'database', runtime: 'blocking', position: { x: 500, y: 260 }, state: 'idle', metadata: { documents: 100000, indexes: ['_id', 'createdAt'] }, explanation: 'Index points to the 5K matching documents. No full scan needed.' },
            { id: 'result', name: 'Aggregation Result', icon: '📐', category: 'service', runtime: 'event-loop', position: { x: 720, y: 180 }, state: 'idle', metadata: {}, explanation: 'Result arrives in ~50ms. Pipeline runs on only the 5K matching docs.' },
        ],
        connections: [
            { id: 'c1', source: 'app', target: 'driver', protocol: 'db-query', latency: 5, reason: 'Same aggregation pipeline.' },
            { id: 'c2', source: 'driver', target: 'index', protocol: 'db-query', latency: 5, reason: '✅ IXSCAN - index narrows to 5K docs from the date range.' },
            { id: 'c3', source: 'index', target: 'collection', protocol: 'db-query', latency: 10, reason: 'Fetch the 5K matching documents by reference.' },
            { id: 'c4', source: 'collection', target: 'result', protocol: 'db-query', latency: 10, reason: '$group and $sort on 5K docs - fast.' },
            { id: 'c5', source: 'result', target: 'app', protocol: 'db-query', latency: 5, reason: 'Total pipeline time: ~50ms. That\'s 160x faster.' },
        ],
        initialPackets: [
            { id: 'pkt_agg', protocol: 'db-query', payload: 'aggregate([{$match}, {$group}, {$sort}])', label: 'Fast Aggregation', currentNodeId: 'app', sourceNodeId: 'app', targetNodeId: 'driver', path: ['app'], progress: 0, status: 'pending', createdAt: Date.now() },
        ],
    },
};

// ---- Mission 4: Event Loop Blocked ----

export const MISSION_EVENT_LOOP_BLOCKED: Mission = {
    id: 'event-loop-blocked',
    title: 'Event loop blocked under load.',
    description: 'Server stops responding to all requests when a specific endpoint is called. CPU hits 100% on one core.',
    briefing: 'A file processing endpoint reads a large CSV file synchronously using fs.readFileSync(). While this runs, the event loop is completely blocked - no other requests can be processed. Under load, the entire server becomes unresponsive.',
    difficulty: 'advanced',
    moduleId: 'event-loop',
    category: 'Performance',
    hints: [
        'Watch the Event Loop node - does it ever become "idle" to pick up new callbacks?',
        'The processing task stays on the call stack for the entire duration. Nothing else can run.',
        'fs.readFileSync() is synchronous - it blocks the main thread. Use fs.readFile() (async) or streams instead.',
    ],
    whatWentWrong: 'A synchronous file read (fs.readFileSync) runs on the main thread. Since Node.js is single-threaded, the event loop cannot process ANY other requests while this runs. The call stack is never empty.',
    howToFix: 'Replace fs.readFileSync() with fs.readFile() (callback-based) or fs.promises.readFile() (async/await). For large files, use streams: fs.createReadStream(). This keeps the event loop free.',
    successExplanation: 'The golden rule of Node.js: never block the event loop. Synchronous operations (readFileSync, crypto.pbkdf2Sync, heavy computation) freeze your entire server. Always use async alternatives. For CPU-intensive work, use Worker Threads.',
    solutionOptions: [
        { label: 'Replace readFileSync with fs.readFile (async)', isCorrect: true, feedback: 'Exactly. Async I/O offloads the work to libuv\'s thread pool, keeping the main thread free for new requests.' },
        { label: 'Increase the number of Node.js threads', isCorrect: false, feedback: 'Node.js has a single main thread for the event loop; simply "adding threads" is not a simple config change.' },
        { label: 'Wrap the sync call in a try/catch', isCorrect: false, feedback: 'Try/catch handles errors but does not stop the synchronous call from blocking the loop.' },
    ],
    brokenConfig: {
        moduleId: 'event-loop',
        nodes: [
            { id: 'browser', name: 'Browser', icon: '🌐', category: 'client', runtime: 'event-loop', position: { x: 80, y: 180 }, state: 'idle', metadata: {}, explanation: 'Multiple clients are sending requests simultaneously.' },
            { id: 'express', name: 'Express Server', icon: '⚡', category: 'service', runtime: 'event-loop', position: { x: 320, y: 80 }, state: 'idle', metadata: {}, explanation: 'Express receives the file processing request.' },
            { id: 'event-loop-core', name: 'Event Loop', icon: '🔄', category: 'service', runtime: 'event-loop', position: { x: 320, y: 280 }, state: 'idle', metadata: {}, explanation: '⚠️ BLOCKED - fs.readFileSync() is on the call stack. The event loop CANNOT pick up callbacks or process other requests until this finishes.' },
            { id: 'sync-io', name: 'Sync File Read', icon: '📄', category: 'queue', runtime: 'blocking', position: { x: 580, y: 280 }, state: 'idle', metadata: {}, explanation: '⚠️ fs.readFileSync() runs ON the main thread. It reads the entire file into memory synchronously. This is the blocking operation.' },
            { id: 'callback', name: 'Callback Queue', icon: '📥', category: 'queue', runtime: 'event-loop', position: { x: 580, y: 80 }, state: 'idle', metadata: {}, explanation: '⚠️ Other request callbacks are stuck here. The event loop can\'t dequeue them because the call stack is occupied.' },
        ],
        connections: [
            { id: 'c1', source: 'browser', target: 'express', protocol: 'http', latency: 50, reason: 'Request arrives at Express.' },
            { id: 'c2', source: 'express', target: 'event-loop-core', protocol: 'http', latency: 5, reason: 'Handler pushed to call stack.' },
            { id: 'c3', source: 'event-loop-core', target: 'sync-io', protocol: 'http', latency: 300, reason: '⚠️ fs.readFileSync() - BLOCKS the event loop. Nothing else runs until this returns. 5 second freeze.' },
            { id: 'c4', source: 'sync-io', target: 'event-loop-core', protocol: 'http', latency: 5, reason: 'File read complete. Only NOW can the event loop resume processing other callbacks.' },
            { id: 'c5', source: 'event-loop-core', target: 'express', protocol: 'http', latency: 5, reason: 'Response finally sent - but all other requests waited 5+ seconds.' },
        ],
        initialPackets: [
            { id: 'pkt_sync', protocol: 'http', payload: 'POST /api/process-csv', label: 'File Upload', currentNodeId: 'browser', sourceNodeId: 'browser', targetNodeId: 'express', path: ['browser'], progress: 0, status: 'pending', createdAt: Date.now() },
        ],
    },
    fixedConfig: {
        moduleId: 'event-loop',
        nodes: [
            { id: 'browser', name: 'Browser', icon: '🌐', category: 'client', runtime: 'event-loop', position: { x: 80, y: 180 }, state: 'idle', metadata: {}, explanation: 'Multiple clients sending requests - all handled concurrently.' },
            { id: 'express', name: 'Express Server', icon: '⚡', category: 'service', runtime: 'event-loop', position: { x: 320, y: 80 }, state: 'idle', metadata: {}, explanation: 'Express receives the request and delegates I/O asynchronously.' },
            { id: 'event-loop-core', name: 'Event Loop', icon: '🔄', category: 'service', runtime: 'event-loop', position: { x: 320, y: 280 }, state: 'idle', metadata: {}, explanation: '✅ Event loop is FREE - async I/O runs in the background. Other requests are processed while the file is being read.' },
            { id: 'async-io', name: 'Async File Read', icon: '📄', category: 'queue', runtime: 'event-loop', position: { x: 580, y: 280 }, state: 'idle', metadata: {}, explanation: '✅ fs.readFile() runs in libuv\'s thread pool. The main thread is NOT blocked.' },
            { id: 'callback', name: 'Callback Queue', icon: '📥', category: 'queue', runtime: 'event-loop', position: { x: 580, y: 80 }, state: 'idle', metadata: {}, explanation: '✅ Other callbacks are processed normally. File read callback is queued when done.' },
        ],
        connections: [
            { id: 'c1', source: 'browser', target: 'express', protocol: 'http', latency: 50, reason: 'Request arrives.' },
            { id: 'c2', source: 'express', target: 'event-loop-core', protocol: 'http', latency: 5, reason: 'Handler pushed to call stack → immediately offloads I/O.' },
            { id: 'c3', source: 'event-loop-core', target: 'async-io', protocol: 'http', latency: 5, reason: '✅ fs.readFile() - offloaded to thread pool. Event loop immediately moves on to other work.' },
            { id: 'c4', source: 'async-io', target: 'callback', protocol: 'http', latency: 100, reason: '✅ File read completes in the background. Callback pushed to queue.' },
            { id: 'c5', source: 'callback', target: 'event-loop-core', protocol: 'http', latency: 5, reason: '✅ Event loop picks up the callback when ready. No blocking.' },
            { id: 'c6', source: 'event-loop-core', target: 'express', protocol: 'http', latency: 5, reason: 'Response sent - and other requests were NOT delayed.' },
        ],
        initialPackets: [
            { id: 'pkt_async', protocol: 'http', payload: 'POST /api/process-csv', label: 'File Upload', currentNodeId: 'browser', sourceNodeId: 'browser', targetNodeId: 'express', path: ['browser'], progress: 0, status: 'pending', createdAt: Date.now() },
        ],
    },
};



// ---- Mission 5: React Infinite Loop ----

export const MISSION_REACT_LOOP: Mission = {
    id: 'react-loop',
    title: 'React component infinite render loop.',
    description: 'The dashboard is freezing and the browser tab is consuming 100% CPU. React devtools shows thousands of renders.',
    briefing: 'A developer added a logging effect to the PaymentDashboard component. However, they are updating the component state inside the effect without a dependency array. This triggers a re-render, which triggers the effect, ad infinitum.',
    difficulty: 'intermediate',
    moduleId: 'react',
    category: 'UI/UX',
    hints: [
        'Watch the React node - does it ever stop blinking?',
        'State updates (setState) inside useEffect trigger a re-render.',
        'If useEffect has no dependency array, it runs on EVERY render.',
    ],
    whatWentWrong: 'The useEffect hook is missing its dependency array while performing a state update. This creates a circular dependency: render -> effect -> state change -> render.',
    howToFix: 'Add a dependency array to the useEffect hook. If it should only run once, use []. If it depends on specific values, list them in the array.',
    successExplanation: 'React\'s lifecycle hooks are powerful but dangerous. Always specify dependencies. An empty array [] means "run once on mount". No array means "run on every render".',
    solutionOptions: [
        { label: 'Add an empty dependency array [] to useEffect', isCorrect: true, feedback: 'Correct. This ensures the effect runs only once, breaking the rendering loop.' },
        { label: 'Use useMemo instead of useEffect', isCorrect: false, feedback: 'useMemo is for memoizing values, not for side effects like logging or state updates.' },
        { label: 'Move the state update outside of useEffect', isCorrect: false, feedback: 'Moving it to the top level of the component would still cause a loop on every render.' },
    ],
    brokenConfig: {
        moduleId: 'react',
        nodes: [
            { id: 'vdom', name: 'Virtual DOM', icon: '🌳', category: 'service', runtime: 'event-loop', position: { x: 80, y: 180 }, state: 'idle', metadata: {}, explanation: 'React is constantly re-calculating the tree.' },
            { id: 'effect', name: 'useEffect (No Deps)', icon: '♻️', category: 'middleware', runtime: 'event-loop', position: { x: 320, y: 180 }, state: 'idle', metadata: {}, explanation: '⚠️ LOOP - This effect runs on every render and triggers a state update.' },
            { id: 'state', name: 'Component State', icon: '💾', category: 'service', runtime: 'event-loop', position: { x: 560, y: 180 }, state: 'idle', metadata: {}, explanation: '⚠️ State is being set thousands of times per second.' },
        ],
        connections: [
            { id: 'c1', source: 'vdom', target: 'effect', protocol: 'http', latency: 2, reason: 'Render cycle triggers effects.' },
            { id: 'c2', source: 'effect', target: 'state', protocol: 'http', latency: 2, reason: '⚠️ Effect calls setState(), scheduling a new render immediately.' },
            { id: 'c3', source: 'state', target: 'vdom', protocol: 'http', latency: 2, reason: '⚠️ State change forces a full re-render of the component.' },
        ],
        initialPackets: [
            { id: 'pkt_loop', protocol: 'http', payload: 'Render Cycle', label: 'Infinite Loop', currentNodeId: 'vdom', sourceNodeId: 'vdom', targetNodeId: 'effect', path: ['vdom'], progress: 0, status: 'pending', createdAt: Date.now() },
        ],
    },
    fixedConfig: {
        moduleId: 'react',
        nodes: [
            { id: 'vdom', name: 'Virtual DOM', icon: '🌳', category: 'service', runtime: 'event-loop', position: { x: 80, y: 180 }, state: 'idle', metadata: {}, explanation: 'React renders once and stops.' },
            { id: 'effect', name: 'useEffect ([])', icon: '✅', category: 'middleware', runtime: 'event-loop', position: { x: 320, y: 180 }, state: 'idle', metadata: {}, explanation: '✅ Dependency array [] ensures this only runs once.' },
            { id: 'state', name: 'Component State', icon: '💾', category: 'service', runtime: 'event-loop', position: { x: 560, y: 180 }, state: 'idle', metadata: {}, explanation: 'State is stable now.' },
        ],
        connections: [
            { id: 'c1', source: 'vdom', target: 'effect', protocol: 'http', latency: 2, reason: 'Mount render triggers effect.' },
            { id: 'c2', source: 'effect', target: 'state', protocol: 'http', latency: 2, reason: 'One-time initial state setup.' },
            { id: 'c3', source: 'state', target: 'vdom', protocol: 'http', latency: 2, reason: 'Final render. Simulation settles.' },
        ],
        initialPackets: [
            { id: 'pkt_once', protocol: 'http', payload: 'Render Cycle', label: 'Stable Render', currentNodeId: 'vdom', sourceNodeId: 'vdom', targetNodeId: 'effect', path: ['vdom'], progress: 0, status: 'pending', createdAt: Date.now() },
        ],
    },
};

// ---- Export All Missions ----

export const ALL_MISSIONS: Mission[] = [
    MISSION_SLOW_API,
    MISSION_LOGIN_FAILING,
    MISSION_MONGO_FULL_SCAN,
    MISSION_EVENT_LOOP_BLOCKED,
    MISSION_REACT_LOOP,
];
