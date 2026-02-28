// ========================================
// Mission Panel - System Challenges
// ========================================

import { useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { useStore } from '../../store/simulationStore';
import type { Mission } from '../../engine/types/system.types';
import './MissionPanel.css';

// ---- Mission Definitions ----
import { ALL_MISSIONS } from '../../missions';

export default function MissionPanel() {
    const { snapshot, loadMission, revealHint, showSolution, exitMission, submitSolution } = useStore();
    const { activeMission, missionStatus, revealedHints } = snapshot;
    const [wrongChoiceIndex, setWrongChoiceIndex] = useState<number | null>(null);
    const [correctChoiceIndex, setCorrectChoiceIndex] = useState<number | null>(null);

    // Trigger confetti on success
    useEffect(() => {
        if (missionStatus === 'completed') {
            const duration = 3 * 1000;
            const animationEnd = Date.now() + duration;
            const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

            const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

            const interval: any = setInterval(function () {
                const timeLeft = animationEnd - Date.now();

                if (timeLeft <= 0) {
                    return clearInterval(interval);
                }

                const particleCount = 50 * (timeLeft / duration);
                confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
                confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
            }, 250);

            return () => clearInterval(interval);
        }
    }, [missionStatus]);

    // Reset feedback when mission changes
    useEffect(() => {
        setWrongChoiceIndex(null);
        setCorrectChoiceIndex(null);
    }, [activeMission?.id]);

    const handleSubmit = useCallback((index: number) => {
        if (missionStatus === 'completed') return;

        const isCorrect = submitSolution(index);
        if (isCorrect) {
            setCorrectChoiceIndex(index);
        } else {
            setWrongChoiceIndex(index);
            setTimeout(() => setWrongChoiceIndex(null), 1000);
        }
    }, [submitSolution, missionStatus]);

    // If a mission is active, show mission detail view
    if (activeMission) {
        return (
            <div className="mission-panel">
                <div className="mission-panel__header">
                    <button className="mission-panel__back" onClick={exitMission}>
                        ← Back
                    </button>
                    <span className="mission-panel__status-badge" data-status={missionStatus}>
                        {missionStatus === 'completed' ? '🏁 Solved' : '⚡ Active'}
                    </span>
                </div>

                <div className="mission-panel__briefing">
                    <h3 className="mission-panel__title">{activeMission.title}</h3>
                    <p className="mission-panel__desc">{activeMission.description}</p>
                    <div className="mission-panel__scenario">
                        <span className="mission-panel__scenario-label">Scenario</span>
                        <p>{activeMission.briefing}</p>
                    </div>
                </div>

                <div className="mission-panel__hints">
                    <div className="mission-panel__section-header">
                        <span>Hints</span>
                        <span className="mission-panel__hint-count">
                            {revealedHints}/{activeMission.hints.length}
                        </span>
                    </div>
                    {activeMission.hints.map((hint, i) => (
                        <div
                            key={i}
                            className={`mission-panel__hint ${i < revealedHints ? 'mission-panel__hint--revealed' : ''}`}
                        >
                            {i < revealedHints ? (
                                <>
                                    <span className="mission-panel__hint-num">{i + 1}</span>
                                    {hint}
                                </>
                            ) : (
                                <span className="mission-panel__hint-locked">Hint {i + 1} - locked</span>
                            )}
                        </div>
                    ))}
                    {revealedHints < activeMission.hints.length && (
                        <button className="mission-panel__btn mission-panel__btn--hint" onClick={revealHint}>
                            Reveal next hint
                        </button>
                    )}
                </div>

                {missionStatus !== 'completed' && missionStatus !== 'revealed_solution' && (
                    <div className="mission-panel__solver">
                        <div className="mission-panel__section-header">Laboratory - Apply Fix</div>
                        <p className="mission-panel__solver-desc">Based on your diagnosis, which action will resolve this issue?</p>
                        <div className="mission-panel__options">
                            {activeMission.solutionOptions.map((option, i) => (
                                <button
                                    key={i}
                                    className="mission-panel__option-btn"
                                    data-status={correctChoiceIndex === i ? 'correct' : (wrongChoiceIndex === i ? 'wrong' : '')}
                                    onClick={() => handleSubmit(i)}
                                >
                                    <span className="mission-panel__option-index">{String.fromCharCode(65 + i)}</span>
                                    <span className="mission-panel__option-text">{option.label}</span>
                                </button>
                            ))}
                        </div>
                        {wrongChoiceIndex !== null && (
                            <div className="mission-panel__solver-feedback mission-panel__solver-feedback--wrong">
                                ❌ {activeMission.solutionOptions[wrongChoiceIndex].feedback}
                            </div>
                        )}
                    </div>
                )}

                {missionStatus === 'completed' || missionStatus === 'revealed_solution' ? (
                    <div className="mission-panel__solution">
                        <div className="mission-panel__success-banner">
                            <span className="mission-panel__success-icon">
                                {missionStatus === 'completed' ? '🏆' : '💡'}
                            </span>
                            <div className="mission-panel__success-text">
                                <h4>{missionStatus === 'completed' ? 'Challenge Completed!' : 'Solution Revealed'}</h4>
                                <p>{missionStatus === 'completed' ? "You've successfully diagnosed and fixed the issue." : "You decided to skip. Here is what you needed to do."}</p>
                            </div>
                        </div>
                        <div className="mission-panel__section-header">Success Report</div>
                        <div className="mission-panel__solution-block">
                            <div className="mission-panel__solution-row">
                                <span className="mission-panel__solution-label">❌ Root Cause</span>
                                <p>{activeMission.whatWentWrong}</p>
                            </div>
                            <div className="mission-panel__solution-row">
                                <span className="mission-panel__solution-label">✅ Resolution</span>
                                <p>{activeMission.howToFix}</p>
                            </div>
                            <div className="mission-panel__solution-row">
                                <span className="mission-panel__solution-label">📖 Insights</span>
                                <p>{activeMission.successExplanation}</p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <button className="mission-panel__btn mission-panel__btn--solution" onClick={() => showSolution()}>
                        I give up - show solution
                    </button>
                )}
            </div>
        );
    }

    // Mission list view
    return (
        <div className="mission-panel">
            <div className="mission-panel__list-header">
                <h3 className="mission-panel__list-title">System Challenges</h3>
                <p className="mission-panel__list-subtitle">
                    Real debugging scenarios. Inspect, reason, fix.
                </p>
            </div>

            <div className="mission-panel__list">
                {ALL_MISSIONS.map((mission) => (
                    <MissionCard
                        key={mission.id}
                        mission={mission}
                        onStart={() => loadMission(mission)}
                    />
                ))}
            </div>
        </div>
    );
}

function MissionCard({ mission, onStart }: { mission: Mission; onStart: () => void }) {
    return (
        <div className="mission-card">
            <div className="mission-card__top">
                <span className="mission-card__category">{mission.category}</span>
                <span className="mission-card__difficulty" data-difficulty={mission.difficulty}>
                    {mission.difficulty}
                </span>
            </div>
            <h4 className="mission-card__title">{mission.title}</h4>
            <p className="mission-card__desc">{mission.description}</p>
            <button className="mission-card__start" onClick={onStart}>
                Start challenge →
            </button>
        </div>
    );
}
