import { useState } from 'react';
import { useStore } from '../../store/simulationStore';
import type { SystemNode, DataPacket } from '../../engine/types/system.types';
import './SimCanvas.css';

function getNodeById(nodes: SystemNode[], id: string): SystemNode | undefined {
    return nodes.find(n => n.id === id);
}

function getProtocolClass(protocol: string): string {
    switch (protocol) {
        case 'db-query': return 'db';
        case 'websocket': return 'ws';
        case 'queue': return 'queue';
        default: return 'http';
    }
}

export default function SimCanvas() {
    const { snapshot } = useStore();
    const { nodes, connections, packets, status } = snapshot;
    const isRunning = status === 'running';

    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

    const handleMouseDown = (e: React.MouseEvent) => {
        if (e.button !== 0) return; // Only left click
        setIsDragging(true);
        setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging) return;
        setPan({
            x: e.clientX - dragStart.x,
            y: e.clientY - dragStart.y
        });
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleWheel = (e: React.WheelEvent) => {
        setPan(prev => ({
            x: prev.x - e.deltaX,
            y: prev.y - e.deltaY
        }));
    };

    if (!nodes.length) {
        return (
            <div className="sim-canvas">
                <div className="sim-canvas__grid" />
                <div className="sim-canvas__empty">
                    <div className="sim-canvas__empty-icon">⬡</div>
                    <div className="sim-canvas__empty-title">No Simulation Loaded</div>
                    <div className="sim-canvas__empty-sub">
                        Select a concept module from the sidebar to begin a simulation.
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div
            className={`sim-canvas ${isDragging ? 'is-dragging' : ''}`}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={handleWheel}
        >
            <div
                className="sim-canvas__grid"
                style={{ backgroundPosition: `${pan.x}px ${pan.y}px` }}
            />

            <div className="sim-canvas__viewport" style={{ transform: `translate(${pan.x}px, ${pan.y}px)` }}>
                {/* SVG connections */}
                <svg className="sim-canvas__svg">
                    {connections.map(conn => {
                        const src = getNodeById(nodes, conn.source);
                        const tgt = getNodeById(nodes, conn.target);
                        if (!src || !tgt) return null;
                        const x1 = src.position.x + 36;
                        const y1 = src.position.y + 36;
                        const x2 = tgt.position.x + 36;
                        const y2 = tgt.position.y + 36;
                        const hasActivePacket = packets.some(
                            (p: DataPacket) => p.sourceNodeId === conn.source && p.targetNodeId === conn.target && p.status === 'processing'
                        );
                        const mx = (x1 + x2) / 2;
                        const my = (y1 + y2) / 2;
                        return (
                            <g key={conn.id}>
                                <line
                                    className={`connection-line ${hasActivePacket ? 'connection-line--active' : ''} ${isRunning ? 'connection-line--running' : ''}`}
                                    x1={x1} y1={y1} x2={x2} y2={y2}
                                />
                                <text className="connection-label" x={mx} y={my - 6} textAnchor="middle">
                                    {conn.protocol}
                                </text>
                            </g>
                        );
                    })}
                </svg>

                {/* Nodes & Packets */}
                <div className="sim-canvas__content">
                    {nodes.map((node: SystemNode) => (
                        <div
                            key={node.id}
                            className={`system-node system-node--${node.category} ${node.state === 'active' ? 'system-node--active' : ''} ${node.state === 'blocked' ? 'system-node--blocked' : ''}`}
                            style={{ left: node.position.x, top: node.position.y }}
                        >
                            <div className="system-node__box">{node.icon}</div>
                            <div className="system-node__label">{node.name}</div>
                        </div>
                    ))}

                    {/* Packets */}
                    {packets.map((pkt: DataPacket) => {
                        if (pkt.status === 'completed' || pkt.status === 'failed') return null;
                        const src = getNodeById(nodes, pkt.sourceNodeId);
                        const tgt = getNodeById(nodes, pkt.targetNodeId);
                        if (!src || !tgt) return null;
                        const x = src.position.x + 36 + (tgt.position.x - src.position.x) * pkt.progress - 7;
                        const y = src.position.y + 36 + (tgt.position.y - src.position.y) * pkt.progress - 7;
                        return (
                            <div
                                key={pkt.id}
                                className={`packet-dot packet-dot--${getProtocolClass(pkt.protocol)}`}
                                style={{ left: x, top: y }}
                            >
                                {pkt.label && <span className="packet-dot__label">{pkt.label}</span>}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
