import { useStore } from '../../store/simulationStore';
import '../../components/layout/Inspector.css';

export default function GraphQLInspector() {
    const { snapshot } = useStore();

    const middlewareNodes = snapshot.nodes.filter(n => n.category === 'middleware');
    const activePackets = snapshot.packets.filter(p => p.status === 'pending' || p.status === 'processing');
    const dataloaderNode = snapshot.nodes.find(n => n.id === 'dataloader');

    return (
        <div>
            <div className="inspector__section">
                <div className="inspector__section-title">Query Pipeline</div>
                <div className="inspector__stack">
                    {snapshot.nodes.map((node, i) => (
                        <div key={node.id} className={`inspector__stack-item ${node.state === 'active' ? 'inspector__stack-item--active' : ''}`}>
                            {i + 1}. {node.icon} {node.name}
                        </div>
                    ))}
                </div>
            </div>

            <div className="inspector__section">
                <div className="inspector__section-title">Resolvers</div>
                <div className="inspector__queue">
                    {middlewareNodes.map(node => (
                        <div key={node.id} className="inspector__queue-item">
                            {node.icon} {node.name}
                        </div>
                    ))}
                </div>
            </div>

            <div className="inspector__section">
                <div className="inspector__section-title">Active Queries</div>
                <div className="inspector__stack">
                    {activePackets.map(pkt => (
                        <div key={pkt.id} className="inspector__stack-item inspector__stack-item--active">
                            {pkt.label} - {Math.round(pkt.progress * 100)}%
                        </div>
                    ))}
                    {activePackets.length === 0 && (
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
                {dataloaderNode && (
                    <div className="inspector__metric">
                        <span className="inspector__metric-label">Batching</span>
                        <span className={`inspector__metric-value ${dataloaderNode.metadata.batching ? 'text-success' : 'text-error'}`}>
                            {dataloaderNode.metadata.batching ? 'Active' : 'Disabled'}
                        </span>
                    </div>
                )}
                <div className="inspector__metric">
                    <span className="inspector__metric-label">Protocol</span>
                    <span className="inspector__metric-value">GraphQL</span>
                </div>
            </div>
        </div>
    );
}
