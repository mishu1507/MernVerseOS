// ========================================
// Why Mode Overlay - Pause and Explain
// ========================================

import { useState } from 'react';
import { useStore } from '../../store/simulationStore';
import './WhyModeOverlay.css';

export default function WhyModeOverlay() {
    const { snapshot, answerWhyMode, dismissWhyMode } = useStore();
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
    const [feedbackState, setFeedbackState] = useState<'idle' | 'correct' | 'wrong'>('idle');

    const prompt = snapshot.whyModePrompt;
    if (!prompt) return null;

    const handleSelect = (index: number) => {
        if (feedbackState === 'correct') return;
        setSelectedIndex(index);
        const isCorrect = answerWhyMode(index);

        if (isCorrect) {
            setFeedbackState('correct');
            // Auto-dismiss after showing explanation
            setTimeout(() => {
                setSelectedIndex(null);
                setFeedbackState('idle');
                dismissWhyMode();
            }, 3000);
        } else {
            setFeedbackState('wrong');
            // Reset after brief feedback
            setTimeout(() => {
                setSelectedIndex(null);
                setFeedbackState('idle');
            }, 1500);
        }
    };

    const handleSkip = () => {
        setSelectedIndex(null);
        setFeedbackState('idle');
        dismissWhyMode();
    };

    return (
        <div className="why-overlay">
            <div className="why-overlay__card">
                <div className="why-overlay__header">
                    <span className="why-overlay__badge">Why Mode</span>
                    <span className="why-overlay__label">Think before continuing</span>
                </div>

                <p className="why-overlay__question">{prompt.question}</p>

                <div className="why-overlay__options">
                    {prompt.options.map((opt, i) => {
                        let optClass = 'why-overlay__option';
                        if (selectedIndex === i) {
                            optClass += feedbackState === 'correct'
                                ? ' why-overlay__option--correct'
                                : feedbackState === 'wrong'
                                    ? ' why-overlay__option--wrong'
                                    : '';
                        }
                        return (
                            <button
                                key={i}
                                className={optClass}
                                onClick={() => handleSelect(i)}
                                disabled={feedbackState === 'correct'}
                            >
                                <span className="why-overlay__option-marker">
                                    {String.fromCharCode(65 + i)}
                                </span>
                                {opt.label}
                            </button>
                        );
                    })}
                </div>

                {feedbackState === 'correct' && (
                    <div className="why-overlay__explanation">
                        <span className="why-overlay__explanation-icon">✓</span>
                        {prompt.explanation}
                    </div>
                )}

                {feedbackState === 'wrong' && (
                    <div className="why-overlay__feedback-wrong">
                        Not quite - try again.
                    </div>
                )}

                <button className="why-overlay__skip" onClick={handleSkip}>
                    Skip → show explanation
                </button>
            </div>
        </div>
    );
}
