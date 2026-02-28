// ========================================
// Packet Engine - Manages data packets
// ========================================

import type { DataPacket, ProtocolType, PacketStatus } from "../types/system.types";

let packetCounter = 0;

export function createPacketId(): string {
    return `pkt_${++packetCounter}`;
}

export class PacketEngine {
    private packets: Map<string, DataPacket> = new Map();

    spawnPacket(config: {
        protocol: ProtocolType;
        payload: string;
        label: string;
        sourceNodeId: string;
        targetNodeId: string;
    }): DataPacket {
        const packet: DataPacket = {
            id: createPacketId(),
            protocol: config.protocol,
            payload: config.payload,
            label: config.label,
            currentNodeId: config.sourceNodeId,
            sourceNodeId: config.sourceNodeId,
            targetNodeId: config.targetNodeId,
            path: [config.sourceNodeId],
            progress: 0,
            status: "pending",
            createdAt: Date.now(),
        };
        this.packets.set(packet.id, packet);
        return packet;
    }

    getPacket(id: string): DataPacket | undefined {
        return this.packets.get(id);
    }

    getAllPackets(): DataPacket[] {
        return Array.from(this.packets.values());
    }

    getActivePackets(): DataPacket[] {
        return this.getAllPackets().filter(
            p => p.status === "pending" || p.status === "processing"
        );
    }

    updatePacket(id: string, updates: Partial<DataPacket>): void {
        const packet = this.packets.get(id);
        if (packet) {
            this.packets.set(id, { ...packet, ...updates });
        }
    }

    setStatus(id: string, status: PacketStatus): void {
        this.updatePacket(id, { status });
    }

    advancePacket(id: string, increment: number): void {
        const packet = this.packets.get(id);
        if (!packet) return;

        const newProgress = Math.min(1, packet.progress + increment);
        const updates: Partial<DataPacket> = { progress: newProgress };

        if (newProgress >= 1) {
            updates.status = "completed";
            updates.currentNodeId = packet.targetNodeId;
            updates.path = [...packet.path, packet.targetNodeId];
        } else if (packet.status === "pending") {
            updates.status = "processing";
        }

        this.packets.set(id, { ...packet, ...updates });
    }

    removePacket(id: string): void {
        this.packets.delete(id);
    }

    removeCompleted(): void {
        for (const [id, packet] of this.packets) {
            if (packet.status === "completed" || packet.status === "failed") {
                this.packets.delete(id);
            }
        }
    }

    clear(): void {
        this.packets.clear();
        packetCounter = 0;
    }
}
