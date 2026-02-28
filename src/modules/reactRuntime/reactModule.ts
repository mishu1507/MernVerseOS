// ========================================
// React Module - Level 3 Engineering Depth
// Fiber architecture, scheduler/lanes, render/commit phases, effects
// ========================================

import type { ModuleConfig, SystemNode, Connection } from "../../engine/types/system.types";

const nodes: SystemNode[] = [
    {
        id: "state-trigger",
        name: "State Update Trigger",
        icon: "📝",
        category: "client",
        runtime: "reactive",
        position: { x: 60, y: 200 },
        state: "idle",
        metadata: { sources: "useState setter, setState, context change, parent re-render, forceUpdate" },
        explanation: "What: A component re-render is triggered by: (1) calling a useState setter or setState, (2) context value changing, (3) parent component re-rendering, or (4) forceUpdate(). Note: changing props alone does NOT trigger a re-render - it's the PARENT's re-render that does. Why: React is declarative - when state changes, the UI must reflect the new state. The trigger creates an 'update object' describing what changed. Breaks when: You mutate state directly (this.state.x = 5) instead of using setState - React doesn't detect the change, so no re-render happens. Also: setState inside useEffect without a dependency guard creates infinite render loops.",
    },
    {
        id: "update-queue",
        name: "Update Queue",
        icon: "📋",
        category: "queue",
        runtime: "reactive",
        position: { x: 200, y: 80 },
        state: "idle",
        metadata: { batching: "React 18: ALL updates batched", react17: "only event handlers batched" },
        explanation: "What: Multiple state updates are queued and batched into a SINGLE re-render. In React 18, ALL updates are batched (including setTimeout, promises, native events). React 17 only batched updates inside event handlers. Why: Without batching, setState({a: 1}); setState({b: 2}); would cause TWO re-renders. Batching collapses them into one. This is a major performance optimization. Breaks when: You rely on state being updated immediately after setState. State updates are ASYNCHRONOUS - reading state right after setState gives the OLD value. Use the functional form setState(prev => prev + 1) for updates based on previous state.",
    },
    {
        id: "scheduler",
        name: "Scheduler",
        icon: "⏱️",
        category: "service",
        runtime: "reactive",
        position: { x: 200, y: 320 },
        state: "idle",
        metadata: { lanes: "SyncLane, InputContinuousLane, DefaultLane, TransitionLane, IdleLane" },
        explanation: "What: React's scheduler assigns PRIORITY LANES to updates. Typing in an input = SyncLane (highest priority). Data fetching = DefaultLane. useTransition = TransitionLane (lower priority, interruptible). Why: Not all updates are equal. A user typing must feel instant (16ms). A search result updating can wait. The scheduler ensures high-priority work preempts low-priority work. Breaks when: All work is SyncLane (default in React 17) - a heavy render blocks the main thread. Use useTransition() or useDeferredValue() for expensive computations.",
    },
    {
        id: "render-begin",
        name: "Render Phase (begin)",
        icon: "🔄",
        category: "service",
        runtime: "reactive",
        position: { x: 380, y: 80 },
        state: "idle",
        metadata: { purity: "MUST be pure - no side effects", interruptible: true },
        explanation: "What: React calls your component function to produce JSX (React elements). This is the 'render' - converting state+props into a UI description. In class components, this is the render() method. In function components, it's the function body. Why: React renders create a DESCRIPTION of the UI (virtual DOM), not the actual DOM. This is why render must be pure - React may call it multiple times (StrictMode), pause it (Concurrent), or discard it. Breaks when: You put side effects in the render body: fetch calls, DOM mutations, subscriptions. These belong in useEffect. StrictMode's double-render in dev exposes this - if your component breaks in StrictMode, you have impure renders.",
    },
    {
        id: "fiber-walk",
        name: "Fiber Tree Walk",
        icon: "🌲",
        category: "service",
        runtime: "reactive",
        position: { x: 380, y: 200 },
        state: "idle",
        metadata: { algorithm: "DFS via child/sibling/return pointers", interruptible: "yes, via time slicing" },
        explanation: "What: React Fiber replaces the old recursive reconciler with an iterative, interruptible tree walk. Each component is a Fiber node with child, sibling, and return pointers. React processes one fiber at a time and can PAUSE between fibers. Why: The old reconciler was synchronous and recursive - a 10,000-component tree would block the main thread for 100ms+. Fiber breaks work into small units, yielding to the browser between frames. Breaks when: You have extremely deep component trees (1000+ levels deep). Each level adds a fiber node. While interruptible, the initial walk still has O(n) work. Use lazy loading and virtualization.",
    },
    {
        id: "bailout-check",
        name: "Bailout Check",
        icon: "🛑",
        category: "middleware",
        runtime: "reactive",
        position: { x: 380, y: 320 },
        state: "idle",
        metadata: { mechanisms: "React.memo, shouldComponentUpdate, useMemo, useCallback" },
        explanation: "What: Before rendering a child component, React checks if it can BAIL OUT (skip rendering). React.memo does a shallow comparison of props. shouldComponentUpdate returns false to skip. If props haven't changed AND the component is memoized, React reuses the previous output. Why: Skipping unnecessary renders is a major optimization. A parent re-render causes ALL children to re-render by default - even if their props didn't change. React.memo prevents this. Breaks when: You pass new object/array/function references on every render: <Child data={{x:1}} /> creates a new object each time, breaking memo. Fix: useMemo for data, useCallback for functions. Also: don't over-memoize - the comparison itself has a cost.",
    },
    {
        id: "diff-algorithm",
        name: "Diffing Algorithm",
        icon: "⚙️",
        category: "service",
        runtime: "reactive",
        position: { x: 560, y: 80 },
        state: "idle",
        metadata: { complexity: "O(n) heuristic", heuristics: "same type = update, different type = unmount+remount" },
        explanation: "What: React's diffing algorithm compares old and new element trees using two heuristics: (1) Elements of different types produce entirely different trees - React unmounts the old tree and mounts a new one. (2) 'key' props identify which child elements are stable across renders. Why: A true tree diff is O(n³). React's heuristics reduce it to O(n) by avoiding cross-level moves. This makes diffing fast enough for 60fps. Breaks when: You don't use 'key' props in lists. Without keys, React uses array indices - which causes wrong elements to update when items are inserted, deleted, or reordered. Using Math.random() as key destroys all component state on every render.",
    },
    {
        id: "effect-list",
        name: "Effect List",
        icon: "📑",
        category: "queue",
        runtime: "reactive",
        position: { x: 560, y: 200 },
        state: "idle",
        metadata: { collects: "DOM mutations to apply, effects to run" },
        explanation: "What: During the render phase, React collects a list of 'effects' - DOM operations that need to happen (insert element, update text, remove node) and side effects (useEffect, useLayoutEffect). Why: By collecting all changes first, React can apply them in one batch during the commit phase, minimizing browser reflows. Breaks when: The effect list is huge because too many components changed. Use React.memo and proper key props to minimize the number of components that enter the effect list.",
    },
    {
        id: "commit-phase",
        name: "Commit Phase",
        icon: "✍️",
        category: "service",
        runtime: "reactive",
        position: { x: 560, y: 320 },
        state: "idle",
        metadata: { nature: "SYNCHRONOUS - cannot be interrupted", operations: "DOM mutations" },
        explanation: "What: The commit phase applies all collected DOM mutations to the real DOM. This phase is SYNCHRONOUS and CANNOT be interrupted - once it starts, it runs to completion. It processes in three sub-phases: beforeMutation, mutation, layout. Why: DOM must be updated atomically - users should NEVER see a partially rendered UI. If React paused mid-commit, you'd see flickering or torn renders. Breaks when: The commit phase is too heavy (thousands of DOM mutations). Virtualization (react-window) reduces the number of actual DOM elements.",
    },
    {
        id: "layout-effects",
        name: "useLayoutEffect",
        icon: "📐",
        category: "service",
        runtime: "reactive",
        position: { x: 740, y: 80 },
        state: "idle",
        metadata: { timing: "SYNCHRONOUS, after DOM update, BEFORE browser paint", useCase: "DOM measurements, scroll position" },
        explanation: "What: useLayoutEffect fires synchronously AFTER the DOM is updated but BEFORE the browser paints. It's identical to componentDidMount/componentDidUpdate timing. Why: Use it when you need to read DOM layout (element dimensions, scroll position) or make DOM changes that must be visible on the FIRST paint - no flickering. Breaks when: Heavy computation inside useLayoutEffect BLOCKS the browser from painting - the user sees a frozen frame. Keep it fast. For most effects, useEffect is correct. useLayoutEffect is for DOM measurement only.",
    },
    {
        id: "passive-effects",
        name: "useEffect",
        icon: "🔮",
        category: "service",
        runtime: "reactive",
        position: { x: 740, y: 200 },
        state: "idle",
        metadata: { timing: "ASYNCHRONOUS, after browser paint", useCase: "data fetching, subscriptions, logging" },
        explanation: "What: useEffect fires ASYNCHRONOUSLY after the browser has painted. It runs in a separate microtask after the render is committed and visible. Why: Most side effects (API calls, subscriptions, analytics) don't need to block painting. Running them asynchronously keeps the UI responsive. Breaks when: Dependency array is wrong: [] means 'run once', [dep] means 'run when dep changes', missing deps means stale closures. Lint rule react-hooks/exhaustive-deps catches this. Also: missing cleanup function causes memory leaks (subscriptions, timers).",
    },
    {
        id: "browser-paint",
        name: "Browser Paint",
        icon: "🖥️",
        category: "client",
        runtime: "reactive",
        position: { x: 740, y: 320 },
        state: "idle",
        metadata: { process: "Style → Layout → Paint → Composite", target: "16ms for 60fps" },
        explanation: "What: The browser recalculates styles, computes layout (element positions and sizes), paints pixels, and composites layers. This is what the user actually SEES. Why: DOM mutations trigger reflows (layout recalculation). React minimizes reflows by batching all mutations into the commit phase. Breaks when: Layout thrashing - reading a layout property (offsetHeight) then writing (style.height), then reading again - forces synchronous reflows. React avoids this, but manual DOM access in useRef can trigger it.",
    },
];

const connections: Connection[] = [
    {
        id: "c1", source: "state-trigger", target: "update-queue", protocol: "http", latency: 5,
        reason: "State change creates an update object and adds it to the component's update queue. In React 18, this update is automatically batched with any concurrent updates from the same event, timeout, or promise.",
    },
    {
        id: "c2", source: "update-queue", target: "scheduler", protocol: "http", latency: 5,
        reason: "The update queue notifies the scheduler. The scheduler assigns a priority lane based on the update source: user input = SyncLane (immediate), startTransition = TransitionLane (interruptible, lower priority).",
    },
    {
        id: "c3", source: "scheduler", target: "render-begin", protocol: "http", latency: 5,
        reason: "Scheduler selects the highest-priority work and starts the render phase. If a higher-priority update arrives mid-render, the current render can be INTERRUPTED and restarted. This is concurrent rendering.",
    },
    {
        id: "c4", source: "render-begin", target: "fiber-walk", protocol: "http", latency: 10,
        reason: "React calls the component function (or render method) and begins walking the Fiber tree via depth-first search. Each component is processed as a unit of work. Between units, React can yield to the browser.",
    },
    {
        id: "c5", source: "fiber-walk", target: "bailout-check", protocol: "http", latency: 5,
        reason: "Before rendering each child, React checks for a bailout. If the component is wrapped in React.memo and props haven't changed (shallow comparison), React skips this entire subtree - a major optimization.",
    },
    {
        id: "c6", source: "bailout-check", target: "diff-algorithm", protocol: "http", latency: 10,
        reason: "No bailout - component rendered. The new React elements are compared against the previous Fiber tree. React's O(n) diff uses element type and 'key' props to determine what changed, what's new, and what's removed.",
    },
    {
        id: "c7", source: "diff-algorithm", target: "effect-list", protocol: "http", latency: 5,
        reason: "Diffing produces a list of effects: DOM nodes to insert, update, or remove. useEffect and useLayoutEffect registrations are also collected here. This list is the 'work' for the commit phase.",
    },
    {
        id: "c8", source: "effect-list", target: "commit-phase", protocol: "http", latency: 5,
        reason: "The effect list is passed to the commit phase. Commit is SYNCHRONOUS - it applies ALL DOM mutations atomically. The user never sees a partially updated UI. This phase cannot be interrupted.",
    },
    {
        id: "c9", source: "commit-phase", target: "layout-effects", protocol: "http", latency: 5,
        reason: "After DOM mutations are applied, useLayoutEffect callbacks fire SYNCHRONOUSLY. This is your chance to read DOM layout (getBoundingClientRect) before the browser paints. Keep it fast - heavy work here blocks the paint.",
    },
    {
        id: "c10", source: "layout-effects", target: "browser-paint", protocol: "http", latency: 5,
        reason: "Browser performs style recalculation, layout, and paint. The user now sees the updated UI. If useLayoutEffect made additional DOM changes, they're included in this paint - no flickering.",
    },
    {
        id: "c11", source: "browser-paint", target: "passive-effects", protocol: "http", latency: 5,
        reason: "After painting, useEffect callbacks fire asynchronously. Data fetching, subscriptions, and analytics happen here. They don't block the UI - the user already sees the update.",
    },
];

export function getReactModuleConfig(): ModuleConfig {
    return {
        moduleId: "react",
        nodes,
        connections,
        initialPackets: [
            {
                id: "pkt_state",
                protocol: "http",
                payload: "setCount(prev => prev + 1)",
                label: "State Update",
                currentNodeId: "state-trigger",
                sourceNodeId: "state-trigger",
                targetNodeId: "update-queue",
                path: ["state-trigger"],
                progress: 0,
                status: "pending",
                createdAt: Date.now(),
            },
        ],
        whyModePrompts: [
            {
                question: "A parent component re-renders. Does the child ALWAYS re-render?",
                options: [
                    { label: "No - React checks if props changed before rendering the child", isCorrect: false },
                    { label: "Yes - by default, ALL children re-render when the parent re-renders", isCorrect: true },
                    { label: "Only if the child uses state", isCorrect: false },
                    { label: "Only if the child is a class component", isCorrect: false },
                ],
                correctIndex: 1,
                explanation: "By DEFAULT, React re-renders ALL children when the parent re-renders - regardless of whether props changed. This surprises many developers. React.memo() adds a shallow prop comparison to bail out if props haven't changed. But even with memo, passing new object/function references (<Child fn={() => {}} />) defeats it - use useCallback and useMemo.",
                connectionId: "c5",
                nodeId: "fiber-walk",
            },
            {
                question: "You call setState three times in a click handler: setState(1); setState(2); setState(3). How many re-renders happen?",
                options: [
                    { label: "Three re-renders - one per setState call", isCorrect: false },
                    { label: "One re-render - React batches updates within the same event", isCorrect: true },
                    { label: "Zero - React deduplicates identical setStates", isCorrect: false },
                    { label: "It depends on whether you're using hooks or class components", isCorrect: false },
                ],
                correctIndex: 1,
                explanation: "React 18 batches ALL state updates - even in promises, setTimeout, and native event handlers. React 17 only batched inside React event handlers. Batching collapses multiple updates into a single re-render. To force a synchronous update in React 18, use flushSync() - but this is rarely needed.",
                connectionId: "c1",
                nodeId: "state-trigger",
            },
            {
                question: "useLayoutEffect vs useEffect - when would you NEED useLayoutEffect?",
                options: [
                    { label: "For API calls - it's faster than useEffect", isCorrect: false },
                    { label: "For reading DOM layout (element dimensions) before the browser paints - prevents visual flickering", isCorrect: true },
                    { label: "For setting up subscriptions and event listeners", isCorrect: false },
                    { label: "For animations - it runs on every frame", isCorrect: false },
                ],
                correctIndex: 1,
                explanation: "useLayoutEffect fires SYNCHRONOUSLY after DOM mutation but BEFORE the browser paints. Use it when you need to measure DOM (getBoundingClientRect) or make DOM changes that must appear on the first paint. If you used useEffect for this, the user would see a flash - the old layout paints, THEN useEffect fires and updates. useLayoutEffect prevents that flicker.",
                connectionId: "c9",
                nodeId: "commit-phase",
            },
            {
                question: "In a <ul> list, you render items without key props. Items are reordered. What goes wrong?",
                options: [
                    { label: "Nothing - React handles reordering automatically", isCorrect: false },
                    { label: "React uses array indices as keys - reordered items get the WRONG state and DOM elements", isCorrect: true },
                    { label: "React throws an error and the render fails", isCorrect: false },
                    { label: "Performance is slightly worse but everything works correctly", isCorrect: false },
                ],
                correctIndex: 1,
                explanation: "Without explicit keys, React uses array indices. When items reorder, index 0 maps to a DIFFERENT item - but React thinks it's the same component. Component state (inputs, scroll position) stays attached to the INDEX, not the data. This causes wrong form values, animations on wrong elements, and subtle bugs. Always use stable, unique keys (database IDs, not Math.random()).",
                connectionId: "c6",
                nodeId: "diff-algorithm",
            },
        ],
        learningStory: {
            title: "The Puppet Master",
            content: "React is the 'R' in MERN! It's like being a Puppet Master. Instead of moving every single piece of a house (the DOM) by hand, you just tell React: 'The house should be blue and have 4 windows.' React then works its magic to make the house look exactly like you described without you having to lift a finger!",
            analogy: "A magic coloring book. You tell the book 'I want the dragon to be red,' and it colors itself perfectly without you needing to grab any crayons.",
            lookFor: "Look at the 'Diffing Algorithm' node. See how it filters the updates so that only the small 'Browser Paint' node at the end get the final data-just like only coloring the parts that changed!"
        }
    };
}
