// ========================================
// Simulation Engine - Core runtime orchestrator
// Multi-hop packet routing with reasoning + Why Mode
// ========================================

import { SystemGraph } from "../graph/systemGraph";
import { PacketEngine } from "../packet/packetEngine";
import type {
    SimulationStatus,
    SimulationSnapshot,
    TimelineEvent,
    ConsoleLog,
    ModuleConfig,
    DataPacket,
    ProtocolType,
    Connection,
    WhyModePrompt,
    Mission,
    MissionStatus,
} from "../types/system.types";

export type SimulationListener = (snapshot: SimulationSnapshot) => void;

export class SimulationEngine {
    private graph: SystemGraph;
    private packetEngine: PacketEngine;
    private status: SimulationStatus = "idle";
    private tick = 0;
    private speed = 1;
    private activeModule: string | null = null;
    private timeline: TimelineEvent[] = [];
    private consoleLogs: ConsoleLog[] = [];
    private listeners: Set<SimulationListener> = new Set();
    private initialModuleConfig: ModuleConfig | null = null;

    // Why Mode
    private whyModeEnabled = false;
    private whyModePrompt: WhyModePrompt | null = null;
    private whyModePrompts: WhyModePrompt[] = [];
    private whyModePromptIndex = 0;

    // Mission Mode
    private activeMission: Mission | null = null;
    private missionStatus: MissionStatus = "locked";
    private revealedHints = 0;

    constructor() {
        this.graph = new SystemGraph();
        this.packetEngine = new PacketEngine();
    }

    // ---- Module Loading ----

    loadModule(config: ModuleConfig): void {
        // Clear previous config BEFORE reset to prevent re-adding old nodes
        this.initialModuleConfig = null;
        this.activeModule = null;
        this.reset();
        this.activeModule = config.moduleId;
        this.initialModuleConfig = config;
        this.whyModePrompts = config.whyModePrompts || [];
        this.whyModePromptIndex = 0;

        for (const node of config.nodes) {
            this.graph.addNode(node);
        }
        for (const conn of config.connections) {
            this.graph.addConnection(conn);
        }

        if (config.initialPackets) {
            for (const pkt of config.initialPackets) {
                this.packetEngine.spawnPacket({
                    protocol: pkt.protocol,
                    payload: pkt.payload,
                    label: pkt.label,
                    sourceNodeId: pkt.sourceNodeId,
                    targetNodeId: pkt.targetNodeId,
                });
            }
        }

        this.log("info", `Module "${config.moduleId}" loaded - simulation ready.`);
        this.addTimelineEvent("Module Loaded", `${config.moduleId} initialized with ${config.nodes.length} nodes`);
        this.notify();
    }

    // ---- Why Mode ----

    toggleWhyMode(): void {
        this.whyModeEnabled = !this.whyModeEnabled;
        if (!this.whyModeEnabled) {
            this.whyModePrompt = null;
        }
        this.notify();
    }

    getWhyModeEnabled(): boolean {
        return this.whyModeEnabled;
    }

    answerWhyMode(selectedIndex: number): boolean {
        if (!this.whyModePrompt) return false;
        const correct = selectedIndex === this.whyModePrompt.correctIndex;
        if (correct) {
            this.log("success", `✓ Correct: ${this.whyModePrompt.explanation}`);
            this.addTimelineEvent("Why Mode", `Answered correctly`);
            // The UI (WhyModeOverlay) will call dismissWhyMode after a delay to resume the simulation.
        } else {
            this.log("warn", `✗ Not quite. Think about: ${this.whyModePrompt.explanation}`);
        }
        this.notify();
        return correct;
    }

    dismissWhyMode(): void {
        if (this.whyModePrompt) {
            this.log("info", `💡 ${this.whyModePrompt.explanation}`);
            this.whyModePrompt = null;
            this.status = "running";
            this.notify();
        }
    }

    private checkWhyModeTrigger(arrivedNodeId: string, connectionId: string): boolean {
        if (!this.whyModeEnabled || this.whyModePromptIndex >= this.whyModePrompts.length) {
            return false;
        }

        const nextPrompt = this.whyModePrompts[this.whyModePromptIndex];
        if (nextPrompt.nodeId === arrivedNodeId || nextPrompt.connectionId === connectionId) {
            this.whyModePrompt = nextPrompt;
            this.whyModePromptIndex++;
            this.status = "paused";
            this.notify();
            return true;
        }
        return false;
    }

    // ---- Mission Mode ----

    loadMission(mission: Mission): void {
        this.activeMission = mission;
        this.missionStatus = "active";
        this.revealedHints = 0;
        this.loadModule(mission.brokenConfig);
        this.log("warn", `🎯 MISSION: ${mission.title}`);
        this.log("info", mission.briefing);
        this.addTimelineEvent("Mission Started", mission.title);
        this.notify();
    }

    revealHint(): string | null {
        if (!this.activeMission) return null;
        if (this.revealedHints >= this.activeMission.hints.length) return null;
        const hint = this.activeMission.hints[this.revealedHints];
        this.revealedHints++;
        this.log("info", `💡 Hint ${this.revealedHints}: ${hint}`);
        this.notify();
        return hint;
    }

    showSolution(isSolved: boolean = false): void {
        if (!this.activeMission) return;
        this.missionStatus = isSolved ? "completed" : "revealed_solution";
        this.log("info", `❌ What went wrong: ${this.activeMission.whatWentWrong}`);
        this.log("success", `✅ How to fix: ${this.activeMission.howToFix}`);
        this.log("success", `📖 ${this.activeMission.successExplanation}`);
        this.addTimelineEvent("Solution Revealed", this.activeMission.howToFix);

        // Load the fixed config so they can see the difference
        this.loadModule(this.activeMission.fixedConfig);
        this.activeMission = { ...this.activeMission };
        this.missionStatus = isSolved ? "completed" : "revealed_solution";
        this.notify();
    }

    submitSolution(optionIndex: number): boolean {
        if (!this.activeMission || this.missionStatus === "completed" || this.missionStatus === "revealed_solution") return false;

        const option = this.activeMission.solutionOptions[optionIndex];
        if (option.isCorrect) {
            this.log("success", `🎊 Correct! ${option.feedback}`);
            this.showSolution(true);
            return true;
        } else {
            this.log("warn", `✗ Incorrect: ${option.feedback}`);
            this.notify();
            return false;
        }
    }

    exitMission(): void {
        this.activeMission = null;
        this.missionStatus = "locked";
        this.revealedHints = 0;
        this.reset();
        this.notify();
    }

    // ---- Playback Controls ----

    play(): void {
        if (this.status !== "running" && !this.whyModePrompt) {
            this.status = "running";
            this.notify();
        }
    }

    pause(): void {
        if (this.status === "running") {
            this.status = "paused";
            this.notify();
        }
    }

    step(): void {
        if (!this.whyModePrompt) {
            this.status = "paused";
            // Run ticks until a major event occurs (packet arrival or status change)
            // We limit the number of internal ticks to prevent infinite loops
            let attempts = 0;
            const maxAttempts = 200;
            let eventFound = false;

            while (attempts < maxAttempts && !eventFound) {
                const prevPackets = this.packetEngine.getAllPackets().map(p => ({
                    id: p.id,
                    progress: p.progress,
                    status: p.status,
                    target: p.targetNodeId
                }));

                this.advanceTick();
                attempts++;

                const currentPackets = this.packetEngine.getAllPackets();

                // If Why Mode triggered, we must stop
                if (this.whyModePrompt) break;

                for (const curr of currentPackets) {
                    const prev = prevPackets.find(p => p.id === curr.id);
                    if (!prev) continue;

                    // Event 1: Packet just arrived (reset progress to 0 or completed)
                    if (curr.progress < prev.progress || curr.status === 'completed') {
                        eventFound = true;
                        break;
                    }
                    // Event 2: Multiple hops status changed
                    if (curr.status !== prev.status) {
                        eventFound = true;
                        break;
                    }
                }

                // If there are no active packets, stop
                if (currentPackets.every(p => p.status === 'completed' || p.status === 'failed')) {
                    break;
                }
            }
            this.notify();
        }
    }

    reset(): void {
        this.graph.clear();
        this.packetEngine.clear();
        this.status = "idle";
        this.tick = 0;
        this.timeline = [];
        this.consoleLogs = [];
        this.whyModePrompt = null;
        this.whyModePromptIndex = 0;

        if (this.initialModuleConfig && this.activeModule) {
            const config = this.initialModuleConfig;
            for (const node of config.nodes) {
                this.graph.addNode({ ...node, state: "idle" });
            }
            for (const conn of config.connections) {
                this.graph.addConnection(conn);
            }
            this.whyModePrompts = config.whyModePrompts || [];
            if (config.initialPackets) {
                for (const pkt of config.initialPackets) {
                    this.packetEngine.spawnPacket({
                        protocol: pkt.protocol,
                        payload: pkt.payload,
                        label: pkt.label,
                        sourceNodeId: pkt.sourceNodeId,
                        targetNodeId: pkt.targetNodeId,
                    });
                }
            }
        }

        this.notify();
    }

    setSpeed(speed: number): void {
        this.speed = speed;
        this.notify();
    }

    // ---- Packet Creation ----

    spawnPacket(config: {
        protocol: ProtocolType;
        payload: string;
        label: string;
        sourceNodeId: string;
        targetNodeId: string;
    }): DataPacket {
        const pkt = this.packetEngine.spawnPacket(config);
        this.notify();
        return pkt;
    }

    // ---- Tick Logic (Multi-Hop with Reasoning) ----

    advanceTick(): void {
        // Don't tick if Why Mode prompt is active
        if (this.whyModePrompt) return;

        this.tick++;
        const increment = 0.005 * this.speed;

        const allPackets = this.packetEngine.getAllPackets();

        for (const packet of allPackets) {
            if (packet.status === "completed" || packet.status === "failed") continue;

            // Mark source node as active when packet starts moving
            if (packet.status === "pending") {
                this.packetEngine.updatePacket(packet.id, { status: "processing" });
                this.graph.updateNode(packet.sourceNodeId, { state: "active" });

                const sourceNode = this.graph.getNode(packet.sourceNodeId);
                this.log("info", `→ ${packet.label || packet.payload} departing ${this.getNodeName(packet.sourceNodeId)}`);
                if (sourceNode?.explanation) {
                    this.log("info", `  ℹ ${sourceNode.explanation}`);
                }
                this.addTimelineEvent("Packet Sent", `${packet.label} from ${this.getNodeName(packet.sourceNodeId)}`);
            }

            // Advance packet progress
            const newProgress = Math.min(1, packet.progress + increment);
            this.packetEngine.updatePacket(packet.id, { progress: newProgress });

            // Packet arrived at current target
            if (newProgress >= 1) {
                const arrivedNodeId = packet.targetNodeId;
                const arrivedNodeName = this.getNodeName(arrivedNodeId);

                // Update path
                const newPath = [...packet.path, arrivedNodeId];
                this.packetEngine.updatePacket(packet.id, {
                    currentNodeId: arrivedNodeId,
                    path: newPath,
                });

                // Mark arrived node as active
                this.graph.updateNode(arrivedNodeId, { state: "active" });
                // Mark previous source as idle
                this.graph.updateNode(packet.sourceNodeId, { state: "idle" });

                // Log arrival with reasoning
                const arrivedNode = this.graph.getNode(arrivedNodeId);
                this.log("success", `✓ ${packet.label || packet.payload} arrived at ${arrivedNodeName}`);
                if (arrivedNode?.explanation) {
                    this.log("info", `  ℹ ${arrivedNode.explanation}`);
                }

                // Log the connection reason
                const currentConnection = this.findConnectionBetween(packet.sourceNodeId, arrivedNodeId);
                if (currentConnection?.reason) {
                    this.log("info", `  → Why: ${currentConnection.reason}`);
                }

                // Check for Why Mode trigger BEFORE finding next hop
                if (currentConnection && this.checkWhyModeTrigger(arrivedNodeId, currentConnection.id)) {
                    // Why Mode paused the simulation - stop processing this packet
                    return;
                }

                // Find next hop from arrived node
                const nextConnection = this.findNextHop(arrivedNodeId, newPath, packet);

                if (nextConnection) {
                    const nextTargetName = this.getNodeName(nextConnection.target);
                    this.packetEngine.updatePacket(packet.id, {
                        sourceNodeId: arrivedNodeId,
                        targetNodeId: nextConnection.target,
                        progress: 0,
                        status: "processing",
                    });
                    this.addTimelineEvent("Next Hop", `${packet.label} → ${nextTargetName}`);

                    // Log why this hop happens
                    if (nextConnection.reason) {
                        this.log("info", `  → Next: ${nextConnection.reason}`);
                    }
                } else {
                    // No more hops - packet completed
                    this.packetEngine.updatePacket(packet.id, {
                        status: "completed",
                        progress: 1,
                    });
                    this.log("success", `🏁 ${packet.label || packet.payload} - journey complete (${newPath.length} hops)`);
                    this.addTimelineEvent("Completed", `${packet.label} delivered after ${newPath.length} hops`);
                    this.resetAllNodeStates();
                }
            }
        }
    }

    /**
     * Find the next connection to follow from the current node.
     * Avoids revisiting nodes already in the path (prevents loops).
     */
    private findNextHop(currentNodeId: string, path: string[], packet: DataPacket): Connection | null {
        const outgoing = this.graph.getConnectionsFrom(currentNodeId);
        const candidates = outgoing.filter(conn => !path.includes(conn.target));

        if (candidates.length === 0) return null;

        // If we have an exact protocol match, use it
        const exactMatch = candidates.find(c => c.protocol === packet.protocol);
        if (exactMatch) return exactMatch;

        // Special case: MERN/MEAN stack router (they both arrive at E as same protocol)
        if (currentNodeId === 'e') {
            return candidates.find(c => c.target === (packet.id === 'pkt_mean' ? 'a' : 'r')) || candidates[0];
        }

        return candidates[0];
    }

    private findConnectionBetween(sourceId: string, targetId: string): Connection | null {
        const connections = this.graph.getConnectionsFrom(sourceId);
        return connections.find(c => c.target === targetId) || null;
    }

    private getNodeName(nodeId: string): string {
        const node = this.graph.getNode(nodeId);
        return node ? node.name : nodeId;
    }

    private resetAllNodeStates(): void {
        for (const node of this.graph.getAllNodes()) {
            this.graph.updateNode(node.id, { state: "idle" });
        }
    }

    // ---- Logging ----

    log(level: ConsoleLog["level"], message: string): void {
        this.consoleLogs.push({ tick: this.tick, level, message });
    }

    addTimelineEvent(event: string, detail: string): void {
        this.timeline.push({ tick: this.tick, event, detail });
    }

    // ---- Graph Access ----

    getGraph(): SystemGraph {
        return this.graph;
    }

    getPacketEngine(): PacketEngine {
        return this.packetEngine;
    }

    // ---- Observable Pattern ----

    subscribe(listener: SimulationListener): () => void {
        this.listeners.add(listener);
        return () => { this.listeners.delete(listener); };
    }

    getSnapshot(): SimulationSnapshot {
        return {
            nodes: this.graph.getAllNodes(),
            connections: this.graph.getAllConnections(),
            packets: this.packetEngine.getAllPackets(),
            status: this.status,
            tick: this.tick,
            speed: this.speed,
            activeModule: this.activeModule,
            timeline: [...this.timeline],
            consoleLogs: [...this.consoleLogs],
            whyModeEnabled: this.whyModeEnabled,
            whyModePrompt: this.whyModePrompt,
            activeMission: this.activeMission,
            missionStatus: this.missionStatus,
            revealedHints: this.revealedHints,
            learningStory: this.initialModuleConfig?.learningStory || null,
        };
    }

    private notify(): void {
        const snapshot = this.getSnapshot();
        for (const listener of this.listeners) {
            listener(snapshot);
        }
    }

    // ---- Status Getters ----

    getStatus(): SimulationStatus { return this.status; }
    getTick(): number { return this.tick; }
    getSpeed(): number { return this.speed; }
    getActiveModule(): string | null { return this.activeModule; }
}
