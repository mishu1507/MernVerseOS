import type { ChallengeDefinition } from './challenge.types';

/* ─── CHALLENGE 1: Fix the Express Middleware Pipeline ─── */
export const CHALLENGE_EXPRESS_PIPELINE: ChallengeDefinition = {
  id: 'express-pipeline',
  title: 'The Broken Express Pipeline',
  difficulty: 'beginner',
  category: 'Server',
  briefing: 'A junior dev set up an Express server but the pipeline is completely wrong. Users get 401 errors even with valid tokens, and the body is always undefined. Drag the correct middleware into each slot to fix the pipeline.',
  systemLabel: 'Fix the Express Middleware Order',
  slots: [
    { id: 'slot-1', x: 80,  y: 200, hint: 'Parses incoming JSON bodies so req.body works', correctElementId: 'body-parser', placedElementId: null },
    { id: 'slot-2', x: 280, y: 200, hint: 'Handles Cross-Origin Resource Sharing headers', correctElementId: 'cors',        placedElementId: null },
    { id: 'slot-3', x: 480, y: 200, hint: 'Verifies the JWT token before protected routes', correctElementId: 'auth-mw',    placedElementId: null },
    { id: 'slot-4', x: 680, y: 200, hint: 'Contains the actual business logic and DB calls', correctElementId: 'controller', placedElementId: null },
    { id: 'slot-5', x: 880, y: 200, hint: 'Catches errors and returns 4xx or 5xx responses', correctElementId: 'error-mw',   placedElementId: null },
  ],
  connections: [
    { id: 'c1', fromSlotId: 'slot-1', toSlotId: 'slot-2', label: 'next()',  broken: true },
    { id: 'c2', fromSlotId: 'slot-2', toSlotId: 'slot-3', label: 'next()',  broken: true },
    { id: 'c3', fromSlotId: 'slot-3', toSlotId: 'slot-4', label: 'next()',  broken: true },
    { id: 'c4', fromSlotId: 'slot-4', toSlotId: 'slot-5', label: 'next(err)', broken: true },
  ],
  availableElements: [
    { id: 'body-parser', label: 'Body Parser',    icon: '📦', description: 'express.json() — parses req.body',         color: 'var(--node-middleware)' },
    { id: 'cors',        label: 'CORS',           icon: '🌐', description: 'cors() — sets Access-Control headers',    color: 'var(--node-gateway)'    },
    { id: 'auth-mw',     label: 'Auth Middleware', icon: '🔐', description: 'verifyJWT() — checks Authorization header', color: 'var(--node-server)'  },
    { id: 'controller',  label: 'Controller',     icon: '🎛️', description: 'Route handler — business logic',          color: 'var(--node-service)'    },
    { id: 'error-mw',    label: 'Error Handler',  icon: '🚨', description: '4-param (err,req,res,next) error handler', color: 'var(--coral)'           },
    // decoys
    { id: 'rate-limit',  label: 'Rate Limiter',   icon: '🛑', description: 'Limits requests per IP per window',       color: 'var(--warning)'         },
    { id: 'logger',      label: 'Logger',         icon: '📝', description: 'Morgan/Winston request logger',           color: 'var(--info)'            },
  ],
  errorMessages: {
    'slot-1': '❌ Body Parser must come FIRST — otherwise req.body is undefined in all subsequent middleware',
    'slot-2': '❌ CORS middleware must come before auth — otherwise preflight OPTIONS requests get rejected before reaching your CORS handler',
    'slot-3': '❌ Auth middleware must come BEFORE the controller — it is the gatekeeper that protects the route',
    'slot-4': '❌ The controller handles business logic AFTER all middleware has validated the request',
    'slot-5': '❌ Error handler must be LAST and must have exactly 4 parameters: (err, req, res, next)',
  },
  successStory: {
    title: '🎉 Pipeline Fixed!',
    content: 'Express middleware runs in registration order. Body Parser must be first (parses the body for everyone downstream). CORS next (handles preflight before auth rejects it). Auth validates the token. Controller runs business logic. Error handler catches anything that went wrong. Order matters — every position in the chain has a reason.',
    analogy: 'Like airport security: first you check in (body parser — process your luggage), then immigration (CORS — are you allowed here?), then security (auth — verify your identity), then boarding (controller — you made it!), then lost baggage (error handler — something went wrong).',
  },
};

/* ─── CHALLENGE 2: Fix the MongoDB Query ─── */
export const CHALLENGE_MONGO_QUERY: ChallengeDefinition = {
  id: 'mongo-query',
  title: 'The Slow Database Query',
  difficulty: 'intermediate',
  category: 'Database',
  briefing: 'The user search endpoint takes 8 seconds. The collection has 500,000 users. Fix the query pipeline by placing the correct operators and ensure the index is used.',
  systemLabel: 'Optimize the MongoDB Pipeline',
  slots: [
    { id: 'slot-1', x: 80,  y: 200, hint: 'Filter documents early — uses the index if this field is indexed', correctElementId: 'match-op',   placedElementId: null },
    { id: 'slot-2', x: 280, y: 200, hint: 'The database structure that makes lookups O(log n)',               correctElementId: 'index',       placedElementId: null },
    { id: 'slot-3', x: 480, y: 200, hint: 'Reduce the document fields returned over the network',            correctElementId: 'projection',  placedElementId: null },
    { id: 'slot-4', x: 680, y: 200, hint: 'Cap the number of results returned',                              correctElementId: 'limit-op',    placedElementId: null },
  ],
  connections: [
    { id: 'c1', fromSlotId: 'slot-1', toSlotId: 'slot-2', label: 'scan', broken: true },
    { id: 'c2', fromSlotId: 'slot-2', toSlotId: 'slot-3', label: 'fetch', broken: true },
    { id: 'c3', fromSlotId: 'slot-3', toSlotId: 'slot-4', label: 'shape', broken: true },
  ],
  availableElements: [
    { id: 'match-op',   label: '$match',     icon: '🔍', description: 'Filters documents — place FIRST to use indexes', color: 'var(--node-database)' },
    { id: 'index',      label: 'B-Tree Index', icon: '📑', description: 'db.users.createIndex({email:1})',               color: 'var(--success)'       },
    { id: 'projection', label: '$project',   icon: '✂️', description: 'Include only needed fields, exclude _id etc.',   color: 'var(--node-middleware)'},
    { id: 'limit-op',   label: '$limit',     icon: '📄', description: 'Stop after N documents — always paginate',       color: 'var(--node-service)'  },
    // decoys
    { id: 'sort-op',    label: '$sort',      icon: '🔢', description: 'Orders results — expensive without index',       color: 'var(--warning)'       },
    { id: 'group-op',   label: '$group',     icon: '📊', description: 'Aggregates documents — not for simple queries',  color: 'var(--lavender)'      },
    { id: 'collscan',   label: 'COLLSCAN',   icon: '🐢', description: 'Full collection scan — reads every document',   color: 'var(--error)'         },
  ],
  errorMessages: {
    'slot-1': '❌ $match must be FIRST in the pipeline to benefit from indexes. Placing it after $sort forces a full collection scan first.',
    'slot-2': '❌ Without an index MongoDB must scan ALL 500,000 documents. Create the index: db.users.createIndex({email: 1})',
    'slot-3': '❌ $project reduces the data sent over the network. Without it you return every field in every document.',
    'slot-4': '❌ Always $limit your results. Without it a query matching 100,000 documents returns all 100,000 to your Node.js server, crashing it.',
  },
  successStory: {
    title: '🎉 Query Optimized!',
    content: 'Query went from 8000ms to 2ms — a 4000x speedup! $match first with an index converts a COLLSCAN (read all 500K docs) into an IXSCAN (read ~10 matching docs). $project reduces network payload. $limit prevents OOM crashes from huge result sets.',
    analogy: 'Like finding a book in a library. COLLSCAN = read every single book from cover to cover until you find the one you want. Index = look up the catalog (B-Tree), find the exact shelf and position, walk directly there. Same result, completely different cost.',
  },
};

/* ─── CHALLENGE 3: Fix the React Component ─── */
export const CHALLENGE_REACT_HOOKS: ChallengeDefinition = {
  id: 'react-hooks-order',
  title: 'The Infinite Re-render Loop',
  difficulty: 'intermediate',
  category: 'Frontend',
  briefing: 'A React component is stuck in an infinite loop — CPU at 100%, browser tab frozen. The developer used hooks incorrectly. Fix the component by placing hooks in the correct positions.',
  systemLabel: 'Fix the React Hook Order',
  slots: [
    { id: 'slot-1', x: 80,  y: 180, hint: 'Declare state variables at the TOP of the component', correctElementId: 'use-state-top',    placedElementId: null },
    { id: 'slot-2', x: 80,  y: 320, hint: 'Fetch data ONCE on mount with an empty dependency array', correctElementId: 'use-effect-deps', placedElementId: null },
    { id: 'slot-3', x: 400, y: 180, hint: 'Memoize the filtered list so it does not recalculate every render', correctElementId: 'use-memo-filter', placedElementId: null },
    { id: 'slot-4', x: 400, y: 320, hint: 'Memoize the event handler so child components do not re-render', correctElementId: 'use-callback-fn', placedElementId: null },
    { id: 'slot-5', x: 700, y: 250, hint: 'Return the JSX — hooks must ALL be called before any return', correctElementId: 'jsx-return',      placedElementId: null },
  ],
  connections: [
    { id: 'c1', fromSlotId: 'slot-1', toSlotId: 'slot-2', label: 'hook', broken: true },
    { id: 'c2', fromSlotId: 'slot-2', toSlotId: 'slot-3', label: 'hook', broken: true },
    { id: 'c3', fromSlotId: 'slot-3', toSlotId: 'slot-4', label: 'hook', broken: true },
    { id: 'c4', fromSlotId: 'slot-4', toSlotId: 'slot-5', label: 'render', broken: true },
  ],
  availableElements: [
    { id: 'use-state-top',    label: 'useState (top)',      icon: '💾', description: 'const [data, setData] = useState([])',          color: 'var(--node-client)'   },
    { id: 'use-effect-deps',  label: 'useEffect ([])',      icon: '🔮', description: 'useEffect(() => { fetch() }, []) — mount only', color: 'var(--node-service)'  },
    { id: 'use-memo-filter',  label: 'useMemo',             icon: '🧠', description: 'useMemo(() => data.filter(...), [data])',        color: 'var(--node-middleware)'},
    { id: 'use-callback-fn',  label: 'useCallback',         icon: '🎯', description: 'useCallback(() => handleClick(), [])',           color: 'var(--lavender)'      },
    { id: 'jsx-return',       label: 'return JSX',          icon: '⚛️', description: 'return <div>...</div> — always at the END',     color: 'var(--node-gateway)'  },
    // decoys
    { id: 'use-effect-nodeps', label: 'useEffect (no deps)', icon: '🔥', description: 'useEffect(() => { setState(...) }) — INFINITE LOOP', color: 'var(--error)' },
    { id: 'hook-in-if',       label: 'Hook in if()',        icon: '⚠️', description: 'if (condition) useState() — RULES VIOLATION',  color: 'var(--error)'         },
    { id: 'hook-in-loop',     label: 'Hook in for()',       icon: '⚠️', description: 'for (...) useEffect() — RULES VIOLATION',      color: 'var(--error)'         },
  ],
  errorMessages: {
    'slot-1': '❌ useState must be called at the TOP of the component unconditionally — never inside if/else or loops (Rules of Hooks)',
    'slot-2': '❌ useEffect without a dependency array [] runs after EVERY render — if it calls setState it creates an infinite loop! Always add [] for mount-only.',
    'slot-3': '❌ Without useMemo the filter runs on every render even when data has not changed — expensive operations should be memoized.',
    'slot-4': '❌ Without useCallback the function reference changes every render, causing memoized child components to re-render unnecessarily.',
    'slot-5': '❌ The return statement must come AFTER all hook calls. Placing return before hooks violates the Rules of Hooks.',
  },
  successStory: {
    title: '🎉 Infinite Loop Fixed!',
    content: 'The component now renders correctly with no loops. useState at the top declares state. useEffect([]) fetches data once on mount. useMemo caches the filtered list. useCallback stabilizes function references for child components. return JSX at the end. Rules of Hooks: always call hooks at the top level, never inside conditions or loops.',
    analogy: 'Like cooking a recipe: you gather ingredients first (useState), then follow the recipe steps in order (effects, memos, callbacks), then serve the dish (return JSX). You never skip to serving before gathering ingredients — the order is the recipe.',
  },
};

/* ─── CHALLENGE 4: Fix the Auth Flow ─── */
export const CHALLENGE_AUTH_FLOW: ChallengeDefinition = {
  id: 'auth-flow',
  title: 'The Broken Authentication',
  difficulty: 'advanced',
  category: 'Security',
  briefing: 'Users can log in but get logged out instantly. Also, passwords are stored in plain text in the database — a major security breach. Fix the auth flow by placing the correct security components.',
  systemLabel: 'Secure the Authentication Pipeline',
  slots: [
    { id: 'slot-1', x: 80,  y: 200, hint: 'Hash the password before storing — never store plaintext', correctElementId: 'bcrypt-hash',   placedElementId: null },
    { id: 'slot-2', x: 300, y: 200, hint: 'Compare the submitted password against the stored hash',  correctElementId: 'bcrypt-compare', placedElementId: null },
    { id: 'slot-3', x: 520, y: 200, hint: 'Generate a signed token on successful login',             correctElementId: 'jwt-sign',       placedElementId: null },
    { id: 'slot-4', x: 740, y: 200, hint: 'Store the token securely — NOT in localStorage',          correctElementId: 'http-only-cookie', placedElementId: null },
    { id: 'slot-5', x: 520, y: 380, hint: 'Verify the token on every protected request',             correctElementId: 'jwt-verify',     placedElementId: null },
  ],
  connections: [
    { id: 'c1', fromSlotId: 'slot-1', toSlotId: 'slot-2', label: 'stored hash', broken: true },
    { id: 'c2', fromSlotId: 'slot-2', toSlotId: 'slot-3', label: 'verified',    broken: true },
    { id: 'c3', fromSlotId: 'slot-3', toSlotId: 'slot-4', label: 'token',       broken: true },
    { id: 'c4', fromSlotId: 'slot-4', toSlotId: 'slot-5', label: 'cookie sent', broken: true },
  ],
  availableElements: [
    { id: 'bcrypt-hash',    label: 'bcrypt.hash()',    icon: '🔒', description: 'Hash password with salt before storing in DB',    color: 'var(--node-service)'   },
    { id: 'bcrypt-compare', label: 'bcrypt.compare()', icon: '🔍', description: 'Compare plaintext against stored hash safely',    color: 'var(--node-middleware)' },
    { id: 'jwt-sign',       label: 'jwt.sign()',       icon: '🎫', description: 'Sign payload with secret — creates access token', color: 'var(--node-gateway)'   },
    { id: 'http-only-cookie', label: 'httpOnly Cookie', icon: '🍪', description: 'Stores token — JS cannot access, XSS-safe',     color: 'var(--success)'        },
    { id: 'jwt-verify',     label: 'jwt.verify()',     icon: '✅', description: 'Validates token signature and expiry',            color: 'var(--node-database)'  },
    // decoys
    { id: 'plain-text',     label: 'Plain Text',       icon: '📝', description: '⚠️ Stores password as-is — NEVER do this',      color: 'var(--error)'          },
    { id: 'local-storage',  label: 'localStorage',     icon: '⚠️', description: '⚠️ XSS vulnerable — attackers can read tokens', color: 'var(--error)'          },
    { id: 'md5-hash',       label: 'md5(password)',    icon: '⚠️', description: '⚠️ MD5 is broken — cracked in milliseconds',    color: 'var(--error)'          },
  ],
  errorMessages: {
    'slot-1': '❌ Passwords must NEVER be stored in plaintext. Use bcrypt.hash(password, 10) — the salt factor makes brute-force impractical.',
    'slot-2': '❌ bcrypt.compare() safely compares plaintext against hash without revealing the hash. Never decrypt the hash — it is a one-way function.',
    'slot-3': '❌ After successful comparison generate a JWT with jwt.sign({userId, role}, secret, {expiresIn: "15m"}) — short expiry limits damage if stolen.',
    'slot-4': '❌ httpOnly cookies cannot be read by JavaScript — XSS attacks cannot steal them. localStorage is readable by any script on your page.',
    'slot-5': '❌ jwt.verify() must run on EVERY protected request. It checks the signature (was this really issued by us?) and the expiry (is it still valid?).',
  },
  successStory: {
    title: '🎉 Auth Flow Secured!',
    content: 'The authentication pipeline is now secure. bcrypt hashes passwords with a salt (each hash is unique even for the same password). bcrypt.compare() verifies without reversing. JWT signs a short-lived token. httpOnly cookie stores it safely away from XSS. jwt.verify() validates every protected request. Defense in depth — multiple layers protecting user accounts.',
    analogy: 'Like a bank vault. bcrypt = the combination lock (hard to crack). bcrypt.compare = the bank employee checking your combination without writing it down. JWT = a time-limited visitor badge. httpOnly cookie = keeping the badge in a locked drawer. jwt.verify = the guard checking the badge at every door.',
  },
};

/* ─── CHALLENGE 5: Fix the Microservices Architecture ─── */
export const CHALLENGE_MICROSERVICES: ChallengeDefinition = {
  id: 'microservices-arch',
  title: 'The Tangled Microservices',
  difficulty: 'advanced',
  category: 'Architecture',
  briefing: 'A monolith was split into microservices but everything is still tightly coupled — services call each other synchronously, there is no gateway, and no circuit breaker. Fix the architecture.',
  systemLabel: 'Design the Microservices Architecture',
  slots: [
    { id: 'slot-1', x: 80,  y: 220, hint: 'Single entry point — handles auth, rate limiting, routing', correctElementId: 'api-gateway',    placedElementId: null },
    { id: 'slot-2', x: 320, y: 100, hint: 'Handles user accounts and authentication',                  correctElementId: 'user-service',   placedElementId: null },
    { id: 'slot-3', x: 320, y: 340, hint: 'Handles order processing logic independently',              correctElementId: 'order-service',  placedElementId: null },
    { id: 'slot-4', x: 560, y: 220, hint: 'Async communication — decouples services from each other',  correctElementId: 'message-queue',  placedElementId: null },
    { id: 'slot-5', x: 760, y: 220, hint: 'Stops cascading failures when a service is slow or down',   correctElementId: 'circuit-breaker',placedElementId: null },
  ],
  connections: [
    { id: 'c1', fromSlotId: 'slot-1', toSlotId: 'slot-2', label: 'route',   broken: true },
    { id: 'c2', fromSlotId: 'slot-1', toSlotId: 'slot-3', label: 'route',   broken: true },
    { id: 'c3', fromSlotId: 'slot-3', toSlotId: 'slot-4', label: 'publish', broken: true },
    { id: 'c4', fromSlotId: 'slot-4', toSlotId: 'slot-5', label: 'consume', broken: true },
  ],
  availableElements: [
    { id: 'api-gateway',     label: 'API Gateway',     icon: '🚦', description: 'Nginx/Kong — single entry, auth, rate limit',   color: 'var(--node-gateway)'   },
    { id: 'user-service',    label: 'User Service',    icon: '👤', description: 'Isolated service with its own database',        color: 'var(--node-service)'   },
    { id: 'order-service',   label: 'Order Service',   icon: '📦', description: 'Isolated service with its own database',        color: 'var(--node-service)'   },
    { id: 'message-queue',   label: 'Message Queue',   icon: '📬', description: 'RabbitMQ/Kafka — async event-driven comm',      color: 'var(--node-queue)'     },
    { id: 'circuit-breaker', label: 'Circuit Breaker', icon: '⚡', description: 'Stops cascade failures — fail fast pattern',   color: 'var(--warning)'        },
    // decoys
    { id: 'direct-call',     label: 'Direct HTTP Call', icon: '⚠️', description: '⚠️ Tight coupling — one service down = all down', color: 'var(--error)'       },
    { id: 'shared-db',       label: 'Shared Database',  icon: '⚠️', description: '⚠️ Services sharing DB = tight coupling',     color: 'var(--error)'          },
  ],
  errorMessages: {
    'slot-1': '❌ Without an API Gateway every service must handle its own auth and rate limiting — massive duplication. Gateway centralizes cross-cutting concerns.',
    'slot-2': '❌ Each microservice must own its data — a User Service with its own database means teams can deploy independently without stepping on each other.',
    'slot-3': '❌ Order Service must be isolated. If it shares a database with User Service, you cannot deploy them independently or scale them separately.',
    'slot-4': '❌ Direct synchronous HTTP calls between services create tight coupling. If Order calls User synchronously and User is slow, Order is slow too. Use async messaging.',
    'slot-5': '❌ Without a circuit breaker, a slow downstream service causes threads to pile up waiting — the entire system cascades into failure. Circuit breaker fails fast.',
  },
  successStory: {
    title: '🎉 Architecture Fixed!',
    content: 'The microservices are now properly decoupled. API Gateway handles cross-cutting concerns (auth, rate limiting, routing). Each service owns its data. Message queue decouples services — Order publishes an event, User Service consumes it asynchronously. Circuit breaker prevents cascade failures. Each service can now be deployed, scaled, and maintained independently.',
    analogy: 'Like a city infrastructure: the city gate (API Gateway) controls who enters. Each neighborhood (service) has its own water supply (database). The postal system (message queue) delivers messages between neighborhoods without requiring anyone to be home. Emergency shutoffs (circuit breakers) prevent one burst pipe from flooding the whole city.',
  },
};

export const ALL_BUILD_CHALLENGES: ChallengeDefinition[] = [
  CHALLENGE_EXPRESS_PIPELINE,
  CHALLENGE_MONGO_QUERY,
  CHALLENGE_REACT_HOOKS,
  CHALLENGE_AUTH_FLOW,
  CHALLENGE_MICROSERVICES,
];
