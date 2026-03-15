// ========================================
// GraphQL Pipeline Module - Level 2-3 Engineering Depth
// Query parsing, resolver tree, N+1, DataLoader, complexity analysis
// ========================================

import type { ModuleConfig, SystemNode, Connection } from "../../engine/types/system.types";

const nodes: SystemNode[] = [
    {
        id: "client",
        name: "Client",
        icon: "🌐",
        category: "client",
        runtime: "event-loop",
        position: { x: 60, y: 200 },
        state: "idle",
        metadata: { method: "POST /graphql", contentType: "application/json" },
        explanation: "What: The client sends a GraphQL query specifying EXACTLY which fields it needs. One endpoint, one request, custom response shape. No over-fetching (extra fields) or under-fetching (needing multiple round-trips). Why: REST requires multiple endpoints and returns fixed response shapes. GraphQL flips this - the client defines the response structure. Mobile clients can request less data (save bandwidth), dashboards can request more. Breaks when: Clients craft deeply nested or expensive queries (query depth attack). Without complexity limits, a malicious query can bring down your server.",
    },
    {
        id: "query-parser",
        name: "Query Parser",
        icon: "📝",
        category: "service",
        runtime: "event-loop",
        position: { x: 200, y: 80 },
        state: "idle",
        metadata: { steps: "lexing → parsing → AST → validation", language: "GraphQL SDL" },
        explanation: "What: The incoming query string is parsed into an Abstract Syntax Tree (AST). The parser tokenizes the query (lexing), builds a tree structure (parsing), then validates the AST against the schema - checking that all requested fields, types, and arguments exist. Why: Validation happens BEFORE any resolver executes. If a client requests a field that doesn't exist, they get a clear error immediately - no wasted database queries. The AST enables powerful middleware: logging, caching, authorization per-field. Breaks when: The schema is too permissive (no input validation) or introspection is enabled in production - attackers can explore your entire API structure. Disable introspection in production.",
    },
    {
        id: "complexity-check",
        name: "Complexity Analysis",
        icon: "📊",
        category: "middleware",
        runtime: "event-loop",
        position: { x: 200, y: 320 },
        state: "idle",
        metadata: { maxComplexity: 1000, depthLimit: 10, strategy: "field cost + multiplier" },
        explanation: "What: Before execution, analyze the query's cost. Each field has a complexity score (e.g., scalar = 1, relation = 10). Nested lists multiply: users(100) → posts(50) = 100 × 50 = 5000 complexity. If total exceeds the limit, reject the query. Why: Without complexity limits, a single deeply nested query can trigger millions of resolver calls: { users { friends { friends { friends { ... } } } } }. This is a denial of service attack specific to GraphQL. Breaks when: Complexity scoring doesn't account for pagination arguments - users(first: 1000) is 1000x more expensive than users(first: 10) but might score the same without multiplier-based analysis.",
    },
    {
        id: "resolver-tree",
        name: "Resolver Tree",
        icon: "🌳",
        category: "service",
        runtime: "event-loop",
        position: { x: 380, y: 80 },
        state: "idle",
        metadata: { execution: "top-down, breadth-first", signature: "(parent, args, context, info)" },
        explanation: "What: Resolvers are functions that fetch data for each field. They execute top-down: Query.user → User.name, User.email, User.posts → Post.title. Each resolver receives 4 arguments: parent (resolved parent value), args (field arguments), context (shared request state like auth), info (AST metadata). Why: This decomposition means each resolver is independent and composable. User.name doesn't know about User.posts. This separation of concerns makes the schema maintainable. Breaks when: Resolvers contain business logic - they should only orchestrate data fetching. Also: deeply nested resolvers create the N+1 problem.",
    },
    {
        id: "context",
        name: "Context Object",
        icon: "🔑",
        category: "middleware",
        runtime: "event-loop",
        position: { x: 380, y: 200 },
        state: "idle",
        metadata: { contains: "auth user, DataLoader instances, DB connection", lifecycle: "per-request" },
        explanation: "What: The context object is shared across ALL resolvers within a single request. It's created fresh for each request and contains: the authenticated user (from JWT), DataLoader instances (for batching), database connections, and any per-request state. Why: Context is how authentication flows through resolvers: context.user is available in every resolver without passing it manually. DataLoader instances MUST be per-request (not global) because they cache within a request lifecycle. Breaks when: DataLoader is created globally - it caches across requests, serving User A's data to User B. DataLoader cache must be request-scoped.",
    },
    {
        id: "dataloader",
        name: "DataLoader",
        icon: "📦",
        category: "middleware",
        runtime: "event-loop",
        position: { x: 380, y: 320 },
        state: "idle",
        metadata: { technique: "batching + deduplication", timing: "collects keys during one event loop tick, batches on nextTick" },
        explanation: "What: DataLoader solves the N+1 problem. When 10 User resolvers each call loadUser(id), DataLoader collects ALL requested IDs during one event loop tick, then makes a SINGLE batched query: findByIds([1, 2, 3, ...]). It also deduplicates: requesting id=5 twice makes only one DB call. Why: Without DataLoader, a query for 10 users with posts generates: 1 (users) + 10 (posts per user) = 11 queries. With DataLoader: 1 (users) + 1 (batched posts) = 2 queries. This is the difference between O(n) and O(1) database calls. Breaks when: The batch function doesn't return results in the same order as the input keys - DataLoader maps results by position, not by ID. Also: DataLoader only batches within a single event loop tick (microtask boundary).",
    },
    {
        id: "database",
        name: "Database",
        icon: "🍃",
        category: "database",
        runtime: "blocking",
        position: { x: 560, y: 320 },
        state: "idle",
        metadata: { query: "findByIds([1,2,3]) instead of findById(1), findById(2)..." },
        explanation: "What: The database receives batched queries from DataLoader. Instead of n individual SELECT queries, it receives one WHERE id IN (...) query. The result set is returned to DataLoader, which distributes individual results to the requesting resolvers. Why: Database round-trips are the biggest performance bottleneck in GraphQL. Each round-trip adds ~5-50ms of network latency. Batching reduces n round-trips to 1, turning a 500ms query into a 50ms query. Breaks when: The IN clause has too many IDs (some DBs have limits: MySQL 65535, PostgreSQL no hard limit but performance degrades). For very large batches, consider chunking.",
    },
    {
        id: "field-auth",
        name: "Field Authorization",
        icon: "🛡",
        category: "middleware",
        runtime: "event-loop",
        position: { x: 560, y: 80 },
        state: "idle",
        metadata: { level: "per-field, not per-endpoint", directives: "@auth, @hasRole" },
        explanation: "What: Unlike REST (authorization per endpoint), GraphQL needs authorization PER FIELD. User.email might be public, but User.ssn requires admin role. Schema directives (@auth, @hasRole('ADMIN')) or resolver middleware check permissions for each field. Why: One GraphQL query can access multiple resources with different authorization levels. Endpoint-level auth (REST-style) can't handle this - you need field-level granularity. Breaks when: Authorization is only in the gateway (not resolvers) - a nested query might bypass auth checks. Always validate authorization at the resolver level, as close to the data as possible.",
    },
    {
        id: "response-builder",
        name: "Response Shaper",
        icon: "📐",
        category: "service",
        runtime: "event-loop",
        position: { x: 560, y: 200 },
        state: "idle",
        metadata: { output: "mirrors query structure exactly", errors: "partial responses + error array" },
        explanation: "What: GraphQL assembles the response to match the exact shape of the query. Client asked for { user { name, posts { title } } } - they get exactly that. Errors are returned alongside data (partial success is valid). Why: The response shape IS the query shape - no documentation needed to know what you'll get back. Also: GraphQL returns errors in a separate 'errors' array, allowing partial responses. If User.posts fails but User.name succeeds, the client gets the name with an error for posts. Breaks when: Resolvers throw unhandled exceptions - they become 500 errors instead of graceful partial responses. Always catch errors in resolvers and format them properly.",
    },
];

const connections: Connection[] = [
    {
        id: "c1", source: "client", target: "query-parser", protocol: "http", latency: 5,
        reason: "Client sends POST /graphql with query in the request body. Unlike REST (multiple endpoints: /users, /posts, /comments), GraphQL has ONE endpoint. The query defines what data to fetch - the endpoint doesn't change.",
    },
    {
        id: "c2", source: "query-parser", target: "complexity-check", protocol: "http", latency: 5,
        reason: "Query parsed and validated against schema (all fields exist, types match, required args present). The AST is now analyzed for complexity - deeply nested queries or unbounded lists are rejected before execution.",
    },
    {
        id: "c3", source: "complexity-check", target: "context", protocol: "http", latency: 5,
        reason: "Complexity within limits. A fresh context object is created for this request: { user: decodedJWT, dataloaders: { user: new DataLoader(...), post: new DataLoader(...) }, db: connection }. This context is shared across all resolvers.",
    },
    {
        id: "c4", source: "context", target: "resolver-tree", protocol: "http", latency: 5,
        reason: "Resolver execution begins top-down. Query.user(id: 1) fires first, returns the user object. Then child resolvers fire: User.name (trivial - reads from parent), User.posts (needs DB query - delegates to DataLoader).",
    },
    {
        id: "c5", source: "resolver-tree", target: "dataloader", protocol: "http", latency: 5,
        reason: "Multiple resolvers call dataloader.load(id) during this event loop tick. DataLoader collects ALL requested IDs. On the next microtask (process.nextTick), it fires the batch function with all collected IDs at once.",
    },
    {
        id: "c6", source: "dataloader", target: "database", protocol: "db-query", latency: 30,
        reason: "DataLoader sends a single batched query: findByIds([1, 2, 3, 7, 12]). The database executes one WHERE id IN (1,2,3,7,12) instead of 5 separate queries. DataLoader maps results back to individual resolvers by position.",
    },
    {
        id: "c7", source: "database", target: "field-auth", protocol: "db-query", latency: 5,
        reason: "Data returned from DB. Before including each field in the response, field-level authorization checks run. User.email: public ✓. User.ssn: requires ADMIN role - check context.user.role. Unauthorized fields return null with an error.",
    },
    {
        id: "c8", source: "field-auth", target: "response-builder", protocol: "http", latency: 5,
        reason: "All fields resolved and authorized. The response builder assembles the JSON to match the query's shape exactly. Errors (if any) are collected in a separate 'errors' array alongside the 'data' object.",
    },
    {
        id: "c9", source: "response-builder", target: "client", protocol: "http", latency: 30,
        reason: "Response sent: { data: { user: { name: 'Alice', posts: [...] } }, errors: [] }. The client receives exactly the fields it requested - no over-fetching, no extra round-trips, strongly typed by the schema.",
    },
];

export function getGraphQLModuleConfig(): ModuleConfig {
    return {
        moduleId: "graphql",
        nodes,
        connections,
        initialPackets: [
            {
                id: "pkt_gql",
                protocol: "http",
                payload: "query { user(id: 1) { name, email, posts { title } } }",
                label: "GraphQL Query",
                currentNodeId: "client",
                sourceNodeId: "client",
                targetNodeId: "query-parser",
                path: ["client"],
                progress: 0,
                status: "pending",
                createdAt: Date.now(),
            },
        ],
        whyModePrompts: [
            {
                question: "A query requests user.posts for 10 users. Without DataLoader, how many database queries are made?",
                options: [
                    { label: "1 query - GraphQL automatically batches", isCorrect: false },
                    { label: "11 queries - 1 for users + 10 individual queries for each user's posts (N+1 problem)", isCorrect: true },
                    { label: "2 queries - one for users, one for all posts", isCorrect: false },
                    { label: "10 queries - one per user", isCorrect: false },
                ],
                correctIndex: 1,
                explanation: "Without DataLoader: 1 query fetches 10 users, then each User.posts resolver independently queries the DB = 11 total queries. With DataLoader: it collects all 10 user IDs during one event loop tick and batches them into a single findPostsByUserIds([1,2,...,10]) = 2 queries total. The N+1 problem is GraphQL's biggest performance pitfall.",
                connectionId: "c5",
                nodeId: "dataloader",
            },
            {
                question: "An attacker sends: { users { friends { friends { friends { friends { name } } } } } }. What happens?",
                options: [
                    { label: "Nothing - GraphQL handles deep nesting automatically", isCorrect: false },
                    { label: "The server crashes from a stack overflow", isCorrect: false },
                    { label: "Without complexity/depth limits, this query can trigger millions of resolver calls - a denial-of-service attack", isCorrect: true },
                    { label: "GraphQL rejects queries deeper than 3 levels by default", isCorrect: false },
                ],
                correctIndex: 2,
                explanation: "GraphQL has NO built-in depth or complexity limits. A deeply nested query on recursive types (users → friends → friends → ...) can trigger exponential resolver calls. Protection: set query depth limits (max 10), complexity scoring (each field has a cost), and rate limiting per client. These are NOT optional in production.",
                connectionId: "c2",
                nodeId: "complexity-check",
            },
            {
                question: "Why must DataLoader instances be created per-request (in context), never globally?",
                options: [
                    { label: "Global DataLoaders are slower", isCorrect: false },
                    { label: "DataLoader caches results - a global instance would serve User A's cached data to User B (data leak)", isCorrect: true },
                    { label: "GraphQL requires per-request instances", isCorrect: false },
                    { label: "Global instances can't batch queries", isCorrect: false },
                ],
                correctIndex: 1,
                explanation: "DataLoader caches loaded values by key within its lifecycle. A global DataLoader persists across requests - if Request 1 loads user:5 (admin data), Request 2 from a different user gets the cached admin data without authorization checks. Per-request DataLoaders ensure cache isolation between users.",
                connectionId: "c4",
                nodeId: "context",
            },
        ],
        learningStory: {
            title: "The Ultimate Lunch Box",
            content: "GraphQL is like a magical lunch order. In regular APIs (REST), the teacher gives everyone the same lunch tray-even if you don't like broccoli! But with GraphQL, you get a special list where you check off EXACTLY what you want. If you want two apples and no broccoli, that's exactly what you get! No waste, and no extra trips to the kitchen.",
            analogy: "A build-your-own-pizza place versus a pre-made frozen pizza. You choose every topping, and the chef makes it just for you!",
            lookFor: "Notice the 'Query Parser' node. It reads the specific fields requested in the packet and ensures the 'DataLoader' only grabs those specific pieces from the 'Database'."
        }
    };
}
