import { useState, useEffect } from 'react';
import './TutorialLanding.css';

interface TutorialLandingProps {
    onStart: () => void;
}

export default function TutorialLanding({ onStart }: TutorialLandingProps) {
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [showTutorial, setShowTutorial] = useState(false);
    const [step, setStep] = useState(0);

    const tutorialSteps = [
        {
            title: "Concept Modules",
            content: "The Sidebar contains interactive modules covering Runtime (Event Loop), Servers, Databases, and Architecture. Each 'Concept Module' explores a specific engineering topic.",
            icon: "📚"
        },
        {
            title: "System Graph Canvas",
            content: "The center stage visualizes the architecture. Watch Data Packets travel between nodes (like Client to API Gateway) in real-time. Understand latency and async behavior visually.",
            icon: "🕸️"
        },
        {
            title: "Interactive Inspector",
            content: "The Right Panel displays live telemetry and 'Hard Parts' theory. It has two tabs: 'Specs' for real-time stats, and 'Story' for conceptual analogies.",
            icon: "🔬"
        },
        {
            title: "Event Logger & Controls",
            content: "The Bottom Panel logs every system event chronologically. Use the Top Navigation to Pause, Play, adjust Speed, or enter 'Why Mode' to test your knowledge.",
            icon: "🎛️"
        },
        {
            title: "System Challenges",
            content: "Bored of theory? Click 'System Challenges' in the sidebar to enter Mission Mode. You'll be given broken architectures with massive bottlenecks and tasked with repairing them.",
            icon: "🎯"
        }
    ];

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setMousePos({
                x: (e.clientX / window.innerWidth - 0.5) * 20,
                y: (e.clientY / window.innerHeight - 0.5) * 20
            });
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    const nextTutorialStep = () => {
        if (step < tutorialSteps.length - 1) {
            setStep(s => s + 1);
        } else {
            onStart();
        }
    };

    return (
        <div className="landing-viewport">
            <div className="landing-background">
                <div className="landing-grid"></div>
                <div className="landing-glow" style={{ transform: `translate(${mousePos.x * 2}px, ${mousePos.y * 2}px)` }}></div>
            </div>

            {!showTutorial ? (
                <div className="landing-hero" style={{ transform: `perspective(1000px) rotateX(${mousePos.y * -1}deg) rotateY(${mousePos.x}deg)` }}>
                    <div className="landing-logo-container">
                        <div className="landing-logo-mark">M</div>
                        <h1 className="landing-title">
                            <span className="text-gradient">ernVerse</span> <span className="os-badge">OS</span>
                        </h1>
                    </div>

                    <p className="landing-subtitle">
                        The Interactive Engineering Simulation Environment
                    </p>

                    <div className="landing-features">
                        <div className="feature-pill">
                            <span className="feature-icon">⚡</span>
                            Live Tracing
                        </div>
                        <div className="feature-pill">
                            <span className="feature-icon">🧠</span>
                            Architecture Theory
                        </div>
                        <div className="feature-pill">
                            <span className="feature-icon">🎯</span>
                            System Challenges
                        </div>
                    </div>

                    <div className="landing-actions">
                        <button className="landing-enter-btn" onClick={() => setShowTutorial(true)}>
                            <span className="btn-text">INITIALIZE SYSTEM</span>
                            <span className="btn-icon">→</span>
                        </button>
                    </div>
                </div>
            ) : (
                <div className="tutorial-modal-wrapper">
                    <div className="tutorial-modal">
                        <div className="tutorial-modal-header">
                            <div className="tutorial-modal-icon">{tutorialSteps[step].icon}</div>
                            <h2>{tutorialSteps[step].title}</h2>
                            <p>{tutorialSteps[step].content}</p>
                        </div>
                        <div className="tutorial-modal-footer">
                            <div className="tutorial-dots">
                                {tutorialSteps.map((_, i) => (
                                    <div key={i} className={`tutorial-dot ${i === step ? 'active' : ''}`} />
                                ))}
                            </div>
                            <div className="tutorial-modal-controls">
                                <button className="tutorial-skip" onClick={onStart}>Skip</button>
                                <button className="tutorial-next-btn" onClick={nextTutorialStep}>
                                    {step === tutorialSteps.length - 1 ? "Start Exploring" : "Next"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="landing-footer-hint">
                <div className="landing-footer-copy">© 2026 Aditi Borkar</div>
                <div className="landing-footer-links">
                    <a href="https://www.linkedin.com/in/mishuborkar-csa152006/" target="_blank" rel="noreferrer">LinkedIn</a>
                    <span>•</span>
                    <a href="mailto:aditi.borkar1507@gmail.com">Contact</a>
                </div>
            </div>
        </div>
    );
}
