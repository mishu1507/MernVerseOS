import type { ModuleConfig, SystemNode, Connection } from "../../engine/types/system.types";

const nodes: SystemNode[] = [
    {
        id: "user",
        name: "User Browser",
        icon: "👤",
        category: "client",
        runtime: "reactive",
        position: { x: 60, y: 220 },
        state: "idle",
        metadata: {},
        explanation: "The user clicks Login with Google. They want to use your app but do not want to create yet another password. OAuth lets them use their existing trusted identity from Google or GitHub without sharing their password with your app.",
    },
    {
        id: "our-app",
        name: "Your App (Client)",
        icon: "🌐",
        category: "service",
        runtime: "event-loop",
        position: { x: 280, y: 220 },
        state: "idle",
        metadata: {},
        explanation: "Your app is the OAuth Client. It must be registered with the provider (Google/GitHub) to get a client_id and client_secret. It never sees the user Google password. Keep client_secret server-side only — never in frontend code.",
    },
    {
        id: "auth-server",
        name: "Auth Server (Google/GitHub)",
        icon: "🔑",
        category: "gateway",
        runtime: "event-loop",
        position: { x: 280, y: 80 },
        state: "idle",
        metadata: {},
        explanation: "The Authorization Server (Google, GitHub, Auth0) authenticates the user with their own credentials. Your app NEVER sees the user Google password. After authentication it redirects back to your app with an authorization code. Always use HTTPS — authorization codes can be intercepted over plain HTTP.",
    },
    {
        id: "auth-code",
        name: "Authorization Code",
        icon: "🎟️",
        category: "middleware",
        runtime: "event-loop",
        position: { x: 500, y: 80 },
        state: "idle",
        metadata: {},
        explanation: "After user approves the auth server redirects to your callback URL with a short-lived one-time authorization code. The code itself has no value — it must be exchanged for a token using your client_secret (server-to-server, never exposed to browser). This two-step process prevents token interception from browser history and logs.",
    },
    {
        id: "token-exchange",
        name: "Token Exchange",
        icon: "🔄",
        category: "service",
        runtime: "event-loop",
        position: { x: 500, y: 360 },
        state: "idle",
        metadata: {},
        explanation: "Your server makes a server-to-server POST request to the auth server token endpoint: exchange the authorization code plus client_secret for an access token. Server-to-server means the client_secret is never exposed to the browser. The returned access_token can be used to call the provider API (e.g. GitHub API to get user profile).",
    },
    {
        id: "resource-server",
        name: "Resource Server (Profile)",
        icon: "👤",
        category: "service",
        runtime: "event-loop",
        position: { x: 720, y: 220 },
        state: "idle",
        metadata: {},
        explanation: "With the access token your server calls the provider API to get the user profile (name, email, avatar). You store this in your database — creating a new user or linking to an existing account. The access_token expires (usually 1 hour) — use the refresh_token to get a new one without re-prompting the user.",
    }
];

const connections: Connection[] = [
    { id: "c1", source: "user", target: "our-app", protocol: "http", latency: 5, reason: "User clicks Login with Google. App constructs authorization URL with client_id, redirect_uri, scope, and random state parameter for CSRF protection." },
    { id: "c2", source: "our-app", target: "auth-server", protocol: "http", latency: 20, reason: "Browser redirected to Google login page. User enters Google credentials directly on Google servers — your app NEVER sees the password." },
    { id: "c3", source: "auth-server", target: "auth-code", protocol: "http", latency: 20, reason: "User approved! Google redirects back to your callback with ?code=xyz&state=token. Verify the state parameter to prevent CSRF." },
    { id: "c4", source: "auth-code", target: "token-exchange", protocol: "http", latency: 10, reason: "Your server exchanges the code for tokens via server-to-server POST. code + client_id + client_secret + redirect_uri → access_token + refresh_token." },
    { id: "c5", source: "token-exchange", target: "resource-server", protocol: "http", latency: 20, reason: "Access token received! Call the provider profile API with Authorization: Bearer access_token." },
    { id: "c6", source: "resource-server", target: "user", protocol: "http", latency: 10, reason: "User profile fetched. Create or update user in your DB. Issue your own JWT to the user. OAuth flow complete." }
];

export function getOAuthModuleConfig(): ModuleConfig {
    return {
        moduleId: "oauth",
        nodes,
        connections,
        initialPackets: [
            {
                id: "pkt_oauth",
                protocol: "http",
                label: "OAuth Flow",
                payload: "Login with Google clicked",
                sourceNodeId: "user",
                targetNodeId: "our-app",
                currentNodeId: "user",
                path: ["user"],
                progress: 0,
                status: "pending",
                createdAt: Date.now(),
            }
        ],
        whyModePrompts: [
            {
                question: "Why is there a 2-step process (auth code then token exchange) instead of returning the token directly?",
                options: [
                    { label: "It is just how OAuth was designed historically", isCorrect: false },
                    { label: "The code is worthless alone — it needs client_secret to exchange. This keeps the actual token out of the browser URL and history.", isCorrect: true },
                    { label: "To add an extra security verification step", isCorrect: false },
                    { label: "Because tokens are too large for URLs", isCorrect: false },
                ],
                correctIndex: 1,
                explanation: "If the token came directly in the redirect URL it would be visible in browser history, server logs, and referrer headers. The authorization code is useless by itself — it requires the client_secret (which lives only on your server) to exchange. This server-to-server exchange keeps the actual access token completely out of the browser.",
                connectionId: "c4",
                nodeId: "token-exchange",
            }
        ],
        learningStory: {
            title: "The Hotel Key Card System",
            content: "OAuth is like a hotel key card system. You check in at reception (the auth server — Google). Reception verifies your ID (your Google password) and gives you a key card (authorization code). You take the key card to your room door (your app server) which has a special reader (client_secret). The reader exchanges the key card for actual room access (access token). The door never needed to see your ID.",
            analogy: "A valet service: you give the valet a special valet key (limited access token) — not your master key. They can park the car but cannot open your glove box. OAuth gives apps limited scoped access without full credential sharing.",
            lookFor: "Count the 6 steps! The Authorization Code node is the pivotal moment — a temporary ticket that has no value on its own. Watch how it gets exchanged in the Token Exchange node using the secret that only YOUR server knows!"
        }
    };
}
