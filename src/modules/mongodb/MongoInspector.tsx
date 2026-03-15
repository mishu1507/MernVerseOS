import { useStore } from '../../store/simulationStore';
import '../../components/layout/Inspector.css';

export default function MongoInspector() {
    const { snapshot } = useStore();

    const dbNodes = snapshot.nodes.filter(n => n.category === 'database');
    const dbPackets = snapshot.packets.filter(p => p.protocol === 'db-query');

    return (
        <div>
            <div className="inspector__section">
                <div className="inspector__section-title">Collections</div>
                <div className="inspector__stack">
                    {dbNodes.map(node => (
                        <div key={node.id} className={`inspector__stack-item ${node.state === 'active' ? 'inspector__stack-item--active' : ''}`}>
                            {node.icon} {node.name}
                            {node.metadata.documents !== undefined && (
                                <span style={{ marginLeft: 'auto', color: 'var(--text-tertiary)', fontSize: 'var(--text-xs)' }}>
                                    {String(node.metadata.documents)} docs
                                </span>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <div className="inspector__section">
                <div className="inspector__section-title">Indexes</div>
                <div className="inspector__queue">
                    {dbNodes.flatMap(node =>
                        Array.isArray(node.metadata.indexes)
                            ? (node.metadata.indexes as string[]).map((idx: string) => (
                                <div key={`${node.id}-${idx}`} className="inspector__queue-item">
                                    {idx}
                                </div>
                            ))
                            : []
                    )}
                </div>
            </div>

            <div className="inspector__section">
                <div className="inspector__section-title">Active Queries</div>
                <div className="inspector__stack">
                    {dbPackets.map(pkt => (
                        <div key={pkt.id} className={`inspector__stack-item ${pkt.status === 'processing' ? 'inspector__stack-item--active' : ''}`}>
                            {pkt.label} - {pkt.status} ({Math.round(pkt.progress * 100)}%)
                        </div>
                    ))}
                    {dbPackets.length === 0 && (
                        <div className="inspector__stack-item" style={{ opacity: 0.4, fontStyle: 'italic' }}>
                            No active queries
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
                    <span className="inspector__metric-label">DB Nodes</span>
                    <span className="inspector__metric-value">{dbNodes.length}</span>
                </div>
            </div>
        </div>
    );
}
