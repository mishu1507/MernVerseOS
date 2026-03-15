import type { ModuleConfig, SystemNode, Connection } from "../../engine/types/system.types";

const nodes: SystemNode[] = [
    {
        id: "component",
        name: "React Component",
        icon: "⚛️",
        category: "client",
        runtime: "reactive",
        position: { x: 400, y: 50 },
        state: "idle",
        metadata: {},
        explanation: "React components are pure functions that describe UI based on props and state. Hooks allow these functions to 'hook into' React features like state and lifecycle. Hooks must be called at the top level — never inside loops or conditions. This ensures that React knows the order of hooks between renders.",
    },
    {
        id: "use-state",
        name: "useState",
        icon: "💾",
        category: "service",
        runtime: "reactive",
        position: { x: 100, y: 200 },
        state: "idle",
        metadata: {},
        explanation: "useState adds local state to a function component. It returns a pair: the current state value and a function to update it. When you call the setter React re-renders the component. State updates are NOT immediate — they are batched and processed in the next render cycle. Think of it as a variable that React remembers across renders.",
    },
    {
        id: "use-effect",
        name: "useEffect",
        icon: "⚡",
        category: "service",
        runtime: "reactive",
        position: { x: 400, y: 350 },
        state: "idle",
        metadata: {},
        explanation: "useEffect handles 'side effects': data fetching, manual DOM changes, timers, or subscriptions. It runs AFTER the component renders. The dependency array [dep1] tells React to only re-run the effect if dep1 changed. An empty array [] means 'run once on mount'. Always return a cleanup function to prevent memory leaks!",
    },
    {
        id: "use-memo",
        name: "useMemo",
        icon: "🧠",
        category: "middleware",
        runtime: "reactive",
        position: { x: 700, y: 200 },
        state: "idle",
        metadata: {},
        explanation: "useMemo 'memoizes' a computed value. It only re-calculates the value if a dependency changes. This is a performance optimization for expensive calculations (e.g. sorting a huge list). It doesn't run during render — it returns the cached result from the PREVIOUS render if inputs are the same. Don't over-use it; simple math is cheaper than memoization overhead.",
    },
    {
        id: "render-trigger",
        name: "Re-Render UI",
        icon: "🖼️",
        category: "client",
        runtime: "reactive",
        position: { x: 400, y: 200 },
        state: "idle",
        metadata: {},
        explanation: "The magic of React: when state changes or a hook triggers an update React calls your component function again. It creates a new Virtual DOM tree, compares it to the old one (Diffing), and updates only the necessary parts of the real DOM. Re-renders should be 'pure': no side effects allowed during the function execution itself — that's what useEffect is for.",
    }
];

const connections: Connection[] = [
    { id: "c1", source: "component", target: "use-state", protocol: "internal", latency: 2, reason: "Initial render. useState initializes state value. React allocates memory for this component instance." },
    { id: "c2", source: "use-state", target: "render-trigger", protocol: "internal", latency: 5, reason: "State setter called. React marks component as 'dirty' and schedules a re-render." },
    { id: "c3", source: "render-trigger", target: "use-effect", protocol: "internal", latency: 10, reason: "Render complete! Real DOM updated. React now fires effects (fetching data, starting timers)." },
    { id: "c4", source: "component", target: "use-memo", protocol: "internal", latency: 2, reason: "Render in progress. useMemo checks if inputs changed. If not, returns cached value immediately." },
    { id: "c5", source: "use-effect", target: "use-state", protocol: "internal", latency: 20, reason: "Effect finished (e.g. API call done). Calls state setter with new data. Cycle continues." }
];

export function getHooksModuleConfig(): ModuleConfig {
    return {
        moduleId: "react-hooks",
        nodes,
        connections,
        initialPackets: [
            {
                id: "pkt_hook",
                protocol: "internal",
                label: "State Update",
                payload: "setCount(count + 1)",
                sourceNodeId: "use-state",
                targetNodeId: "render-trigger",
                currentNodeId: "use-state",
                path: ["use-state"],
                progress: 0,
                status: "pending",
                createdAt: Date.now(),
            }
        ],
        whyModePrompts: [
            {
                question: "You have a console.log in your component body and a useEffect with []. Which runs first?",
                options: [
                    { label: "The useEffect runs first", isCorrect: false },
                    { label: "The console.log runs first because the component function must execute before the effect is scheduled", isCorrect: true },
                    { label: "They run simultaneously", isCorrect: false },
                    { label: "It depends on the browser", isCorrect: false },
                ],
                correctIndex: 1,
                explanation: "React's render phase (executing your function) happens BEFORE the commit phase (updating DOM and running effects). Anything in your component body runs during render. useEffect always runs AFTER the render is painted to the screen. This separation keeps the UI responsive even during complex logic.",
                connectionId: "c3",
                nodeId: "use-effect",
            }
        ],
        learningStory: {
            title: "The Actor's Memory",
            content: "Think of a React component as an actor on stage. Every time the scene changes (render) the actor comes out and recites their lines (the component function). React is the director. useState is like a teleprompter that remembers the actor's notes from the last scene. useEffect is what the actor does back-stage after the scene is over (like reading fan mail).",
            analogy: "A calculator with a 'Memory' button. useState is the memory. useMemo is like pre-calculating a complex tax formula — you don't do the math again unless the income changes. useEffect is like a print button — it's the result of your work that actually affects the outside world.",
            lookFor: "Watch the 'Render Trigger' node. It's the central station. See how state changes flow into it, and how it then triggers effects. This loop is the heartbeat of a React application!"
        }
    };
}
