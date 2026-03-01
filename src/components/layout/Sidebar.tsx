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
    { section: 'Basics' },
    { id: 'intro', label: 'Stack Architecture', icon: '📖' },
    { id: 'struggles', label: 'MEARN Struggles', icon: '🧗' },
    { section: 'Runtime' },
    { id: 'event-loop', label: 'Event Loop', icon: '🔄' },
    { section: 'Server' },
    { id: 'express', label: 'Express Routing', icon: '🛤' },
    { id: 'auth', label: 'Authentication', icon: '🔐' },
    { section: 'Database' },
    { id: 'mongodb', label: 'MongoDB', icon: '🍃' },
    { section: 'Frontend' },
    { id: 'react', label: 'React Rendering', icon: '⚛' },
    { section: 'Architecture' },
    { id: 'microservices', label: 'Microservices', icon: '🧩' },
    { id: 'graphql', label: 'GraphQL', icon: '◈' },
    { id: 'websockets', label: 'WebSockets', icon: '🔌' },
    { id: 'caching', label: 'Caching', icon: '⚡' },
    { section: 'Mastery' },
    { id: 'indexing', label: 'Mental Indexing', icon: '🧠' },
];

interface SidebarProps {
    onModuleSelect: (moduleId: string) => void;
    onMissionsClick: () => void;
    showMissions: boolean;
    onClose: () => void;
}

export default function Sidebar({ onModuleSelect, onMissionsClick, showMissions, onClose }: SidebarProps) {
    const { snapshot } = useStore();

    const handleSelect = (moduleId: string) => {
        onModuleSelect(moduleId);
        onClose();
    };

    const handleMissions = () => {
        onMissionsClick();
        onClose();
    };

    return (
        <aside className="sidebar">
            <div className="sidebar__header">
                <div className="sidebar__title">Concept Modules</div>
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
                    className={`sidebar__module sidebar__module--missions ${showMissions ? 'sidebar__module--active' : ''}`}
                    onClick={handleMissions}
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
