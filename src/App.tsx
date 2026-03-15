import { useState, useCallback, useRef, useEffect } from 'react';
import { SimulationProvider, useStore } from './store/simulationStore';
import TopNav, { MODULE_LABELS } from './components/layout/TopNav';
import Sidebar from './components/layout/Sidebar';
import { CONTENT_BANK } from './modules/contentBank';
import SimCanvas from './components/layout/SimCanvas';
import Inspector from './components/layout/Inspector';
import BottomPanel from './components/layout/BottomPanel';
import TutorialLanding from './components/layout/TutorialLanding';
import WhyModeOverlay from './components/learning/WhyModeOverlay';
import MissionPanel from './components/learning/MissionPanel';
import BuildChallenge from './challenges/BuildChallenge';
import { getEventLoopModuleConfig } from './modules/eventLoop/eventLoopModule';
import { getExpressModuleConfig } from './modules/express/expressModule';
import { getMongoModuleConfig } from './modules/mongo/mongoModule';
import { getReactModuleConfig } from './modules/reactRuntime/reactModule';
import { getAuthModuleConfig } from './modules/auth/authModule';
import { getWebSocketModuleConfig } from './modules/websocket/websocketModule';
import { getCachingModuleConfig } from './modules/caching/cachingModule';
import { getMicroservicesModuleConfig } from './modules/microservices/microservicesModule';
import { getGraphQLModuleConfig } from './modules/graphql/graphqlModule';
import { getIndexingModuleConfig } from './modules/indexing/indexingModule';
import { getIntroModuleConfig } from './modules/intro/introModule';
import { getStrugglesModuleConfig } from './modules/struggles/strugglesModule';
import { getWipModuleConfig } from './modules/wip/wipModule';
import { getFullJourneyModuleConfig } from './modules/fullJourney/fullJourneyModule';
import { getReqResModuleConfig } from "./modules/reqRes/reqResModule";
import { getPromisesModuleConfig } from "./modules/promises/promisesModule";
import { getCrudModuleConfig } from "./modules/crud/crudModule";
import { getSessionsJwtModuleConfig } from "./modules/sessionsJwt/sessionsJwtModule";
import { getAggregationModuleConfig } from "./modules/aggregation/aggModule";
import { getLoadBalancingModuleConfig } from "./modules/loadBalancing/lbModule";
import { getVdomModuleConfig } from "./modules/vdom/vdomModule";

// New Modules
import { getSpaMpaModuleConfig } from "./modules/spaMpa/spaMpaModule";
import { getRestFundamentalsModuleConfig } from "./modules/restFundamentals/restModule";
import { getAsyncAwaitModuleConfig } from "./modules/asyncAwait/asyncAwaitModule";
import { getWorkerThreadsModuleConfig } from "./modules/workerThreads/workerModule";
import { getStreamsModuleConfig } from "./modules/streams/streamsModule";
import { getOAuthModuleConfig } from "./modules/oauth/oauthModule";
import { getRateLimitingModuleConfig } from "./modules/rateLimiting/rateLimitModule";
import { getValidationModuleConfig } from "./modules/validation/validationModule";
import { getSchemaDesignModuleConfig } from "./modules/schemaDesign/schemaDesignModule";
import { getTransactionsModuleConfig } from "./modules/transactions/txnModule";
import { getReplicationModuleConfig } from "./modules/replication/replModule";
import { getShardingModuleConfig } from "./modules/sharding/shardModule";
import { getHooksModuleConfig } from "./modules/hooks/hooksModule";
import { getErrorFlowModuleConfig } from "./modules/errorFlow/errorFlowModule";
import { getSystemDesignModuleConfig } from "./modules/systemDesign/systemDesignModule";
import { getMessageQueueModuleConfig } from "./modules/messageQueues/mqModule";

// Integrated New Modules
import { getMvcModuleConfig } from './modules/mvc/mvcModule';
import { getEmbedRefModuleConfig } from './modules/embedRef/embedRefModule';
import { getRbacModuleConfig } from './modules/rbac/rbacModule';
import { getComponentLifecycleModuleConfig } from './modules/componentLifecycle/lifecycleModule';
import { getStatePropsModuleConfig } from './modules/stateProps/statePropsModule';
import { getContextApiModuleConfig } from './modules/contextApi/contextModule';
import { getGlobalStateModuleConfig } from './modules/globalState/globalStateModule';
import { getServerUiStateModuleConfig } from './modules/serverUiState/serverUiModule';
import { getMemoizationModuleConfig } from './modules/memoization/memoModule';
import { getLazyLoadingModuleConfig } from './modules/lazyLoading/lazyModule';
import { getCodeSplittingModuleConfig } from './modules/codeSplitting/codeSplitModule';
import './App.css';

type ModuleConfigFn = () => ReturnType<typeof getEventLoopModuleConfig>;

const MODULE_CONFIGS: Record<string, ModuleConfigFn> = {
    // ── Section 1: Basics ────────────────────────────────────
    'intro':             getIntroModuleConfig,
    'req-res':           getReqResModuleConfig,
    'spa-mpa':           getSpaMpaModuleConfig,
    'rest-fundamentals': getRestFundamentalsModuleConfig,
    'mvc':               getMvcModuleConfig,

    // ── Section 2: Runtime ───────────────────────────────────
    'event-loop':        getEventLoopModuleConfig,
    'promises':          getPromisesModuleConfig,
    'async-await':       getAsyncAwaitModuleConfig,
    'worker-threads':    getWorkerThreadsModuleConfig,
    'streams':           getStreamsModuleConfig,

    // ── Section 3: Server ────────────────────────────────────
    'express':           getExpressModuleConfig,
    'middleware':        getExpressModuleConfig,
    'auth':              getAuthModuleConfig,
    'sessions-jwt':      getSessionsJwtModuleConfig,
    'oauth':             getOAuthModuleConfig,
    'rbac':              getRbacModuleConfig,
    'rate-limiting':     getRateLimitingModuleConfig,
    'validation':        getValidationModuleConfig,

    // ── Section 4: Database ──────────────────────────────────
    'mongodb':           getMongoModuleConfig,
    'crud':              getCrudModuleConfig,
    'schema-design':     getSchemaDesignModuleConfig,
    'embed-ref':         getEmbedRefModuleConfig,
    'indexing':          getIndexingModuleConfig,
    'aggregation':       getAggregationModuleConfig,
    'transactions':      getTransactionsModuleConfig,
    'replication':       getReplicationModuleConfig,
    'sharding':          getShardingModuleConfig,

    // ── Section 5: Frontend ──────────────────────────────────
    'react':             getReactModuleConfig,
    'vdom':              getVdomModuleConfig,
    'component-lifecycle': getComponentLifecycleModuleConfig,
    'hooks':             getHooksModuleConfig,
    'state-props':       getStatePropsModuleConfig,
    'context-api':       getContextApiModuleConfig,
    'global-state':      getGlobalStateModuleConfig,
    'server-ui-state':   getServerUiStateModuleConfig,
    'memoization':       getMemoizationModuleConfig,
    'lazy-loading':      getLazyLoadingModuleConfig,
    'code-splitting':    getCodeSplittingModuleConfig,

    // ── Section 6: Data Flow ─────────────────────────────────
    'full-journey':      getFullJourneyModuleConfig,
    'error-flow':        getErrorFlowModuleConfig,

    // ── Section 7: Architecture ──────────────────────────────
    'system-design':     getSystemDesignModuleConfig,
    'microservices':     getMicroservicesModuleConfig,
    'graphql':           getGraphQLModuleConfig,
    'websockets':        getWebSocketModuleConfig,
    'caching':           getCachingModuleConfig,
    'message-queues':    getMessageQueueModuleConfig,
    'load-balancing':    getLoadBalancingModuleConfig,
};

/* ─── Reusable resize hook ─── */
function useResize(axis: 'x' | 'y', initial: number, min: number, max: number, invert = false) {
    const [size, setSize] = useState(initial);
    const isResizing = useRef(false);
    const startPos = useRef(0);
    const startSize = useRef(0);

    const onMouseDown = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        isResizing.current = true;
        startPos.current = axis === 'x' ? e.clientX : e.clientY;
        startSize.current = size;
        document.body.style.cursor = axis === 'x' ? 'col-resize' : 'ns-resize';
        document.body.style.userSelect = 'none';

        const handleMove = (ev: MouseEvent) => {
            if (!isResizing.current) return;
            const pos = axis === 'x' ? ev.clientX : ev.clientY;
            const delta = invert
                ? startPos.current - pos
                : pos - startPos.current;
            setSize(Math.min(max, Math.max(min, startSize.current + delta)));
        };

        const handleUp = () => {
            isResizing.current = false;
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
            document.removeEventListener('mousemove', handleMove);
            document.removeEventListener('mouseup', handleUp);
        };

        document.addEventListener('mousemove', handleMove);
        document.addEventListener('mouseup', handleUp);
    }, [axis, size, min, max, invert]);

    return { size, onMouseDown };
}

function AppContent() {
    const [theme, setTheme] = useState('light');
    const [showMissions, setShowMissions] = useState(false);
    const [showBuildChallenges, setShowBuildChallenges] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [tutorialCompleted, setTutorialCompleted] = useState(false);
    const [isFullScreen, setIsFullScreen] = useState(false);
    const { loadModule } = useStore();

    // Resize hooks
    const rightPanel = useResize('x', 400, 280, 800, true);   // Inspector width (drag left = bigger)
    const bottomPanel = useResize('y', 180, 80, 500, true);   // Bottom panel height (drag up = bigger)

    // Responsive effect: close sidebar on mobile by default
    useEffect(() => {
        const checkMobile = () => {
            if (window.innerWidth < 1024) {
                setIsSidebarOpen(false);
            } else {
                setIsSidebarOpen(true);
            }
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Start in light mode
    useState(() => {
        document.documentElement.setAttribute('data-theme', 'light');
    });

    const handleToggleTheme = useCallback(() => {
        setTheme(prev => {
            const next = prev === 'light' ? 'dark' : 'light';
            document.documentElement.setAttribute('data-theme', next);
            return next;
        });
    }, []);

    const handleModuleSelect = useCallback((moduleId: string) => {
        setShowMissions(false);
        setShowBuildChallenges(false);
        // On mobile, close sidebar after selection
        if (window.innerWidth < 1024) {
            setIsSidebarOpen(false);
        }
        const configFn = MODULE_CONFIGS[moduleId];
        if (configFn) {
            loadModule(configFn());
        } else {
            const content = CONTENT_BANK[moduleId] || { title: MODULE_LABELS[moduleId] || moduleId };
            loadModule(getWipModuleConfig(moduleId, content));
        }
    }, [loadModule]);

    const handleMissionsClick = useCallback(() => {
        setShowMissions(true);
        setShowBuildChallenges(false);
        if (window.innerWidth < 1024) {
            setIsSidebarOpen(false);
        }
    }, []);

    const handleBuildChallengesClick = useCallback(() => {
        setShowBuildChallenges(true);
        setShowMissions(false);
        if (window.innerWidth < 1024) {
            setIsSidebarOpen(false);
        }
    }, []);

    if (!tutorialCompleted) {
        return <TutorialLanding onStart={() => setTutorialCompleted(true)} />;
    }

    return (
        <div className={`app ${isFullScreen ? 'app--fullscreen' : ''}`}>
            <TopNav
                onToggleTheme={handleToggleTheme}
                theme={theme}
                onToggleSidebar={() => setIsSidebarOpen(prev => !prev)}
                onSimulateRequest={() => handleModuleSelect('full-journey')}
                isFullScreen={isFullScreen}
                onToggleFullScreen={() => setIsFullScreen(!isFullScreen)}
            />
            <div className="app__body">
                {isSidebarOpen && (
                    <Sidebar
                        onModuleSelect={handleModuleSelect}
                        onMissionsClick={handleMissionsClick}
                        showMissions={showMissions}
                        onBuildChallengesClick={handleBuildChallengesClick}
                        showBuildChallenges={showBuildChallenges}
                        onClose={() => setIsSidebarOpen(false)}
                    />
                )}
                <div className="app__center">
                    {showBuildChallenges ? (
                        <div className="app__challenge-fullarea">
                            <BuildChallenge />
                        </div>
                    ) : (
                        <>
                            <div className="app__canvas-wrapper">
                                <SimCanvas isFullScreen={isFullScreen} onToggleFullScreen={() => setIsFullScreen(!isFullScreen)} />
                                <WhyModeOverlay />
                            </div>
                            {/* ─── Horizontal resize bar (bottom panel) ─── */}
                            {!isFullScreen && (
                                <div className="bottom-panel-container" style={{ height: bottomPanel.size }}>
                                    <div className="resize-bar resize-bar--horizontal" onMouseDown={bottomPanel.onMouseDown}>
                                        <div className="resize-bar__grip" />
                                    </div>
                                    <BottomPanel height="100%" />
                                </div>
                            )}
                        </>
                    )}
                </div>
                {/* ─── Vertical resize bar (right panel) ─── */}
                {!isFullScreen && !showBuildChallenges && (
                    <>
                        <div className="resize-bar resize-bar--vertical" onMouseDown={rightPanel.onMouseDown}>
                            <div className="resize-bar__grip" />
                        </div>
                        <div className="app__right-panel" style={{ width: rightPanel.size, flexShrink: 0 }}>
                            {showMissions ? <MissionPanel /> : <Inspector />}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default function App() {
    return (
        <SimulationProvider>
            <AppContent />
        </SimulationProvider>
    );
}
