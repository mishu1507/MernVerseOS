import { useState, useRef, useEffect } from 'react';
import { useStore } from '../../store/simulationStore';
import type { ConsoleLog, TimelineEvent, DataPacket } from '../../engine/types/system.types';
import './BottomPanel.css';

const TABS = ['Console', 'Reasoning', 'Timeline', 'Network', 'DB Logs'] as const;
type TabName = typeof TABS[number];

interface BottomPanelProps {
    height?: number | string;
}

export default function BottomPanel({ height = 220 }: BottomPanelProps) {
    const [activeTab, setActiveTab] = useState<TabName>('Console');
    const { snapshot } = useStore();
    const scrollRef = useRef<HTMLDivElement>(null);
    const [isScrolledUp, setIsScrolledUp] = useState(false);

    // Track scroll position to show/hide "Scroll to Bottom" button
    const handleScroll = () => {
        if (scrollRef.current) {
            const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
            // Precise check: If we are within 20px of the bottom, we consider it "at the bottom"
            const atBottom = scrollHeight - scrollTop - clientHeight < 20;

            // Only update state if it actually changed to prevent unnecessary re-renders
            setIsScrolledUp(!atBottom);
        }
    };

    // Auto-scroll logic: only snaps to bottom if the user hasn't manually scrolled up
    useEffect(() => {
        if (scrollRef.current && !isScrolledUp) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [snapshot.consoleLogs.length, snapshot.timeline.length, snapshot.packets.length, activeTab, isScrolledUp]);

    const scrollToBottom = () => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
            setIsScrolledUp(false);
        }
    };

    // Filter reasoning logs
    const reasoningLogs = snapshot.consoleLogs.filter((log: ConsoleLog) =>
        log.message.startsWith('  ℹ') ||
        log.message.startsWith('  → Why:') ||
        log.message.startsWith('  → Next:')
    );

    const renderContent = () => {
        switch (activeTab) {
            case 'Console':
                if (!snapshot.consoleLogs.length) {
                    return <div className="bottom-panel__empty">Console output will appear here during simulation.</div>;
                }
                return snapshot.consoleLogs.map((log: ConsoleLog, i: number) => (
                    <div key={i} className="log-line">
                        <span className="log-line__tick">t:{log.tick}</span>
                        <span className={`log-line__level log-line__level--${log.level}`}>
                            {log.level.toUpperCase()}
                        </span>
                        <span className="log-line__message">{log.message}</span>
                    </div>
                ));

            case 'Reasoning':
                if (!reasoningLogs.length) {
                    return (
                        <div className="bottom-panel__empty">
                            Reasoning explanations appear here as the simulation runs.
                            <br />
                            <span style={{ fontSize: '11px', marginTop: '4px', display: 'block' }}>
                                Each node and connection has an explanation of WHY it exists and what it does.
                            </span>
                        </div>
                    );
                }
                return reasoningLogs.map((log: ConsoleLog, i: number) => (
                    <div key={i} className="log-line log-line--reasoning">
                        <span className="log-line__tick">t:{log.tick}</span>
                        <span className="log-line__level log-line__level--info">WHY</span>
                        <span className="log-line__message">{log.message.replace(/^\s+[ℹ→]\s*(?:Why:\s*|Next:\s*)?/, '')}</span>
                    </div>
                ));

            case 'Timeline':
                if (!snapshot.timeline.length) {
                    return <div className="bottom-panel__empty">Timeline events will appear here.</div>;
                }
                return snapshot.timeline.map((entry: TimelineEvent, i: number) => (
                    <div key={i} className="timeline-entry">
                        <span className="timeline-entry__tick">t:{entry.tick}</span>
                        <span className="timeline-entry__event">{entry.event}</span>
                        <span className="timeline-entry__detail">{entry.detail}</span>
                    </div>
                ));

            case 'Network': {
                const networkPackets = snapshot.packets.filter((p: DataPacket) => p.protocol === 'http' || p.protocol === 'websocket');
                if (!networkPackets.length) {
                    return <div className="bottom-panel__empty">Network activity will appear here.</div>;
                }
                return networkPackets.map((pkt: DataPacket, i: number) => (
                    <div key={i} className="log-line">
                        <span className="log-line__tick">t:{snapshot.tick}</span>
                        <span className={`log-line__level log-line__level--${pkt.status === 'completed' ? 'success' : 'info'}`}>
                            {pkt.protocol.toUpperCase()}
                        </span>
                        <span className="log-line__message">
                            {pkt.label || pkt.payload} - {pkt.status} ({Math.round(pkt.progress * 100)}%)
                        </span>
                    </div>
                ));
            }

            case 'DB Logs': {
                const dbPackets = snapshot.packets.filter((p: DataPacket) => p.protocol === 'db-query');
                if (!dbPackets.length) {
                    return <div className="bottom-panel__empty">Database query logs will appear here.</div>;
                }
                return dbPackets.map((pkt: DataPacket, i: number) => (
                    <div key={i} className="log-line">
                        <span className="log-line__tick">t:{snapshot.tick}</span>
                        <span className="log-line__level log-line__level--warn">QUERY</span>
                        <span className="log-line__message">
                            {pkt.label || pkt.payload} - {pkt.status}
                        </span>
                    </div>
                ));
            }

            default:
                return null;
        }
    };

    return (
        <div className="bottom-panel" style={{ height }}>
            <div className="bottom-panel__tabs">
                {TABS.map(tab => (
                    <button
                        key={tab}
                        className={`bottom-panel__tab ${activeTab === tab ? 'bottom-panel__tab--active' : ''}`}
                        onClick={() => setActiveTab(tab)}
                    >
                        {tab}
                        {tab === 'Console' && snapshot.consoleLogs.length > 0 && (
                            <span className="bottom-panel__tab-count">{snapshot.consoleLogs.length}</span>
                        )}
                        {tab === 'Reasoning' && reasoningLogs.length > 0 && (
                            <span className="bottom-panel__tab-count">{reasoningLogs.length}</span>
                        )}
                        {tab === 'Timeline' && snapshot.timeline.length > 0 && (
                            <span className="bottom-panel__tab-count">{snapshot.timeline.length}</span>
                        )}
                    </button>
                ))}
            </div>
            <div className="bottom-panel__content" ref={scrollRef} onScroll={handleScroll}>
                {renderContent()}

                {isScrolledUp && (activeTab === 'Console' || activeTab === 'Reasoning' || activeTab === 'Timeline') && (
                    <button className="bottom-panel__scroll-btn" onClick={scrollToBottom}>
                        ↓ New Logs Below
                    </button>
                )}
            </div>
        </div>
    );
}
