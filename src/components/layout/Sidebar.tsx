import { useStore } from '../../store/simulationStore';
import './Sidebar.css';

interface ModuleItem {
    id: string;
    label: string;
    icon: string;
}

interface SectionItem {
    section: string;
}

type SidebarItem = ModuleItem | SectionItem;

function isSection(item: SidebarItem): item is SectionItem {
    return 'section' in item;
}

const MODULES: SidebarItem[] = [
    { section: '1. Basics' },
    { id: 'intro', label: 'Stack Architecture', icon: '📖' },
    { id: 'req-res', label: 'Request–Response', icon: '🔄' },
    { id: 'spa-mpa', label: 'SPA vs MPA', icon: '📄' },
    { id: 'rest-fundamentals', label: 'REST Fundamentals', icon: '🌐' },
    { id: 'json-flow', label: 'JSON Data Flow', icon: '📦' },
    { id: 'mvc', label: 'MVC Pattern', icon: '🏗️' },
    { id: 'env-vars', label: 'Environment Variables', icon: '🔐' },
    { id: 'dev-prod', label: 'Dev vs Production', icon: '⚙️' },
    { id: 'struggles', label: 'MERN Reality', icon: '🧗' },
    { id: 'common-mistakes', label: 'Common Mistakes', icon: '⚠️' },
    { id: 'why-async', label: 'Why async exists', icon: '⏳' },
    { id: 'state-confusion', label: 'State confusion', icon: '🌪️' },

    { section: '2. Runtime' },
    { id: 'node-internals', label: 'Node Internals', icon: '🧠' },
    { id: 'event-loop', label: 'Event Loop', icon: '🔄' },
    { id: 'call-stack', label: 'Call Stack', icon: '📚' },
    { id: 'callback-queue', label: 'Callback Queue', icon: '📥' },
    { id: 'microtask-queue', label: 'Microtask Queue', icon: '⚡' },
    { id: 'non-blocking', label: 'Non-Blocking I/O', icon: '🛣️' },
    { id: 'threads-vs-event', label: 'Threads vs Event Loop', icon: '🧵' },
    { id: 'worker-threads', label: 'Worker Threads', icon: '🛠️' },
    { id: 'streams', label: 'Streams', icon: '🌊' },
    { id: 'buffers', label: 'Buffers', icon: '🗄️' },
    { id: 'callbacks', label: 'Callbacks', icon: '📞' },
    { id: 'promises', label: 'Promises', icon: '🤝' },
    { id: 'async-await', label: 'Async/Await', icon: '✨' },
    { id: 'error-prop', label: 'Error Propagation', icon: '💥' },

    { section: '3. Server' },
    { id: 'express-core', label: 'Express Core', icon: '🚂' },
    { id: 'express', label: 'Express Routing', icon: '🛤' },
    { id: 'middleware', label: 'Middleware Flow', icon: '🚥' },
    { id: 'req-res-obj', label: 'Request & Response Obj', icon: '📦' },
    { id: 'route-matching', label: 'Route Matching', icon: '🎯' },
    { id: 'error-middleware', label: 'Error Middleware', icon: '🛡️' },
    { id: 'controllers-routes', label: 'Controllers vs Routes', icon: '🔀' },
    { id: 'auth', label: 'Authentication', icon: '🔐' },
    { id: 'authorization', label: 'Authorization', icon: '🛂' },
    { id: 'sessions-jwt', label: 'Sessions vs JWT', icon: '🎫' },
    { id: 'cookies', label: 'Cookies', icon: '🍪' },
    { id: 'oauth', label: 'OAuth Flow', icon: '🔄' },
    { id: 'password-hashing', label: 'Password Hashing', icon: '🔒' },
    { id: 'rbac', label: 'RBAC', icon: '👥' },
    { id: 'api-design', label: 'API Design', icon: '📐' },
    { id: 'rest-structure', label: 'REST API Structure', icon: '🏗️' },
    { id: 'api-versioning', label: 'API Versioning', icon: '🏷️' },
    { id: 'rate-limiting', label: 'Rate Limiting', icon: '🛑' },
    { id: 'validation', label: 'Validation (Zod/Joi)', icon: '✅' },
    { id: 'logging', label: 'Logging', icon: '📝' },

    { section: '4. Database' },
    { id: 'mongodb-core', label: 'MongoDB Core', icon: '🍃' },
    { id: 'docs-collections', label: 'Docs & Collections', icon: '📁' },
    { id: 'bson-json', label: 'BSON vs JSON', icon: '🔄' },
    { id: 'crud', label: 'CRUD Operations', icon: '🛠️' },
    { id: 'schema-design', label: 'Schema Design', icon: '📐' },
    { id: 'embed-ref', label: 'Embedding vs Referencing', icon: '🔗' },
    { id: 'indexing', label: 'MongoDB Indexing', icon: '🧠' },
    { id: 'compound-indexes', label: 'Compound Indexes', icon: '🗂️' },
    { id: 'text-index', label: 'Text Index', icon: '📑' },
    { id: 'ttl-index', label: 'TTL Index', icon: '⏱️' },
    { id: 'index-perf', label: 'Index Performance', icon: '📈' },
    { id: 'aggregation', label: 'Aggregation Pipeline', icon: '🚰' },
    { id: 'transactions', label: 'Transactions', icon: '🤝' },
    { id: 'data-modeling', label: 'Data Modeling Patterns', icon: '🧩' },
    { id: 'pagination', label: 'Pagination Strategies', icon: '📄' },
    { id: 'query-opt', label: 'Query Optimization', icon: '⚡' },
    { id: 'replication', label: 'Replication', icon: '👯' },
    { id: 'sharding', label: 'Sharding', icon: '🔪' },

    { section: '5. Frontend' },
    { id: 'react-core', label: 'React Core', icon: '⚛️' },
    { id: 'react', label: 'React Rendering', icon: '⚛️' },
    { id: 'vdom', label: 'Virtual DOM', icon: '🪞' },
    { id: 'reconciliation', label: 'Reconciliation', icon: '🤝' },
    { id: 'component-lifecycle', label: 'Component Lifecycle', icon: '♻️' },
    { id: 'hooks', label: 'Hooks System', icon: '🪝' },
    { id: 'state-props', label: 'State vs Props', icon: '⚖️' },
    { id: 'controlled-components', label: 'Controlled Components', icon: '🎮' },
    { id: 'state-arch', label: 'State Architecture', icon: '🏗️' },
    { id: 'local-state', label: 'Local State', icon: '🏠' },
    { id: 'context-api', label: 'Context API', icon: '🌐' },
    { id: 'global-state', label: 'Global State Patterns', icon: '🌍' },
    { id: 'server-ui-state', label: 'Server State vs UI State', icon: '☁️' },
    { id: 'memoization', label: 'Memoization', icon: '🧠' },
    { id: 'lazy-loading', label: 'Lazy Loading', icon: '🐌' },
    { id: 'suspense', label: 'Suspense', icon: '⏳' },
    { id: 'code-splitting', label: 'Code Splitting', icon: '✂️' },

    { section: '6. Data Flow' },
    { id: 'full-journey', label: 'Full Request Journey', icon: '🛣️' },
    { id: 'client-api-db', label: 'Client → API → DB', icon: '➡️' },
    { id: 'serialization', label: 'Serialization', icon: '📦' },
    { id: 'caching-layers', label: 'Caching Layers', icon: '⚡' },
    { id: 'data-transformation', label: 'Data Transformation', icon: '🔄' },
    { id: 'error-flow', label: 'Error Flow', icon: '🛑' },

    { section: '7. Architecture' },
    { id: 'system-design', label: 'System Design', icon: '🏗️' },
    { id: 'microservices', label: 'Microservices', icon: '🧩' },
    { id: 'monolith-micro', label: 'Monolith vs Microservices', icon: '⚖️' },
    { id: 'graphql', label: 'GraphQL', icon: '◈' },
    { id: 'websockets', label: 'WebSockets', icon: '🔌' },
    { id: 'caching', label: 'Caching', icon: '⚡' },
    { id: 'message-queues', label: 'Message Queues', icon: '📬' },
    { id: 'api-gateway', label: 'API Gateway', icon: '🚪' },
    { id: 'load-balancing', label: 'Load Balancing', icon: '⚖️' },
];

interface SidebarProps {
    onModuleSelect: (moduleId: string) => void;
    onMissionsClick: () => void;
    showMissions: boolean;
<<<<<<< HEAD
    onBuildChallengesClick: () => void;
    showBuildChallenges: boolean;
    onClose: () => void;
}

export default function Sidebar({
    onModuleSelect,
    onMissionsClick,
    showMissions,
    onBuildChallengesClick,
    showBuildChallenges,
    onClose
}: SidebarProps) {
=======
    onClose: () => void;
}

export default function Sidebar({ onModuleSelect, onMissionsClick, showMissions, onClose }: SidebarProps) {
>>>>>>> 4ab21cbb75eeb8440e220add363f45a6bafa73e1
    const { snapshot } = useStore();

    const handleSelect = (moduleId: string) => {
        onModuleSelect(moduleId);
<<<<<<< HEAD
=======
        onClose();
>>>>>>> 4ab21cbb75eeb8440e220add363f45a6bafa73e1
    };

    const handleMissions = () => {
        onMissionsClick();
<<<<<<< HEAD
=======
        onClose();
>>>>>>> 4ab21cbb75eeb8440e220add363f45a6bafa73e1
    };

    return (
        <aside className="sidebar">
            <div className="sidebar__header">
                <div className="sidebar__title">Concept Modules</div>
                <button className="sidebar__close" onClick={onClose} title="Close Sidebar">✕</button>
            </div>
            <nav className="sidebar__modules">
                {MODULES.map((item, i) => {
                    if (isSection(item)) {
                        return (
                            <div key={`section-${i}`}>
                                {i > 0 && <div className="sidebar__divider" />}
                                <div className="sidebar__section-label">{item.section}</div>
                            </div>
                        );
                    }
                    const isActive = snapshot.activeModule === item.id && !showMissions;
                    return (
                        <button
                            key={item.id}
                            className={`sidebar__module ${isActive ? 'sidebar__module--active' : ''}`}
                            onClick={() => handleSelect(item.id)}
                        >
                            <span className="sidebar__module-icon">{item.icon}</span>
                            <span className="sidebar__module-label">{item.label}</span>
                        </button>
                    );
                })}
            </nav>

            <div className="sidebar__divider" />

            <div className="sidebar__missions-section">
                <div className="sidebar__section-label">Challenges</div>
                <button
<<<<<<< HEAD
                    className={`sidebar__module ${showBuildChallenges ? 'sidebar__module--active' : ''}`}
                    onClick={() => onBuildChallengesClick()}
                >
                    <span className="sidebar__module-icon">⚙️</span>
                    <span className="sidebar__module-label">Build Challenges</span>
                </button>
                <button
                    className={`sidebar__module sidebar__module--missions ${showMissions ? 'sidebar__module--active' : ''}`}
                    onClick={() => handleMissions()}
=======
                    className={`sidebar__module sidebar__module--missions ${showMissions ? 'sidebar__module--active' : ''}`}
                    onClick={handleMissions}
>>>>>>> 4ab21cbb75eeb8440e220add363f45a6bafa73e1
                >
                    <span className="sidebar__module-icon">🎯</span>
                    <span className="sidebar__module-label">System Challenges</span>
                </button>
            </div>

            <div className="sidebar__divider" />

            <div className="sidebar__footer">
                <div className="sidebar__footer-copy">© 2026 Aditi Borkar</div>
                <div className="sidebar__footer-links">
                    <a href="https://www.linkedin.com/in/mishuborkar-csa152006/" target="_blank" rel="noreferrer">LinkedIn</a>
                    <span>•</span>
                    <a href="mailto:aditi.borkar1507@gmail.com">Contact</a>
                </div>
            </div>
        </aside>
    );
}
