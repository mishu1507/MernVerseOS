import type { ModuleConfig, SystemNode, Connection } from "../../engine/types/system.types";

const nodes: [SystemNode, ...SystemNode[]] = [
    {
        id: "producer",
        name: "Task Producer",
        icon: "📤",
        category: "service",
        runtime: "event-loop",
        position: { x: 60, y: 220 },
        state: "idle",
        metadata: {},
        explanation: "The Producer is a service that needs a job done but doesn't want to wait for it. Example: A user uploads a video. The web server (Producer) sends a message 'Encode this video' to the queue and immediately tells the user 'Upload successful!'. Asynchronous tasks keep your frontend fast and responsive.",
    },
    {
        id: "queue",
        name: "Message Queue (RabbitMQ)",
        icon: "📥",
        category: "gateway",
        runtime: "event-loop",
        position: { x: 400, y: 100 },
        state: "idle",
        metadata: {},
        explanation: "The Queue is a 'buffer' that stores messages until they can be processed. It provides 'Decoupling': the Producer doesn't need to know who the Consumer is or if they are even online. If the Consumer is slow, the queue just grows. This protects your system from sudden traffic spikes by smoothing out the workload over time.",
    },
    {
        id: "consumer-1",
        name: "Worker 1 (Consumer)",
        icon: "⚙️",
        category: "service",
        runtime: "threaded",
        position: { x: 720, y: 60 },
        state: "idle",
        metadata: {},
        explanation: "Consumers (Workers) pull messages from the queue and perform the actual work (resizing images, sending emails, generating reports). You can have many workers. RabbitMQ distributes jobs among them (Round Robin). If a worker crashes while processing, the message stays in the queue and is sent to another worker — this is 'Fault Tolerance'.",
    },
    {
        id: "consumer-2",
        name: "Worker 2 (Consumer)",
        icon: "⚙️",
        category: "service",
        runtime: "threaded",
        position: { x: 720, y: 220 },
        state: "idle",
        metadata: {},
        explanation: "Scaling workers is easy. If the queue is getting too long (backlog), just spin up a second, third, or hundredth worker instance. This allows you to handle massive bursts of background work without slowing down the primary API that users are interacting with.",
    },
    {
        id: "ack-flow",
        name: "Acknowledgment (Ack)",
        icon: "📢",
        category: "middleware",
        runtime: "event-loop",
        position: { x: 400, y: 350 },
        state: "idle",
        metadata: {},
        explanation: "Acknowledgments are critical. A worker sends an 'Ack' back to the queue ONLY after the task is 100% finished. If a worker dies before sending the Ack, the queue knows the job wasn't finished and puts it back for someone else. This 'At-Least-Once' delivery guarantee ensures that no email or video encode is ever lost.",
    }
];

const connections: Connection[] = [
    { id: "c1", source: "producer", target: "queue", protocol: "internal", latency: 5, reason: "Task created! Producer publishes 'send-email' message. Web server is now free to handle more user requests." },
    { id: "c2", source: "queue", target: "consumer-1", protocol: "internal", latency: 2, reason: "Queue pushes message to Worker 1. Worker begins heavy CPU processing task." },
    { id: "c3", source: "queue", target: "consumer-2", protocol: "internal", latency: 2, reason: "Queue pushes next message to Worker 2. Load is distributed evenly across the worker pool." },
    { id: "c4", source: "consumer-1", target: "ack-flow", protocol: "internal", latency: 50, reason: "Task done! Worker 1 hits the API to send the email, then tells the queue 'Task Complete'." },
    { id: "c5", source: "ack-flow", target: "queue", protocol: "internal", latency: 2, reason: "Queue receives Ack and safely deletes the message from memory. Workflow successfully finished!" }
];

export function getMessageQueueModuleConfig(): ModuleConfig {
    return {
        moduleId: "message-queues",
        nodes,
        connections,
        initialPackets: [
            {
                id: "pkt_mq",
                protocol: "internal",
                label: "Asynchronous Job",
                payload: "Resize Image (Task ID: 987)",
                sourceNodeId: "producer",
                targetNodeId: "queue",
                currentNodeId: "producer",
                path: ["producer"],
                progress: 0,
                status: "pending",
                createdAt: Date.now(),
            }
        ],
        whyModePrompts: [
            {
                question: "What is the primary reason to use a Message Queue for sending emails?",
                options: [
                    { label: "Queues make emails arrive faster", isCorrect: false },
                    { label: "Email APIs can be slow or fail; a queue ensures the user doesn't have to wait and the email can be retried if it fails.", isCorrect: true },
                    { label: "Queues are more secure than direct API calls", isCorrect: false },
                    { label: "Queues are required by most email providers", isCorrect: false },
                ],
                correctIndex: 1,
                explanation: "Sending an email via a third-party API (like SendGrid) can take 2-5 seconds. If you do this 'synchronously' in your route handler, the user's browser spins for 5 seconds. By using a queue, you send the email in the background. If the email API is down, the message stays in the queue and the worker can retry it 5 minutes later automatically. This is 'Reliability' and 'UX optimization'.",
                connectionId: "c1",
                nodeId: "queue",
            }
        ],
        learningStory: {
            title: "The Post Office Warehouse",
            content: "Message Queues are like a post office. Instead of driving your letter directly to your friend (Synchronous), you drop it in a mailbox (The Queue). The mail truck (Worker) comes by later, picks up all the letters, and delivers them. If a mail truck breaks down, another truck picks up the letters. You can have more trucks for busy holidays (Scaling).",
            analogy: "A doctor's office waiting room. Patients (Tasks) sit in the room (Queue). When a doctor (Worker) is free, they call the next patient. If there are too many patients, the office brings in more doctors. The waiting room 'buffers' the sudden rush so the doctors can work at a steady, efficient pace.",
            lookFor: "Watch the 'Ack Flow'. It's like the signature when you receive a package. Without that signature, the post office doesn't know you got it and might try to deliver it again. This ensures that every job is accounted for!"
        }
    };
}
