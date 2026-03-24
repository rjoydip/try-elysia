# Middleware & Configuration

## Middleware Stack

The application uses a layered middleware approach for security, observability, and functionality.

## Security Middleware

### Helmet (`elysiajs-helmet`)

Security headers to protect against common web vulnerabilities.

```typescript
.use((elysiaHelmet as any)({
  csp: {
    useNonce: true,  // Cryptographic nonce for inline scripts
  },
  hsts: {
    maxAge: 31_536_000,  // 1 year
    includeSubDomains: true,
    preload: true,
  },
  frameOptions: "DENY",  // Prevent clickjacking
  referrerPolicy: "strict-origin-when-cross-origin",
  permissionsPolicy: {},
}))
```

**Headers Set:**

- `Content-Security-Policy`
- `Strict-Transport-Security`
- `X-Frame-Options`
- `X-Content-Type-Options`
- `Referrer-Policy`
- `Permissions-Policy`

### Rate Limiter (`elysia-rate-limit`)

Prevents abuse by limiting request frequency.

```typescript
.use(rateLimit({
  duration: 60_000,        // 60 seconds window
  max: 100,                // 100 requests per window
  headers: true,            // Include rate limit headers
  scoping: "scoped",        // Rate limit per route
  countFailedRequest: true,  // Count failed requests
  generator: ipGenerator,   // IP-based identification
  errorResponse: new Response(
    JSON.stringify({ error: "Too many requests" }),
    { status: 429 }
  ),
}))
```

**Rate Limit Headers:**

```bash
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

### IP Extraction (`elysia-ip`)

Extracts client IP address for logging and rate limiting.

```typescript
const ipGenerator: Generator<{ ip: SocketAddress }> = (_r, _s, { ip }) => ip?.address ?? "unknown";
```

## Authentication Middleware

### Bearer Token (`@elysiajs/bearer`)

Extracts Bearer tokens from Authorization header.

```typescript
.use(bearer())  // Makes token available via context.bearer
```

### better-auth Middleware

Session-based authentication with better-auth.

**Middleware Definition:**

```typescript
export const authMiddleware = new Elysia({ name: "better-auth" }).mount(auth.handler).macro({
  auth: {
    async resolve({ request: { headers }, status }) {
      const session = await auth.api.getSession({ headers });

      if (!session)
        return status(401, {
          success: false,
          message: "Unauthorized",
        });

      return {
        user: session.user,
        session: session.session,
      };
    },
  },
});
```

**Usage:**

```typescript
.use(authMiddleware)
.get("/", ({ userService, auth }) => {
  // auth.user and auth.session available
  return userService.getUsers();
})
```

## Observability Middleware

### OpenTelemetry (`@elysiajs/opentelemetry`)

Distributed tracing for request visibility.

```typescript
.use(opentelemetry())
```

### Server Timing (`@elysiajs/server-timing`)

Performance metrics in response headers.

```typescript
.use(serverTiming({
  trace: {
    request: true,
    parse: true,
    transform: true,
    beforeHandle: true,
    handle: true,
    afterHandle: true,
    error: true,
    mapResponse: true,
    total: true,
  },
}))
```

**Response Header:**

```bash
Server-Timing: parse;dur=1.5, transform;dur=0.8, handle;dur=12.3, total;dur=14.6
```

## Custom Middleware

### Request Tracing

Traces request lifecycle with timing information.

```typescript
.trace(
  async ({ onBeforeHandle, onAfterHandle, onError, onHandle, set }) => {
    onBeforeHandle(({ begin, onStop }) => {
      onStop(({ end }) => {
        const duration = typeof begin === "number" && typeof end === "number"
          ? (end - begin).toFixed(4)
          : "0.00";
        logger.debug(`BeforeHandle took ${duration} ms`);
      });
    });

    onAfterHandle(({ begin, onStop }) => { /* ... */ });
    onError(({ begin, onStop }) => { /* ... */ });
    onHandle(({ onStop }) => { /* ... */ });
  },
)
```

### Static Files (`@elysiajs/static`)

Serves static files from the public directory.

```typescript
.use(async () => await staticPlugin())
```

## Error Handling

### Global Error Handler

```typescript
.onError(({ code, error }) => {
  const errorMessage = isProduction
    ? "An unexpected error occurred"
    : error instanceof Error
      ? error.message
      : String(error);

  const responseBody =
    code === "NOT_FOUND"
      ? JSON.stringify({ error: "Endpoint not found" })
      : JSON.stringify({ error: errorMessage });

  return new Response(responseBody, {
    status: code === "NOT_FOUND" ? 404 : 500,
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
})
```

**Error Codes:**

| Code                  | HTTP Status | Description       |
| --------------------- | ----------- | ----------------- |
| NOT_FOUND             | 404         | Route not found   |
| INTERNAL_SERVER_ERROR | 500         | Unexpected error  |
| VALIDATION            | 400         | Invalid input     |
| UNAUTHORIZED          | 401         | Not authenticated |
| FORBIDDEN             | 403         | Not authorized    |

## Application Configuration

### Base Config (`_config.ts`)

```typescript
export const appConfig: ElysiaConfig<any> = {
  normalize: true,
  prefix: "",
  nativeStaticResponse: true,
  websocket: {
    idleTimeout: 30, // 30 seconds
  },
};
```

### Logger Configuration

Uses tslog for structured logging:

```typescript
export const logger: Logger<ILogObj> = new Logger({
  name: API_NAME,
  type: "pretty",
  prettyLogTemplate: `{{dateIsoStr}} {{logLevelName}} {{filePathWithLine}}`,
  prettyLogTimeZone: "UTC",
  stylePrettyLogs: true,
  prettyLogStyles: {
    logLevelName: {
      "*": ["bold", "black", "bgWhiteBright", "dim"],
      SILLY: ["bold", "cyan"],
      TRACE: ["bold", "cyanBright"],
      DEBUG: ["bold", "green"],
      INFO: ["bold", "blue"],
      WARN: ["bold", "yellow"],
      ERROR: ["bold", "red"],
      FATAL: ["bold", "redBright"],
    },
  },
});
```

### Constants

```typescript
export const API_PREFIX = `/api`;
export const AUTH_PREFIX = `${API_PREFIX}/auth/*`;
export const API_NAME = "TRY ELYSIA";
```

## Middleware Order

The order of middleware is crucial:

```bash
1. openapi()           - API documentation (outermost)
2. ip()                - IP extraction
3. bearer()            - Token extraction
4. opentelemetry()      - Tracing
5. helmet()            - Security headers
6. serverTiming()       - Performance metrics
7. rateLimit()         - Rate limiting
8. staticPlugin()      - Static files
9. authMiddleware      - Authentication (per-route)
10. route handlers      - Business logic
```

## Creating Custom Middleware

### Functional Middleware

```typescript
const myMiddleware = new Elysia().derive(({ headers }) => {
  return {
    customValue: headers.get("x-custom-header"),
  };
});
```

### Async Middleware

```typescript
.use(async ({ set }) => {
  set.headers["X-Custom-Header"] = "value";
})
```
