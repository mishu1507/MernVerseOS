import { useStore } from '../../store/simulationStore';
import '../../components/layout/Inspector.css';

export default function MicroservicesInspector() {
    const { snapshot } = useStore();

    const services = snapshot.nodes.filter(n => n.category === 'service');
    const queueNodes = snapshot.nodes.filter(n => n.category === 'queue');
    const activePackets = snapshot.packets.filter(p => p.status === 'pending' || p.status === 'processing');

    return (
        <div>
            <div className="inspector__section">
                <div className="inspector__section-title">Service Mesh</div>
                <div className="inspector__stack">
                    {snapshot.nodes.map((node, i) => (
                        <div key={node.id} className={`inspector__stack-item ${node.state === 'active' ? 'inspector__stack-item--active' : ''}`}>
                            <span style={{ marginRight: '8px' }}>{node.icon}</span>
                            <span>{node.name}</span>
                            <span style={{ marginLeft: 'auto', fontSize: '9px', fontWeight: 900, color: node.state === 'active' ? 'var(--bg-primary)' : 'var(--text-tertiary)' }}>
                                {node.state === 'active' ? 'ACTIVE' : 'IDLE'}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="inspector__section">
                <div className="inspector__section-title">Message Queues</div>
                <div className="inspector__queue">
                    {queueNodes.map(node => (
                        <div key={node.id} className="inspector__queue-item">
                            {node.icon} {node.name} ({String(node.metadata.type ?? 'queue')})
                        </div>
                    ))}
                    {queueNodes.length === 0 && (
                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', fontStyle: 'italic' }}>
                            No message queues
                        </div>
                    )}
                </div>
            </div>

            <div className="inspector__section">
                <div className="inspector__section-title">Active Requests</div>
                <div className="inspector__stack">
                    {activePackets.map(pkt => (
                        <div key={pkt.id} className="inspector__stack-item inspector__stack-item--active">
                            {pkt.label} - {Math.round(pkt.progress * 100)}%
                        </div>
                    ))}
                    {activePackets.length === 0 && (
                        <div className="inspector__stack-item" style={{ opacity: 0.4, fontStyle: 'italic' }}>
                            No active requests
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
                    <span className="inspector__metric-label">Services</span>
                    <span className="inspector__metric-value">{services.length}</span>
                </div>
                <div className="inspector__metric">
                    <span className="inspector__metric-label">Architecture</span>
                    <span className="inspector__metric-value">microservices</span>
                </div>
            </div>
        </div>
    );
}
