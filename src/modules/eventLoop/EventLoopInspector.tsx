import { useStore } from '../../store/simulationStore';
import '../../components/layout/Inspector.css';

export default function EventLoopInspector() {
    const { snapshot } = useStore();

    const callStackItems = snapshot.packets
        .filter(p => p.status === 'processing' && p.currentNodeId === 'event-loop-core')
        .map(p => p.label || p.payload);

    const pendingIOItems = snapshot.packets
        .filter(p => p.status === 'processing' && p.currentNodeId === 'database')
        .map(p => p.label || p.payload);

    const callbackItems = snapshot.packets
        .filter(p => p.status === 'processing' && p.currentNodeId === 'callback')
        .map(p => p.label || p.payload);

    return (
        <div>
            <div className="inspector__section">
                <div className="inspector__section-title">Call Stack</div>
                <div className="inspector__stack">
                    {callStackItems.length > 0 ? (
                        callStackItems.map((item, i) => (
                            <div key={i} className="inspector__stack-item inspector__stack-item--active">
                                {item}
                            </div>
                        ))
                    ) : (
                        <div className="inspector__stack-item" style={{ opacity: 0.4, fontStyle: 'italic' }}>
                            (empty)
                        </div>
                    )}
                </div>
            </div>

            <div className="inspector__section">
                <div className="inspector__section-title">Callback Queue</div>
                <div className="inspector__queue">
                    {callbackItems.length > 0 ? (
                        callbackItems.map((item, i) => (
                            <div key={i} className="inspector__queue-item">{item}</div>
                        ))
                    ) : (
                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', fontStyle: 'italic' }}>
                            (empty)
                        </div>
                    )}
                </div>
            </div>

            <div className="inspector__section">
                <div className="inspector__section-title">Pending I/O</div>
                <div className="inspector__stack">
                    {pendingIOItems.length > 0 ? (
                        pendingIOItems.map((item, i) => (
                            <div key={i} className="inspector__stack-item inspector__stack-item--pending">
                                {item}
                            </div>
                        ))
                    ) : (
                        <div className="inspector__stack-item" style={{ opacity: 0.4, fontStyle: 'italic' }}>
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
