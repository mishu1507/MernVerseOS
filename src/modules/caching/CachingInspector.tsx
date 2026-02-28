import { useStore } from '../../store/simulationStore';
import '../../components/layout/Inspector.css';

export default function CachingInspector() {
    const { snapshot } = useStore();

    const cacheNode = snapshot.nodes.find(n => n.id === 'redis');
    const dbNode = snapshot.nodes.find(n => n.id === 'database');
    const activePackets = snapshot.packets.filter(p => p.status === 'pending' || p.status === 'processing');

    return (
        <div>
            <div className="inspector__section">
                <div className="inspector__section-title">Cache Pipeline</div>
                <div className="inspector__stack">
                    {snapshot.nodes.map((node, i) => (
                        <div key={node.id} className={`inspector__stack-item ${node.state === 'active' ? 'inspector__stack-item--active' : ''}`}>
                            {i + 1}. {node.icon} {node.name}
                        </div>
                    ))}
                </div>
            </div>


            <div className="inspector__section">
                <div className="inspector__section-title">Active Lookups</div>
                <div className="inspector__stack">
                    {activePackets.map(pkt => (
                        <div key={pkt.id} className="inspector__stack-item inspector__stack-item--active">
                            {pkt.label} - {Math.round(pkt.progress * 100)}%
                        </div>
                    ))}
                    {activePackets.length === 0 && (
                        <div className="inspector__stack-item" style={{ opacity: 0.4, fontStyle: 'italic' }}>
                            No active lookups
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
                    <span className="inspector__metric-label">Strategy</span>
                    <span className="inspector__metric-value text-info">Cache-Aside</span>
                </div>
            </div>
        </div>
    );
}
