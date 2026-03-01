import { useStore } from '../../store/simulationStore';
import './TopNav.css';

export const MODULE_LABELS: Record<string, string> = {
    // 1. Basics
    'intro': 'Stack Architecture',
    'req-res': 'Request–Response',
    'spa-mpa': 'SPA vs MPA',
    'rest-fundamentals': 'REST Fundamentals',
    'json-flow': 'JSON Data Flow',
    'mvc': 'MVC Pattern',
    'env-vars': 'Environment Variables',
    'dev-prod': 'Dev vs Production',
    'struggles': 'MERN Reality',
    'common-mistakes': 'Common Mistakes',
    'why-async': 'Why async exists',
    'state-confusion': 'State confusion',

    // 2. Runtime
    'node-internals': 'Node Internals',
    'event-loop': 'Event Loop',
    'call-stack': 'Call Stack',
    'callback-queue': 'Callback Queue',
    'microtask-queue': 'Microtask Queue',
    'non-blocking': 'Non-Blocking I/O',
    'threads-vs-event': 'Threads vs Event Loop',
    'worker-threads': 'Worker Threads',
    'streams': 'Streams',
    'buffers': 'Buffers',
    'callbacks': 'Callbacks',
    'promises': 'Promises',
    'async-await': 'Async/Await',
    'error-prop': 'Error Propagation',

    // 3. Server
    'express-core': 'Express Core',
    'express': 'Express Routing',
    'middleware': 'Middleware Flow',
    'req-res-obj': 'Request & Response Obj',
    'route-matching': 'Route Matching',
    'error-middleware': 'Error Middleware',
    'controllers-routes': 'Controllers vs Routes',
    'auth': 'Authentication',
    'authorization': 'Authorization',
    'sessions-jwt': 'Sessions vs JWT',
    'cookies': 'Cookies',
    'oauth': 'OAuth Flow',
    'password-hashing': 'Password Hashing',
    'rbac': 'RBAC',
    'api-design': 'API Design',
    'rest-structure': 'REST API Structure',
    'api-versioning': 'API Versioning',
    'rate-limiting': 'Rate Limiting',
    'validation': 'Validation (Zod/Joi)',
    'logging': 'Logging',

    // 4. Database
    'mongodb-core': 'MongoDB Core',
    'mongodb': 'MongoDB',
    'docs-collections': 'Docs & Collections',
    'bson-json': 'BSON vs JSON',
    'crud': 'CRUD Operations',
    'schema-design': 'Schema Design',
    'embed-ref': 'Embedding vs Referencing',
    'indexing': 'MongoDB Indexing',
    'compound-indexes': 'Compound Indexes',
    'text-index': 'Text Index',
    'ttl-index': 'TTL Index',
    'index-perf': 'Index Performance',
    'aggregation': 'Aggregation Pipeline',
    'transactions': 'Transactions',
    'data-modeling': 'Data Modeling Patterns',
    'pagination': 'Pagination Strategies',
    'query-opt': 'Query Optimization',
    'replication': 'Replication',
    'sharding': 'Sharding',

    // 5. Frontend
    'react-core': 'React Core',
    'react': 'React Rendering',
    'vdom': 'Virtual DOM',
    'reconciliation': 'Reconciliation',
    'component-lifecycle': 'Component Lifecycle',
    'hooks': 'Hooks System',
    'state-props': 'State vs Props',
    'controlled-components': 'Controlled Components',
    'state-arch': 'State Architecture',
    'local-state': 'Local State',
    'context-api': 'Context API',
    'global-state': 'Global State Patterns',
    'server-ui-state': 'Server State vs UI State',
    'memoization': 'Memoization',
    'lazy-loading': 'Lazy Loading',
    'suspense': 'Suspense',
    'code-splitting': 'Code Splitting',

    // 6. Data Flow
    'full-journey': 'Full Request Journey',
    'client-api-db': 'Client → API → DB',
    'serialization': 'Serialization',
    'caching-layers': 'Caching Layers',
    'data-transformation': 'Data Transformation',
    'error-flow': 'Error Flow',

    // 7. Architecture
    'system-design': 'System Design',
    'microservices': 'Microservices',
    'monolith-micro': 'Monolith vs Microservices',
    'graphql': 'GraphQL',
    'websockets': 'WebSockets',
    'caching': 'Caching',
    'message-queues': 'Message Queues',
    'api-gateway': 'API Gateway',
    'load-balancing': 'Load Balancing',
};

interface TopNavProps {
    onToggleTheme: () => void;
    theme: string;
    onToggleSidebar: () => void;
    onSimulateRequest?: () => void;
    onToggleFullScreen?: () => void;
    isFullScreen?: boolean;
}

export default function TopNav({
    onToggleTheme,
    theme,
    onToggleSidebar,
    onSimulateRequest,
    onToggleFullScreen,
    isFullScreen
}: TopNavProps) {
    const { snapshot, play, pause, step, reset, setSpeed, toggleWhyMode } = useStore();
    const isRunning = snapshot.status === 'running';
    const isPaused = snapshot.status === 'paused';
    const moduleLabel = snapshot.activeModule ? MODULE_LABELS[snapshot.activeModule] || 'Unknown' : 'No Module';

    return (
        <header className="topnav">
            <div className="topnav__left">
                <button className="topnav__hamburger" onClick={onToggleSidebar} title="Toggle Sidebar">
                    ☰
                </button>
                <div className="topnav__logo">
                    <div className="topnav__logo-mark">M</div>
                    <div className="topnav__logo-title">
                        <span className="topnav__text-gradient">ernVerse</span>
                        <span className="topnav__os-badge">OS</span>
                    </div>
                </div>
            </div>

            {snapshot.activeModule && (
                <>
                    <div className="topnav__separator" />
                    <div className="topnav__module-badge">
                        {moduleLabel}
                    </div>
                </>
            )}

            <div className="topnav__controls">
                {onSimulateRequest && (
                    <>
                        <button
                            className="topnav__btn--simulate-global"
                            onClick={onSimulateRequest}
                            title="Simulate Full Request Journey"
                        >
                            ⚡ Simulate Request
                        </button>
                        <div className="topnav__separator" />
                    </>
                )}

                <div className="topnav__status">
                    <span className={`topnav__status-dot ${isRunning ? 'running' : isPaused ? 'paused' : ''}`} />
                    <span className="topnav__status-text">{isRunning ? 'RUNNING' : isPaused ? 'PAUSED' : 'IDLE'}</span>
                </div>

                <div className="topnav__separator" />

                <div className="topnav__actions">
                    <button
                        className={`topnav__btn topnav__btn--play ${isRunning ? 'active' : ''}`}
                        onClick={isRunning ? pause : play}
                        title={isRunning ? 'Pause' : 'Play'}
                    >
                        {isRunning ? '⏸' : '▶'}
                    </button>
                    <button className="topnav__btn" onClick={step} title="Step">⏭</button>
                    <button className="topnav__btn" onClick={reset} title="Reset">↻</button>
                </div>

                <div className="topnav__separator" />

                <button
                    className={`topnav__btn topnav__btn--why ${snapshot.whyModeEnabled ? 'active' : ''}`}
                    onClick={toggleWhyMode}
                    title="Toggle Explanation Mode (Enabled by Default)"
                >
                    WHY?
                </button>

                <div className="topnav__separator" />

                <div className="topnav__speed-control">
                    <span className="topnav__speed-label">SPEED:</span>
                    <div className="topnav__speed-buttons">
                        {[0.5, 1, 2, 4].map(s => (
                            <button
                                key={s}
                                className={`topnav__speed-btn ${snapshot.speed === s ? 'active' : ''}`}
                                onClick={() => setSpeed(s)}
                            >
                                {s}x
                            </button>
                        ))}
                    </div>
                </div>

                <div className="topnav__separator" />

                <button
                    className={`topnav__btn ${isFullScreen ? 'active' : ''}`}
                    onClick={onToggleFullScreen}
                    title="Toggle Fullscreen"
                >
                    {isFullScreen ? '⤓' : '⤢'}
                </button>

                <div className="topnav__separator" />

                <button className="topnav__btn topnav__btn--theme" onClick={onToggleTheme} title="Toggle Dark Mode">
                    {theme === 'dark' ? '☀' : '🌙'}
                </button>
            </div>
        </header>
    );
}
