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
        explanation: "The user browser. In MPA every click triggers a full HTTP round trip and causes a white-screen flash. In SPA only the first load is a full request — all subsequent navigation is handled by JavaScript inside the browser without any new server requests.",
    },
    {
        id: "mpa-server",
        name: "MPA Server (PHP/SSR)",
        icon: "🖥️",
        category: "service",
        runtime: "blocking",
        position: { x: 300, y: 100 },
        state: "idle",
        metadata: {},
        explanation: "In a Multi-Page App the server renders a complete HTML document for every URL. Clicking About makes a new GET /about request, server generates full HTML, browser discards the current page and renders fresh. Simple and SEO-friendly but every navigation causes a full page reload — terrible UX for complex apps.",
    },
    {
        id: "mpa-db",
        name: "Database",
        icon: "🗄️",
        category: "database",
        runtime: "blocking",
        position: { x: 560, y: 100 },
        state: "idle",
        metadata: {},
        explanation: "The server queries the database on every page request in MPA. Each route fetches its own data server-side and embeds it directly into the HTML before sending to the browser.",
    },
    {
        id: "spa-shell",
        name: "HTML Shell (index.html)",
        icon: "📄",
        category: "client",
        runtime: "reactive",
        position: { x: 300, y: 340 },
        state: "idle",
        metadata: {},
        explanation: "In a Single Page App the server sends one tiny HTML file with a div id=root and a link to the JS bundle. This is the only HTML document the browser ever receives. All subsequent page changes are JavaScript swapping out DOM content — no server round trip. Fix large bundle size with code splitting and lazy loading routes.",
    },
    {
        id: "js-bundle",
        name: "React JS Bundle",
        icon: "⚛️",
        category: "service",
        runtime: "reactive",
        position: { x: 560, y: 340 },
        state: "idle",
        metadata: {},
        explanation: "The JS bundle contains your entire React app. React Router intercepts link clicks and updates the URL and renders the correct component WITHOUT any server request. Enables instant navigation and smooth transitions. SEO issue: search engines may see empty shell — solution is SSR with Next.js.",
    },
    {
        id: "spa-api",
        name: "JSON API (Express)",
        icon: "⚡",
        category: "service",
        runtime: "event-loop",
        position: { x: 760, y: 340 },
        state: "idle",
        metadata: {},
        explanation: "In SPA architecture Express is a pure JSON API — it never renders HTML. React fetches data via fetch or Axios when needed and renders client-side. The same API serves web app, mobile app, and third-party integrations. CORS must be configured for cross-origin requests.",
    }
];

const connections: Connection[] = [
    { id: "c1", source: "user", target: "mpa-server", protocol: "http", latency: 50, reason: "MPA: user clicks link — full GET request sent to server. Server renders complete HTML page from scratch each time." },
    { id: "c2", source: "mpa-server", target: "mpa-db", protocol: "db-query", latency: 30, reason: "Server queries database to fetch data for the requested page. Happens on EVERY navigation even if data has not changed." },
    { id: "c3", source: "mpa-db", target: "user", protocol: "http", latency: 50, reason: "Complete HTML page returned. Browser discards current page, re-parses HTML, re-runs CSS, causes white flash. Slow and jarring." },
    { id: "c4", source: "user", target: "spa-shell", protocol: "http", latency: 30, reason: "SPA: user visits site for the FIRST time. Tiny HTML shell downloaded once. All future navigation is instant — no more server requests for pages." },
    { id: "c5", source: "spa-shell", target: "js-bundle", protocol: "http", latency: 100, reason: "React JS bundle loads. Once loaded React Router takes over — all link clicks are intercepted and handled client-side." },
    { id: "c6", source: "js-bundle", target: "spa-api", protocol: "http", latency: 30, reason: "When a route needs data React fetches from the JSON API. Only DATA travels over the network — no HTML no full page reload." }
];

export function getSpaMpaModuleConfig(): ModuleConfig {
    return {
        moduleId: "spa-mpa",
        nodes,
        connections,
        initialPackets: [
            {
                id: "pkt_spa",
                protocol: "http",
                label: "First Visit",
                payload: "GET / (first load)",
                sourceNodeId: "user",
                targetNodeId: "spa-shell",
                currentNodeId: "user",
                path: ["user"],
                progress: 0,
                status: "pending",
                createdAt: Date.now(),
            }
        ],
        whyModePrompts: [
            {
                question: "A user clicks Profile in a React SPA. What actually happens?",
                options: [
                    { label: "Browser sends GET /profile to the server", isCorrect: false },
                    { label: "React Router intercepts the click, updates the URL, and renders Profile component — zero network requests", isCorrect: true },
                    { label: "The HTML shell is re-downloaded", isCorrect: false },
                    { label: "Express renders a new HTML page", isCorrect: false },
                ],
                correctIndex: 1,
                explanation: "React Router uses the HTML5 History API to update the URL without a page reload. The Profile component is already in the JS bundle — React just swaps the rendered output. This is why SPAs feel instantaneous after the initial load.",
                connectionId: "c5",
                nodeId: "js-bundle",
            },
            {
                question: "Why is SEO harder for SPAs compared to MPAs?",
                options: [
                    { label: "SPAs use different HTTP methods", isCorrect: false },
                    { label: "Search engine crawlers often cannot execute JavaScript — they see an empty div id=root instead of content", isCorrect: true },
                    { label: "SPAs do not support meta tags", isCorrect: false },
                    { label: "SPAs load too slowly for crawlers", isCorrect: false },
                ],
                correctIndex: 1,
                explanation: "Traditional web crawlers request a page and read the HTML — for SPAs that HTML is just an empty shell. The actual content is rendered by JavaScript AFTER load. Solution: Server-Side Rendering with Next.js pre-renders HTML so crawlers see real content.",
                connectionId: "c6",
                nodeId: "spa-api",
            }
        ],
        learningStory: {
            title: "The Magazine vs the App",
            content: "MPA is like a print magazine — every article is a separate physical page. You flip to page 45 and the whole layout is pre-printed there for you (server-rendered HTML). SPA is like a digital app — you download it once, then every page is just the app rearranging its content on your screen. No reprinting, no reloading, instant transitions.",
            analogy: "MPA = ordering a new pizza for every topping change. SPA = a pizza builder app where you tap toppings and see the result instantly — you only fetch data when you actually need something new.",
            lookFor: "Compare the two paths! MPA path hits the server AND database on every navigation. SPA path only fetches data — no HTML round trip. Count the nodes each packet visits!"
        }
    };
}
