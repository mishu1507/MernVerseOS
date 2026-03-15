import type { ModuleConfig, SystemNode, Connection, DataPacket } from "../../engine/types/system.types";

export function getFullJourneyModuleConfig(): ModuleConfig {
    const nodes: SystemNode[] = [
        {
            id: 'client-ui',
            name: 'React Click',
            icon: '👆',
            category: 'client',
            runtime: 'reactive',
<<<<<<< HEAD
            position: { x: 100, y: 200 },
=======
            position: { x: 100, y: 150 },
>>>>>>> 4ab21cbb75eeb8440e220add363f45a6bafa73e1
            state: 'idle',
            metadata: { "Type": "User Event", "Layer": "React Component" },
            explanation: "User clicks a button. React triggers an event handler."
        },
        {
            id: 'client-fetch',
            name: 'Fetch API',
            icon: '🌐',
            category: 'client',
            runtime: 'event-loop',
<<<<<<< HEAD
            position: { x: 300, y: 200 },
=======
            position: { x: 300, y: 150 },
>>>>>>> 4ab21cbb75eeb8440e220add363f45a6bafa73e1
            state: 'idle',
            metadata: { "Type": "Network Request", "API": "fetch()" },
            explanation: "The browser's fetch API initiates an HTTP request."
        },
        {
            id: 'gw-ingress',
            name: 'API Ingress',
            icon: '🚪',
            category: 'gateway',
            runtime: 'event-loop',
<<<<<<< HEAD
            position: { x: 500, y: 200 },
=======
            position: { x: 300, y: 350 },
>>>>>>> 4ab21cbb75eeb8440e220add363f45a6bafa73e1
            state: 'idle',
            metadata: { "Type": "Reverse Proxy", "Tech": "Nginx / Node" },
            explanation: "Traffic enters the server and is directed to Express."
        },
        {
            id: 'express-mid',
            name: 'Express MW',
            icon: '🚥',
            category: 'service',
            runtime: 'event-loop',
<<<<<<< HEAD
            position: { x: 700, y: 200 },
=======
            position: { x: 500, y: 350 },
>>>>>>> 4ab21cbb75eeb8440e220add363f45a6bafa73e1
            state: 'idle',
            metadata: { "Type": "Middleware", "Tech": "cors, json" },
            explanation: "Express validates the request, checks tokens, and parses JSON."
        },
        {
            id: 'server-controller',
            name: 'Controller',
            icon: '🧠',
            category: 'service',
            runtime: 'event-loop',
<<<<<<< HEAD
            position: { x: 900, y: 200 },
=======
            position: { x: 700, y: 350 },
>>>>>>> 4ab21cbb75eeb8440e220add363f45a6bafa73e1
            state: 'idle',
            metadata: { "Type": "Route Handler", "Logic": "Business Rules" },
            explanation: "Business logic executes and initiates a database query."
        },
        {
            id: 'db-query',
            name: 'Mongo Query',
            icon: '🍃',
            category: 'database',
            runtime: 'blocking',
<<<<<<< HEAD
            position: { x: 900, y: 400 },
=======
            position: { x: 700, y: 550 },
>>>>>>> 4ab21cbb75eeb8440e220add363f45a6bafa73e1
            state: 'idle',
            metadata: { "Type": "NoSQL Operation", "Tech": "Mongoose" },
            explanation: "Mongoose sends the command to MongoDB."
        },
        {
            id: 'db-index',
            name: 'Index Hit',
            icon: '🗂️',
            category: 'database',
            runtime: 'blocking',
<<<<<<< HEAD
            position: { x: 1100, y: 400 },
=======
            position: { x: 900, y: 550 },
>>>>>>> 4ab21cbb75eeb8440e220add363f45a6bafa73e1
            state: 'idle',
            metadata: { "Type": "B-Tree Search", "Outcome": "O(log n)" },
            explanation: "MongoDB uses an index to locate the document instantly."
        },
        {
            id: 'react-render',
            name: 'React Re-render',
            icon: '⚛️',
            category: 'client',
            runtime: 'reactive',
<<<<<<< HEAD
            position: { x: 100, y: 400 },
=======
            position: { x: 100, y: 350 },
>>>>>>> 4ab21cbb75eeb8440e220add363f45a6bafa73e1
            state: 'idle',
            metadata: { "Type": "Virtual DOM", "Phase": "Commit" },
            explanation: "React receives the JSON response, updates state, and reconciles the DOM."
        }
    ];

    const connections: Connection[] = [
        { id: 'c-1', source: 'client-ui', target: 'client-fetch', protocol: 'http', latency: 5, reason: 'Event handler calls fetch' },
        { id: 'c-2', source: 'client-fetch', target: 'gw-ingress', protocol: 'http', latency: 50, reason: 'Network transit' },
        { id: 'c-3', source: 'gw-ingress', target: 'express-mid', protocol: 'http', latency: 5, reason: 'Reverse proxy passing request' },
        { id: 'c-4', source: 'express-mid', target: 'server-controller', protocol: 'http', latency: 5, reason: 'Middleware passes to next()' },
        { id: 'c-5', source: 'server-controller', target: 'db-query', protocol: 'db-query', latency: 15, reason: 'Mongoose queries DB' },
        { id: 'c-6', source: 'db-query', target: 'db-index', protocol: 'db-query', latency: 5, reason: 'Storage Engine looks up index' },
        { id: 'c-7', source: 'client-fetch', target: 'react-render', protocol: 'http', latency: 5, reason: 'Promises resolves and updates UI state' }
    ];

    const initialPackets: DataPacket[] = [
        {
            id: 'full-cycle-1',
            protocol: 'http',
            payload: 'Full Stack Trace',
            label: 'Interactive Request',
            currentNodeId: 'client-ui',
            sourceNodeId: 'client-ui',
            targetNodeId: 'server-controller',
            path: ['client-ui'],
            progress: 0,
            status: 'pending',
            createdAt: Date.now()
        }
    ];

    return {
        moduleId: 'full-journey',
        nodes,
        connections,
        initialPackets,
        learningStory: {
            title: "The Ultimate Journey",
            content: "You clicked a button. What actually happens across the tech stack? This module traces the exact serialization, routing, intelligence, and querying required to update state.",
            analogy: "Like a relay race where every runner is a different technology handing off the baton until it reaches the finish line.",
            lookFor: "Notice how the request bounces back mathematically symmetrically down the stack and bubbles back up to close the loop."
        },
        whyModePrompts: []
    };
}
