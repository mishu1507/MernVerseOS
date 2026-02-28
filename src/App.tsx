import { useState, useCallback, useRef } from 'react';
import { SimulationProvider, useStore } from './store/simulationStore';
import TopNav from './components/layout/TopNav';
import Sidebar from './components/layout/Sidebar';
import SimCanvas from './components/layout/SimCanvas';
import Inspector from './components/layout/Inspector';
import BottomPanel from './components/layout/BottomPanel';
import TutorialLanding from './components/layout/TutorialLanding';
import WhyModeOverlay from './components/learning/WhyModeOverlay';
import MissionPanel from './components/learning/MissionPanel';
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
import './App.css';

type ModuleConfigFn = () => ReturnType<typeof getEventLoopModuleConfig>;

const MODULE_CONFIGS: Record<string, ModuleConfigFn> = {
    'intro': getIntroModuleConfig,
    'struggles': getStrugglesModuleConfig,
    'event-loop': getEventLoopModuleConfig,
    'express': getExpressModuleConfig,
    'mongodb': getMongoModuleConfig,
    'react': getReactModuleConfig,
    'auth': getAuthModuleConfig,
    'websockets': getWebSocketModuleConfig,
    'caching': getCachingModuleConfig,
    'microservices': getMicroservicesModuleConfig,
    'graphql': getGraphQLModuleConfig,
    'indexing': getIndexingModuleConfig,
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
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [tutorialCompleted, setTutorialCompleted] = useState(false);
    const { loadModule } = useStore();

    // Resize hooks
    const rightPanel = useResize('x', 400, 280, 800, true);   // Inspector width (drag left = bigger)
    const bottomPanel = useResize('y', 220, 100, 500, true);   // Bottom panel height (drag up = bigger)

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
        const configFn = MODULE_CONFIGS[moduleId];
        if (configFn) {
            loadModule(configFn());
        }
    }, [loadModule]);

    const handleMissionsClick = useCallback(() => {
        setShowMissions(true);
    }, []);

    if (!tutorialCompleted) {
        return <TutorialLanding onStart={() => setTutorialCompleted(true)} />;
    }

    return (
        <div className="app">
            <TopNav
                onToggleTheme={handleToggleTheme}
                theme={theme}
                onToggleSidebar={() => setIsSidebarOpen(prev => !prev)}
            />
            <div className="app__body">
                {isSidebarOpen && (
                    <Sidebar
                        onModuleSelect={handleModuleSelect}
                        onMissionsClick={handleMissionsClick}
                        showMissions={showMissions}
                        onClose={() => setIsSidebarOpen(false)}
                    />
                )}
                <div className="app__center">
                    <div className="app__canvas-wrapper">
                        <SimCanvas />
                        <WhyModeOverlay />
                    </div>
                    {/* ─── Horizontal resize bar (bottom panel) ─── */}
                    <div className="resize-bar resize-bar--horizontal" onMouseDown={bottomPanel.onMouseDown}>
                        <div className="resize-bar__grip" />
                    </div>
                    <BottomPanel height={bottomPanel.size} />
                </div>
                {/* ─── Vertical resize bar (right panel) ─── */}
                <div className="resize-bar resize-bar--vertical" onMouseDown={rightPanel.onMouseDown}>
                    <div className="resize-bar__grip" />
                </div>
                <div style={{ width: rightPanel.size, flexShrink: 0 }}>
                    {showMissions ? <MissionPanel /> : <Inspector />}
                </div>
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
