import { TOPOLOGY_SERVER, TOPOLOGY_DATABASE, TOPOLOGY_OAUTH, TOPOLOGY_INDEXING, TOPOLOGY_RBAC } from '../topologies';
import { WipContent } from '../wip/wipModule';

export const serverAndDatabaseExtra: Record<string, WipContent> = {
    'req-res-obj': {
        title: 'Request & Response Objects',
        ...TOPOLOGY_SERVER,
        learningStory: {
            title: 'The Sacred Vessels',
            content: 'In Express, req holds everything incoming (headers, body, params), and res holds everything outgoing (status, JSON, cookies). Every middleware passes them down like a baton in a relay race.',
            analogy: 'An envelope full of instructions (req) that you open, read, and put a new letter (res) back inside.',
            lookFor: 'Watch the middleware tag the packet payload with a user ID before handing it precisely to the controller.'
        }
    },
    'sessions-jwt': {
        title: 'Sessions vs JWT',
        ...TOPOLOGY_SERVER,
        learningStory: {
            title: 'Stateful vs Stateless',
            content: 'Sessions store user data in server memory (stateful), while JWTs cryptographically sign user data and trust the client to hold it (stateless). JWTs scale better across load balancers.',
            analogy: 'A session is a coat check ticket (the physical coat stays at the club). A JWT is a driver\'s license (you carry it, and it proves your identity independently).',
            lookFor: 'See the JWT payload traversing rapidly through middleware authentication.'
        }
    },
    'cookies': {
        title: 'Cookies',
        ...TOPOLOGY_SERVER,
        learningStory: {
            title: 'The HTTP Memory',
            content: 'HTTP is notoriously forgetful (stateless). Cookies are snippets of text the server sends to the browser. The browser promises to include them on EVERY future request automatically.',
            analogy: 'A club handstamp that gets checked by the bouncer every single time you re-enter.',
            lookFor: 'Notice a Set-Cookie header returning to the client, and subsequent inbound packets bearing its mark.'
        }
    },
    'oauth': {
        title: 'OAuth Flow',
        ...TOPOLOGY_OAUTH,
        learningStory: {
            title: 'Delegated Access',
            content: 'OAuth lets users grant an app (like your MERN app) limited access to their data on another service (like Google or GitHub) without ever handing over their password.',
            analogy: 'Giving a valet a specialized key that only starts the car and opens the door, but refuses to open the trunk.',
            lookFor: 'A multi-step dance where the server redirects to an external provider before returning with an access token.'
        }
    },
    'rbac': {
        title: 'Role-Based Access Control',
        ...TOPOLOGY_RBAC,
        learningStory: {
            title: 'Who Can Do What?',
            content: 'RBAC checks if an authenticated user has the necessary permissions (Admin vs User) before executing a controller.',
            analogy: 'A VIP pass check after you are already inside the club.',
            lookFor: 'Notice the standard user getting rejected at the middleware level, while the admin goes through successfully.'
        }
    },
    'api-design': {
        title: 'API Design',
        ...TOPOLOGY_SERVER,
        learningStory: {
            title: 'The Contract',
            content: 'Great APIs are predictable. They use standard HTTP codes (200 OK, 404 Not Found, 500 Error), logical URL nouns, and never surprise the consumer.',
            analogy: 'Designing steering wheels and pedals so any driver can operate your car without reading a 500-page manual.',
            lookFor: 'Predictable HTTP verbs routing clean traffic through the controllers.'
        }
    },
    'rest-structure': {
        title: 'REST Architecture',
        ...TOPOLOGY_SERVER,
        learningStory: {
            title: 'Nouns and Verbs',
            content: 'A strict architectural style where /users/:id represents a noun resource, and GET/POST/PUT/DELETE define the action. Every response is independent.',
            analogy: 'A library system where books have exact Dewey Decimal locations regardless of who is asking for them.',
            lookFor: 'Distinct packets requesting specific resource URIs from the Controller.'
        }
    },
    'api-versioning': {
        title: 'API Versioning',
        ...TOPOLOGY_SERVER,
        learningStory: {
            title: 'Never Break the Client',
            content: 'When an API changes its data structure drastically, old mobile apps or websites will crash. We use /api/v1/ and /api/v2/ to serve both the old and new structures safely.',
            analogy: 'Releasing PlayStation 5 games but ensuring the old PlayStation 4 games still work on the older consoles.',
            lookFor: 'Two distinct pipelines routing differently depending on their version prefix.'
        }
    },
    'rate-limiting': {
        title: 'Rate Limiting',
        ...TOPOLOGY_SERVER,
        learningStory: {
            title: 'Defending the Gates',
            content: 'To prevent Distributed Denial of Service (DDoS) attacks or abuse, middleware tracks how many requests an IP sends and blocks them if they exceed the threshold.',
            analogy: 'A bartender cutting off a patron who orders too many drinks too fast.',
            lookFor: 'Watch middleware reject incoming traffic with a 429 Too Many Requests response.'
        }
    },
    'validation': {
        title: 'Validation (Zod/Joi)',
        ...TOPOLOGY_SERVER,
        learningStory: {
            title: 'Never Trust the Client',
            content: 'Validation libraries ensure incoming data is exactly the right shape (e.g., email is an email, age is a number > 0) before it touches business logic.',
            analogy: 'A bouncer checking IDs and dress codes before letting anyone near the VIP section.',
            lookFor: 'The middleware intercepting malformed packets and rejecting them before the controller.'
        }
    },
    'logging': {
        title: 'Logging',
        ...TOPOLOGY_SERVER,
        learningStory: {
            title: 'The Black Box',
            content: 'When a server crashes in production, there is no UI telling you why. Morgan, Winston, or Pino act as flight recorders, writing down every single request details.',
            analogy: 'Security cameras recording all traffic passing through the bank lobby.',
            lookFor: 'The middleware silently duplicating information to a file while the request proceeds.'
        }
    },
    'docs-collections': {
        title: 'Docs & Collections',
        ...TOPOLOGY_DATABASE,
        learningStory: {
            title: 'The Filing Cabinet',
            content: 'A Document is a single record (like a JSON object). A Collection is a bucket of similar Documents. Unlike SQL tables, collections don’t enforce rigid forms.',
            analogy: 'A folder (Collection) filled with different types of resumes (Documents).',
            lookFor: 'The API Server sending diverse JSON models into the generic BSON storage system.'
        }
    },
    'bson-json': {
        title: 'BSON vs JSON',
        ...TOPOLOGY_DATABASE,
        learningStory: {
            title: 'Binary JSON',
            content: 'MongoDB stores data as BSON (Binary JSON), which is faster to parse over networks and supports deeper data types like native Dates, ObjectIds, and raw Buffers.',
            analogy: 'JSON is an English paragraph. BSON is the compressed ZIP file translating it into machine code.',
            lookFor: 'The driver converting the string payload into a heavily compressed binary token.'
        }
    },
    'crud': {
        title: 'CRUD Operations',
        ...TOPOLOGY_DATABASE,
        learningStory: {
            title: 'The Four Actions',
            content: 'Create, Read, Update, Delete. These are the lifeblood of persistent applications. Every feature maps to one of these database operations.',
            analogy: 'Writing a note (C), reading it (R), fixing a typo (U), and throwing it away (D).',
            lookFor: 'Diverse payload patterns interacting dynamically with the storage layer.'
        }
    },
    'embed-ref': {
        title: 'Embedding vs Referencing',
        ...TOPOLOGY_DATABASE,
        learningStory: {
            title: 'The Mongoose Dilemma',
            content: 'Do you put comments INSIDE the post document (Embedding - great for reads), or do you make a separate comments collection and link them by ID (Referencing - great for writes)?',
            analogy: 'Putting the manual inside the glovebox (embed) vs keeping it at the dealership and giving the driver its address (ref).',
            lookFor: 'A multi-step query fetching a record, then fetching its populated reference.'
        }
    },
    'compound-indexes': {
        title: 'Compound Indexes',
        ...TOPOLOGY_INDEXING,
        learningStory: {
            title: 'Multi-Key Sorting',
            content: 'When you query by two fields (e.g., active = true AND age > 20), a single index isn’t enough. A compound index organizes data by multiple properties simultaneously.',
            analogy: 'A phone book sorted first by Last Name, then by First Name.',
            lookFor: 'The engine traversing a complex B-tree graph incredibly quickly.'
        }
    },
    'text-index': {
        title: 'Text Indexes',
        ...TOPOLOGY_INDEXING,
        learningStory: {
            title: 'The Search Engine',
            content: 'Text indexes tokenize paragraphs by dropping stop words (the, a, and) and stemming words (running -> run), enabling fast Google-like phrase searches.',
            analogy: 'Reading an entire book vs looking up a specific keyword in the glossary at the back.',
            lookFor: 'A text-based query directly hitting the optimized BSON search space.'
        }
    },
    'ttl-index': {
        title: 'TTL Index',
        ...TOPOLOGY_INDEXING,
        learningStory: {
            title: 'Self-Destructing Data',
            content: 'Time-To-Live indexes automatically delete documents from MongoDB after a specified time. Perfect for temporary password resets, session tokens, or cached data.',
            analogy: 'A Snapchat message that vanishes 10 seconds after opening.',
            lookFor: 'A background thread routinely sweeping the storage layer and erasing old data without API instruction.'
        }
    },
    'index-perf': {
        title: 'Index Performance',
        ...TOPOLOGY_DATABASE,
        learningStory: {
            title: 'The Hidden Cost',
            content: 'Indexes make READS lightning fast, but they make WRITES slower because the B-tree must be recalculated every time a new document is inserted. Do not index everything.',
            analogy: 'Updating an encyclopedia index every time a new page is printed slows the printing press down.',
            lookFor: 'A slow write latency offsetting an incredibly fast read performance.'
        }
    },
    'data-modeling': {
        title: 'Data Modeling Patterns',
        ...TOPOLOGY_DATABASE,
        learningStory: {
            title: 'The Schema Blueprint',
            content: 'Designing NoSQL requires predicting how your app will query data. If your app always queries A and B together, they should probably live in the same document.',
            analogy: 'Designing a grocery store layout so customers buying peanut butter immediately see the jelly.',
            lookFor: 'Mongoose transforming multi-faceted API demands into highly optimized queries.'
        }
    },
    'pagination': {
        title: 'Pagination Strategies',
        ...TOPOLOGY_DATABASE,
        learningStory: {
            title: 'Chunking the Data',
            content: 'Sending 10,000 records to the frontend will crash it. We use skip() and limit() (or cursor-based pagination) to pull chunks of 20 items at a time.',
            analogy: 'A book with pages instead of a single 300-foot-long scroll.',
            lookFor: 'Targeted read operations returning bounded JSON payloads.'
        }
    },
    'query-opt': {
        title: 'Query Optimization',
        ...TOPOLOGY_DATABASE,
        learningStory: {
            title: 'The Explain Plan',
            content: 'Query optimization involves using .explain() to verify if MongoDB used your indexes or resorted to a deadly collection scan. Also, using Projections to only return needed fields.',
            analogy: 'Taking the highway instead of driving through 50 red lights in city traffic.',
            lookFor: 'An intense visualization of a collection scan resolving into an indexed B-tree hop.'
        }
    },
    'replication': {
        title: 'Replication',
        ...TOPOLOGY_DATABASE,
        learningStory: {
            title: 'The Backup Plan',
            content: 'MongoDB Replica Sets consist of a Primary node (handles writes) and Secondary nodes (handle reads/backups). If the primary dies, a secondary instantly promotes itself.',
            analogy: 'A CEO with two highly informed Vice Presidents ready to take over if the CEO gets sick.',
            lookFor: 'Data writes broadcasting automatically to secondary nodes across the network.'
        }
    },
    'sharding': {
        title: 'Database Sharding',
        ...TOPOLOGY_DATABASE,
        learningStory: {
            title: 'Horizontal Scaling',
            content: 'When a database gets too massive (terabytes), Sharding splits the data across multiple machines based on a Shard Key (like splitting a phonebook by A-M and N-Z).',
            analogy: 'Instead of buying a bigger truck (Scaling Up), you buy a fleet of smaller delivery vans (Scaling Out).',
            lookFor: 'A query routing specifically to only the database server holding that shard of data.'
        }
    }
};
