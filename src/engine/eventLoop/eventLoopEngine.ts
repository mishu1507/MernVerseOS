// ========================================
// Event Loop Engine - Node.js runtime sim
// ========================================

export interface EventLoopState {
    callStack: string[];
    callbackQueue: string[];
    pendingIO: string[];
    microtaskQueue: string[];
}

export class EventLoopEngine {
    private state: EventLoopState = {
        callStack: [],
        callbackQueue: [],
        pendingIO: [],
        microtaskQueue: [],
    };

    pushToCallStack(task: string): void {
        this.state.callStack.push(task);
    }

    popFromCallStack(): string | undefined {
        return this.state.callStack.pop();
    }

    addToPendingIO(task: string): void {
        this.state.pendingIO.push(task);
    }

    completeIO(task: string): void {
        this.state.pendingIO = this.state.pendingIO.filter(t => t !== task);
        this.state.callbackQueue.push(task);
    }

    addMicrotask(task: string): void {
        this.state.microtaskQueue.push(task);
    }

    /**
     * One tick of the event loop:
     * 1. Process all microtasks first
     * 2. If call stack is empty, dequeue one callback
     */
    tick(): string | null {
        // Process microtasks first
        if (this.state.callStack.length === 0 && this.state.microtaskQueue.length > 0) {
            const micro = this.state.microtaskQueue.shift();
            if (micro) {
                this.state.callStack.push(micro);
                return micro;
            }
        }

        // Then process callback queue
        if (this.state.callStack.length === 0 && this.state.callbackQueue.length > 0) {
            const next = this.state.callbackQueue.shift();
            if (next) {
                this.state.callStack.push(next);
                return next;
            }
        }

        return null;
    }

    isBlocked(): boolean {
        return this.state.callStack.length > 0;
    }

    getState(): Readonly<EventLoopState> {
        return { ...this.state };
    }

    reset(): void {
        this.state = {
            callStack: [],
            callbackQueue: [],
            pendingIO: [],
            microtaskQueue: [],
        };
    }
}
