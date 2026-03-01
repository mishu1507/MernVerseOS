import { useStore } from '../../store/simulationStore';
import '../../components/layout/Inspector.css';

export default function EventLoopInspector() {
    const { snapshot } = useStore();

    const callStackItems = snapshot.packets
        .filter(p => (p.status === 'processing' || p.status === 'pending') && p.currentNodeId === 'call-stack')
        .map(p => ({ id: p.id, label: p.label || p.payload }));

    const pendingIOItems = snapshot.packets
        .filter(p => (p.status === 'processing' || p.status === 'pending') && ['web-apis', 'thread-pool', 'io-operation'].includes(p.currentNodeId))
        .map(p => ({ id: p.id, label: p.label || p.payload }));

    const callbackItems = snapshot.packets
        .filter(p => (p.status === 'processing' || p.status === 'pending') && ['microtask-queue', 'macrotask-queue'].includes(p.currentNodeId))
        .map(p => ({ id: p.id, label: p.label || p.payload }));

    return (
        <div className="event-loop-inspector">
            <div className="inspector__section">
                <div className="inspector__section-header">
                    <span className="inspector__section-title">Call Stack</span>
                    <span className="inspector__badge">{callStackItems.length}</span>
                </div>
                <div className="inspector__stack">
                    {callStackItems.length > 0 ? (
                        callStackItems.map((item, i) => (
                            <div key={item.id} className="inspector__stack-item inspector__stack-item--active animate-in">
                                <span className="stack-icon">⚡</span>
                                {item.label}
                            </div>
                        ))
                    ) : (
                        <div className="inspector__stack-item inspector__stack-item--empty">
                            (empty)
                        </div>
                    )}
                </div>
            </div>

            <div className="inspector__section">
                <div className="inspector__section-header">
                    <span className="inspector__section-title">Task Queues</span>
                    <span className="inspector__badge">{callbackItems.length}</span>
                </div>
                <div className="inspector__queue">
                    {callbackItems.length > 0 ? (
                        callbackItems.map((item) => (
                            <div key={item.id} className="inspector__queue-item animate-in">
                                {item.label}
                            </div>
                        ))
                    ) : (
                        <div className="inspector__empty-text">No pending callbacks</div>
                    )}
                </div>
            </div>

            <div className="inspector__section">
                <div className="inspector__section-header">
                    <span className="inspector__section-title">External I/O</span>
                    <span className="inspector__badge">{pendingIOItems.length}</span>
                </div>
                <div className="inspector__stack">
                    {pendingIOItems.length > 0 ? (
                        pendingIOItems.map((item) => (
                            <div key={item.id} className="inspector__stack-item inspector__stack-item--pending animate-in">
                                {item.label}
                            </div>
                        ))
                    ) : (
                        <div className="inspector__stack-item inspector__stack-item--empty">
                            (none)
                        </div>
                    )}
                </div>
            </div>

            <div className="inspector__section">
                <div className="inspector__section-title">Metrics</div>
                <div className="inspector__metric">
                    <span className="inspector__metric-label">Tick</span>
                    <span className="inspector__metric-value">{snapshot.tick}</span>
                </div>
                <div className="inspector__metric">
                    <span className="inspector__metric-label">Active Packets</span>
                    <span className="inspector__metric-value">
                        {snapshot.packets.filter(p => p.status === 'pending' || p.status === 'processing').length}
                    </span>
                </div>
                <div className="inspector__metric">
                    <span className="inspector__metric-label">Runtime</span>
                    <span className="inspector__metric-value">event-loop</span>
                </div>
            </div>
        </div>
    );
}
