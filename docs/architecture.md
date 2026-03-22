# Architecture

This document describes the application architecture and design patterns.

## High-Level Architecture

```bash
┌─────────────────────────────────────────────────────────┐
│                     Client (Browser)                    │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐  │
│  │   React     │  │   TanStack  │  │  TanStack       │  │
│  │   App       │  │   Router    │  │  Devtools       │  │
│  └─────────────┘  └─────────────┘  └─────────────────┘  │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼ HTTP/WebSocket
┌─────────────────────────────────────────────────────────────┐
│                    API Layer (/api)                         │
│  ┌─────────────────────────────────────────────────────────┐│
│  │                    ElysiaJS                             ││
│  │  ┌──────────┐ ┌──────────┐ ┌────────────────────┐       ││
│  │  │ OpenAPI  │ │  Helmet  │ │   Rate Limiter     │       ││
│  │  └──────────┘ └──────────┘ └────────────────────┘       ││
│  │  ┌──────────┐ ┌──────────────┐ ┌────────────────────┐   ││
│  │  │  Bearer  │ │ OpenTelemetry│ │   Server Timing    │   ││
│  │  └──────────┘ └──────────────┘ └────────────────────┘   ││
│  └─────────────────────────────────────────────────────────┘│
│                            │                                │
│  ┌─────────────────────────┴─────────────────────────┐      │
│  │                   Routes                          │      │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌──────────┐ │      │
│  │  │ /user/* │ │/auth/* │ │/chat WS │ │ /sse      │ │      │
│  │  └─────────┘ └─────────┘ └─────────┘ └──────────┘ │      │
│  └───────────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────┐
│                  Middleware Layer                        │
│  ┌─────────────────────────────────────────────────────┐ │
│  │               better-auth                           | │
│  │  ┌───────────┐ ┌───────────┐ ┌─────────────────┐    │ │
│  │  │  Session  │ │   Email   │ │   Password      │    │ │
│  │  │  Handler  │ │  Handler  │ │   Hashing       │    │ │
│  │  └───────────┘ └───────────┘ └─────────────────┘    │ │
│  └─────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────┐
│                    Data Layer                            │
│  ┌──────────────────────┐ ┌────────────────────────────┐ │
│  │      Drizzle ORM     │ │   SQLite / libSQL          │ │
│  │   (Type-safe queries)│ │   (Data persistence)       │ │
│  └──────────────────────┘ └────────────────────────────┘ │
└──────────────────────────────────────────────────────────┘
```

## Core Components

### 1. Application Factory (`_app.ts`)

The `createApp()` function creates the main Elysia application with all middleware:

```typescript
export const createApp = (config?: ElysiaConfig<any>) =>
  new Elysia({
    /* base config */
  })
    .use(openapi()) // API documentation
    .use(ip()) // IP extraction
    .use(bearer()) // Bearer token
    .use(opentelemetry()) // Observability
    .use(elysiaHelmet()) // Security headers
    .use(serverTiming()) // Performance metrics
    .use(rateLimit()) // Rate limiting
    .use(staticPlugin()) // Static files
    .trace() // Request tracing
    .onError(); // Error handling
```

### 2. API Definition (`_api.ts`)

Defines all API routes under the `/api` prefix:

```typescript
export const api = new Elysia({ prefix: API_PREFIX })
  .state("name", API_NAME)
  .use(authService) // Auth handler
  .use(userRoutes) // Feature routes
  .ws("/chat", {
    /* ... */
  }) // WebSocket
  .get("/sse", {
    /* ... */
  }) // Server-Sent Events
  .get("/health", {
    /* ... */
  });
```

### 3. Environment Management (`_env.ts`)

Type-safe environment variable access with validation:

```typescript
export const env = await _createEnv({
  client: {
    /* client-side vars */
  },
  server: {
    /* server-side vars */
  },
  runtimeEnv: () => ({
    /* values */
  }),
});
```

### 4. Authentication (`auth.ts`)

Better-auth configuration with session management:

```typescript
export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "sqlite" }),
  plugins: [openAPI()],
  emailAndPassword: { enabled: true /* ... */ },
});
```

## Design Patterns

### Feature Module Pattern

Each feature follows a consistent structure:

```bash
features/[name]/
├── +index.routes.ts   # API endpoints
├── +index.service.ts  # Business logic
└── +index.model.ts    # Drizzle model (optional)
```

**Benefits:**

- Self-contained feature modules
- Easy to add/remove features
- Clear separation of concerns

### Middleware Composition

Elysia uses a plugin system for middleware:

```typescript
app
  .use(middlewareA) // Applied first
  .use(middlewareB) // Wraps A
  .use(middlewareC) // Wraps B
  .get("/", handler); // Handler wrapped by all
```

### Decorator Pattern

Services are injected via decorators:

```typescript
export const userRoutes = new Elysia({ prefix: "/user" })
  .decorate("userService", new UserService(db))
  .get("/", ({ userService }) => userService.getUsers());
```

### Multi-Runtime Abstraction

Runtime-specific code is isolated:

```bash
src/runtime/
├── bun.ts      # Bun-specific
├── node.ts     # Node.js-specific
├── workerd.ts  # Cloudflare Workers
└── edge.ts     # Edge functions
```

Shared code uses `std-env` for detection:

```typescript
import { isBun, isNode, isWorkerd } from "std-env";
```

## Request Lifecycle

1. **Request Received** → Rate limiter check
2. **IP Extraction** → `ip()` middleware
3. **Bearer Token** → `bearer()` middleware
4. **Helmet Headers** → Security headers
5. **Route Matching** → API routes
6. **Auth Check** → Session validation
7. **Handler Execution** → Business logic
8. **Response** → Error handling if needed
9. **Telemetry** → OpenTelemetry spans

## Security Architecture

### Defense in Depth

```bash
┌─────────────────────────────────┐
│        Rate Limiting            │ ← First line (100 req/min)
├─────────────────────────────────┤
│        Helmet Headers           │ ← CSP, HSTS, X-Frame-Options
├─────────────────────────────────┤
│        Auth Middleware          │ ← Session validation
├─────────────────────────────────┤
│        Route Guards             │ ← Per-route authorization
└─────────────────────────────────┘
```

### Security Headers

- Content-Security-Policy (CSP)
- HSTS (HTTP Strict Transport Security)
- X-Frame-Options: DENY
- Referrer-Policy: strict-origin-when-cross-origin
- Nonce-based CSP for inline scripts

## Observability

### OpenTelemetry Integration

Automatic instrumentation for:

- HTTP requests
- Database queries
- External API calls

### Server Timing

Request timing headers:

```bash
Server-Timing: total;dur=123
```

### Custom Logging

Structured logging with tslog:

```typescript
logger.info("Request processed", { duration: elapsed });
```

## Deployment Targets

| Target  | Adapter        | Database        | Best For        |
| ------- | -------------- | --------------- | --------------- |
| Bun     | Native         | bun:sqlite      | Max performance |
| Node.js | @elysiajs/node | libSQL          | Enterprise      |
| Workers | Cloudflare     | libSQL (remote) | Global edge     |
| Edge    | None           | libSQL (remote) | Serverless      |
