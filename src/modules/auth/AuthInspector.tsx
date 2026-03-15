import { useStore } from '../../store/simulationStore';
import '../../components/layout/Inspector.css';

export default function AuthInspector() {
    const { snapshot } = useStore();

    const authNodes = snapshot.nodes.filter(n => n.category === 'middleware' || n.id === 'auth-server');
    const activePackets = snapshot.packets.filter(p => p.status === 'pending' || p.status === 'processing');

    return (
        <div>
            <div className="inspector__section">
                <div className="inspector__section-title">Auth Pipeline</div>
                <div className="inspector__stack">
                    {snapshot.nodes.map((node, i) => (
                        <div key={node.id} className={`inspector__stack-item ${node.state === 'active' ? 'inspector__stack-item--active' : ''}`}>
                            {i + 1}. {node.icon} {node.name}
                        </div>
                    ))}
                </div>
            </div>

            <div className="inspector__section">
                <div className="inspector__section-title">Token Flow</div>
                <div className="inspector__stack">
                    {activePackets.map(pkt => (
                        <div key={pkt.id} className="inspector__stack-item inspector__stack-item--active">
                            {pkt.label} - {Math.round(pkt.progress * 100)}%
                        </div>
                    ))}
                    {activePackets.length === 0 && (
                        <div className="inspector__stack-item" style={{ opacity: 0.4, fontStyle: 'italic' }}>
                            No active auth flows
                        </div>
                    )}
                </div>
            </div>

            <div className="inspector__section">
                <div className="inspector__section-title">Security Status</div>
                {authNodes.map(node => (
                    <div key={node.id} className="inspector__metric">
                        <span className="inspector__metric-label">{node.name}</span>
                        <span className="inspector__metric-value" style={{ color: node.state === 'active' ? 'var(--success)' : undefined }}>
                            {node.state === 'active' ? '● Active' : '○ Idle'}
                        </span>
                    </div>
                ))}
            </div>

            <div className="inspector__section">
                <div className="inspector__section-title">Metrics</div>
                <div className="inspector__metric">
                    <span className="inspector__metric-label">Tick</span>
                    <span className="inspector__metric-value">{snapshot.tick}</span>
                </div>
                <div className="inspector__metric">
                    <span className="inspector__metric-label">Pipeline Stages</span>
                    <span className="inspector__metric-value">{snapshot.nodes.length}</span>
                </div>
            </div>
        </div>
    );
}
