import { TOPOLOGY_SERVER, TOPOLOGY_RUNTIME, TOPOLOGY_WORKER_THREADS, TOPOLOGY_STREAMS } from '../topologies';
import { WipContent } from '../wip/wipModule';

export const basicsAndRuntimeExtra: Record<string, WipContent> = {
    'env-vars': {
        title: 'Environment Variables',
        ...TOPOLOGY_SERVER,
        learningStory: {
            title: 'The Hidden Settings',
            content: 'Environment variables are configurations (like database passwords or API keys) injected at runtime via .env files, not hardcoded into the source code.',
            analogy: 'A secure recipe book where secret spices are added at the last minute by the head chef.',
            lookFor: 'Notice how the server boots up, pulls secrets out of the environment, and uses them to establish its DB connection securely.'
        }
    },
    'dev-prod': {
        title: 'Dev vs Production',
        ...TOPOLOGY_SERVER,
        learningStory: {
            title: 'Two Different Worlds',
            content: 'In development, apps run with hot-reloading, unoptimized code, and local databases. In production, they use minified code, caching, load balancers, and rigorous security.',
            analogy: 'Dev is a sandbox where mistakes are okay; Prod is the live stage where everything must be perfect.',
            lookFor: 'Observe how production architecture strictly filters error data, hiding stack traces from the client.'
        }
    },
    'common-mistakes': {
        title: 'Common Beginner Mistakes',
        ...TOPOLOGY_SERVER,
        learningStory: {
            title: 'Learning the Hard Way',
            content: 'New devs often make blocking calls in Node, mutate React state directly, or forget to await promises. This lab simulates those catastrophic failures.',
            analogy: 'Putting diesel in a gasoline car.',
            lookFor: 'Watch the server crash directly as an unhandled promise rejection destroys the Node process.'
        }
    },
    'why-async': {
        title: 'Why Async Exists',
        ...TOPOLOGY_RUNTIME,
        learningStory: {
            title: 'The Need for Speed',
            content: 'If JS waited for a 5-second database query, the entire frontend or server would freeze. Async prevents this by offloading the waiting time.',
            analogy: 'Ordering coffee and stepping aside to let the next person pay while your drink is made.',
            lookFor: 'Observe how the Call Stack immediately empties after issuing the fetch, keeping the thread responsive.'
        }
    },
    'state-confusion': {
        title: 'State Confusion',
        ...TOPOLOGY_RUNTIME,
        learningStory: {
            title: 'Who Holds the Truth?',
            content: 'State confusion happens when the UI and the Backend disagree about the truth (e.g. user is logged out on server, but UI still shows them logged in).',
            analogy: 'Two people having different versions of the same map.',
            lookFor: 'Notice the UI attempting an action, only for the Server to reject it due to outdated state parameters.'
        }
    },
    'non-blocking': {
        title: 'Non-Blocking I/O',
        ...TOPOLOGY_RUNTIME,
        learningStory: {
            title: 'Delegating Work',
            content: 'Node.js is extremely fast at I/O (Network, Disk) precisely because it does not do the work itself. It asks the OS, then moves on to the next request.',
            analogy: 'A rapid-fire dispatcher assigning tasks to an army of invisible workers.',
            lookFor: 'Watch Libuv intercept the I/O system call while the main V8 thread continues executing.'
        }
    },
    'threads-vs-event': {
        title: 'Threads vs Event Loop',
        ...TOPOLOGY_RUNTIME,
        learningStory: {
            title: 'Changing the Paradigm',
            content: 'Java/Python spawn a heavy OS thread for every request. Node uses one single thread with an event loop for everything, saving immense amounts of RAM.',
            analogy: 'Having 1,000 cashiers for 1,000 customers (Threads) vs one ultra-fast cashier who never stops moving (Event Loop).',
            lookFor: 'Notice all simulated inbound connections funneling into the exact same V8 instance, queued perfectly.'
        }
    },
    'worker-threads': {
        title: 'Worker Threads',
        ...TOPOLOGY_WORKER_THREADS,
        learningStory: {
            title: 'Breaking the Single-Thread Constraint',
            content: 'When Node needs to process extremely heavy CPU work (like video rendering or encryption), it can spawn actual Workers to run parallel JS instances.',
            analogy: 'The fast cashier calling in extra managers specifically to handle massive, complicated transactions.',
            lookFor: 'Watch the heavy payload bypass the standard event loop and jump entirely to an isolated Worker pool.'
        }
    },
    'streams': {
        title: 'Node.js Streams',
        ...TOPOLOGY_STREAMS,
        learningStory: {
            title: 'Flowing Data',
            content: 'Streams process large data chunk by chunk indefinitely instead of loading an entire file into memory at once. Perfect for video or massive CSVs.',
            analogy: 'Drinking from a water fountain continuously instead of trying to swallow an entire gallon bucket at once.',
            lookFor: 'See the data split into tiny chunks, moving steadily without overflowing the memory buffer.'
        }
    },
    'buffers': {
        title: 'Buffers',
        ...TOPOLOGY_RUNTIME,
        learningStory: {
            title: 'Raw Binary Data',
            content: 'JavaScript traditionally could not handle raw binary data. Buffers allow Node to read and manipulate raw memory allocations (TCP streams, file systems) directly.',
            analogy: 'A structured shipping container built perfectly to hold raw materials.',
            lookFor: 'A raw hex payload traversing the internal connection before serialization.'
        }
    },
    'error-prop': {
        title: 'Error Propagation',
        ...TOPOLOGY_RUNTIME,
        learningStory: {
            title: 'Bubbling Up',
            content: 'In async architecture, errors must be explicitly caught and thrown upwards (using Promise .catch or try/catch) or they will silently vanish or crash the app.',
            analogy: 'A worker dropping a package. If they do not explicitly tell the boss, the boss assumes task success.',
            lookFor: 'An Error injected deep in the DB driver correctly bubbling all the way up through middleware.'
        }
    }
};
