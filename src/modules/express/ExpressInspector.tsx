import { useStore } from '../../store/simulationStore';
import '../../components/layout/Inspector.css';

export default function ExpressInspector() {
    const { snapshot } = useStore();

    const middlewareNodes = snapshot.nodes.filter(n => n.category === 'middleware');
    const serviceNodes = snapshot.nodes.filter(n => n.category === 'service');
    const activePackets = snapshot.packets.filter(p => p.status === 'pending' || p.status === 'processing');

    return (
        <div>
            <div className="inspector__section">
                <div className="inspector__section-title">Route Table</div>
                <div className="inspector__stack">
                    {serviceNodes.map(node => (
                        <div key={node.id} className={`inspector__stack-item ${node.state === 'active' ? 'inspector__stack-item--active' : ''}`}>
                            {node.icon} {node.name}
                        </div>
                    ))}
                </div>
            </div>

            <div className="inspector__section">
                <div className="inspector__section-title">Middleware Chain</div>
                <div className="inspector__stack">
                    {middlewareNodes.map((node, i) => (
                        <div key={node.id} className={`inspector__stack-item ${node.state === 'active' ? 'inspector__stack-item--active' : ''}`}>
                            {i + 1}. {node.icon} {node.name}
                        </div>
                    ))}
                    {middlewareNodes.length === 0 && (
                        <div className="inspector__stack-item" style={{ opacity: 0.4, fontStyle: 'italic' }}>
                            No middleware configured
                        </div>
                    )}
                </div>
            </div>

            <div className="inspector__section">
                <div className="inspector__section-title">Request Log</div>
                <div className="inspector__stack">
                    {activePackets.map(pkt => (
                        <div key={pkt.id} className="inspector__stack-item">
                            {pkt.protocol.toUpperCase()} {pkt.label} - {Math.round(pkt.progress * 100)}%
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
                    <span className="inspector__metric-label">Nodes</span>
                    <span className="inspector__metric-value">{snapshot.nodes.length}</span>
                </div>
            </div>
        </div>
    );
}
