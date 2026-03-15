import React from 'react';
import { useStore } from '../../store/simulationStore';
import '../../components/layout/Inspector.css';

export default function WipInspector() {
    const { snapshot, engine } = useStore();

    // In theory we map active module ID back to the display label if we had it, but snapshot.activeModule holds ID.
    const title = snapshot.activeModule ? snapshot.activeModule.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') : 'Theory Lab';

    const activePackets = snapshot.packets.filter(p => p.status !== 'completed' && p.status !== 'failed');
    const completedPackets = snapshot.packets.filter(p => p.status === 'completed').length;

    React.useEffect(() => {
        if (!snapshot.activeModule || snapshot.nodes.length === 0) return;

        let intervalTime = 3000;

        const interval = setInterval(() => {
            if (engine.getStatus() === 'running') {
                const state = engine.getSnapshot();
                if (state.nodes.length === 0) return;

                // Deterministic mapping to find start and end of current dynamic graph
                const firstNode = state.nodes[0];
                const connections = state.connections.filter(c => c.source === firstNode.id);
                if (connections.length === 0) return;

                // Pick a random connection from the origin
                const firstConn = connections[Math.floor(Math.random() * connections.length)];

                // Generate contextual payloads based on the topology
                let payload = `System Ping`;
                let label = `Telemetry`;

                if (firstNode.id === 'client') {
                    if (firstConn.target === 'react') {
                        // Frontend Topology
                        const events = ['onClick', 'onChange', 'onHover', 'onSubmit'];
                        label = 'DOM Event';
                        payload = events[Math.floor(Math.random() * events.length)];
                        intervalTime = 2000;
                    } else if (firstConn.target === 'lb') {
                        // Global Architecture
                        const reqs = ['GraphQL Query', 'REST GET /api/users', 'WebSocket upgrade', 'CDN Fetch'];
                        label = 'Traffic';
                        payload = reqs[Math.floor(Math.random() * reqs.length)];
                        intervalTime = 1500;
                    }
                } else if (firstNode.id === 'ingress') {
                    // Server Topology
                    const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
                    const routes = ['/users', '/auth/login', '/data', '/settings'];
                    label = 'HTTP Req';
                    payload = `${methods[Math.floor(Math.random() * methods.length)]} ${routes[Math.floor(Math.random() * routes.length)]}`;
                    intervalTime = 2500;
                } else if (firstNode.id === 'server') {
                    // Database Topology
                    const queries = ['db.users.find()', 'db.logs.insertOne()', 'db.sessions.update()', 'db.cache.delete()'];
                    label = 'BSON Query';
                    payload = queries[Math.floor(Math.random() * queries.length)];
                    intervalTime = 3500;
                } else if (firstNode.id === 'v8') {
                    // Runtime Topology
                    const fns = ['fetch() callback', 'renderUI()', 'crypto.hash()', 'fs.readFile()'];
                    label = 'Execution';
                    payload = fns[Math.floor(Math.random() * fns.length)];
                    intervalTime = 1000;
                }

                engine.spawnPacket({
                    protocol: firstConn.protocol,
                    payload,
                    label,
                    sourceNodeId: firstNode.id,
                    targetNodeId: firstConn.target
                });
            }
        }, intervalTime);

        return () => clearInterval(interval);
    }, [engine, snapshot.activeModule]);

    return (
        <div className="inspector__section" style={{ marginTop: '20px' }}>
            <h3 style={{ color: 'var(--text-primary)', marginBottom: '16px', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{title} Metrics</h3>

            <div className="inspector__metric" style={{ marginBottom: '16px' }}>
                <span className="inspector__metric-label">Active Packets</span>
                <span className="inspector__metric-value" style={{ color: 'var(--teal)', fontSize: '18px' }}>{activePackets.length}</span>
            </div>

            {activePackets.map(pkt => {
                const source = snapshot.nodes.find(n => n.id === pkt.sourceNodeId)?.name || pkt.sourceNodeId;
                const target = snapshot.nodes.find(n => n.id === pkt.targetNodeId)?.name || pkt.targetNodeId;
                return (
                    <div key={pkt.id} style={{
                        background: 'var(--bg-card)',
                        padding: '12px',
                        borderRadius: '8px',
                        border: '2px solid var(--border)',
                        marginBottom: '10px'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <span style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text-primary)' }}>{pkt.label || pkt.protocol}</span>
                            <span style={{ fontSize: '10px', color: 'var(--text-tertiary)', background: 'var(--bg-secondary)', padding: '2px 6px', borderRadius: '4px' }}>{Math.round(pkt.progress * 100)}%</span>
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span>{source}</span>
                            <span>→</span>
                            <span style={{ color: 'var(--accent)' }}>{target}</span>
                        </div>
                    </div>
                )
            })}

            <h4 style={{ color: 'var(--teal)', margin: '24px 0 12px 0', fontSize: '12px', textTransform: 'uppercase' }}>Active Interfaces</h4>
            <div className="inspector__stack">
                {snapshot.nodes.map(node => (
                    <div key={node.id} className={`inspector__stack-item ${node.state === 'active' ? 'inspector__stack-item--active' : ''}`}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ fontSize: '16px' }}>{node.icon}</span>
                                <span style={{ fontWeight: 800 }}>{node.name}</span>
                            </div>
                            <span style={{ fontSize: '10px', background: 'rgba(0,0,0,0.2)', padding: '2px 6px', borderRadius: '4px' }}>{node.category}</span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="inspector__metric" style={{ marginTop: '24px' }}>
                <span className="inspector__metric-label">Total Hops Completed</span>
                <span className="inspector__metric-value">{completedPackets}</span>
            </div>
        </div>
    );
}
