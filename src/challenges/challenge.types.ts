export type SlotId = string;
export type ElementId = string;

export interface ChallengeElement {
  id: ElementId;
  label: string;
  icon: string;
  description: string;
  color: string; // CSS var like "var(--node-server)"
}

export interface ChallengeSlot {
  id: SlotId;
  x: number;
  y: number;
  hint: string;          // shown as tooltip on hover
  correctElementId: ElementId;
  placedElementId: ElementId | null;
}

export interface ChallengeConnection {
  id: string;
  fromSlotId: SlotId;
  toSlotId: SlotId;
  label: string;
  broken?: boolean; // red dashed line until solved
}

export interface ChallengeDefinition {
  id: string;
  title: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  briefing: string;          // the problem description
  systemLabel: string;       // e.g. "Fix the Express Pipeline"
  slots: ChallengeSlot[];
  connections: ChallengeConnection[];
  availableElements: ChallengeElement[]; // palette items (includes decoys)
  errorMessages: Record<SlotId, string>; // per-slot error when wrong element placed
  successStory: {
    title: string;
    content: string;
    analogy: string;
  };
}

export type ChallengeStatus = 'idle' | 'running' | 'error' | 'success';

export interface ChallengeState {
  placedElements: Record<SlotId, ElementId | null>;
  status: ChallengeStatus;
  errorSlots: SlotId[];
  errorMessage: string;
  attemptCount: number;
}
