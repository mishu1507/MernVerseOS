export const TOPOLOGY_FRONTEND = {
    nodes: [
        { id: 'client', name: 'Browser UI', icon: '💻', category: 'client' as const, runtime: 'reactive' as const, position: { x: 100, y: 300 }, state: 'idle' as const, metadata: {}, explanation: 'User Interface' },
        { id: 'react', name: 'React Component', icon: '⚛️', category: 'service' as const, runtime: 'reactive' as const, position: { x: 350, y: 300 }, state: 'idle' as const, metadata: {}, explanation: 'UI Logic' },
        { id: 'vdom', name: 'Virtual DOM', icon: '🪞', category: 'database' as const, runtime: 'blocking' as const, position: { x: 600, y: 300 }, state: 'idle' as const, metadata: {}, explanation: 'JS Object Tree' },
        { id: 'dom', name: 'Real DOM', icon: '🌲', category: 'database' as const, runtime: 'blocking' as const, position: { x: 850, y: 300 }, state: 'idle' as const, metadata: {}, explanation: 'Browser Render' }
    ],
    connections: [
        { id: 'c-r', source: 'client', target: 'react', protocol: 'dom-event' as const, latency: 10, reason: 'Interaction' },
        { id: 'r-v', source: 'react', target: 'vdom', protocol: 'internal' as const, latency: 5, reason: 'Reconciliation' },
        { id: 'v-d', source: 'vdom', target: 'dom', protocol: 'internal' as const, latency: 20, reason: 'DOM Patch' }
    ]
};

export const TOPOLOGY_SERVER = {
    nodes: [
        { id: 'ingress', name: 'Client Request', icon: '🌐', category: 'client' as const, runtime: 'reactive' as const, position: { x: 100, y: 300 }, state: 'idle' as const, metadata: {}, explanation: 'Network Request' },
        { id: 'middleware', name: 'Express Middleware', icon: '🚥', category: 'service' as const, runtime: 'event-loop' as const, position: { x: 350, y: 300 }, state: 'idle' as const, metadata: {}, explanation: 'Request Interceptor' },
        { id: 'controller', name: 'Route Controller', icon: '🎛️', category: 'service' as const, runtime: 'event-loop' as const, position: { x: 600, y: 300 }, state: 'idle' as const, metadata: {}, explanation: 'Business Logic' },
        { id: 'db-driver', name: 'DB Driver', icon: '🔌', category: 'database' as const, runtime: 'blocking' as const, position: { x: 850, y: 300 }, state: 'idle' as const, metadata: {}, explanation: 'Database Operations' }
    ],
    connections: [
        { id: 'i-m', source: 'ingress', target: 'middleware', protocol: 'http' as const, latency: 15, reason: 'Inbound HTTP' },
        { id: 'm-c', source: 'middleware', target: 'controller', protocol: 'internal' as const, latency: 5, reason: 'Next()' },
        { id: 'c-d', source: 'controller', target: 'db-driver', protocol: 'db-query' as const, latency: 10, reason: 'Query API' }
    ]
};

export const TOPOLOGY_DATABASE = {
    nodes: [
        { id: 'server', name: 'API Server', icon: '⚙️', category: 'service' as const, runtime: 'event-loop' as const, position: { x: 100, y: 300 }, state: 'idle' as const, metadata: {}, explanation: 'Application Server' },
        { id: 'mongoose', name: 'Mongoose ORM', icon: '📜', category: 'service' as const, runtime: 'blocking' as const, position: { x: 350, y: 300 }, state: 'idle' as const, metadata: {}, explanation: 'Object Modeling' },
        { id: 'mongo-engine', name: 'Mongo Engine', icon: '🧠', category: 'database' as const, runtime: 'blocking' as const, position: { x: 600, y: 300 }, state: 'idle' as const, metadata: {}, explanation: 'Query Execution' },
        { id: 'storage', name: 'BSON Storage', icon: '🍃', category: 'database' as const, runtime: 'blocking' as const, position: { x: 850, y: 300 }, state: 'idle' as const, metadata: {}, explanation: 'Disk Persistence' }
    ],
    connections: [
        { id: 's-m', source: 'server', target: 'mongoose', protocol: 'internal' as const, latency: 5, reason: 'Schema Validation' },
        { id: 'm-e', source: 'mongoose', target: 'mongo-engine', protocol: 'db-query' as const, latency: 15, reason: 'BSON Query' },
        { id: 'e-st', source: 'mongo-engine', target: 'storage', protocol: 'internal' as const, latency: 25, reason: 'Disk I/O' }
    ]
};

export const TOPOLOGY_RUNTIME = {
    nodes: [
        { id: 'v8', name: 'Call Stack (V8)', icon: '📚', category: 'service' as const, runtime: 'blocking' as const, position: { x: 100, y: 300 }, state: 'idle' as const, metadata: {}, explanation: 'Synchronous Execution' },
        { id: 'libuv', name: 'Node APIs (Libuv)', icon: '🛠️', category: 'service' as const, runtime: 'reactive' as const, position: { x: 350, y: 300 }, state: 'idle' as const, metadata: {}, explanation: 'Async C++ Workers' },
        { id: 'queue', name: 'Task Queue', icon: '📥', category: 'database' as const, runtime: 'blocking' as const, position: { x: 600, y: 300 }, state: 'idle' as const, metadata: {}, explanation: 'Pending Callbacks' },
        { id: 'event-loop', name: 'Event Loop', icon: '🔄', category: 'service' as const, runtime: 'event-loop' as const, position: { x: 850, y: 300 }, state: 'idle' as const, metadata: {}, explanation: 'Concurrency Coordinator' }
    ],
    connections: [
        { id: 'v8-l', source: 'v8', target: 'libuv', protocol: 'internal' as const, latency: 5, reason: 'Async Call' },
        { id: 'l-q', source: 'libuv', target: 'queue', protocol: 'internal' as const, latency: 15, reason: 'Enqueuing' },
        { id: 'q-e', source: 'queue', target: 'event-loop', protocol: 'internal' as const, latency: 5, reason: 'Tick' }
    ]
};

export const TOPOLOGY_ARCHITECTURE = {
    nodes: [
        { id: 'client', name: 'Global Traffic', icon: '🌍', category: 'client' as const, runtime: 'reactive' as const, position: { x: 100, y: 300 }, state: 'idle' as const, metadata: {}, explanation: 'External Traffic' },
        { id: 'lb', name: 'Load Balancer', icon: '⚖️', category: 'service' as const, runtime: 'event-loop' as const, position: { x: 350, y: 300 }, state: 'idle' as const, metadata: {}, explanation: 'Traffic Router' },
        { id: 'microservice', name: 'Auth/API Services', icon: '🧩', category: 'service' as const, runtime: 'event-loop' as const, position: { x: 600, y: 300 }, state: 'idle' as const, metadata: {}, explanation: 'Distributed Logic' },
        { id: 'redis-mongo', name: 'Cache & DB', icon: '🗄️', category: 'database' as const, runtime: 'blocking' as const, position: { x: 850, y: 300 }, state: 'idle' as const, metadata: {}, explanation: 'Data Persistence' }
    ],
    connections: [
        { id: 'c-l', source: 'client', target: 'lb', protocol: 'http' as const, latency: 20, reason: 'Inbound Req' },
        { id: 'l-m', source: 'lb', target: 'microservice', protocol: 'internal' as const, latency: 10, reason: 'Routing' },
        { id: 'm-r', source: 'microservice', target: 'redis-mongo', protocol: 'db-query' as const, latency: 15, reason: 'Data Fetch' }
    ]
};

export const TOPOLOGY_MVC = {
    nodes: [
        { id: 'view', name: 'View (React)', icon: '📱', category: 'client' as const, runtime: 'reactive' as const, position: { x: 100, y: 300 }, state: 'idle' as const, metadata: {}, explanation: 'The User Interface presented to the client' },
        { id: 'controller', name: 'Controller (Express)', icon: '🎛️', category: 'service' as const, runtime: 'event-loop' as const, position: { x: 475, y: 150 }, state: 'idle' as const, metadata: {}, explanation: 'The Brain handling routing and business logic' },
        { id: 'model', name: 'Model (Mongoose)', icon: '🧩', category: 'database' as const, runtime: 'blocking' as const, position: { x: 850, y: 300 }, state: 'idle' as const, metadata: {}, explanation: 'The Data Layer interacting with MongoDB' }
    ],
    connections: [
        { id: 'v-c', source: 'view', target: 'controller', protocol: 'http' as const, latency: 15, reason: 'User Action (e.g., Click)' },
        { id: 'c-m', source: 'controller', target: 'model', protocol: 'internal' as const, latency: 5, reason: 'Data Request' },
        { id: 'm-c', source: 'model', target: 'controller', protocol: 'internal' as const, latency: 10, reason: 'Data Response' },
        { id: 'c-v', source: 'controller', target: 'view', protocol: 'http' as const, latency: 15, reason: 'Render update' }
    ]
};

export const TOPOLOGY_REACT_STATE = {
    nodes: [
        { id: 'event', name: 'User Event', icon: '👆', category: 'client' as const, runtime: 'reactive' as const, position: { x: 100, y: 300 }, state: 'idle' as const, metadata: {}, explanation: 'User clicks or types' },
        { id: 'set-state', name: 'setState()', icon: '⚡', category: 'service' as const, runtime: 'reactive' as const, position: { x: 350, y: 300 }, state: 'idle' as const, metadata: {}, explanation: 'Triggers state update queue' },
        { id: 're-render', name: 'Component Render', icon: '🔄', category: 'service' as const, runtime: 'blocking' as const, position: { x: 600, y: 300 }, state: 'idle' as const, metadata: {}, explanation: 'Function runs again with new state' },
        { id: 'vdom', name: 'Virtual DOM Update', icon: '🪞', category: 'database' as const, runtime: 'blocking' as const, position: { x: 850, y: 300 }, state: 'idle' as const, metadata: {}, explanation: 'Generates new React Tree' }
    ],
    connections: [
        { id: 'c1', source: 'event', target: 'set-state', protocol: 'dom-event' as const, latency: 5, reason: 'Handler called' },
        { id: 'c2', source: 'set-state', target: 're-render', protocol: 'internal' as const, latency: 5, reason: 'State changed' },
        { id: 'c3', source: 're-render', target: 'vdom', protocol: 'internal' as const, latency: 10, reason: 'Returning JSX' }
    ]
};

export const TOPOLOGY_AUTH_FLOW = {
    nodes: [
        { id: 'client', name: 'Browser / Client', icon: '💻', category: 'client' as const, runtime: 'reactive' as const, position: { x: 100, y: 300 }, state: 'idle' as const, metadata: {}, explanation: 'Sends credentials' },
        { id: 'auth-middleware', name: 'Auth Middleware', icon: '🛡️', category: 'middleware' as const, runtime: 'event-loop' as const, position: { x: 350, y: 300 }, state: 'idle' as const, metadata: {}, explanation: 'Verifies Headers/Cookies' },
        { id: 'jwt-service', name: 'JWT Service', icon: '🎫', category: 'service' as const, runtime: 'blocking' as const, position: { x: 600, y: 300 }, state: 'idle' as const, metadata: {}, explanation: 'Validates cryptographic signature' },
        { id: 'db', name: 'User Database', icon: '🗄️', category: 'database' as const, runtime: 'blocking' as const, position: { x: 850, y: 300 }, state: 'idle' as const, metadata: {}, explanation: 'Loads user profile' }
    ],
    connections: [
        { id: 'c1', source: 'client', target: 'auth-middleware', protocol: 'http' as const, latency: 15, reason: 'Request protected route' },
        { id: 'c2', source: 'auth-middleware', target: 'jwt-service', protocol: 'internal' as const, latency: 5, reason: 'Verify token' },
        { id: 'c3', source: 'jwt-service', target: 'db', protocol: 'db-query' as const, latency: 20, reason: 'Fetch related user' }
    ]
};

export const TOPOLOGY_INDEXING = {
    nodes: [
        { id: 'query', name: 'Mongoose Query', icon: '🔍', category: 'service' as const, runtime: 'event-loop' as const, position: { x: 100, y: 300 }, state: 'idle' as const, metadata: {}, explanation: 'App requests data' },
        { id: 'planner', name: 'Query Planner', icon: '🧠', category: 'service' as const, runtime: 'blocking' as const, position: { x: 350, y: 300 }, state: 'idle' as const, metadata: {}, explanation: 'Determines IXSCAN vs COLLSCAN' },
        { id: 'b-tree', name: 'B-Tree Index (RAM)', icon: '🌳', category: 'database' as const, runtime: 'reactive' as const, position: { x: 600, y: 300 }, state: 'idle' as const, metadata: {}, explanation: 'Lightning fast lookup in memory' },
        { id: 'disk', name: 'Storage (Disk)', icon: '💿', category: 'database' as const, runtime: 'blocking' as const, position: { x: 850, y: 300 }, state: 'idle' as const, metadata: {}, explanation: 'Fetches exact document pointer' }
    ],
    connections: [
        { id: 'c1', source: 'query', target: 'planner', protocol: 'db-query' as const, latency: 5, reason: 'Analyze query' },
        { id: 'c2', source: 'planner', target: 'b-tree', protocol: 'internal' as const, latency: 2, reason: 'Index hit! (IXSCAN)' },
        { id: 'c3', source: 'b-tree', target: 'disk', protocol: 'internal' as const, latency: 10, reason: 'Fetch doc reference' }
    ]
};

export const TOPOLOGY_MICROSERVICES = {
    nodes: [
        { id: 'gateway', name: 'API Gateway', icon: '🚦', category: 'gateway' as const, runtime: 'event-loop' as const, position: { x: 100, y: 300 }, state: 'idle' as const, metadata: {}, explanation: 'Single entry point' },
        { id: 'service-a', name: 'Service A (User)', icon: '🧩', category: 'service' as const, runtime: 'event-loop' as const, position: { x: 350, y: 150 }, state: 'idle' as const, metadata: {}, explanation: 'Handles User logic' },
        { id: 'service-b', name: 'Service B (Order)', icon: '🧩', category: 'service' as const, runtime: 'event-loop' as const, position: { x: 350, y: 450 }, state: 'idle' as const, metadata: {}, explanation: 'Handles Ordering logic' },
        { id: 'queue', name: 'Message Queue', icon: '📬', category: 'queue' as const, runtime: 'reactive' as const, position: { x: 650, y: 300 }, state: 'idle' as const, metadata: {}, explanation: 'RabbitMQ / Kafka Async Bus' }
    ],
    connections: [
        { id: 'c1', source: 'gateway', target: 'service-b', protocol: 'http' as const, latency: 10, reason: 'Create Order Request' },
        { id: 'c2', source: 'service-b', target: 'queue', protocol: 'queue' as const, latency: 5, reason: 'Publish "Order Created"' },
        { id: 'c3', source: 'queue', target: 'service-a', protocol: 'queue' as const, latency: 15, reason: 'Consume "Order Created"' },
        { id: 'c4', source: 'service-a', target: 'gateway', protocol: 'http' as const, latency: 10, reason: 'Return confirmation' }
    ]
};

export const TOPOLOGY_AGGREGATION = {
    nodes: [
        { id: 'pipeline', name: 'App Aggregate[]', icon: '📐', category: 'service' as const, runtime: 'event-loop' as const, position: { x: 100, y: 300 }, state: 'idle' as const, metadata: {}, explanation: 'Application sends array of stages' },
        { id: 'match', name: '$match Stage', icon: '🔍', category: 'database' as const, runtime: 'blocking' as const, position: { x: 350, y: 300 }, state: 'idle' as const, metadata: {}, explanation: 'Filters documents early' },
        { id: 'group', name: '$group Stage', icon: '🧱', category: 'database' as const, runtime: 'blocking' as const, position: { x: 600, y: 300 }, state: 'idle' as const, metadata: {}, explanation: 'Accumulates data in RAM' },
        { id: 'sort', name: '$sort Stage', icon: '📊', category: 'database' as const, runtime: 'blocking' as const, position: { x: 850, y: 300 }, state: 'idle' as const, metadata: {}, explanation: 'Final visual ordering' }
    ],
    connections: [
        { id: 'c1', source: 'pipeline', target: 'match', protocol: 'db-query' as const, latency: 15, reason: 'Execute Pipeline' },
        { id: 'c2', source: 'match', target: 'group', protocol: 'internal' as const, latency: 10, reason: 'Pass filtered cursor' },
        { id: 'c3', source: 'group', target: 'sort', protocol: 'internal' as const, latency: 15, reason: 'Pass grouped memory' }
    ]
};

export const TOPOLOGY_WORKER_THREADS = {
    nodes: [
        { id: 'client', name: 'Client', icon: '💻', category: 'client' as const, runtime: 'reactive' as const, position: { x: 100, y: 300 }, state: 'idle' as const, metadata: {}, explanation: 'Sends heavy request' },
        { id: 'main-thread', name: 'Main Event Loop', icon: '🔄', category: 'service' as const, runtime: 'event-loop' as const, position: { x: 350, y: 300 }, state: 'idle' as const, metadata: {}, explanation: 'Remains unblocked' },
        { id: 'worker', name: 'Worker Thread (CPU)', icon: '⚙️', category: 'service' as const, runtime: 'threaded' as const, position: { x: 600, y: 150 }, state: 'idle' as const, metadata: {}, explanation: 'Executes heavy encryption/math' }
    ],
    connections: [
        { id: 'c1', source: 'client', target: 'main-thread', protocol: 'http' as const, latency: 10, reason: 'Request processing' },
        { id: 'c2', source: 'main-thread', target: 'worker', protocol: 'internal' as const, latency: 5, reason: 'Delegate heavy task' },
        { id: 'c3', source: 'worker', target: 'main-thread', protocol: 'internal' as const, latency: 30, reason: 'Return result safely' },
        { id: 'c4', source: 'main-thread', target: 'client', protocol: 'http' as const, latency: 10, reason: 'Respond to client' }
    ]
};

export const TOPOLOGY_OAUTH = {
    nodes: [
        { id: 'client', name: 'User Browser', icon: '👤', category: 'client' as const, runtime: 'reactive' as const, position: { x: 100, y: 300 }, state: 'idle' as const, metadata: {}, explanation: 'Clicks "Login with Google"' },
        { id: 'our-api', name: 'MERN API', icon: '🌐', category: 'service' as const, runtime: 'event-loop' as const, position: { x: 400, y: 300 }, state: 'idle' as const, metadata: {}, explanation: 'Originates OAuth Request' },
        { id: 'google', name: 'Google Server', icon: 'G', category: 'gateway' as const, runtime: 'reactive' as const, position: { x: 400, y: 100 }, state: 'idle' as const, metadata: {}, explanation: 'Authenticates user externally' },
        { id: 'db', name: 'Our Database', icon: '🗄️', category: 'database' as const, runtime: 'blocking' as const, position: { x: 700, y: 300 }, state: 'idle' as const, metadata: {}, explanation: 'Saves associated user profile' }
    ],
    connections: [
        { id: 'c1', source: 'client', target: 'our-api', protocol: 'http' as const, latency: 10, reason: 'Init OAuth' },
        { id: 'c2', source: 'our-api', target: 'google', protocol: 'http' as const, latency: 20, reason: 'Redirect to Provider' },
        { id: 'c3', source: 'google', target: 'our-api', protocol: 'http' as const, latency: 20, reason: 'Callback with Code/Profile' },
        { id: 'c4', source: 'our-api', target: 'db', protocol: 'db-query' as const, latency: 10, reason: 'Find or Create User' },
        { id: 'c5', source: 'db', target: 'our-api', protocol: 'internal' as const, latency: 5, reason: 'Return local profile' },
        { id: 'c6', source: 'our-api', target: 'client', protocol: 'http' as const, latency: 10, reason: 'Issue local JWT' }
    ]
};

export const TOPOLOGY_RBAC = {
    nodes: [
        { id: 'user', name: 'Standard User', icon: '👤', category: 'client' as const, runtime: 'reactive' as const, position: { x: 100, y: 150 }, state: 'idle' as const, metadata: {}, explanation: 'Tries to delete a post' },
        { id: 'admin', name: 'Admin User', icon: '👑', category: 'client' as const, runtime: 'reactive' as const, position: { x: 100, y: 450 }, state: 'idle' as const, metadata: {}, explanation: 'Tries to delete a post' },
        { id: 'rbac-mid', name: 'RBAC Middleware', icon: '🛡️', category: 'middleware' as const, runtime: 'event-loop' as const, position: { x: 400, y: 300 }, state: 'idle' as const, metadata: {}, explanation: 'Checks role permissions' },
        { id: 'controller', name: 'Delete Controller', icon: '🗑️', category: 'service' as const, runtime: 'event-loop' as const, position: { x: 700, y: 300 }, state: 'idle' as const, metadata: {}, explanation: 'Executes deletion' }
    ],
    connections: [
        { id: 'c1', source: 'user', target: 'rbac-mid', protocol: 'http' as const, latency: 10, reason: 'DELETE /posts/1' },
        { id: 'c2', source: 'rbac-mid', target: 'user', protocol: 'http' as const, latency: 5, reason: '403 Forbidden (Not Admin)' },
        { id: 'c3', source: 'admin', target: 'rbac-mid', protocol: 'http' as const, latency: 10, reason: 'DELETE /posts/1' },
        { id: 'c4', source: 'rbac-mid', target: 'controller', protocol: 'internal' as const, latency: 5, reason: 'Next() -> Authorized' }
    ]
};

export const TOPOLOGY_STREAMS = {
    nodes: [
        { id: 'disk', name: 'Large File (Disk)', icon: '💿', category: 'database' as const, runtime: 'blocking' as const, position: { x: 100, y: 300 }, state: 'idle' as const, metadata: {}, explanation: '1GB Video File' },
        { id: 'read-stream', name: 'Read Stream', icon: '🌊', category: 'middleware' as const, runtime: 'event-loop' as const, position: { x: 350, y: 300 }, state: 'idle' as const, metadata: {}, explanation: 'Fetches chunks in 64kb sizes' },
        { id: 'client', name: 'Video Player', icon: '📺', category: 'client' as const, runtime: 'reactive' as const, position: { x: 650, y: 300 }, state: 'idle' as const, metadata: {}, explanation: 'Plays while downloading' }
    ],
    connections: [
        { id: 'c1', source: 'disk', target: 'read-stream', protocol: 'internal' as const, latency: 10, reason: 'Extracting Chunk 1' },
        { id: 'c2', source: 'read-stream', target: 'client', protocol: 'http' as const, latency: 5, reason: 'Streaming Chunk 1' },
        { id: 'c3', source: 'disk', target: 'read-stream', protocol: 'internal' as const, latency: 10, reason: 'Extracting Chunk 2' },
        { id: 'c4', source: 'read-stream', target: 'client', protocol: 'http' as const, latency: 5, reason: 'Streaming Chunk 2' }
    ]
};
