import React from 'react';
import { useStore } from '../../store/simulationStore';
import '../../components/layout/Inspector.css';

export default function FullJourneyInspector() {
    const { snapshot } = useStore();

    // Find the packet tracing the journey
    const journeyPackets = snapshot.packets.filter(p => !p.status.includes('failed'));
    const activePacket = journeyPackets.find(p => p.status === 'processing' || p.status === 'pending');

    // Check if React Re-render has been completed by looking at completed packets
    const completedRenders = snapshot.packets.filter(p => p.status === 'completed' && p.currentNodeId === 'react-render').length;

    let currentState = "Awaiting Action...";
    let currentPhase = "Standby";

    if (activePacket) {
        if (['client-ui', 'client-fetch'].includes(activePacket.currentNodeId)) {
            currentState = "Dispatching Request from Browser";
            currentPhase = "Frontend";
        } else if (['gw-ingress', 'express-mid', 'server-controller'].includes(activePacket.currentNodeId)) {
            currentState = "Validating and Routing inside API Layer";
            currentPhase = "Backend API";
        } else if (['db-query', 'db-index'].includes(activePacket.currentNodeId)) {
            currentState = "B-Tree Index hit and Data Retrieval";
            currentPhase = "Database";
        } else if (['react-render'].includes(activePacket.currentNodeId)) {
            currentState = "DOM Reconciliation execution";
            currentPhase = "Re-render";
        }
    } else if (completedRenders > 0) {
        currentState = "UI Updated Successfully!";
        currentPhase = "Complete";
    }

    return (
        <div>
            <div className="inspector__section">
                <div className="inspector__section-title">Telemetry Overview</div>
                <div className="inspector__stack">
                    <div className={`inspector__stack-item ${activePacket ? 'inspector__stack-item--active' : ''}`}>
                        Current Phase: <strong>{currentPhase}</strong>
                    </div>
                </div>
            </div>

            <div className="inspector__section">
                <div className="inspector__section-title">Execution State</div>
                <div className="inspector__metric">
                    <span className="inspector__metric-label">Status</span>
                    <span className="inspector__metric-value" style={{ color: activePacket ? 'var(--teal)' : 'var(--text-tertiary)' }}>
                        {currentState}
                    </span>
                </div>
                <div className="inspector__metric">
                    <span className="inspector__metric-label">Completed Cycles</span>
                    <span className="inspector__metric-value">{completedRenders}</span>
                </div>
            </div>

            <div className="inspector__section">
                <div className="inspector__section-title">Journey Path</div>
                <div className="inspector__queue">
                    <div className="inspector__queue-item" style={{ background: currentPhase === 'Frontend' ? 'var(--accent)' : 'var(--bg-card)', color: currentPhase === 'Frontend' ? '#000' : 'var(--text-primary)' }}>1. Click</div>
                    <div className="inspector__queue-item" style={{ background: currentPhase === 'Backend API' ? 'var(--accent)' : 'var(--bg-card)', color: currentPhase === 'Backend API' ? '#000' : 'var(--text-primary)' }}>2. API</div>
                    <div className="inspector__queue-item" style={{ background: currentPhase === 'Database' ? 'var(--accent)' : 'var(--bg-card)', color: currentPhase === 'Database' ? '#000' : 'var(--text-primary)' }}>3. MongoDB</div>
                    <div className="inspector__queue-item" style={{ background: currentPhase === 'Re-render' || currentPhase === 'Complete' ? 'var(--accent)' : 'var(--bg-card)', color: currentPhase === 'Re-render' || currentPhase === 'Complete' ? '#000' : 'var(--text-primary)' }}>4. UI Update</div>
                </div>
            </div>
        </div>
    );
}
