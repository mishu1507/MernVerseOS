import { TOPOLOGY_FRONTEND, TOPOLOGY_ARCHITECTURE, TOPOLOGY_SERVER } from '../topologies';
import { WipContent } from '../wip/wipModule';

export const frontendAndArchExtra: Record<string, WipContent> = {
    'vdom': {
        title: 'Virtual DOM',
        ...TOPOLOGY_FRONTEND,
        learningStory: {
            title: 'The Browser Blueprint',
            content: 'React keeps a copy of the actual DOM in memory as pure JavaScript. Adjusting JS is incredibly fast; adjusting the actual browser screen layout is incredibly slow.',
            analogy: 'Drafting changes on architectural blueprints instead of knocking down walls to see how a room looks.',
            lookFor: 'Watch mutations happen entirely inside the lightweight VDOM, shielding the sluggish browser DOM from constant rerouting.'
        }
    },
    'reconciliation': {
        title: 'Reconciliation',
        ...TOPOLOGY_FRONTEND,
        learningStory: {
            title: 'The Magic Diff Algorithm',
            content: 'When React state changes, it generates a new VDOM. Reconciliation is the process of comparing the old VDOM against the new one (diffing), and calculating the absolute minimum number of real DOM updates required.',
            analogy: 'Spot the Differences game, quickly noting what changed in two pictures and only repainting those exact pixels.',
            lookFor: 'A burst of internal comparisons settling on a single, optimized DOM patch.'
        }
    },
    'component-lifecycle': {
        title: 'Component Lifecycle',
        ...TOPOLOGY_FRONTEND,
        learningStory: {
            title: 'Birth, Life, Death',
            content: 'Components Mount (render onto screen), Update (when state/props change), and Unmount (removed from screen). Using useEffect, we hook logic into these critical phases.',
            analogy: 'Checking the oil when a car engine starts (mount), while driving (update), and turning it off when parked (unmount).',
            lookFor: 'Events consistently triggering the React node before traversing down to the real DOM.'
        }
    },
    'controlled-components': {
        title: 'Controlled Components',
        ...TOPOLOGY_FRONTEND,
        learningStory: {
            title: 'Single Source of Truth',
            content: 'Instead of the browser managing an input\'s value (uncontrolled), React forcibly intercepts every keystroke, stores it in State, and passes it back down. React is the absolute authority.',
            analogy: 'A puppet master dictating the exact movements of a browser input field.',
            lookFor: 'Data flowing completely back up into React UI logic before returning downward into the VDOM for render.'
        }
    },
    'state-arch': {
        title: 'State Architecture',
        ...TOPOLOGY_FRONTEND,
        learningStory: {
            title: 'Structuring React Memory',
            content: 'State describes what your app looks like at any given moment. Proper architecture means keeping it minimal, lifting it up when sibling components share it, and never duplicating it maliciously.',
            analogy: 'A well-organized system of filing cabinets instead of scattering papers across your desk.',
            lookFor: 'State objects being efficiently managed inside the React Component node.'
        }
    },
    'local-state': {
        title: 'Local State',
        ...TOPOLOGY_FRONTEND,
        learningStory: {
            title: 'useState Hooks',
            content: 'State that belongs strictly to one component (like an active tab index, or a typing input). It does not need to be shared globally across the app.',
            analogy: 'Keeping a running tally in your head of how many coffees you drank today.',
            lookFor: 'Tight, isolated event telemetry bouncing internally within the React Component.'
        }
    },
    'global-state': {
        title: 'Global State (Redux/Zustand)',
        ...TOPOLOGY_FRONTEND,
        learningStory: {
            title: 'Beyond Context',
            content: 'When data (like the logged-in User profile or Shopping Cart) needs to be read from twenty different random components, we lift it into an external, global Store.',
            analogy: 'A public bulletin board where anyone in the town can check or update the daily temperature.',
            lookFor: 'Telemetry triggering widespread UI Logic updates across the application.'
        }
    },
    'server-ui-state': {
        title: 'Server vs UI State',
        ...TOPOLOGY_FRONTEND,
        learningStory: {
            title: 'Remote vs Local Reality',
            content: 'UI State is temporary (e.g. "Is this dropdown open?"). Server State is persistent (e.g. "What is this user\'s email?"). Tools like React Query handle Server State caching, leaving Redux purely for UI.',
            analogy: 'UI State is arranging the furniture in a room; Server State is the actual deed to the house.',
            lookFor: 'A distinct separation between Network API telemetry and local React DOM interactions.'
        }
    },
    'memoization': {
        title: 'React Memoization',
        ...TOPOLOGY_FRONTEND,
        learningStory: {
            title: 'Preventing Wasted Renders',
            content: 'If the Parent state changes but the Child component receives the exact same props, there is no reason to re-render the Child. useMemo, useCallback, and React.memo prevent heavy operations from repeating pointlessly.',
            analogy: 'Memorizing the answer to 452 x 19 so you don’t have to do the math every single time someone asks.',
            lookFor: 'The React node rejecting a full render cycle after comparing inputs and returning a cached VDOM.'
        }
    },
    'suspense': {
        title: 'React Suspense',
        ...TOPOLOGY_FRONTEND,
        learningStory: {
            title: 'Waiting Gracefully',
            content: 'Suspense allows a React component to literally "pause" its rendering and fallback to a spinner while it waits for a Promise (like a large code chunk or API data) to resolve.',
            analogy: 'A loading screen that plays a mini-game while the real level loads into memory.',
            lookFor: 'React pausing interaction rendering, awaiting async payload completion before finalizing Real DOM.'
        }
    },
    'code-splitting': {
        title: 'Code Splitting',
        ...TOPOLOGY_FRONTEND,
        learningStory: {
            title: 'Shipping Shards of JS',
            content: 'Instead of forcing the user to download a massive 5MB bundle to view the login page, modern bundlers (Webpack/Vite) split the JS into smaller chunks and only load them lazily when navigated to.',
            analogy: 'Reading a massive encyclopedia by taking out one thin volume at a time.',
            lookFor: 'React lazily requesting an extra module file dynamically over the network.'
        }
    },
    'client-api-db': {
        title: 'Client → API → DB',
        ...TOPOLOGY_ARCHITECTURE,
        learningStory: {
            title: 'The Great Pipeline',
            content: 'The holy trinity of web architecture. Frontends talk to APIs (not directly to databases for security reasons), and APIs hold the exact credentials required to speak to the Database securely.',
            analogy: 'A drive-through system: You (Client) speak to the intercom (API) which shouts to the fry-cook (Database).',
            lookFor: 'Data leaving the Client, jumping through Load Balancing/API layers, before finally interacting with Redis/Mongo.'
        }
    },
    'serialization': {
        title: 'Serialization Flow',
        ...TOPOLOGY_ARCHITECTURE,
        learningStory: {
            title: 'Across the Wire',
            content: 'Memory objects (like V8 Maps or Arrays) cannot be sent across a network cable. They must be "Serialized" into flat strings (JSON) and "Deserialized" upon arrival into identical objects.',
            analogy: 'Taking apart a Lego castle bit by bit to fit it into a shipping box, and rebuilding it using instructions upon arrival.',
            lookFor: 'The serialization protocols activating at the boundary of massive network hops.'
        }
    },
    'caching-layers': {
        title: 'Multi-Tier Caching',
        ...TOPOLOGY_ARCHITECTURE,
        learningStory: {
            title: 'Never Calculate Twice',
            content: 'Caching happens everywhere. Browsers cache images, CDNs cache HTML, Redis caches slow DB queries... saving the server from repeating identical expensive work.',
            analogy: 'Creating a highly requested document on a photocopier instead of writing it out by hand each time.',
            lookFor: 'A massive database read being completely bypassed by a lightning-fast Redis cache hit.'
        }
    },
    'data-transformation': {
        title: 'Data Transformation',
        ...TOPOLOGY_SERVER,
        learningStory: {
            title: 'Sanitization & Formatting',
            content: 'Databases hold raw, often chaotic data. Before sending it to the client, the Server must transform it: hiding passwords, formatting dates, aggregating nested relationships.',
            analogy: 'Mining raw iron ore, smelting it, and forging it into a sword before handing it to a customer.',
            lookFor: 'Middleware intercepting the DB response, modifying it, and shipping a clean package to the client.'
        }
    },
    'error-flow': {
        title: 'Distributed Error Flow',
        ...TOPOLOGY_ARCHITECTURE,
        learningStory: {
            title: 'When Systems Crash',
            content: 'If the DB dies, the Microservice must catch the error, inform the Load Balancer, and return a clean 500 error to the client instead of a 20-second hanging white screen.',
            analogy: 'A restaurant kitchen catching fire, and the waiter calmly informing you that your ordered dish is unavailable.',
            lookFor: 'An explosive crash in the DB elegantly translating into a soft error response crossing the API boundary.'
        }
    },
    'monolith-micro': {
        title: 'Monolith vs Microservices',
        ...TOPOLOGY_ARCHITECTURE,
        learningStory: {
            title: 'The Big Split',
            content: 'A Monolith is one giant server code base doing Auth, Video Processing, and Chat. Microservices splits these into entirely separate servers that communicate via internal APIs or Message Queues. Highly scalable, but much harder to debug.',
            analogy: 'A universal swiss army knife vs an entire garage full of highly specialized power tools.',
            lookFor: 'Traffic bouncing unpredictably between multiple distinct API services before responding.'
        }
    },
    'graphql': {
        title: 'GraphQL Architecture',
        ...TOPOLOGY_ARCHITECTURE,
        learningStory: {
            title: 'The Over-Fetching Solution',
            content: 'Unlike REST which hits /users then /posts, GraphQL hits a single /graphql endpoint and asks for EXACTLY what it wants ("Give me the user name, and only their top 5 post titles").',
            analogy: 'Going to an all-you-can-eat buffet and filling exactly 3 plates (REST), vs handing a waiter an exact list of 4 specific ingredients you want mixed (GraphQL).',
            lookFor: 'A massive query object resolving entirely within the Microservice layer and avoiding multiple network round trips.'
        }
    },
    'websockets': {
        title: 'WebSockets Flow',
        ...TOPOLOGY_ARCHITECTURE,
        learningStory: {
            title: 'The Persistent Connection',
            content: 'HTTP requests are strictly one-way (Client asks, Server responds). WebSockets upgrade the connection to be fully bi-directional. The server can push data to the client whenever it wants (like Chat Apps).',
            analogy: 'HTTP is sending a letter and waiting for a response. WebSockets is a direct phone call where both can speak simultaneously.',
            lookFor: 'Bi-directional, extremely low-latency traffic pushing rapidly from Load Balancer to Client without request prompts.'
        }
    },
    'message-queues': {
        title: 'Message Queues (RabbitMQ/Kafka)',
        ...TOPOLOGY_ARCHITECTURE,
        learningStory: {
            title: 'Asynchronous Architecture',
            content: 'If an API task takes 20 seconds (like sending 500 emails), the user screen freezes. With message queues, the API drops the task in a queue, responds "Processing!", and a background worker handles the emails later.',
            analogy: 'Dropping your film rolls off at the pharmacy and getting a ticket, instead of standing at the counter for an hour while they develop them.',
            lookFor: 'Traffic dumping into Redis/Mongo data persistence rapidly, freeing up the API service instantly.'
        }
    },
    'api-gateway': {
        title: 'API Gateway',
        ...TOPOLOGY_ARCHITECTURE,
        learningStory: {
            title: 'The Mega-Bouncer',
            content: 'Before traffic hits your 50 microservices, it hits an API Gateway (like NGINX or AWS API Gateway). It handles SSL, rate-limiting, auth checking, and routing so your actual services can focus purely on business logic.',
            analogy: 'A massive switchboard operator connecting outside calls to the correct internal desk extensions securely.',
            lookFor: 'A Load Balancer aggressively filtering traffic and auth headers before ever transmitting to the Microservice layer.'
        }
    }
};
