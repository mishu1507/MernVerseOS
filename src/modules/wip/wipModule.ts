import type { ModuleConfig, SystemNode, Connection, DataPacket, WhyModePrompt } from "../../engine/types/system.types";

export interface WipContent {
    title: string;
    description?: string;
    nodes?: SystemNode[];
    connections?: Connection[];
    learningStory?: {
        title: string;
        content: string;
        analogy: string;
        lookFor: string;
    };
    whyModePrompts?: WhyModePrompt[];
}

export function getWipModuleConfig(moduleId: string, content: WipContent): ModuleConfig {
    const defaultNodes: SystemNode[] = [
        {
            id: 'client',
            name: 'Client (Frontend)',
            icon: '💻',
            category: 'client',
            runtime: 'reactive',
            position: { x: 200, y: 300 },
            state: 'idle',
            metadata: { "Type": "Frontend", "Layer": "View" },
            explanation: "The user interface where interactions begin."
        },
        {
            id: 'server',
            name: 'API Server',
            icon: '⚙️',
            category: 'service',
            runtime: 'event-loop',
            position: { x: 500, y: 300 },
            state: 'idle',
            metadata: { "Type": "Backend API", "Framework": "Express" },
            explanation: "The middleman handling routing and logic."
        },
        {
            id: 'database',
            name: 'Database',
            icon: '🍃',
            category: 'database',
            runtime: 'blocking',
            position: { x: 800, y: 300 },
            state: 'idle',
            metadata: { "Type": "NoSQL", "Data": "Storage" },
            explanation: "The persistence layer."
        }
    ];

    const defaultConnections: Connection[] = [
        { id: 'c-s', source: 'client', target: 'server', protocol: 'http', latency: 30, reason: 'Requesting data' },
        { id: 's-d', source: 'server', target: 'database', protocol: 'db-query', latency: 20, reason: 'Querying records' }
    ];

    const nodes = content.nodes || defaultNodes;
    const connections = content.connections || defaultConnections;

    // We dynamically map the packet to the first edge of whatever topology arrived
    const sourceNode = nodes.length > 0 ? nodes[0].id : 'client';
    const firstConnection = connections.find(c => c.source === sourceNode);
    const targetNode = firstConnection ? firstConnection.target : (nodes.length > 1 ? nodes[1].id : 'server');
    const protocol = firstConnection ? firstConnection.protocol : 'http';

    return {
        moduleId: moduleId,
        nodes,
        connections,
        initialPackets: [
            {
                id: 'wip-ping',
                protocol: protocol,
                payload: `Exploring: ${content.title}`,
                label: 'Telemetry Signal',
                currentNodeId: sourceNode,
                sourceNodeId: sourceNode,
                targetNodeId: targetNode,
                path: [sourceNode],
                progress: 0,
                status: 'pending',
                createdAt: Date.now()
            }
        ],
        learningStory: content.learningStory || {
            title: `Theory Lab: ${content.title}`,
            content: `Welcome to the conceptual lab for ${content.title}. This section is dedicated to mental-model mapping rather than raw execution metrics. Trace the baseline packet flow while reviewing the underlying principles.`,
            analogy: "Like studying an architectural blueprint before constructing the actual skyscraper.",
            lookFor: "Observe the predictable baseline telemetry flow between the standard tiers while you process the fundamental concepts."
        },
        whyModePrompts: content.whyModePrompts || getDefaultWhyModePrompts(content.title, connections)
    };
}

function getDefaultWhyModePrompts(title: string, connections: Connection[]): WhyModePrompt[] {
    if (connections.length < 2) return [];

    return [
        {
            question: `In the context of ${title}, why does the telemetry flow from ${connections[0].source} to ${connections[0].target}?`,
            options: [
                { label: 'Because it avoids database execution entirely.', isCorrect: false },
                { label: 'Because it represents the standard execution order for this layer.', isCorrect: true },
                { label: 'Because Node.js requires it strictly.', isCorrect: false },
                { label: 'Because it is an error fallback path.', isCorrect: false }
            ],
            correctIndex: 1,
            explanation: `In the ${title} architecture, data flows predictably according to its specific responsibilities (e.g., Client -> Server). Each node handles exactly one abstraction layer before passing control.`,
            connectionId: connections[0].id,
            nodeId: connections[0].target
        },
        {
            question: `Why must ${connections[1].target} be involved in the second step of the ${title} graph?`,
            options: [
                { label: `To translate or finalize the work requested by ${connections[1].source}.`, isCorrect: true },
                { label: 'To permanently crash the Event Loop.', isCorrect: false },
                { label: 'Because there is nowhere else for the data to go.', isCorrect: false },
                { label: 'To wait for user DOM interaction.', isCorrect: false }
            ],
            correctIndex: 0,
            explanation: `${connections[1].target} takes the verified or processed payload from the previous step and acts on it (like querying a DB or Rendering a VDOM), guaranteeing separation of concerns.`,
            connectionId: connections[1].id,
            nodeId: connections[1].target
        }
    ];
}
