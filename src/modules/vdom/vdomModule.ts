import type { ModuleConfig, SystemNode, Connection } from "../../engine/types/system.types";

const nodes: SystemNode[] = [
    {
        id: "state-change",
        name: "State Change",
        icon: "⚡",
        category: "client",
        runtime: "event-loop",
        position: { x: 50, y: 200 },
        state: "idle",
        metadata: { trigger: "setCount(count + 1)" },
        explanation: "What: The trigger that starts the React re-render cycle (e.g., calling a state setter). Why: React only updates the UI in response to state or prop changes. Breaks without it: The interface would remain static and never react to user interaction.",
    },
    {
        id: "vdom-new",
        name: "New Virtual DOM",
        icon: "🌳",
        category: "service",
        runtime: "event-loop",
        position: { x: 250, y: 100 },
        state: "idle",
        metadata: { type: "Fresh lightweight tree" },
        explanation: "What: React re-executes the component function to build a new lightweight description of the UI. Why: Building a JS object tree is thousands of times faster than touching the official browser DOM. Breaks without it: You'd lose the ability to compute changes efficiently, leading to slow, flickering UI updates.",
    },
    {
        id: "vdom-old",
        name: "Previous Virtual DOM",
        icon: "🍂",
        category: "database",
        runtime: "event-loop",
        position: { x: 250, y: 300 },
        state: "idle",
        metadata: { type: "Last rendered snapshot" },
        explanation: "What: A copy of the Virtual DOM from the last render cycle that React keeps in memory. Why: You need something to compare the 'new' state against to see exactly what changed. Breaks without it: React would have to overwrite the entire Real DOM every time, which is very slow.",
    },
    {
        id: "differ",
        name: "Diffing Algorithm",
        icon: "🔍",
        category: "middleware",
        runtime: "event-loop",
        position: { x: 450, y: 200 },
        state: "idle",
        metadata: { complexity: "O(n) / Reconciliation" },
        explanation: "What: The core React logic that compares the new tree and the old tree to find differences. Why: It identifies the minimal set of changes needed to update the screen. Breaks without it: The system wouldn't know which specific HTML elements need updating.",
    },
    {
        id: "collector",
        name: "Effect Collector",
        icon: "📥",
        category: "middleware",
        runtime: "event-loop",
        position: { x: 650, y: 200 },
        state: "idle",
        metadata: { list: "Update h1 -> 'Hello 2'" },
        explanation: "What: Batches all the identified changes into a single set of operations. Why: Prevents multiple layout reflows in the browser by doing all updates at once. Breaks without it: Performance would degrade as the browser tries to recalculate styles for every tiny individual change.",
    },
    {
        id: "real-dom",
        name: "Real DOM (Commit)",
        icon: "🏗️",
        category: "database",
        runtime: "blocking",
        position: { x: 800, y: 200 },
        state: "idle",
        metadata: { action: "document.appendChild()" },
        explanation: "What: The actual browser document structure that we see on screen. Why: This is what the browser uses to actually show content to the user. Breaks without it: The user would never see the updated count or UI changes.",
    },
    {
        id: "paint",
        name: "Browser Paint",
        icon: "🎨",
        category: "client",
        runtime: "blocking",
        position: { x: 950, y: 200 },
        state: "idle",
        metadata: { action: "GPU Rendering" },
        explanation: "What: The process where the browser takes the DOM and CSSOM and turns it into actual pixels. Why: Users consume visual pixels, not code structures. Breaks without it: The memory changes would exist, but the screen would never visually update.",
    }
];

const connections: Connection[] = [
    { id: "c1", source: "state-change", target: "vdom-new", protocol: "internal", latency: 5, reason: "Trigger re-render" },
    { id: "c2", source: "state-change", target: "vdom-old", protocol: "internal", latency: 2, reason: "Reference last state" },
    { id: "c3", source: "vdom-new", target: "differ", protocol: "internal", latency: 10, reason: "Compare with old" },
    { id: "c4", source: "vdom-old", target: "differ", protocol: "internal", latency: 5, reason: "Compare with new" },
    { id: "c5", source: "differ", target: "collector", protocol: "internal", latency: 5, reason: "Identify changes" },
    { id: "c6", source: "collector", target: "real-dom", protocol: "internal", latency: 5, reason: "Commit to DOM" },
    { id: "c7", source: "real-dom", target: "paint", protocol: "internal", latency: 20, reason: "Visual update" }
];

export function getVdomModuleConfig(): ModuleConfig {
    return {
        moduleId: "vdom",
        nodes,
        connections,
        initialPackets: [
            {
                id: "pkt_vdom",
                protocol: "internal",
                label: "State Update",
                payload: "setCount(count + 1)",
                sourceNodeId: "state-change",
                targetNodeId: "vdom-new",
                currentNodeId: "state-change",
                path: ["state-change"],
                progress: 0,
                status: "pending",
                createdAt: Date.now(),
            },
        ],
        whyModePrompts: [
            {
                question: "If you have a list of items and you don't use 'key' props, what does the Diffing Algorithm do when you delete the first item?",
                options: [
                    { label: "It ignores the change and nothing happens", isCorrect: false },
                    { label: "It efficiently removes only that one DOM node", isCorrect: false },
                    { label: "It re-renders every single item because it thinks they all changed (index shift)", isCorrect: true },
                    { label: "It crashes the application", isCorrect: false },
                ],
                correctIndex: 2,
                explanation: "Without keys, React relies on order. If you delete index 0, what was index 1 is now index 0. React sees the content of 'index 0' changed, so it updates that node, and so on for every item in the list, causing a massive performance hit.",
                connectionId: "c3",
                nodeId: "differ",
            },
            {
                question: "If you change a component from <Counter /> to <Input />, what does React do during reconciliation?",
                options: [
                    { label: "It tries to preserve the state if the props are similar", isCorrect: false },
                    { label: "It fully unmounts the Counter and destroys its state", isCorrect: true },
                    { label: "It just changes the HTML tag and keeps the JS object", isCorrect: false },
                    { label: "It merges the two components into a hybrid", isCorrect: false },
                ],
                correctIndex: 1,
                explanation: "When the element TYPE changes (Counter vs Input), React assumes the tree is entirely different. It performs a full unmount of the old tree, destroying all its local state and DOM nodes, and mounts a fresh new tree.",
                connectionId: "c3",
                nodeId: "differ",
            }
        ],
        learningStory: {
            title: "The Blueprint Comparison",
            content: "The Virtual DOM is like a blueprint. If you want to move a door in a house, you don't tear down the whole house. You check the blueprint, find the door, mark the change, and then the workers (Real DOM) only move that one door...",
            analogy: "Like comparing two blueprints of a house to see what changed before starting construction.",
            lookFor: "Notice how React builds a 'New' tree and compares it to the 'Previous' tree before ever touching the 'Real DOM'."
        }
    };
}
