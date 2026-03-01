import { WipContent } from "./wip/wipModule";
import { TOPOLOGY_FRONTEND, TOPOLOGY_SERVER, TOPOLOGY_DATABASE, TOPOLOGY_RUNTIME, TOPOLOGY_ARCHITECTURE, TOPOLOGY_MVC, TOPOLOGY_INDEXING, TOPOLOGY_AGGREGATION, TOPOLOGY_REACT_STATE, TOPOLOGY_MICROSERVICES, TOPOLOGY_AUTH_FLOW, TOPOLOGY_RBAC } from "./topologies";
import { basicsAndRuntimeExtra } from "./content/basicsAndRuntimeExtra";
import { serverAndDatabaseExtra } from "./content/serverAndDatabaseExtra";
import { frontendAndArchExtra } from "./content/frontendAndArchExtra";

export const CONTENT_BANK: Record<string, WipContent> = {
    // ----------------- BASICS -----------------
    'req-res': {
        title: 'Request-Response Lifecycle',
        description: 'How a client and server negotiate over HTTP.',
        ...TOPOLOGY_SERVER,
        learningStory: {
            title: 'The Infinite Loop of the Web',
            content: 'Every web interaction follows a strict cycle: a Client sends an HTTP Request (GET, POST), and the Server sends back an HTTP Response (200 OK, HTML/JSON). Without this, the web does not exist.',
            analogy: 'Ordering food at a restaurant: You ask the waiter (Request), the kitchen cooks it, and the waiter brings it back (Response).',
            lookFor: 'Watch the packet cross the wire, hit the server middleware, and return back down the pipeline.'
        }
    },
    'spa-mpa': {
        title: 'SPA vs MPA',
        description: 'Single Page Applications versus Multi Page Applications.',
        ...TOPOLOGY_FRONTEND,
        learningStory: {
            title: 'The Great Frontend Shift',
            content: 'MPAs (like old PHP/WordPress) request a full new HTML page on every click. SPAs (like React) load one single HTML shell and use JavaScript to swap out data and UI components instantly, preventing white-screen flashes.',
            analogy: 'MPA is buying a new car every time you need to change the radio station. SPA is just pressing the button on the dashboard.',
            lookFor: 'Notice how the React node stays active while only internally triggering the Virtual DOM, rather than triggering a full browser refresh.'
        }
    },
    'rest-fundamentals': {
        title: 'REST Fundamentals',
        description: 'Representational State Transfer and API Design.',
        ...TOPOLOGY_SERVER,
        learningStory: {
            title: 'Speaking the Same Language',
            content: 'REST is a set of rules for APIs. It uses URL paths as "Nouns" (e.g., /api/users) and HTTP verbs as "Actions" (GET, POST, PUT, DELETE). It must be stateless: the server remembers nothing between requests.',
            analogy: 'A library catalog. You use standard verbs to interact with resources (Books).',
            lookFor: 'Watch how different stateless packets travel individually through the router controller to fetch independent resources.'
        }
    },
    'json-flow': {
        title: 'JSON Data Flow',
        description: 'Javascript Object Notation traversing the stack.',
        ...TOPOLOGY_SERVER,
        learningStory: {
            title: 'The Universal Translator',
            content: 'JSON allows the React Client (which speaks JS), the Express Server (JS), and MongoDB (BSON) to send data universally. Data is "serialized" to sending and "parsed" back into native objects upon arrival.',
            analogy: 'Like translating a speech into English so diplomats from anywhere can understand it.',
            lookFor: 'Look for the serialization tagging on the packets traversing from Express down to the Database.'
        }
    },
    'mvc': {
        title: 'MVC Pattern',
        description: 'Model-View-Controller architecture.',
        ...TOPOLOGY_MVC,
        learningStory: {
            title: 'Dividing the Labor',
            content: 'MVC splits code into three parts: Models (Data logic), Views (UI logic), and Controllers (Business logic routing). Express handles the C, Mongoose the M, and React the V in the MERN stack.',
            analogy: 'The View is the restaurant menu, the Model is the pantry ingredients, and the Controller is the chef assembling the meal.',
            lookFor: 'Observe the routing controller pulling data from the DB Driver (Model) to send back out toward the client (View).'
        },
        whyModePrompts: [
            {
                question: "In MVC, why doesn't the View (React) directly talk to the Model (MongoDB)?",
                options: [
                    { label: "Because the View doesn't speak BSON.", isCorrect: false },
                    { label: "Because React only runs in the browser where it doesn't have database credentials for security.", isCorrect: true },
                    { label: "Because the Model is too slow to handle React requests.", isCorrect: false },
                    { label: "They do talk directly in the MERN stack.", isCorrect: false }
                ],
                correctIndex: 1,
                explanation: "Security and Separation of Concerns! The View executes on the user's insecure browser. Giving it database credentials would mean exposing your DB password to the world. It MUST go through the Controller API.",
                connectionId: "v-c",
                nodeId: "controller"
            },
            {
                question: "What is the Controller's main responsibility after fetching data from the Model?",
                options: [
                    { label: "To render the HTML directly onto the page.", isCorrect: false },
                    { label: "To shut down the database connection.", isCorrect: false },
                    { label: "To format the data and construct a Response (typically JSON) to send back to the View.", isCorrect: true },
                    { label: "To write the data to local storage.", isCorrect: false }
                ],
                correctIndex: 2,
                explanation: "The Controller (Express) acts as the Brain. It gets a request, asks the Model for raw data, bundles that data up perfectly, and sends it back to the View (React) which knows how to render it.",
                connectionId: "c-v",
                nodeId: "view"
            }
        ]
    },

    // ----------------- RUNTIME (NODE) -----------------
    'node-internals': {
        title: 'Node.js Internals',
        description: 'The architecture behind the Ryan Dahl engine.',
        ...TOPOLOGY_RUNTIME,
        learningStory: {
            title: 'V8 + Libuv = Node',
            content: 'Node.js is not a language; it is a C++ program. It binds Google Chrome\'s V8 JS Engine together with Libuv (a C library) which handles all the asynchronous I/O and the Event Loop.',
            analogy: 'V8 is the brain (thinking), Libuv is the nervous system (doing).',
            lookFor: 'Notice how JavaScript execution on the Call Stack delegates heavy lifting off to Libuv APIs.'
        }
    },
    'call-stack': {
        title: 'The Call Stack',
        description: 'How JS executes code synchronously.',
        ...TOPOLOGY_RUNTIME,
        learningStory: {
            title: 'One Thing At A Time',
            content: 'JS is single-threaded. The Call Stack is a LIFO (Last In First Out) queue of frames representing function calls. If a function is slow, the entire stack blocks.',
            analogy: 'A stack of plates. You can only wash the top plate, and you must wash it before you can reach the one under it.',
            lookFor: 'A synchronous frame landing on the V8 engine node and holding execution before passing on.'
        }
    },
    'event-loop': {
        title: 'The Event Loop',
        description: 'The heartbeat of Node.js concurrency.',
        ...TOPOLOGY_RUNTIME,
        learningStory: {
            title: 'The Non-Blocking Miracle',
            content: 'The Event Loop constantly checks if the Call Stack is empty. If it is, it grabs the first pending callback from the Task Queue and pushes it to the stack for execution, enabling non-blocking concurrency.',
            analogy: 'A revolving door that checks if the lobby is empty before letting the next guest inside.',
            lookFor: 'Watch the Event Loop node pull packets exclusively from the Task Queue up onto the main stack when idle.'
        }
    },
    // Adding general mappings to reuse Runtime
    'callbacks': {
        title: 'Callbacks',
        ...TOPOLOGY_RUNTIME,
        learningStory: {
            title: 'The "Call Me Back" Logic',
            content: 'A callback is a function passed as an argument. In Node, it is the primary way to handle long-running tasks: "Go fetch this file, and when you are done, run this specific function".',
            analogy: 'Leaving your phone number at a busy restaurant so they can call you when a table is free.',
            lookFor: 'Watch the telemetry event complete and then trigger a secondary execution on the V8 engine.'
        }
    },
    'promises': {
        title: 'JS Promises',
        ...TOPOLOGY_RUNTIME,
        learningStory: {
            title: 'The Future Guarantee',
            content: 'A Promise represents a value that might be available now, later, or never. It exists in three states: Pending, Fulfilled, or Rejected. It solves the nested "Callback Hell" problem.',
            analogy: 'Ordering food at a counter and receiving a buzzer that will alert you when your meal is ready.',
            lookFor: 'A packet moving to the Microtask Queue specifically for high-priority promise resolution.'
        }
    },
    'async-await': {
        title: 'Async/Await Syntax',
        ...TOPOLOGY_RUNTIME,
        learningStory: {
            title: 'Syntactic Sugar for Promises',
            content: 'Async/Await makes asynchronous code look and behave like synchronous code! The execution literally "pauses" at the await keyword until the promise resolves, but without blocking the entire server.',
            analogy: 'A chef pausing to wait for the oven timer, but still able to talk to other kitchen staff while waiting.',
            lookFor: 'Notice the execution frame halting on the V8 node without freezing the event loop pulse.'
        }
    },

    // ----------------- SERVER (EXPRESS) -----------------
    'express-core': {
        title: 'Express Pipeline',
        description: 'The unopinionated web framework for Node.',
        ...TOPOLOGY_SERVER,
        learningStory: {
            title: 'The Middleware River',
            content: 'Express is literally just a pipeline. A request comes in, and is passed through a sequence of functions called "Middleware" until one of them sends a "Response". If no one responds, it hangs.',
            analogy: 'An assembly line. The request (car frame) rolls down the line, and each middleware station modifies it or stops it.',
            lookFor: 'Watch the request physically step through the Middleware node, which parses JSON/CORS, before landing on the Route Controller.'
        }
    },
    'middleware': {
        title: 'Middleware Flow',
        description: 'Hooking into the request lifecycle.',
        ...TOPOLOGY_SERVER,
        learningStory: {
            title: 'The Interceptors',
            content: 'Middleware functions have access to the request (req) and response (res) objects. They can modify them, end the request early (like Auth failures), or call next() to pass control onward.',
            analogy: 'Security checkpoints at an airport. You pass through luggage check, metal detector, and passport control before reaching your terminal (the route handler).',
            lookFor: 'Trace the packet halting slightly at the Express Middleware node before continuing to the Controller.'
        }
    },
    'route-matching': { title: 'Express Route Matching', ...TOPOLOGY_SERVER },
    'error-middleware': { title: 'Global Error Handling', ...TOPOLOGY_SERVER },
    'controllers-routes': { title: 'Controllers vs Routes separation', ...TOPOLOGY_SERVER },

    'auth': {
        title: 'Authentication Concept',
        ...TOPOLOGY_AUTH_FLOW,
        learningStory: {
            title: 'Who Are You?',
            content: 'Authentication is verifying identity. Usually a client sends credentials, the server hashes them, compares against the DB, and issues a JWT token or Session Cookie if successful.',
            analogy: 'Checking an ID at the door of an exclusive club.',
            lookFor: 'The middleware validating a token before allowing the packet to reach the DB driver.'
        }
    },
    'authorization': {
        title: 'Authorization',
        ...TOPOLOGY_RBAC,
        learningStory: {
            title: 'Permissions & Roles',
            content: 'Authorization check occurs AFTER authentication. It determines if the identified user has the specific rights to view or modify a resource (e.g. Can this user delete this post?).',
            analogy: 'An ID gets you into the building (AuthN), but a keycard gets you into the server room (AuthZ).',
            lookFor: 'Watch the verified user packet hit the RBAC node and get rejected or passed based on its role metadata.'
        }
    },
    'password-hashing': {
        title: 'Bcrypt Password Hashing',
        ...TOPOLOGY_SERVER,
        learningStory: {
            title: 'The One-Way Trip',
            content: 'We NEVER store raw passwords. Bcrypt uses salting and slow hashing to secure passwords so that even if a database is hacked, the hacker only sees useless strings (hashes) that are impossible to reverse.',
            analogy: 'Turning fruits into a smoothie. You can identify the fruit by the taste, but you can never turn the smoothie back into a whole apple.',
            lookFor: 'The request payload being scrambled at the Controller node before hitting the DB persistence layer.'
        }
    },
    'rbac': {
        title: 'Role-Based Access Control',
        ...TOPOLOGY_RBAC,
        learningStory: {
            title: 'The Hierarchy of Access',
            content: 'RBAC maps users to "Roles" (Admin, Editor, Viewer), and roles to "Permissions". This makes managing 10,000 users simple: you just change the permissions of the "Editor" role once.',
            analogy: 'A king having different access levels than a knight or a peasant.',
            lookFor: 'See the standard user packet getting rejected at the RBAC middleware, while the admin goes through successfully.'
        }
    },

    // ----------------- DATABASE (MONGO) -----------------
    'mongodb-core': {
        title: 'MongoDB Core',
        description: 'NoSQL architecture and BSON persistence.',
        ...TOPOLOGY_DATABASE,
        learningStory: {
            title: 'Flexible Document Storage',
            content: 'Instead of rigid SQL tables, Mongo uses JSON-like Documents (BSON). Related data can be embedded within a single document, meaning joining tables is often unnecessary, drastically improving read speeds for certain workloads.',
            analogy: 'SQL is an organized filing cabinet with strict forms. Mongo is a series of digital folders where you can drop any type of document inside.',
            lookFor: 'Observe how the Mongoose packet translates schema validation straight into BSON storage execution.'
        }
    },
    'schema-design': {
        title: 'Mongoose Schema Design',
        ...TOPOLOGY_DATABASE,
        learningStory: {
            title: 'Strictness in a Schemaless World',
            content: 'While MongoDB is schemaless, Mongoose applies application-level schemas, validating data types and required fields before allowing the DB Driver to actually write to the database.',
            analogy: 'A bouncer holding a dress-code checklist before admitting data into the flexible party inside.',
            lookFor: 'The Mongoose ORM node intercepting the packet for validation logic prior to the DB engine.'
        }
    },
    'indexing': {
        title: 'MongoDB Indexing',
        ...TOPOLOGY_INDEXING,
        learningStory: {
            title: 'O(1) Data Retrieval',
            content: 'Indexes create a specialized B-Tree mapping to the exact location of documents on disk, preventing the Database from doing a devastating "Collection Scan" (reading every document one by one).',
            analogy: 'The index in the back of a textbook. You look up a word and jump straight to page 404, instead of reading from page 1.',
            lookFor: 'Watch the Mongo Engine node rapidly bypass standard querying via its B-Tree structure directly to Storage.'
        }
    },
    'aggregation': {
        title: 'Aggregation Pipelines',
        ...TOPOLOGY_AGGREGATION,
        learningStory: {
            title: 'The Industrial Data Shredder',
            content: 'Aggregation is used for complex data processing. Instead of pulling 10,000 documents to Node, we let Mongo $match, $group, and $sort them internally, returning only the final result.',
            analogy: 'Filtering, chopping, and cooking 100 vegetables in the kitchen and only bringing a finished soup to the guest.',
            lookFor: 'Data physically passing through successive nodes inside the database engine before returning a single result.'
        }
    },
    'transactions': {
        title: 'ACID Transactions',
        ...TOPOLOGY_DATABASE,
        learningStory: {
            title: 'All or Nothing',
            content: 'Transactions ensure that group of operations (like transferring money) either all succeed or all fail together. This prevents "partial writes" where one bank account is debited but the other is never credited.',
            analogy: 'Passing a baton in a relay race. If it is dropped, the whole team restarts; it only counts if it crosses the finish line.',
            lookFor: 'A cluster of database operations being staged and then committed or rolled back as a single atomic packet.'
        }
    },

    // ----------------- FRONTEND (REACT) -----------------
    'react-core': {
        title: 'React Core & VDOM',
        description: 'How React actually thinks and renders.',
        ...TOPOLOGY_FRONTEND,
        learningStory: {
            title: 'The Virtual DOM Illusion',
            content: 'React doesn\'t touch the real browser DOM immediately. It builds a fast, lightweight JavaScript copy (Virtual DOM). When state changes, it builds a new VDOM, compares it to the old one (Reconciliation), and only updates what specifically changed.',
            analogy: 'Instead of rebuilding the entire house when you want to paint a wall, React just sends a painter directly to that specific wall.',
            lookFor: 'See the React node rapidly reconcile the Virtual DOM before making a single costly update to the actual Real DOM.'
        }
    },
    'hooks': {
        title: 'React Hooks System',
        description: 'State and lifecycle in functional components.',
        ...TOPOLOGY_FRONTEND,
        learningStory: {
            title: 'Attaching Memory to Functions',
            content: 'Standard JavaScript functions forget everything once they execute. React Hooks (like useState) "hook" into the React runtime to attach persistent memory and side-effects (useEffect) to functions without needing ES6 Classes.',
            analogy: 'Like giving a goldfish a notebook so it remembers what happened 10 seconds ago across different function renders.',
            lookFor: 'The React Component retaining a state payload internally while rendering to the VDOM.'
        }
    },
    'state-props': { title: 'State vs Props Flow', ...TOPOLOGY_REACT_STATE },
    'context-api': {
        title: 'React Context API',
        ...TOPOLOGY_FRONTEND,
        learningStory: {
            title: 'Teleporting Data',
            content: 'Context allows data to "teleport" from a Parent component to a deep Child component without having to manually pass it through every mid-level component (Prop Drilling).',
            analogy: 'Installing a central heating system instead of carrying a small heater from room to room.',
            lookFor: 'A state payload bypassing the standard tree traversal and appearing directly at a distant leaf node.'
        }
    },
    'lazy-loading': {
        title: 'Lazy Loading Components',
        ...TOPOLOGY_FRONTEND,
        learningStory: {
            title: 'Load on Demand',
            content: 'Why load the "Dashboard" code when the user is only on the "Home" page? Lazy loading waits until the user actually interacts with a component before downloading its code.',
            analogy: 'Only opening the fridge door when you are actually hungry.',
            lookFor: 'React triggering a dynamic network fetch for a missing JS chunk only when the component node is activated.'
        }
    },

    // ----------------- ARCHITECTURE -----------------
    'system-design': {
        title: 'System Design Overview',
        description: 'Architecting for scale and resilience.',
        ...TOPOLOGY_ARCHITECTURE,
        learningStory: {
            title: 'Beyond a Single Server',
            content: 'Real applications don\'t run on your laptop. They run behind Load Balancers distributing traffic to multiple API servers, which query replicated Database shards, often with Caching Layers in between to avoid DB collapse.',
            analogy: 'Upgrading from a single chef running a food cart to an entire industrial kitchen with specialized stations.',
            lookFor: 'Notice the Load Balancer splitting traffic between Microservices, which interface with distributed Cache/DBs.'
        }
    },
    'microservices': { title: 'Microservices vs Monoliths', ...TOPOLOGY_MICROSERVICES },
    'caching': { title: 'Redis Caching Strategy', ...TOPOLOGY_ARCHITECTURE },
    'load-balancing': { title: 'Round-Robin Load Balancing', ...TOPOLOGY_ARCHITECTURE },

    ...basicsAndRuntimeExtra,
    ...serverAndDatabaseExtra,
    ...frontendAndArchExtra
};
