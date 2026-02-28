// ========================================
// SystemGraph - Manages nodes & connections
// ========================================

import type { SystemNode, Connection } from "../types/system.types";

export class SystemGraph {
    private nodes: Map<string, SystemNode> = new Map();
    private connections: Map<string, Connection> = new Map();

    addNode(node: SystemNode): void {
        this.nodes.set(node.id, node);
    }

    removeNode(id: string): void {
        this.nodes.delete(id);
        // Remove connections involving this node
        for (const [connId, conn] of this.connections) {
            if (conn.source === id || conn.target === id) {
                this.connections.delete(connId);
            }
        }
    }

    getNode(id: string): SystemNode | undefined {
        return this.nodes.get(id);
    }

    getAllNodes(): SystemNode[] {
        return Array.from(this.nodes.values());
    }

    updateNode(id: string, updates: Partial<SystemNode>): void {
        const node = this.nodes.get(id);
        if (node) {
            this.nodes.set(id, { ...node, ...updates });
        }
    }

    addConnection(connection: Connection): void {
        this.connections.set(connection.id, connection);
    }

    removeConnection(id: string): void {
        this.connections.delete(id);
    }

    getConnection(id: string): Connection | undefined {
        return this.connections.get(id);
    }

    getAllConnections(): Connection[] {
        return Array.from(this.connections.values());
    }

    getConnectionsFrom(nodeId: string): Connection[] {
        return Array.from(this.connections.values()).filter(
            c => c.source === nodeId
        );
    }

    getConnectionsTo(nodeId: string): Connection[] {
        return Array.from(this.connections.values()).filter(
            c => c.target === nodeId
        );
    }

    getConnectionBetween(sourceId: string, targetId: string): Connection | undefined {
        return Array.from(this.connections.values()).find(
            c => c.source === sourceId && c.target === targetId
        );
    }

    clear(): void {
        this.nodes.clear();
        this.connections.clear();
    }
}
