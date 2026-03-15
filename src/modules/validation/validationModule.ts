import type { ModuleConfig, SystemNode, Connection } from "../../engine/types/system.types";

const nodes: SystemNode[] = [
    {
        id: "request",
        name: "Raw Request",
        icon: "📨",
        category: "client",
        runtime: "reactive",
        position: { x: 60, y: 220 },
        state: "idle",
        metadata: {},
        explanation: "Every incoming request body, URL parameter, query string, and header is untrusted input. It could be from a legitimate user, an automated script, or a malicious actor. Servers must validate ALL input — never assume the frontend validated it. Frontends can be bypassed entirely with Postman, curl, or custom code.",
    },
    {
        id: "schema",
        name: "Zod / Joi Schema",
        icon: "📐",
        category: "middleware",
        runtime: "event-loop",
        position: { x: 280, y: 100 },
        state: "idle",
        metadata: {},
        explanation: "Schemas define the exact shape of valid input: field types, required or optional, string formats (email, URL, UUID), number ranges, enum values, nested objects. Zod is TypeScript-first — it infers static types from schemas. Schema-driven validation is a single source of truth — the schema documents the API AND enforces it simultaneously.",
    },
    {
        id: "type-check",
        name: "Type Validation",
        icon: "🔍",
        category: "middleware",
        runtime: "event-loop",
        position: { x: 280, y: 340 },
        state: "idle",
        metadata: {},
        explanation: "First layer — checks that each field is the correct JavaScript type. age must be a number not the string 25. active must be boolean not the string true. HTTP body fields from form data are always strings unless explicitly parsed — you must coerce and validate them.",
    },
    {
        id: "format-check",
        name: "Format Validation",
        icon: "🔎",
        category: "middleware",
        runtime: "event-loop",
        position: { x: 480, y: 220 },
        state: "idle",
        metadata: {},
        explanation: "Beyond type, format validation checks that strings match expected patterns: is this a valid email address? Is this a real date? Is this a valid UUID? Is this phone number in E.164 format? Use battle-tested library patterns not custom regex — custom email regex is almost always wrong.",
    },
    {
        id: "business-rules",
        name: "Business Rule Validation",
        icon: "📋",
        category: "service",
        runtime: "event-loop",
        position: { x: 480, y: 360 },
        state: "idle",
        metadata: {},
        explanation: "Business rules validate data RELATIONSHIPS — end date must be after start date, order quantity must be positive, username must be unique (requires DB check). These cannot be expressed as simple type or format checks. Backend rules are the authoritative source — never duplicate them only in the frontend.",
    },
    {
        id: "validation-error",
        name: "400 Bad Request",
        icon: "❌",
        category: "middleware",
        runtime: "event-loop",
        position: { x: 700, y: 100 },
        state: "idle",
        metadata: {},
        explanation: "When validation fails return 400 Bad Request with detailed per-field error messages: email: must be a valid email address, age: must be 18 or older. Never return 500 for validation failures — that is a client error. Never expose internal field names or DB schema in error messages.",
    },
    {
        id: "validated-data",
        name: "Validated and Typed Data",
        icon: "✅",
        category: "service",
        runtime: "event-loop",
        position: { x: 700, y: 340 },
        state: "idle",
        metadata: {},
        explanation: "After validation passes the data is both runtime-validated AND TypeScript-typed. Zod parse() returns typed objects. This eliminates an entire class of bugs — if validation passed you KNOW the data shape is correct. Always use the parsed output not the raw req.body.",
    }
];

const connections: Connection[] = [
    { id: "c1", source: "request", target: "schema", protocol: "internal", latency: 5, reason: "Raw untrusted input meets the Zod schema definition. Schema describes expected shape: required fields, types, formats, constraints." },
    { id: "c2", source: "schema", target: "type-check", protocol: "internal", latency: 5, reason: "First pass: check all field types. price is a number? tags is an array of strings? user is an object with required fields?" },
    { id: "c3", source: "type-check", target: "format-check", protocol: "internal", latency: 5, reason: "Types passed. Second pass: check formats. Is the email address syntactically valid? Is the date in ISO 8601? Is the UUID v4?" },
    { id: "c4", source: "format-check", target: "business-rules", protocol: "internal", latency: 5, reason: "Formats valid. Third pass: business rules. Is end_date after start_date? Is quantity positive? Is username available?" },
    { id: "c5", source: "type-check", target: "validation-error", protocol: "internal", latency: 5, reason: "Type check FAILED. Immediately return 400 with field-level error: { errors: [{ field: age, message: Expected number got string }] }" },
    { id: "c6", source: "format-check", target: "validation-error", protocol: "internal", latency: 5, reason: "Format check FAILED. Return 400: { errors: [{ field: email, message: Invalid email format }] }. No DB query was made." },
    { id: "c7", source: "business-rules", target: "validated-data", protocol: "internal", latency: 5, reason: "All validation passed! Parsed typed sanitized data is safe to use in controller logic and database operations." }
];

export function getValidationModuleConfig(): ModuleConfig {
    return {
        moduleId: "validation",
        nodes,
        // Wait, I noticed a typo in my connection c2. Fixing it now.
        connections: [
            { id: "c1", source: "request", target: "schema", protocol: "internal", latency: 5, reason: "Raw untrusted input meets the Zod schema definition. Schema describes expected shape: required fields, types, formats, constraints." },
            { id: "c2", source: "schema", target: "type-check", protocol: "internal", latency: 5, reason: "First pass: check all field types. price is a number? tags is an array of strings? user is an object with required fields?" },
            { id: "c3", source: "type-check", target: "format-check", protocol: "internal", latency: 5, reason: "Types passed. Second pass: check formats. Is the email address syntactically valid? Is the date in ISO 8601? Is the UUID v4?" },
            { id: "c4", source: "format-check", target: "business-rules", protocol: "internal", latency: 5, reason: "Formats valid. Third pass: business rules. Is end_date after start_date? Is quantity positive? Is username available?" },
            { id: "c5", source: "type-check", target: "validation-error", protocol: "internal", latency: 5, reason: "Type check FAILED. Immediately return 400 with field-level error: { errors: [{ field: age, message: Expected number got string }] }" },
            { id: "c6", source: "format-check", target: "validation-error", protocol: "internal", latency: 5, reason: "Format check FAILED. Return 400: { errors: [{ field: email, message: Invalid email format }] }. No DB query was made." },
            { id: "c7", source: "business-rules", target: "validated-data", protocol: "internal", latency: 5, reason: "All validation passed! Parsed typed sanitized data is safe to use in controller logic and database operations." }
        ],
        initialPackets: [
            {
                id: "pkt_val",
                protocol: "internal",
                label: "Unvalidated Input",
                payload: 'POST /users { "email": "not-an-email", "age": "twenty" }',
                sourceNodeId: "request",
                targetNodeId: "schema",
                currentNodeId: "request",
                path: ["request"],
                progress: 0,
                status: "pending",
                createdAt: Date.now(),
            }
        ],
        whyModePrompts: [
            {
                question: "Your React frontend already validates the form. Do you still need backend validation?",
                options: [
                    { label: "No — frontend validation is sufficient", isCorrect: false },
                    { label: "Yes — frontend can be bypassed entirely with Postman, curl, or browser devtools", isCorrect: true },
                    { label: "Only if the API is public", isCorrect: false },
                    { label: "Only for security-sensitive fields", isCorrect: false },
                ],
                correctIndex: 1,
                explanation: "Frontend validation is UX — it helps users fill forms correctly. Backend validation is SECURITY. Any developer can send a POST request directly to your API URL with Postman bypassing your React frontend completely. Backend validation is the only validation that matters for data integrity and security.",
                connectionId: "c1",
                nodeId: "schema",
            }
        ],
        learningStory: {
            title: "The Airport Security Check",
            content: "Validation is like airport security. Your ticket (schema) defines who can board: must have passport (required field), must be over 18 for certain destinations (business rules), passport must not be expired (format check). Every passenger goes through the same checks regardless of which airline counter sold them the ticket — regardless of which frontend they used.",
            analogy: "A hospital intake form. Type check = making sure date of birth is actually a date. Format check = verifying the date format is correct. Business rule = checking the patient is old enough for the procedure. The validated form goes to the doctor — no field is questioned again.",
            lookFor: "Notice the THREE validation layers — Type, Format, Business Rules — each as a separate node. Failures at ANY layer return 400 immediately (fail fast). Only when ALL three pass does data reach the Validated output. Validation errors return BEFORE touching the database!"
        }
    };
}
