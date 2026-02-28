// ========================================
// React Store - Bridge between engine and React
// Includes Why Mode + Mission Mode actions
// ========================================

import { useState, useEffect, useCallback, useRef, createContext, useContext } from "react";
import type { ReactNode } from "react";
import { SimulationEngine } from "../engine/runtime/simulationEngine";
import type { SimulationSnapshot, ModuleConfig, Mission } from "../engine/types/system.types";

// ---- Singleton Engine Instance ----
const engine = new SimulationEngine();

// ---- React Hook: subscribe to engine snapshots ----

export function useSimulationStore() {
    const [snapshot, setSnapshot] = useState<SimulationSnapshot>(engine.getSnapshot());
    const rafRef = useRef<number | null>(null);

    // Subscribe to engine notifications
    useEffect(() => {
        const unsubscribe = engine.subscribe((snap) => {
            setSnapshot(snap);
        });
        return unsubscribe;
    }, []);

    // Animation loop: when running, tick the engine at ~60fps
    useEffect(() => {
        if (snapshot.status === "running") {
            const loop = () => {
                engine.advanceTick();
                setSnapshot(engine.getSnapshot());
                rafRef.current = requestAnimationFrame(loop);
            };
            rafRef.current = requestAnimationFrame(loop);
        } else {
            if (rafRef.current !== null) {
                cancelAnimationFrame(rafRef.current);
                rafRef.current = null;
            }
        }
        return () => {
            if (rafRef.current !== null) {
                cancelAnimationFrame(rafRef.current);
            }
        };
    }, [snapshot.status]);

    // ---- Standard Actions ----
    const play = useCallback(() => engine.play(), []);
    const pause = useCallback(() => engine.pause(), []);
    const step = useCallback(() => engine.step(), []);
    const reset = useCallback(() => engine.reset(), []);
    const setSpeed = useCallback((s: number) => engine.setSpeed(s), []);
    const loadModule = useCallback((config: ModuleConfig) => engine.loadModule(config), []);

    // ---- Why Mode Actions ----
    const toggleWhyMode = useCallback(() => engine.toggleWhyMode(), []);
    const answerWhyMode = useCallback((index: number) => engine.answerWhyMode(index), []);
    const dismissWhyMode = useCallback(() => engine.dismissWhyMode(), []);

    // ---- Mission Mode Actions ----
    const loadMission = useCallback((mission: Mission) => engine.loadMission(mission), []);
    const revealHint = useCallback(() => engine.revealHint(), []);
    const showSolution = useCallback(() => engine.showSolution(), []);
    const exitMission = useCallback(() => engine.exitMission(), []);
    const submitSolution = useCallback((index: number) => engine.submitSolution(index), []);

    return {
        snapshot,
        engine,
        play,
        pause,
        step,
        reset,
        setSpeed,
        loadModule,
        // Why Mode
        toggleWhyMode,
        answerWhyMode,
        dismissWhyMode,
        // Mission Mode
        loadMission,
        revealHint,
        showSolution,
        exitMission,
        submitSolution,
    };
}

// ---- Context Provider ----

interface StoreContextValue {
    snapshot: SimulationSnapshot;
    engine: SimulationEngine;
    play: () => void;
    pause: () => void;
    step: () => void;
    reset: () => void;
    setSpeed: (s: number) => void;
    loadModule: (config: ModuleConfig) => void;
    // Why Mode
    toggleWhyMode: () => void;
    answerWhyMode: (index: number) => boolean;
    dismissWhyMode: () => void;
    // Mission Mode
    loadMission: (mission: Mission) => void;
    revealHint: () => string | null;
    showSolution: () => void;
    exitMission: () => void;
    submitSolution: (index: number) => boolean;
}

const StoreContext = createContext<StoreContextValue | null>(null);

export function SimulationProvider({ children }: { children: ReactNode }) {
    const store = useSimulationStore();
    return (
        <StoreContext.Provider value={store}>
            {children}
        </StoreContext.Provider>
    );
}

export function useStore(): StoreContextValue {
    const ctx = useContext(StoreContext);
    if (!ctx) throw new Error("useStore must be used within SimulationProvider");
    return ctx;
}
