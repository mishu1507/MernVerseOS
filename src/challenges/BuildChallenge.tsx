import React, { useState, useRef, useCallback, useEffect } from 'react';
import confetti from 'canvas-confetti';
import type { ChallengeDefinition, ChallengeState, SlotId, ElementId } from './challenge.types';
import { ALL_BUILD_CHALLENGES } from './challengeDefinitions';
import './BuildChallenge.css';

/* ── helpers ── */
function makeInitialState(challenge: ChallengeDefinition): ChallengeState {
  const placed: Record<SlotId, ElementId | null> = {};
  challenge.slots.forEach(s => { placed[s.id] = null; });
  return { placedElements: placed, status: 'idle', errorSlots: [], errorMessage: '', attemptCount: 0 };
}

function countFilled(state: ChallengeState): number {
  return Object.values(state.placedElements).filter(Boolean).length;
}

/* ─────────── Challenge Game Board ─────────── */
function ChallengBoard({ challenge, onBack }: { challenge: ChallengeDefinition; onBack: () => void }) {
  const [state, setState] = useState<ChallengeState>(() => makeInitialState(challenge));
  const [dragging, setDragging] = useState<ElementId | null>(null);
  const [dragOverSlot, setDragOverSlot] = useState<SlotId | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  // reset when challenge changes
  useEffect(() => { setState(makeInitialState(challenge)); }, [challenge.id]);

  /* drag handlers */
  const onDragStart = useCallback((e: React.DragEvent, elId: ElementId) => {
    e.dataTransfer.setData('elementId', elId);
    e.dataTransfer.effectAllowed = 'move';
    setDragging(elId);
  }, []);

  const onDragEnd = useCallback(() => { setDragging(null); }, []);

  const onSlotDragOver = useCallback((e: React.DragEvent, slotId: SlotId) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverSlot(slotId);
  }, []);

  const onSlotDragLeave = useCallback(() => { setDragOverSlot(null); }, []);

  const onSlotDrop = useCallback((e: React.DragEvent, slotId: SlotId) => {
    e.preventDefault();
    const elId = e.dataTransfer.getData('elementId') as ElementId;
    if (!elId) return;
    setDragOverSlot(null);
    setState(prev => {
      // if element already placed somewhere, remove it
      const updated = { ...prev.placedElements };
      Object.keys(updated).forEach(k => { if (updated[k] === elId) updated[k] = null; });
      updated[slotId] = elId;
      return { ...prev, placedElements: updated, status: 'idle', errorSlots: [], errorMessage: '' };
    });
  }, []);

  /* click slot to remove placed element */
  const onSlotClick = useCallback((slotId: SlotId) => {
    setState(prev => {
      if (!prev.placedElements[slotId]) return prev;
      const updated = { ...prev.placedElements, [slotId]: null };
      return { ...prev, placedElements: updated, status: 'idle', errorSlots: [], errorMessage: '' };
    });
  }, []);

  /* ── RUN ── */
  const handleRun = useCallback(() => {
    setState(prev => ({ ...prev, status: 'running' }));

    setTimeout(() => {
      const errorSlots: SlotId[] = [];
      challenge.slots.forEach(slot => {
        const placed = state.placedElements[slot.id];
        if (!placed || placed !== slot.correctElementId) {
          errorSlots.push(slot.id);
        }
      });

      if (errorSlots.length === 0) {
        // success!
        setState(prev => ({ ...prev, status: 'success', errorSlots: [], attemptCount: prev.attemptCount + 1 }));
        confetti({ particleCount: 120, spread: 90, origin: { y: 0.6 }, colors: ['#FFD32A','#00B894','#74B9FF'] });
      } else {
        const firstError = errorSlots[0];
        const msg = challenge.errorMessages[firstError] || '❌ Something is wrong here. Check the hint and try again.';
        setState(prev => ({ ...prev, status: 'error', errorSlots, errorMessage: msg, attemptCount: prev.attemptCount + 1 }));
      }
    }, 800); // simulate "running" delay
  }, [challenge, state.placedElements]);

  /* reset */
  const handleReset = useCallback(() => {
    setState(makeInitialState(challenge));
  }, [challenge]);

  const filledCount = countFilled(state);
  const allFilled   = filledCount === challenge.slots.length;
  const usedElements = new Set(Object.values(state.placedElements).filter(Boolean) as ElementId[]);

  /* find placed element object */
  const getElement = (id: ElementId | null) =>
    id ? challenge.availableElements.find(e => e.id === id) ?? null : null;

  /* slot center positions for SVG lines */
  const slotCenter = (slot: { x: number; y: number }) => ({ cx: slot.x, cy: slot.y });

  return (
    <div className="build-challenge">
      {/* Header */}
      <div className="bc-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button className="bc-btn bc-btn--back" onClick={onBack}>← Back</button>
          <span className="bc-header__title">{challenge.title}</span>
        </div>
        <div className="bc-header__meta">
          <span className={`bc-badge bc-badge--${challenge.difficulty}`}>{challenge.difficulty}</span>
          <span className="bc-badge" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>
            {filledCount}/{challenge.slots.length} placed
          </span>
        </div>
        <div className="bc-header__actions">
          <button className="bc-btn bc-btn--reset" onClick={handleReset}>↺ Reset</button>
          <button className="bc-btn bc-btn--run" onClick={handleRun}
            disabled={!allFilled || state.status === 'running'}>
            {state.status === 'running' ? '⚡ Running...' : '▶ Run System'}
          </button>
        </div>
      </div>

      {/* Briefing */}
      <div className="bc-briefing">
        <strong>Problem: </strong>{challenge.briefing}
      </div>

      {/* Game area */}
      <div className="bc-game">

        {/* Diagram canvas */}
        <div className="bc-canvas" ref={canvasRef}>
          <span className="bc-canvas__label">{challenge.systemLabel}</span>

          <div className="bc-canvas__inner">
            {/* SVG connections */}
            <svg className="bc-canvas__svg">
              {challenge.connections.map(conn => {
                const fromSlot = challenge.slots.find(s => s.id === conn.fromSlotId);
                const toSlot   = challenge.slots.find(s => s.id === conn.toSlotId);
                if (!fromSlot || !toSlot) return null;
                const { cx: x1, cy: y1 } = slotCenter(fromSlot);
                const { cx: x2, cy: y2 } = slotCenter(toSlot);
                const mx = (x1 + x2) / 2;
                const my = (y1 + y2) / 2;
                const isSolved = state.status === 'success';
                const isError  = state.status === 'error' &&
                  (state.errorSlots.includes(conn.fromSlotId) || state.errorSlots.includes(conn.toSlotId));
                return (
                  <g key={conn.id}>
                    <line
                      x1={x1} y1={y1} x2={x2} y2={y2}
                      className={`bc-connection ${isSolved ? 'bc-connection--solved' : ''} ${isError ? 'bc-connection--error' : ''}`}
                    />
                    <text className="bc-connection-label" x={mx} y={my - 6} textAnchor="middle">
                      {conn.label}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Slots */}
            {challenge.slots.map((slot, i) => {
              const placed  = getElement(state.placedElements[slot.id]);
              const isError = state.errorSlots.includes(slot.id);
              const isCorrect = state.status === 'success';
              const isDragHover = dragOverSlot === slot.id;

              return (
                <div
                  key={slot.id}
                  className="bc-slot"
                  style={{ left: slot.x, top: slot.y }}
                  onDragOver={e => onSlotDragOver(e, slot.id)}
                  onDragLeave={onSlotDragLeave}
                  onDrop={e => onSlotDrop(e, slot.id)}
                  onClick={() => onSlotClick(slot.id)}
                >
                  {/* Error tooltip */}
                  {isError && state.errorMessage && state.errorSlots[0] === slot.id && (
                    <div className="bc-error-tooltip">{state.errorMessage}</div>
                  )}

                  <div
                    className={[
                      'bc-slot__box',
                      !placed ? 'bc-slot__box--empty' : 'bc-slot__box--filled',
                      isError   ? 'bc-slot__box--error'   : '',
                      isCorrect ? 'bc-slot__box--correct'  : '',
                      isDragHover ? 'bc-slot__box--drag-over' : '',
                    ].join(' ')}
                    style={placed ? { background: placed.color + '22', borderColor: 'var(--border)' } : {}}
                  >
                    <span className="bc-slot__number">{i + 1}</span>
                    {placed ? (
                      <span style={{ fontSize: 28 }}>{placed.icon}</span>
                    ) : (
                      <span style={{ fontSize: 22, opacity: 0.2 }}>?</span>
                    )}
                  </div>

                  {placed ? (
                    <div className="bc-slot__label">{placed.label}</div>
                  ) : (
                    <div className="bc-slot__hint">{slot.hint}</div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Success overlay */}
          {state.status === 'success' && (
            <div className="bc-success-overlay">
              <div className="bc-success-card">
                <div className="bc-success-card__emoji">🎉</div>
                <div className="bc-success-card__title">{challenge.successStory.title}</div>
                <div className="bc-success-card__content">{challenge.successStory.content}</div>
                <div className="bc-success-card__analogy">💡 {challenge.successStory.analogy}</div>
                <div className="bc-success-card__attempts">
                  Solved in {state.attemptCount} {state.attemptCount === 1 ? 'attempt' : 'attempts'}
                </div>
                <div className="bc-success-card__actions">
                  <button className="bc-btn bc-btn--reset" onClick={handleReset}>Try Again</button>
                  <button className="bc-btn bc-btn--back" onClick={onBack}>← All Challenges</button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Tool Palette */}
        <div className="bc-palette">
          <div className="bc-palette__header">🧰 Elements</div>
          <div className="bc-palette__list">
            {challenge.availableElements.map(el => {
              const isUsed = usedElements.has(el.id);
              return (
                <div
                  key={el.id}
                  className={`bc-element ${isUsed ? 'bc-element--used' : ''} ${dragging === el.id ? 'bc-element--dragging' : ''}`}
                  draggable={!isUsed}
                  onDragStart={e => onDragStart(e, el.id)}
                  onDragEnd={onDragEnd}
                >
                  <div className="bc-element__icon" style={{ background: el.color + '22', borderColor: 'var(--border)' }}>
                    {el.icon}
                  </div>
                  <div className="bc-element__info">
                    <div className="bc-element__label">{el.label}</div>
                    <div className="bc-element__desc">{el.description}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Status bar */}
      <div className={`bc-status bc-status--${state.status}`}>
        <div className="bc-status__dot" />
        {state.status === 'idle'    && `Place elements in all ${challenge.slots.length} slots then click Run`}
        {state.status === 'running' && 'Validating your solution...'}
        {state.status === 'error'   && `${state.errorSlots.length} error${state.errorSlots.length > 1 ? 's' : ''} found — check the highlighted slots`}
        {state.status === 'success' && '✓ System is working correctly!'}
        {!allFilled && state.status === 'idle' && ` (${challenge.slots.length - filledCount} remaining)`}
      </div>
    </div>
  );
}

/* ─────────── Challenge List ─────────── */
export default function BuildChallenge() {
  const [activeChallenge, setActiveChallenge] = useState<ChallengeDefinition | null>(null);
  const [solvedIds, _setSolvedIds] = useState<Set<string>>(new Set());

  if (activeChallenge) {
    return (
      <ChallengBoard
        challenge={activeChallenge}
        onBack={() => setActiveChallenge(null)}
      />
    );
  }

  return (
    <div className="bc-list">
      <div className="bc-list__header">
        <div className="bc-list__title">⚙️ Build Challenges</div>
        <div className="bc-list__subtitle">Drag elements to fix broken systems. Run to validate.</div>
      </div>

      {ALL_BUILD_CHALLENGES.map(challenge => (
        <div
          key={challenge.id}
          className={`bc-card ${solvedIds.has(challenge.id) ? 'bc-card--solved' : ''}`}
          onClick={() => setActiveChallenge(challenge)}
        >
          <div className="bc-card__top">
            <span className="bc-card__category">{challenge.category}</span>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              {solvedIds.has(challenge.id) && (
                <span className="bc-card__solved-badge">✓ Solved</span>
              )}
              <span className={`bc-badge bc-badge--${challenge.difficulty}`}>{challenge.difficulty}</span>
            </div>
          </div>
          <div className="bc-card__title">{challenge.title}</div>
          <div className="bc-card__desc">{challenge.briefing.substring(0, 100)}...</div>
          <div className="bc-card__footer">
            <button className="bc-card__cta">
              {solvedIds.has(challenge.id) ? 'Play again →' : 'Start challenge →'}
            </button>
            <span style={{ fontSize: 10, color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>
              {challenge.slots.length} slots
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
