// Agent-discovery documents served at the Worker edge:
//  - /.well-known/api-catalog  (RFC 9727 linkset, RFC 9264 format)
//  - /.well-known/mcp/server-card.json  (SEP-1649 MCP Server Card)
//  - /.well-known/agent-skills/index.json (Agent Skills Discovery v0.2.0)
//  - /skills/osaka-castle-tours/SKILL.md  (skill artifact; digest in the index)
//  - /api/openapi.json         (OpenAPI 3.1 for the public REST endpoints)
//  - /api/docs                 (service-doc target)
//  - /auth.md                  (self-contained — no OAuth exists for agents)
//  - /api/                     (endpoint index so the catalog anchor resolves)
// plus the RFC 8288 Link header injected on HTML responses.
// Kept out of custom-worker.ts for readability.

const BASE = "https://osakacastletours.com";
const CATALOG_PATH = "/.well-known/api-catalog";
const RFC9727_PROFILE = "https://www.rfc-editor.org/info/rfc9727";

// RFC 9727 §2: HEAD /.well-known/api-catalog SHALL include a Link header
// with the api-catalog relation.
export const CATALOG_LINK = `<${CATALOG_PATH}>; rel="api-catalog"`;

// RFC 8288 / RFC 9727 §3 — advertised on homepage + other HTML responses.
export const DISCOVERY_LINK_HEADER = [
  `<${CATALOG_PATH}>; rel="api-catalog"`,
  `</api/openapi.json>; rel="service-desc"; type="application/openapi+json"`,
  `</api/docs>; rel="service-doc"; type="text/markdown"`,
  `</llms.txt>; rel="describedby"; type="text/plain"`,
].join(", ");

// ---------------------------------------------------------------------------
// RFC 9727 API catalog (Linkset, RFC 9264)
// ---------------------------------------------------------------------------

export const API_CATALOG = {
  linkset: [
    {
      anchor: `${BASE}${CATALOG_PATH}`,
      item: [
        { href: `${BASE}/api/` },
        { href: `${BASE}/api/mcp` },
      ],
    },
    {
      anchor: `${BASE}/api/`,
      "service-desc": [
        {
          href: `${BASE}/api/openapi.json`,
          type: "application/openapi+json",
          title: "OpenAPI 3.1 description of the public REST API",
        },
      ],
      "service-doc": [
        {
          href: `${BASE}/api/docs`,
          type: "text/markdown",
          title: "API documentation (Markdown)",
        },
      ],
      status: [
        {
          href: `${BASE}/api/health`,
          type: "application/json",
          title: "Service health",
        },
      ],
    },
    {
      anchor: `${BASE}/api/mcp`,
      "service-doc": [
        {
          href: `${BASE}/api/docs`,
          type: "text/markdown",
          title: "MCP server usage (see /api/docs)",
        },
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// /api/ — endpoint index so the catalog anchor resolves
// ---------------------------------------------------------------------------

export const API_INDEX = {
  service: "Osaka Castle Walks with Edward",
  catalog: CATALOG_PATH,
  docs: "/api/docs",
  openapi: "/api/openapi.json",
  endpoints: [
    { method: "GET", path: "/api/tours", description: "List tours with pricing, schedules, and thematic metadata" },
    { method: "GET", path: "/api/tours/{id}/availability", description: "Available dates and time slots for a tour" },
    { method: "POST", path: "/api/bookings/lookup", description: "Email → signed /book/manage redirect (Turnstile-protected)" },
    { method: "GET", path: "/api/health", description: "Service health check" },
    { method: "POST", path: "/api/mcp", description: "Model Context Protocol server (streamable HTTP, read-only tools)" },
  ],
  notes: "Write/admin endpoints (bookings, calendar, PayPal, cron) require authentication and are intentionally not listed.",
};

// ---------------------------------------------------------------------------
// /api/openapi.json — OpenAPI 3.1, public read surface only
// ---------------------------------------------------------------------------

export const OPENAPI = {
  openapi: "3.1.0",
  info: {
    title: "Osaka Castle Walks with Edward — Public API",
    version: "1.0.0",
    description:
      "Read-only public API for tour discovery and availability, plus the Turnstile-protected booking lookup. " +
      "No authentication is required for GET endpoints. Admin, webhook, and cron endpoints are intentionally omitted. " +
      "A Model Context Protocol server is available at POST /api/mcp (see /api/docs).",
    contact: { name: "Edward Iftody", email: "edward@osakacastletours.com" },
  },
  servers: [{ url: BASE }],
  tags: [{ name: "tours", description: "Public tour catalog and availability" },
          { name: "bookings", description: "Booking lookup (browser flow, bot-protected)" },
          { name: "service", description: "Service health" }],
  paths: {
    "/api/tours": {
      get: {
        operationId: "listTours",
        summary: "List tours",
        description:
          "All active tours with pricing, duration, meeting point, thematic metadata, weekly schedules, and booking URLs.",
        tags: ["tours"],
        responses: {
          "200": {
            description: "Tour list",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["tours", "meta"],
                  properties: {
                    tours: { type: "array", items: { $ref: "#/components/schemas/Tour" } },
                    meta: {
                      type: "object",
                      required: ["total", "language", "currency"],
                      properties: {
                        total: { type: "integer" },
                        language: { type: "string", examples: ["en"] },
                        currency: { type: "string", examples: ["JPY"] },
                      },
                    },
                  },
                },
              },
            },
          },
          "500": { $ref: "#/components/responses/InternalError" },
        },
      },
    },
    "/api/tours/{id}/availability": {
      get: {
        operationId: "getTourAvailability",
        summary: "Tour availability",
        description: "Available dates and time slots for one tour, including blocked and fully booked dates.",
        tags: ["tours"],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            description: "Tour UUID (from GET /api/tours)",
            schema: { type: "string", format: "uuid" },
          },
        ],
        responses: {
          "200": {
            description: "Availability",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["tour_id", "availability"],
                  properties: {
                    tour_id: { type: "string", format: "uuid" },
                    availability: {
                      type: "object",
                      required: ["available", "blocked", "full"],
                      properties: {
                        available: {
                          type: "array",
                          items: {
                            type: "object",
                            required: ["date", "start_time", "duration_minutes", "remaining"],
                            properties: {
                              date: { type: "string", format: "date" },
                              start_time: { type: "string", examples: ["09:30"] },
                              duration_minutes: { type: "integer" },
                              remaining: { type: "integer" },
                            },
                          },
                        },
                        blocked: { type: "array", items: { type: "string", format: "date" } },
                        full: { type: "array", items: { type: "string", format: "date" } },
                      },
                    },
                  },
                },
              },
            },
          },
          "400": {
            description: "Missing tour id",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
          },
        },
      },
    },
    "/api/bookings/lookup": {
      post: {
        operationId: "lookupBooking",
        summary: "Start signed booking lookup",
        description:
          "Form POST used by /book/manage. Submits the booking email; on success responds 303 with a Location of " +
          "/book/manage?email=…&sig=… where the HMAC signature is valid for 30 minutes. Rate-limited to 5 requests/min/IP " +
          "and protected by Cloudflare Turnstile (cf-turnstile-response). Failure modes also redirect (303) with " +
          "error=too_many | unavailable | invalid | verify. Agents should link humans to /book/manage rather than " +
          "call this endpoint.",
        tags: ["bookings"],
        requestBody: {
          required: true,
          content: {
            "application/x-www-form-urlencoded": {
              schema: { $ref: "#/components/schemas/LookupForm" },
            },
            "multipart/form-data": {
              schema: { $ref: "#/components/schemas/LookupForm" },
            },
          },
        },
        responses: {
          "303": {
            description: "See Other — redirect to /book/manage (success or error query parameter)",
            headers: {
              Location: {
                description: "Target URL, e.g. /book/manage?email=…&sig=… or /book/manage?error=verify",
                schema: { type: "string" },
              },
            },
          },
        },
      },
    },
    "/api/health": {
      get: {
        operationId: "getHealth",
        summary: "Service health",
        tags: ["service"],
        responses: {
          "200": {
            description: "Healthy",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["status", "timestamp", "app", "version"],
                  properties: {
                    status: { type: "string", examples: ["ok"] },
                    timestamp: { type: "string", format: "date-time" },
                    app: { type: "string" },
                    version: { type: "string" },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  components: {
    schemas: {
      Tour: {
        type: "object",
        required: ["id", "name", "description", "duration_minutes", "price", "currency", "max_guests", "language", "schedules"],
        properties: {
          id: { type: "string", format: "uuid" },
          name: { type: "string" },
          url: { type: ["string", "null"], format: "uri" },
          description: { type: ["string", "null"] },
          duration_minutes: { type: "integer" },
          price: { type: ["number", "null"] },
          currency: { type: "string", examples: ["JPY"] },
          max_guests: { type: ["integer", "null"] },
          meeting_point_address: { type: ["string", "null"] },
          language: { type: "string", examples: ["en"] },
          historical_periods: { type: "array", items: { type: "string" } },
          themes: { type: "array", items: { type: "string" } },
          traveler_types: { type: "array", items: { type: "string" } },
          neighborhood: { type: ["string", "null"] },
          schedules: {
            type: "array",
            items: {
              type: "object",
              required: ["day_of_week", "start_time", "duration_minutes"],
              properties: {
                day_of_week: { type: "integer", minimum: 0, maximum: 6 },
                start_time: { type: "string" },
                duration_minutes: { type: "integer" },
              },
            },
          },
          availability_endpoint: { type: "string" },
          booking_url: { type: "string", format: "uri" },
        },
      },
      LookupForm: {
        type: "object",
        required: ["email"],
        properties: {
          email: { type: "string", format: "email", maxLength: 254 },
          "cf-turnstile-response": {
            type: "string",
            description: "Cloudflare Turnstile widget token (required while TURNSTILE_SECRET_KEY is configured)",
          },
        },
      },
      Error: {
        type: "object",
        properties: { error: { type: "string" } },
      },
    },
    responses: {
      InternalError: {
        description: "Upstream data error",
        content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
      },
    },
  },
};

// ---------------------------------------------------------------------------
// /api/docs — service-doc target (Markdown)
// ---------------------------------------------------------------------------

export const API_DOCS = `# API Documentation — Osaka Castle Walks with Edward

Machine-readable discovery: [API catalog](/.well-known/api-catalog) · [OpenAPI](/api/openapi.json) · [auth.md](/auth.md) · [llms.txt](/llms.txt)

Base URL: \`https://osakacastletours.com\`

## Authentication

None. All GET endpoints are public — no API keys, no bearer tokens.
Booking lookup and MCP are also unauthenticated (protected by rate limits and Turnstile where noted).

## REST endpoints

### GET /api/tours

Lists active tours with pricing, duration, meeting point, thematic metadata, weekly schedules, and booking URLs.

\`\`\`json
{
  "tours": [
    {
      "id": "…uuid…",
      "name": "Before Japan Had a Name",
      "url": "https://osakacastletours.com/beforejapanhadaname.html",
      "duration_minutes": 150,
      "price": 9500,
      "currency": "JPY",
      "max_guests": 6,
      "language": "en",
      "schedules": [{ "day_of_week": 1, "start_time": "09:30", "duration_minutes": 150 }],
      "availability_endpoint": "/api/tours/…uuid…/availability",
      "booking_url": "https://osakacastletours.com/book?tour=…uuid…"
    }
  ],
  "meta": { "total": 1, "language": "en", "currency": "JPY" }
}
\`\`\`

### GET /api/tours/{id}/availability

Returns \`{ tour_id, availability: { available, blocked, full } }\`. \`available\` items carry
\`date\` (YYYY-MM-DD), \`start_time\` (HH:MM), \`duration_minutes\`, and \`remaining\` capacity;
\`blocked\` and \`full\` are arrays of dates.

### POST /api/bookings/lookup

Form fields: \`email\`, \`cf-turnstile-response\` (Cloudflare Turnstile). Responds **303** to
\`/book/manage?email=…&sig=…\` (HMAC signature, valid 30 minutes) or \`/book/manage?error=…\`
(\`too_many\`, \`unavailable\`, \`invalid\`, \`verify\`). Rate-limited to 5 requests/min/IP.
This is a human booking-management flow — agents should link people to \`/book/manage\`.

### GET /api/health

\`{ "status": "ok", "timestamp": "…", "app": "…", "version": "…" }\`

## MCP server

\`POST https://osakacastletours.com/api/mcp\` exposes a Model Context Protocol server
(streamable HTTP; \`GET\`/\`DELETE\` also handled for session lifecycle). Read-only tools:

| Tool | Purpose |
|---|---|
| \`list_tours\` | Tours with themes, traveler types, itinerary positioning, pricing (filterable) |
| \`get_tour_availability\` | Available dates/slots for a tour UUID |
| \`search_tours\` | Keyword search across name, description, themes, periods, neighborhoods |
| \`build_itinerary\` | Suggested 1–3 day itinerary from interests, trip context, weather |
| \`get_payment_methods\` | Current payment providers and currencies |

## For AI agents

- Negotiate Markdown on any HTML page: send \`Accept: text/markdown\`.
- Site inventory: \`/llms.txt\`, \`/sitemap.xml\`, \`/site-graph.json\`.
- Robots: \`/robots.txt\` (Content Signals permit \`ai-train\`, \`search\`, \`ai-input\`).
- Booking is transacted by humans via \`/book\` (PayPal, GetYourGuide, Airbnb) — agents should
  cite and link, not attempt to purchase or enumerate bookings.

## Contact

Edward Iftody — edward@osakacastletours.com
`;

// ---------------------------------------------------------------------------
// /auth.md — self-contained (the site has no agent-facing OAuth; publishing
// PRM/AS metadata would misrepresent bearer-token support that doesn't exist)
// ---------------------------------------------------------------------------

export const AUTH_MD = `# auth.md

Agent authentication profile for **osakacastletours.com** (Osaka Castle Walks with Edward).

## Agent audience

AI agents, crawlers, and assistants answering questions about Osaka Castle tours, this site's
history content, or availability. All content below is public.

## Credentials required: none

No registration, API keys, or bearer tokens are issued to agents, and none are needed:

- Public pages (Markdown via \`Accept: text/markdown\`)
- \`GET /api/tours\`, \`GET /api/tours/{id}/availability\`, \`GET /api/health\`
- \`GET /.well-known/api-catalog\`, \`GET /api/openapi.json\`, \`GET /api/docs\`
- \`/llms.txt\`, \`/sitemap.xml\`, \`/robots.txt\`
- \`POST /api/mcp\` (read-only Model Context Protocol tools, no credentials)

Agent registration follows the auth.md profile (<https://github.com/workos/auth.md>): this origin
is its own authorization server for agents (\`/.well-known/oauth-authorization-server\` carries the
\`agent_auth\` block). The only method is **anonymous** — the public API needs no credentials and
none are issued; \`GET /agent/auth\` is the registration information document (no \`POST\`
registration API, nothing to provision). Protected-resource metadata (RFC 9728) is published at
\`/.well-known/oauth-protected-resource\`.

## Credential use that does exist (humans only)

- **Booking management** — \`/book/manage\` is reached via signed, time-limited links
  (\`?email=…&sig=…\`) emailed to the booking address after a Cloudflare Turnstile challenge.
  Agents cannot obtain or mint these credentials and must not attempt to enumerate bookings.
- **Payments** — checkout runs on PayPal / GetYourGuide; agents should link travellers to
  \`/book\`, never attempt to transact.
- **Admin console** — Google sign-in (session tokens issued by Supabase) for the site operator
  only; not part of any agent flow.

## Rate limits

Booking lookup is limited to 5 requests/min/IP (plus a Cloudflare WAF rate rule on
\`/book/manage\` and \`/api/bookings/lookup\`) and Turnstile-verified.

## Discovery

\`/.well-known/api-catalog\` (RFC 9727) · \`/.well-known/mcp/server-card.json\` ·
\`/.well-known/agent-skills/index.json\` · \`/.well-known/oauth-protected-resource\` (RFC 9728) ·
\`/.well-known/oauth-authorization-server\` (RFC 8414 + agent_auth) · \`/agent/auth\` ·
\`/api/openapi.json\` · \`/api/docs\` · \`/llms.txt\`

## Contact

mailto:edward@osakacastletours.com — access questions or corrections.
`;

// ---------------------------------------------------------------------------
// /.well-known/oauth-protected-resource — RFC 9728 Protected Resource Metadata
// This origin is its own authorization server for agent access (agent_auth in
// the AS metadata below); public endpoints require no credentials. Admin
// console tokens are issued by Supabase (documented in /auth.md).
// ---------------------------------------------------------------------------

export const PROTECTED_RESOURCE_METADATA = {
  resource: BASE,
  authorization_servers: [BASE],
  issuer: BASE,
  scopes_supported: [],
  bearer_methods_supported: ["header"],
  documentation_url: `${BASE}/api/docs`,
};

// ---------------------------------------------------------------------------
// /.well-known/oauth-authorization-server — RFC 8414 metadata + the auth.md
// agent_auth profile (https://github.com/workos/auth.md). Registration method:
// anonymous — the public API needs no credentials and issues none; register_uri
// resolves to a GET-able registration info document (POST is not implemented).
// ---------------------------------------------------------------------------

export const AUTHORIZATION_SERVER_METADATA = {
  resource: BASE,
  authorization_servers: [BASE],
  issuer: BASE,
  scopes_supported: [],
  bearer_methods_supported: ["header"],
  agent_auth: {
    skill: `${BASE}/auth.md`,
    register_uri: `${BASE}/agent/auth`,
    identity_endpoint: `${BASE}/agent/auth`,
    claim_uri: `${BASE}/agent/auth`,
    identity_types_supported: ["anonymous"],
    anonymous: {
      credential_types_supported: ["none"],
      claim_uri: `${BASE}/agent/auth`,
    },
  },
};

// GET /agent/auth — registration info backing register_uri (no POST API).
export const AGENT_AUTH_INFO = {
  service: "Osaka Castle Walks with Edward",
  auth_md: `${BASE}/auth.md`,
  authorization_server_metadata: `${BASE}/.well-known/oauth-authorization-server`,
  identity_types_supported: ["anonymous"],
  registration_methods: [
    {
      type: "anonymous",
      description:
        "Anonymous access. The public API (GET /api/tours, availability, health) and all content " +
        "require no credentials, and none are issued. This document is the registration source of " +
        "truth; POST /agent/auth is not implemented.",
    },
  ],
  contact: "edward@osakacastletours.com",
};

// ---------------------------------------------------------------------------
// /.well-known/mcp/server-card.json — SEP-1649 MCP Server Card for the
// read-only MCP server already running at POST /api/mcp.
// ---------------------------------------------------------------------------

export const MCP_SERVER_CARD = {
  serverInfo: { name: "toursync", version: "1.0.0" },
  name: "toursync",
  description:
    "Osaka Castle Walks with Edward — read-only tour discovery: list/search tours, " +
    "live availability, itinerary builder, and payment methods.",
  endpoint: `${BASE}/api/mcp`,
  transport: { type: "streamable-http", url: `${BASE}/api/mcp` },
  capabilities: { tools: true, resources: false, prompts: false },
  documentation_url: `${BASE}/api/docs`,
};

// ---------------------------------------------------------------------------
// Agent Skills Discovery v0.2.0 (https://github.com/cloudflare/agent-skills-discovery-rfc)
//
// MAINTENANCE: SKILL_DIGEST must be the SHA-256 of the exact bytes of
// TOUR_SKILL_MD as served. After editing the skill text:
//   npx tsx -e "import('./worker-discovery.ts').then(m=>crypto.createHash('sha256').update(m.TOUR_SKILL_MD).digest('hex'))"
// (or extract the string any other way) and update SKILL_DIGEST.
// ---------------------------------------------------------------------------

const SKILL_PATH = "/skills/osaka-castle-tours/SKILL.md";
const SKILL_DIGEST =
  "sha256:92bb99434266ad4eba4e044747855cbf5dc856bf0a6c3fe662d3ee9dea5d0d3c";

export const TOUR_SKILL_MD = `---
name: osaka-castle-tours
description: Match travellers to Osaka Castle walking tours, check live availability, and build 1-3 day itineraries using the public osakacastletours.com API and MCP tools.
---

# Osaka Castle Tours — agent skill

Guide a traveller from question to booked walk using the public, credential-free API at
\`https://osakacastletours.com\`. No authentication is required (see \`/auth.md\`).

## 1. Discover tours

- \`GET /api/tours\` — all active tours: id, name, description, duration, price (JPY),
  max guests, meeting point, themes, historical periods, traveller types, neighbourhood,
  weekly schedules, availability endpoint, and booking URL.
- Match on themes (castle history, hidden temples, periods), traveller type, duration
  (typically 90-150 minutes), day/time schedules, and group size.
- MCP alternative: \`POST /api/mcp\` with \`list_tours\` or \`search_tours\`.

## 2. Check availability

- \`GET /api/tours/{id}/availability\` returns
  \`{ "tour_id": "…", "availability": { "available": [...], "blocked": [...], "full": [...] } }\`.
- Each \`available\` item has \`date\` (YYYY-MM-DD), \`start_time\` (HH:MM JST),
  \`duration_minutes\`, and \`remaining\` capacity. Report \`remaining\` honestly;
  dates listed in \`blocked\` or \`full\` are not bookable.
- MCP alternative: \`get_tour_availability\`.

## 3. Build an itinerary

- Use the MCP \`build_itinerary\` tool with the traveller's interests, trip dates, and
  weather, or compose one manually from themes, weekly schedules, and neighbourhoods.
  Keep walking distances realistic and leave rest time.
- Site context: \`/llms.txt\` (inventory), \`/api/docs\` (endpoint reference),
  \`/.well-known/api-catalog\` (RFC 9727), \`/.well-known/agent-skills/index.json\` (skills).

## 4. Booking

- Link humans to the tour's \`booking_url\` (or \`/book?tour=<uuid>\`) — checkout runs on
  PayPal and GetYourGuide. Agents must not attempt to purchase or enumerate bookings.
- Existing guests use \`/book/manage\`, reached only via the signed, time-limited link in
  their confirmation email (Turnstile-protected; \`POST /api/bookings/lookup\` is a human
  form flow and must not be called by agents).

## Ground rules

- Everything above is public; no credentials exist or are issued (\`/auth.md\`).
- Cite tour names, JPY prices, and durations accurately; re-fetch rather than cache long.
- Contact: edward@osakacastletours.com
`;

export const SKILLS_INDEX = {
  $schema: "https://schemas.agentskills.io/discovery/0.2.0/schema.json",
  skills: [
    {
      name: "osaka-castle-tours",
      type: "skill-md",
      description:
        "Match travellers to Osaka Castle walking tours, check live availability, and build 1-3 day itineraries via the public API and MCP tools.",
      url: `${BASE}${SKILL_PATH}`,
      digest: SKILL_DIGEST,
    },
  ],
};

// ---------------------------------------------------------------------------
// Route table
// ---------------------------------------------------------------------------

type DiscoveryRoute = { contentType: string; body: string };

const DISCOVERY_ROUTES: Record<string, DiscoveryRoute> = {
  [CATALOG_PATH]: {
    contentType: `application/linkset+json; profile="${RFC9727_PROFILE}"`,
    body: JSON.stringify(API_CATALOG),
  },
  "/auth.md": { contentType: "text/markdown; charset=utf-8", body: AUTH_MD },
  "/.well-known/oauth-protected-resource": {
    contentType: "application/json",
    body: JSON.stringify(PROTECTED_RESOURCE_METADATA),
  },
  "/.well-known/oauth-authorization-server": {
    contentType: "application/json",
    body: JSON.stringify(AUTHORIZATION_SERVER_METADATA),
  },
  "/agent/auth": { contentType: "application/json", body: JSON.stringify(AGENT_AUTH_INFO) },
  "/.well-known/mcp/server-card.json": {
    contentType: "application/json",
    body: JSON.stringify(MCP_SERVER_CARD),
  },
  "/.well-known/agent-skills/index.json": {
    contentType: "application/json",
    body: JSON.stringify(SKILLS_INDEX),
  },
  [SKILL_PATH]: { contentType: "text/markdown; charset=utf-8", body: TOUR_SKILL_MD },
  "/api/openapi.json": { contentType: "application/openapi+json", body: JSON.stringify(OPENAPI) },
  "/api/docs": { contentType: "text/markdown; charset=utf-8", body: API_DOCS },
  "/api": { contentType: "application/json; charset=utf-8", body: JSON.stringify(API_INDEX) },
  "/api/": { contentType: "application/json; charset=utf-8", body: JSON.stringify(API_INDEX) },
};

export function discoveryResponse(request: Request): Response | null {
  const route = DISCOVERY_ROUTES[new URL(request.url).pathname];
  if (!route) return null;
  const headers = new Headers({
    "content-type": route.contentType,
    "cache-control": "public, max-age=60",
    link: CATALOG_LINK,
  });
  if (request.method === "HEAD") return new Response(null, { status: 200, headers });
  if (request.method !== "GET") {
    return new Response(null, { status: 405, headers: { allow: "GET, HEAD", link: CATALOG_LINK } });
  }
  return new Response(route.body, { status: 200, headers });
}
