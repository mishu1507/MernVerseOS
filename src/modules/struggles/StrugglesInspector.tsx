import { useStore } from "../../store/simulationStore";

export default function StrugglesInspector() {
    const { snapshot } = useStore();

    return (
        <div className="inspector-panel">
            <div className="inspector-header">
                <h3>MEARN Struggles</h3>
                <div className="inspector-badges">
                    <span className="badge badge-warning">Caution</span>
                </div>
            </div>

            <div className="inspector-section">
                <h4>The Hard Parts</h4>
                <p className="inspector-text">
                    Learning a full-stack architecture is rarely a smooth path. Most developers hit these major roadblocks. Click on the nodes in the graph to understand the root cause and the engineering solution for each struggle.
                </p>
            </div>

            <div className="inspector-section">
                <h4>Top Bottlenecks</h4>
                <div className="concept-list">
                    <div className="concept-item">
                        <span className="concept-icon">🚫</span>
                        <div className="concept-content">
                            <h5>CORS Restrictions</h5>
                            <p>Port mismatch between frontend and backend.</p>
                        </div>
                    </div>
                    <div className="concept-item">
                        <span className="concept-icon">⏳</span>
                        <div className="concept-content">
                            <h5>Async Execution</h5>
                            <p>Returning data before the DB finishes querying.</p>
                        </div>
                    </div>
                    <div className="concept-item">
                        <span className="concept-icon">⚛️</span>
                        <div className="concept-content">
                            <h5>Infinite Re-renders</h5>
                            <p>Modifying state during the wrong lifecycle phases.</p>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
}
