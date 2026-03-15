const fs = require('fs');

// SimCanvas.css
let simCanvasCss = fs.readFileSync('src/components/layout/SimCanvas.css', 'utf-8');
if (!simCanvasCss.includes('.sim-canvas__empty {')) {
    simCanvasCss += `\n.sim-canvas__empty {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    text-align: center;
    color: var(--text-tertiary);
    pointer-events: none;
    z-index: 10;
}
.sim-canvas__empty-icon {
    font-size: 48px;
    opacity: 0.2;
}
.sim-canvas__empty-title {
    font-size: 16px;
    font-weight: 800;
    color: var(--text-secondary);
}
.sim-canvas__empty-sub {
    font-size: 13px;
    color: var(--text-tertiary);
    max-width: 280px;
    line-height: 1.5;
}`;
    fs.writeFileSync('src/components/layout/SimCanvas.css', simCanvasCss);
}

// SimCanvas.tsx
let simCanvasTsx = fs.readFileSync('src/components/layout/SimCanvas.tsx', 'utf-8');
simCanvasTsx = simCanvasTsx.replace("import { useState } from 'react';", "import { useState, useEffect } from 'react';");
if (!simCanvasTsx.includes('useEffect(() => {')) {
    simCanvasTsx = simCanvasTsx.replace(
        "const [dragStart, setDragStart] = useState({ x: 0, y: 0 });",
        `const [dragStart, setDragStart] = useState({ x: 0, y: 0 });\n\n    useEffect(() => {\n        if (!nodes.length) return;\n        const canvasEl = document.querySelector('.sim-canvas') as HTMLElement;\n        if (!canvasEl) return;\n        const canvasW = canvasEl.offsetWidth;\n        const canvasH = canvasEl.offsetHeight;\n        const minX = Math.min(...nodes.map(n => n.position.x));\n        const maxX = Math.max(...nodes.map(n => n.position.x)) + 72;\n        const minY = Math.min(...nodes.map(n => n.position.y));\n        const maxY = Math.max(...nodes.map(n => n.position.y)) + 72;\n        const contentW = maxX - minX;\n        const contentH = maxY - minY;\n        setPan({\n            x: (canvasW - contentW) / 2 - minX,\n            y: (canvasH - contentH) / 2 - minY,\n        });\n    }, [snapshot.activeModule]);`
    );
    fs.writeFileSync('src/components/layout/SimCanvas.tsx', simCanvasTsx);
}

// Sidebar.tsx
let sidebarTsx = fs.readFileSync('src/components/layout/Sidebar.tsx', 'utf-8');
const fullModulesConst = `const FULL_MODULES = new Set([
    'intro','struggles','event-loop','express','middleware','mongodb','react',
    'auth','websockets','caching','microservices','graphql','indexing',
    'full-journey','req-res','promises','async-await','crud','sessions-jwt',
    'aggregation','load-balancing','vdom','reconciliation',
]);\n\n`;

if (!sidebarTsx.includes('const FULL_MODULES')) {
    sidebarTsx = sidebarTsx.replace(
        "import './Sidebar.css';\\n",
        "import './Sidebar.css';\\n\\n" + fullModulesConst
    );
    // Let's use a simpler replace strategy for the first few lines just in case
    // We can split by line explicitly
    const lines = fs.readFileSync('src/components/layout/Sidebar.tsx', 'utf-8').split('\\n');
    const cssIdx = lines.findIndex(l => l.includes("import './Sidebar.css';"));
    if (cssIdx !== -1 && !lines.find(l => l.includes("const FULL_MODULES"))) {
        lines.splice(cssIdx + 1, 0, "", ...fullModulesConst.trim().split('\\n'));
        sidebarTsx = lines.join('\\n');
    }
}

const newModulesArray = \`const MODULES: SidebarItem[] = [

    { section: '1. Basics' },
    { id: 'intro',             label: 'Stack Architecture',      icon: '📖' },
    { id: 'req-res',           label: 'Request–Response',        icon: '🔄' },
    { id: 'spa-mpa',           label: 'SPA vs MPA',              icon: '📄' },
    { id: 'rest-fundamentals', label: 'REST Fundamentals',       icon: '🌐' },
    { id: 'mvc',               label: 'MVC Pattern',             icon: '🏗️' },

    { section: '2. Runtime' },
    { id: 'event-loop',    label: 'Event Loop',     icon: '🔄' },
    { id: 'promises',      label: 'Promises',       icon: '🤝' },
    { id: 'async-await',   label: 'Async / Await',  icon: '✨' },
    { id: 'worker-threads',label: 'Worker Threads', icon: '🛠️' },
    { id: 'streams',       label: 'Streams',        icon: '🌊' },

    { section: '3. Server' },
    { id: 'express',       label: 'Express Routing',     icon: '🛤️' },
    { id: 'middleware',    label: 'Middleware Flow',      icon: '🚥' },
    { id: 'auth',          label: 'Authentication',      icon: '🔐' },
    { id: 'sessions-jwt',  label: 'Sessions vs JWT',     icon: '🎫' },
    { id: 'oauth',         label: 'OAuth Flow',          icon: '🔄' },
    { id: 'rbac',          label: 'RBAC',                icon: '👥' },
    { id: 'rate-limiting', label: 'Rate Limiting',       icon: '🛑' },
    { id: 'validation',    label: 'Validation (Zod/Joi)',icon: '✅' },

    { section: '4. Database' },
    { id: 'mongodb',       label: 'MongoDB Internals',        icon: '🍃' },
    { id: 'crud',          label: 'CRUD Operations',          icon: '🛠️' },
    { id: 'schema-design', label: 'Schema Design',            icon: '📐' },
    { id: 'embed-ref',     label: 'Embedding vs Referencing', icon: '🔗' },
    { id: 'indexing',      label: 'MongoDB Indexing',         icon: '🧠' },
    { id: 'aggregation',   label: 'Aggregation Pipeline',     icon: '🚰' },
    { id: 'transactions',  label: 'Transactions',             icon: '🤝' },
    { id: 'replication',   label: 'Replication',              icon: '👯' },
    { id: 'sharding',      label: 'Sharding',                 icon: '🔪' },

    { section: '5. Frontend' },
    { id: 'react',               label: 'React Rendering',        icon: '⚛️' },
    { id: 'vdom',                label: 'Virtual DOM',            icon: '🪞' },
    { id: 'component-lifecycle', label: 'Component Lifecycle',    icon: '♻️' },
    { id: 'hooks',               label: 'Hooks System',           icon: '🪝' },
    { id: 'state-props',         label: 'State vs Props',         icon: '⚖️' },
    { id: 'context-api',         label: 'Context API',            icon: '🌐' },
    { id: 'global-state',        label: 'Global State (Zustand)', icon: '🌍' },
    { id: 'server-ui-state',     label: 'Server vs UI State',     icon: '☁️' },
    { id: 'memoization',         label: 'Memoization',            icon: '🧠' },
    { id: 'lazy-loading',        label: 'Lazy Loading',           icon: '🐌' },
    { id: 'code-splitting',      label: 'Code Splitting',         icon: '✂️' },

    { section: '6. Data Flow' },
    { id: 'full-journey', label: 'Full Request Journey', icon: '🛣️' },
    { id: 'error-flow',   label: 'Error Flow',           icon: '🛑' },

    { section: '7. Architecture' },
    { id: 'system-design',  label: 'System Design',      icon: '🏗️' },
    { id: 'microservices',  label: 'Microservices',       icon: '🧩' },
    { id: 'graphql',        label: 'GraphQL',             icon: '◈'  },
    { id: 'websockets',     label: 'WebSockets',          icon: '🔌' },
    { id: 'caching',        label: 'Caching (Redis)',     icon: '⚡' },
    { id: 'message-queues', label: 'Message Queues',      icon: '📬' },
    { id: 'load-balancing', label: 'Load Balancing',      icon: '⚖️' },
];\`;

sidebarTsx = sidebarTsx.replace(/const MODULES: SidebarItem\\[\\] = \\[[\\s\\S]*?\\];/m, newModulesArray);

const liveBadge = \`\\n{FULL_MODULES.has(item.id) && (
    <span style={{
        marginLeft: 'auto',
        fontSize: '8px',
        background: 'var(--success)',
        color: 'white',
        padding: '1px 5px',
        borderRadius: '4px',
        fontWeight: 900,
        flexShrink: 0,
        letterSpacing: '0.05em',
    }}>LIVE</span>
)}\`;
                            
if (!sidebarTsx.includes('FULL_MODULES.has(item.id)')) {
    sidebarTsx = sidebarTsx.replace(
        '<span className="sidebar__module-label">{item.label}</span>',
        '<span className="sidebar__module-label">{item.label}</span>' + liveBadge
    );
}

fs.writeFileSync('src/components/layout/Sidebar.tsx', sidebarTsx);

// TopNav.tsx
let topNavTsx = fs.readFileSync('src/components/layout/TopNav.tsx', 'utf-8');
const newLabels = \`export const MODULE_LABELS: Record<string, string> = {
    'intro':             'Stack Architecture',
    'req-res':           'Request–Response',
    'spa-mpa':           'SPA vs MPA',
    'rest-fundamentals': 'REST Fundamentals',
    'mvc':               'MVC Pattern',
    'event-loop':        'Event Loop',
    'promises':          'Promises',
    'async-await':       'Async / Await',
    'worker-threads':    'Worker Threads',
    'streams':           'Streams',
    'express':           'Express Routing',
    'middleware':        'Middleware Flow',
    'auth':              'Authentication',
    'sessions-jwt':      'Sessions vs JWT',
    'oauth':             'OAuth Flow',
    'rbac':              'RBAC',
    'rate-limiting':     'Rate Limiting',
    'validation':        'Validation (Zod/Joi)',
    'mongodb':           'MongoDB Internals',
    'crud':              'CRUD Operations',
    'schema-design':     'Schema Design',
    'embed-ref':         'Embedding vs Referencing',
    'indexing':          'MongoDB Indexing',
    'aggregation':       'Aggregation Pipeline',
    'transactions':      'Transactions',
    'replication':       'Replication',
    'sharding':          'Sharding',
    'react':             'React Rendering',
    'vdom':              'Virtual DOM',
    'component-lifecycle':'Component Lifecycle',
    'hooks':             'Hooks System',
    'state-props':       'State vs Props',
    'context-api':       'Context API',
    'global-state':      'Global State (Zustand)',
    'server-ui-state':   'Server vs UI State',
    'memoization':       'Memoization',
    'lazy-loading':      'Lazy Loading',
    'code-splitting':    'Code Splitting',
    'full-journey':      'Full Request Journey',
    'error-flow':        'Error Flow',
    'system-design':     'System Design',
    'microservices':     'Microservices',
    'graphql':           'GraphQL',
    'websockets':        'WebSockets',
    'caching':           'Caching (Redis)',
    'message-queues':    'Message Queues',
    'load-balancing':    'Load Balancing',
    'common-mistakes':   'Common Mistakes',
    'struggles':         'MERN Reality',
};\`;

topNavTsx = topNavTsx.replace(/export const MODULE_LABELS: Record<string, string> = \\{[\\s\\S]*?\\};/m, newLabels);
fs.writeFileSync('src/components/layout/TopNav.tsx', topNavTsx);

// App.tsx
let appTsx = fs.readFileSync('src/App.tsx', 'utf-8');

const newConfigs = \`const MODULE_CONFIGS: Record<string, ModuleConfigFn> = {
    'intro':             getIntroModuleConfig,
    'struggles':         getStrugglesModuleConfig,
    'event-loop':        getEventLoopModuleConfig,
    'express':           getExpressModuleConfig,
    'middleware':        getExpressModuleConfig,
    'mongodb':           getMongoModuleConfig,
    'react':             getReactModuleConfig,
    'auth':              getAuthModuleConfig,
    'websockets':        getWebSocketModuleConfig,
    'caching':           getCachingModuleConfig,
    'microservices':     getMicroservicesModuleConfig,
    'graphql':           getGraphQLModuleConfig,
    'indexing':          getIndexingModuleConfig,
    'req-res':           getReqResModuleConfig,
    'promises':          getPromisesModuleConfig,
    'async-await':       getPromisesModuleConfig,
    'crud':              getCrudModuleConfig,
    'sessions-jwt':      getSessionsJwtModuleConfig,
    'aggregation':       getAggregationModuleConfig,
    'load-balancing':    getLoadBalancingModuleConfig,
    'vdom':              getVdomModuleConfig,
    'reconciliation':    getVdomModuleConfig,
};\`;

appTsx = appTsx.replace(/const MODULE_CONFIGS: Record<string, ModuleConfigFn> = \\{[\\s\\S]*?\\};/, newConfigs);

const newImports = \`import { getReqResModuleConfig }      from './modules/reqRes/reqResModule';
import { getPromisesModuleConfig }    from './modules/promises/promisesModule';
import { getCrudModuleConfig }        from './modules/crud/crudModule';
import { getSessionsJwtModuleConfig } from './modules/sessionsJwt/sessionsJwtModule';
import { getAggregationModuleConfig } from './modules/aggregation/aggModule';
import { getLoadBalancingModuleConfig }from './modules/loadBalancing/lbModule';
import { getVdomModuleConfig }        from './modules/vdom/vdomModule';
import './App.css';\`;

if (!appTsx.includes('getReqResModuleConfig')) {
    appTsx = appTsx.replace("import './App.css';", newImports);
}
fs.writeFileSync('src/App.tsx', appTsx);
console.log("SUCCESS");
