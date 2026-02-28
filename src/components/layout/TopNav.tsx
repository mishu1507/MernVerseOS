import { useStore } from '../../store/simulationStore';
import './TopNav.css';

const MODULE_LABELS: Record<string, string> = {
    'intro': 'Stack Architecture',
    'struggles': 'MEARN Struggles',
    'event-loop': 'Event Loop',
    'express': 'Express Routing',
    'middleware': 'Middleware',
    'mongodb': 'MongoDB',
    'aggregation': 'Aggregation Pipeline',
    'indexing': 'Mental Indexing',
    'react': 'React Rendering',
    'angular': 'Angular Change Detection',
    'sql': 'SQL Joins',
    'microservices': 'Microservices',
    'auth': 'Authentication',
    'caching': 'Caching',
    'graphql': 'GraphQL',
    'websockets': 'WebSockets',
};

interface TopNavProps {
    onToggleTheme: () => void;
    theme: string;
    onToggleSidebar: () => void;
}

export default function TopNav({ onToggleTheme, theme, onToggleSidebar }: TopNavProps) {
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
                    title="Toggle Explanation Mode"
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

                <button className="topnav__btn topnav__btn--theme" onClick={onToggleTheme} title="Toggle Dark Mode">
                    {theme === 'dark' ? '☀' : '🌙'}
                </button>
            </div>
        </header>
    );
}
