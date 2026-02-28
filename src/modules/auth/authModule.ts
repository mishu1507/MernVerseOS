// ========================================
// Authentication Flow Module - Level 2-3 Engineering Depth
// bcrypt internals, JWT structure, token rotation, CSRF/XSS
// ========================================

import type { ModuleConfig, SystemNode, Connection } from "../../engine/types/system.types";

const nodes: SystemNode[] = [
    {
        id: "client",
        name: "Client",
        icon: "🌐",
        category: "client",
        runtime: "event-loop",
        position: { x: 60, y: 200 },
        state: "idle",
        metadata: { transport: "HTTPS POST", body: "{ email, password }" },
        explanation: "What: The client sends login credentials via POST body over HTTPS. Credentials are in the request body - never in URL query params (they appear in server logs, browser history, and referrer headers). Why: HTTPS encrypts the body in transit (TLS). Without it, credentials are visible to any network observer (MITM attacks). Breaks when: You send credentials over HTTP, include them in GET params, or store them in localStorage without encryption. Also: the client should hash nothing - server-side hashing prevents timing attacks.",
    },
    {
        id: "rate-limiter",
        name: "Rate Limiter",
        icon: "🚦",
        category: "middleware",
        runtime: "event-loop",
        position: { x: 200, y: 80 },
        state: "idle",
        metadata: { algorithm: "sliding window or token bucket", limit: "5 attempts / 15 min per IP" },
        explanation: "What: Before processing login attempts, a rate limiter checks how many attempts this IP (or email) has made recently. After N failures, the account is temporarily locked. Why: Without rate limiting, attackers can brute-force passwords at thousands of attempts per second. Rate limiting makes brute-force impractical. Breaks when: You rate-limit only by IP (attackers use distributed botnets). Best practice: rate-limit by BOTH IP and email. Also consider exponential backoff: 1s, 2s, 4s, 8s delays.",
    },
    {
        id: "auth-server",
        name: "Auth Service",
        icon: "🔐",
        category: "service",
        runtime: "event-loop",
        position: { x: 200, y: 320 },
        state: "idle",
        metadata: { responsibility: "validate credentials, issue tokens" },
        explanation: "What: The auth service receives validated credentials and orchestrates the authentication flow: find user → compare password hash → generate tokens. It's a dedicated service (not mixed into business logic). Why: Separating auth into its own service follows the single-responsibility principle. Auth logic (hashing, token management, session handling) is security-critical and should be isolated. Breaks when: Auth logic is scattered across multiple controllers. Security bugs become harder to audit and fix.",
    },
    {
        id: "user-db",
        name: "User Database",
        icon: "🗄",
        category: "database",
        runtime: "blocking",
        position: { x: 380, y: 80 },
        state: "idle",
        metadata: { stored: "email (indexed), password_hash, salt, role, created_at" },
        explanation: "What: Stores user records with bcrypt-hashed passwords. The email field MUST be indexed for O(log n) lookups. Passwords are NEVER stored in plain text - only the bcrypt hash (which includes the salt). Why: If the database is breached, bcrypt hashes are computationally expensive to crack (~250ms per attempt vs nanoseconds for MD5). The salt prevents rainbow table attacks. Breaks when: You use MD5/SHA for passwords (too fast to crack), store passwords without salt, or don't index the email field (full table scan on every login).",
    },
    {
        id: "bcrypt",
        name: "bcrypt Compare",
        icon: "🔒",
        category: "service",
        runtime: "blocking",
        position: { x: 380, y: 200 },
        state: "idle",
        metadata: { costFactor: 10, time: "~100ms per comparison", algorithm: "Blowfish-based key derivation" },
        explanation: "What: bcrypt.compare(submitted_password, stored_hash) re-hashes the submitted password with the same salt (embedded in the hash) and compares. It runs on a libuv thread (blocking). Why: bcrypt is intentionally SLOW (~100ms with cost factor 10). This is by design - it makes brute-force cracking impractical. Each cost factor increase doubles the time. Breaks when: Cost factor is too low (fast cracking) or too high (login takes seconds). Also: bcrypt runs on the libuv thread pool (default: 4 threads). Under heavy load, login requests queue up. Increase UV_THREADPOOL_SIZE.",
    },
    {
        id: "jwt-gen",
        name: "JWT Generator",
        icon: "🎫",
        category: "service",
        runtime: "event-loop",
        position: { x: 380, y: 320 },
        state: "idle",
        metadata: { structure: "header.payload.signature", alg: "HS256 or RS256", expiresIn: "15m access, 7d refresh" },
        explanation: "What: Generates a JWT with three Base64-encoded parts: header (algorithm), payload (userId, role, exp), and signature (HMAC-SHA256 of header+payload+secret). Why: JWTs are stateless - the server doesn't need a session store. The signature prevents tampering: if anyone modifies the payload, the signature won't match. Breaks when: You put sensitive data in the payload (it's Base64-encoded, NOT encrypted - anyone can decode it). Also: if the JWT secret is weak or leaked, anyone can forge valid tokens.",
    },
    {
        id: "refresh-token",
        name: "Refresh Token",
        icon: "🔄",
        category: "service",
        runtime: "event-loop",
        position: { x: 560, y: 320 },
        state: "idle",
        metadata: { storage: "httpOnly cookie", lifetime: "7 days", rotation: "new refresh token on each use" },
        explanation: "What: A long-lived refresh token (7 days) stored in an httpOnly cookie. When the access token expires (15 min), the client sends the refresh token to get a new access token WITHOUT re-entering credentials. Why: Short-lived access tokens limit damage if stolen (~15 min window). Refresh tokens provide convenience without weakening security. Token rotation (new refresh token on each use) detects stolen refresh tokens - if a stolen token is used, the rotation chain breaks. Breaks when: Refresh tokens are stored in localStorage (XSS can steal them). httpOnly cookies are immune to JavaScript access.",
    },
    {
        id: "token-validator",
        name: "Token Validator",
        icon: "✅",
        category: "middleware",
        runtime: "event-loop",
        position: { x: 560, y: 80 },
        state: "idle",
        metadata: { checks: "signature, expiration, issuer, audience" },
        explanation: "What: Middleware that runs BEFORE every protected route. It extracts the JWT from the Authorization header (Bearer token), verifies the signature, checks expiration (exp claim), and optionally validates issuer (iss) and audience (aud). Why: Stateless verification - no database lookup needed. The server just verifies the signature using the same secret. This is O(1) and ~0.1ms. Breaks when: You don't check expiration (expired tokens still work). Also: if you need to revoke tokens before expiration, you need a token blacklist (Redis) - this breaks JWT's stateless property.",
    },
    {
        id: "protected-api",
        name: "Protected API",
        icon: "🛡",
        category: "service",
        runtime: "event-loop",
        position: { x: 560, y: 200 },
        state: "idle",
        metadata: { access: "req.user from decoded JWT", rbac: "role-based access control" },
        explanation: "What: Protected routes execute only after token validation. The decoded JWT payload (userId, role) is attached to req.user. Role-based access control (RBAC) checks if the user's role has permission for this action. Why: Authorization (can this user do this?) is separate from authentication (is this user who they claim?). RBAC prevents privilege escalation. Breaks when: You check authentication but not authorization - any logged-in user can access admin endpoints. Always validate roles.",
    },
];

const connections: Connection[] = [
    {
        id: "c1", source: "client", target: "rate-limiter", protocol: "http", latency: 5,
        reason: "Login request arrives. The rate limiter checks for brute-force patterns.",
    },
    {
        id: "c2", source: "rate-limiter", target: "auth-server", protocol: "http", latency: 5,
        reason: "Rate limit passed. Credentials are forwarded to the auth service for password verification.",
    },
    {
        id: "c3", source: "auth-server", target: "user-db", protocol: "db-query", latency: 20,
        reason: "Auth service queries the user database by email to retrieve the stored hash.",
    },
    {
        id: "c4", source: "user-db", target: "bcrypt", protocol: "http", latency: 100,
        reason: "The stored bcrypt hash is passed to bcrypt.compare() along with the submitted password.",
    },
    {
        id: "c5", source: "bcrypt", target: "jwt-gen", protocol: "http", latency: 5,
        reason: "Password hash matches! Control passes to the JWT generator to create an Access Token.",
    },
    {
        id: "c6", source: "jwt-gen", target: "refresh-token", protocol: "http", latency: 5,
        reason: "Access token is created. A long-lived refresh token is also generated.",
    },
    {
        id: "c7", source: "refresh-token", target: "token-validator", protocol: "http", latency: 30,
        reason: "Tokens are returned. On the next request, the token validator intercepts the Access Token.",
    },
    {
        id: "c8", source: "token-validator", target: "protected-api", protocol: "http", latency: 5,
        reason: "Token is valid (signature verified, not expired). The route handler grants access!",
    }
];

export function getAuthModuleConfig(): ModuleConfig {
    return {
        moduleId: "auth",
        nodes,
        connections,
        initialPackets: [
            {
                id: "pkt_login",
                protocol: "http",
                payload: "POST /auth/login { email, password }",
                label: "Login Request",
                currentNodeId: "client",
                sourceNodeId: "client",
                targetNodeId: "rate-limiter",
                path: ["client"],
                progress: 0,
                status: "pending",
                createdAt: Date.now(),
            },
        ],
        whyModePrompts: [
            {
                question: "The auth server received the password. How should it verify it?",
                options: [
                    { label: "Compare it directly to the password stored in the database", isCorrect: false },
                    { label: "Hash the submitted password with bcrypt and compare to the stored hash", isCorrect: true },
                    { label: "Decrypt the stored password and compare in plain text", isCorrect: false },
                    { label: "Use SHA-256 to hash and compare - it's the fastest", isCorrect: false },
                ],
                correctIndex: 1,
                explanation: "Passwords are NEVER stored in plain text. bcrypt is a one-way hash - you hash the input and compare hashes. SHA-256 is too FAST for passwords (billions of attempts/second). bcrypt is intentionally slow (~100ms), making brute-force cracking impractical.",
                connectionId: "c4",
                nodeId: "bcrypt",
            },
            {
                question: "Login succeeded. Where should the access token be stored on the client?",
                options: [
                    { label: "localStorage - it persists across page refreshes", isCorrect: false },
                    { label: "In-memory (React state or closure) - inaccessible to XSS attacks", isCorrect: true },
                    { label: "In a cookie without httpOnly flag", isCorrect: false },
                    { label: "In the URL hash for easy access", isCorrect: false },
                ],
                correctIndex: 1,
                explanation: "localStorage is vulnerable to XSS - any injected script can read it. In-memory storage (React state, closure variable) is cleared on page refresh but is inaccessible to XSS. Use refresh tokens (httpOnly cookies) to get new access tokens after page refresh.",
                connectionId: "c7",
                nodeId: "refresh-token",
            },
            {
                question: "A user's account is compromised. How do you immediately revoke their JWT?",
                options: [
                    { label: "You can't - JWTs are stateless. You need a token blacklist (Redis) or change the signing secret", isCorrect: true },
                    { label: "Delete the JWT from the server", isCorrect: false },
                    { label: "Set the JWT expiration to 0", isCorrect: false },
                    { label: "Remove the user from the database", isCorrect: false },
                ],
                correctIndex: 0,
                explanation: "JWTs are self-contained and verified by signature alone - the server has no 'session' to delete. To revoke: (1) maintain a Redis blacklist of revoked token IDs, or (2) change the signing secret (invalidates ALL tokens). This is the main trade-off of stateless JWTs.",
                connectionId: "c9",
                nodeId: "token-validator",
            },
        ],
        learningStory: {
            title: "The Secret Clubhouse",
            content: "Authentication is like a secret clubhouse. First, you have to prove who you are with a secret password (Login). Once you prove it, the clubhouse leader gives you a special 'Magical Wristband' (a token). Now, whenever you want to go to special rooms or play with special toys, you just show your wristband instead of telling the password every single time!",
            analogy: "A movie ticket or a theme park wristband. Once you buy it (login), you just show it to the guard at the door to get in!",
            lookFor: "Observe the 'Token Validator' middleware. It's the gatekeeper. Watch how packets without a 'Token' icon get rejected and sent back to the 'Client' immediately."
        }
    };
}
