import { useStore } from '../../store/simulationStore';
import '../../components/layout/Inspector.css';

export default function WebSocketInspector() {
    const { snapshot } = useStore();

    const wsPackets = snapshot.packets.filter(p => p.protocol === 'websocket');
    const activePackets = wsPackets.filter(p => p.status === 'pending' || p.status === 'processing');
    const subscriberNode = snapshot.nodes.find(n => n.id === 'subscribers');

    return (
        <div>
            <div className="inspector__section">
                <div className="inspector__section-title">Connection Pipeline</div>
                <div className="inspector__stack">
                    {snapshot.nodes.map((node, i) => (
                        <div key={node.id} className={`inspector__stack-item ${node.state === 'active' ? 'inspector__stack-item--active' : ''}`}>
                            {i + 1}. {node.icon} {node.name}
                        </div>
                    ))}
                </div>
            </div>

            <div className="inspector__section">
                <div className="inspector__section-title">Active Messages</div>
                <div className="inspector__stack">
                    {activePackets.map(pkt => (
                        <div key={pkt.id} className="inspector__stack-item inspector__stack-item--active">
                            {pkt.label} - {Math.round(pkt.progress * 100)}%
                        </div>
                    ))}
                    {activePackets.length === 0 && (
                        <div className="inspector__stack-item" style={{ opacity: 0.4, fontStyle: 'italic' }}>
                            No active messages
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
                    <span className="inspector__metric-label">Protocol</span>
                    <span className="inspector__metric-value">WebSocket</span>
                </div>
                {subscriberNode && (
                    <div className="inspector__metric">
                        <span className="inspector__metric-label">Subscribers</span>
                        <span className="inspector__metric-value">{String(subscriberNode.metadata.count ?? 0)}</span>
                    </div>
                )}
            </div>
        </div>
    );
}
