// ========================================
// MERNVerse OS - Core Type Definitions
// ========================================

export type NodeCategory =
    | "client"
    | "service"
    | "middleware"
    | "database"
    | "queue"
    | "gateway";

export type RuntimeModel =
    | "event-loop"
    | "threaded"
    | "blocking"
    | "reactive";

export type ProtocolType =
    | "http"
    | "db-query"
    | "websocket"
    | "queue"
    | "internal"
    | "dom-event";

export type PacketStatus =
    | "pending"
    | "processing"
    | "completed"
    | "failed";

export type SimulationStatus =
    | "idle"
    | "running"
    | "paused";

export type NodeState =
    | "idle"
    | "active"
    | "blocked"
    | "error";

export interface Position {
    x: number;
    y: number;
}

export interface SystemNode {
    id: string;
    name: string;
    icon: string;
    category: NodeCategory;
    runtime: RuntimeModel;
    position: Position;
    state: NodeState;
    metadata: Record<string, unknown>;
    explanation: string;    // What this node does and why it exists
}

export interface Connection {
    id: string;
    source: string;
    target: string;
    protocol: ProtocolType;
    latency: number;
    reason: string;         // Why data flows through this connection
}

export interface DataPacket {
    id: string;
    protocol: ProtocolType;
    payload: string;
    label: string;
    currentNodeId: string;
    sourceNodeId: string;
    targetNodeId: string;
    path: string[];
    progress: number;       // 0..1 along current connection
    status: PacketStatus;
    createdAt: number;
}

export interface TimelineEvent {
    tick: number;
    event: string;
    detail: string;
}

export interface ConsoleLog {
    tick: number;
    level: "info" | "warn" | "error" | "success";
    message: string;
}

// ---- Why Mode ----

export interface WhyModeOption {
    label: string;
    isCorrect: boolean;
}

export interface WhyModePrompt {
    question: string;
    options: WhyModeOption[];
    correctIndex: number;
    explanation: string;        // shown after answering
    connectionId: string;       // which transition triggered this
    nodeId: string;             // which node the packet just arrived at
}

// ---- Mission Mode ----

export type MissionDifficulty = "beginner" | "intermediate" | "advanced";
export type MissionStatus = "locked" | "available" | "active" | "completed" | "revealed_solution";

export interface MissionHint {
    text: string;
    revealed: boolean;
}

export interface Mission {
    id: string;
    title: string;
    description: string;
    briefing: string;           // longer scenario description
    difficulty: MissionDifficulty;
    moduleId: string;
    category: string;           // e.g. "Performance", "Security", "Data"
    brokenConfig: ModuleConfig;
    fixedConfig: ModuleConfig;
    hints: string[];
    successExplanation: string;
    whatWentWrong: string;
    howToFix: string;
    solutionOptions: {
        label: string;
        isCorrect: boolean;
        feedback: string;
    }[];
}

// ---- Simulation Snapshot ----

export interface SimulationSnapshot {
    nodes: SystemNode[];
    connections: Connection[];
    packets: DataPacket[];
    status: SimulationStatus;
    tick: number;
    speed: number;
    activeModule: string | null;
    timeline: TimelineEvent[];
    consoleLogs: ConsoleLog[];
    // Why Mode
    whyModeEnabled: boolean;
    whyModePrompt: WhyModePrompt | null;
    // Mission Mode
    activeMission: Mission | null;
    missionStatus: MissionStatus;
    revealedHints: number;
    // Conceptual Story
    learningStory: {
        title: string;
        content: string;
        analogy: string;
        lookFor: string;
    } | null;
}

export interface ModuleConfig {
    moduleId: string;
    nodes: SystemNode[];
    connections: Connection[];
    initialPackets?: DataPacket[];
    whyModePrompts?: WhyModePrompt[]; // prompts for critical transitions
    learningStory?: {
        title: string;
        content: string;
        analogy: string;
        lookFor: string;
    };
}
