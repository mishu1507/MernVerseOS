import { useStore } from "../../store/simulationStore";
import "./IntroInspector.css";

export default function IntroInspector() {
    const { snapshot } = useStore();
    const activePackets = snapshot.packets.filter(p => p.status !== "completed" && p.status !== "failed");
    const completedPackets = snapshot.packets.filter(p => p.status === "completed").length;

    return (
        <div className="inspector-panel">
            <div className="inspector-header">
                <h3>Introduction to the Stack</h3>
                <div className="inspector-badges">
                    <span className="badge badge-blue">MERN / MEAN</span>
                    <span className="badge badge-gray">{activePackets.length} Active Requests</span>
                </div>
            </div>

            <div className="inspector-section">
                <h4>What is the Stack?</h4>
                <p className="inspector-text">
                    Modern web applications are built using a "stack" of technologies that handle different parts of the application.
                    The most common stacks for JavaScript developers are MERN (MongoDB, Express, React, Node.js) and MEAN (MongoDB, Express, Angular, Node.js).
                </p>
            </div>

            <div className="inspector-section">
                <h4>System Concepts</h4>
                <div className="concept-list">
                    <div className="concept-item">
                        <span className="concept-icon">💻</span>
                        <div className="concept-content">
                            <h5>Client (Frontend)</h5>
                            <p>React, Angular, or Vue. Runs in the user's browser. Responsible for UI, state management, and user interaction.</p>
                        </div>
                    </div>
                    <div className="concept-item">
                        <span className="concept-icon">⚙️</span>
                        <div className="concept-content">
                            <h5>Server (Backend)</h5>
                            <p>Node.js running Express. Responsible for business logic, authentication, routing, and communicating with the database.</p>
                        </div>
                    </div>
                    <div className="concept-item">
                        <span className="concept-icon">🍃</span>
                        <div className="concept-content">
                            <h5>Database</h5>
                            <p>MongoDB. A NoSQL database that stores data in flexible, JSON-like documents rather than rigid tables.</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="inspector-section">
                <h4>Live Telemetry</h4>
                <div className="metrics-grid">
                    <div className="metric-box">
                        <span className="metric-label">Completed Requests</span>
                        <span className="metric-value">{completedPackets}</span>
                    </div>
                    <div className="metric-box box-active">
                        <span className="metric-label">In Flight</span>
                        <span className="metric-value">{activePackets.length}</span>
                    </div>
                </div>
            </div>

            <div className="inspector-section">
                <h4>The Data Flow</h4>
                <p className="inspector-text">
                    Watch as the HTTP Request travels from the Client, through the Gateway, to the Server. The Server then translates this into a Database Query (BSON format), retrieves the data, and returns it as JSON to the Client.
                </p>
            </div>

        </div>
    );
}
