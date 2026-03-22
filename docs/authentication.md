# Authentication

The application uses **better-auth** for authentication, providing secure email/password authentication with session management.

## Configuration

Auth is configured in `src/auth.ts`:

```typescript
export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "sqlite",
  }),
  plugins: [openAPI()],
  emailAndPassword: {
    enabled: true,
    password: {
      hash: async (input: string) =>
        isBun ? await Bun.password.hash(input) : await hash(input, hashOpts),
      verify: async ({ password, hash }) =>
        isBun ? await Bun.password.verify(password, hash) : await verify(hash, password, hashOpts),
    },
  },
  basePath: env.BETTER_AUTH_BASE_URL,
  secret: env.BETTER_AUTH_SECRET,
  trustedOrigins: [env.BETTER_AUTH_BASE_URL],
});
```

## Password Hashing

The application uses **Argon2id** algorithm for password hashing:

```typescript
const hashOpts: Options = {
  memoryCost: 65536, // 64 MiB
  timeCost: 3, // 3 iterations
  parallelism: 4, // 4 lanes
  outputLen: 32, // 32 bytes
  algorithm: 2, // Argon2id
};
```

In **Bun** runtime, it uses native `Bun.password` for better performance.

## Auth Middleware

The auth middleware is defined in `src/middlewares/_auth.ts`:

### authMiddleware

Provides route protection and session injection:

```typescript
export const authMiddleware = new Elysia({ name: "better-auth" }).mount(auth.handler).macro({
  auth: {
    async resolve({ request: { headers }, status }) {
      const session = await auth.api.getSession({ headers });

      if (!session)
        return status(401, {
          success: false,
          message: "Unauthorized: Please check your credentials and permissions",
        });

      return {
        user: session.user,
        session: session.session,
      };
    },
  },
});
```

**Usage in routes:**

```typescript
export const userRoutes = new Elysia({ prefix: "/user" })
  .use(authMiddleware)
  .get("/", ({ userService }) => userService.getUsers(), {
    // Route is automatically protected
  });
```

### authService

Handles better-auth API routes at `/api/auth/*`:

```typescript
const authService = new Elysia().all(AUTH_PREFIX, (context: Context & { request: Request }) => {
  const BETTER_AUTH_ACCEPT_METHODS = ["POST", "GET"];
  if (BETTER_AUTH_ACCEPT_METHODS.includes(context.request.method)) {
    return auth.handler(context.request);
  } else {
    context.set.status = 405;
    context.set.headers["Allow"] = BETTER_AUTH_ACCEPT_METHODS.join(", ");
    return "Method Not Allowed";
  }
});
```

## Auth Endpoints

The following endpoints are available at `/api/auth/*`:

| Endpoint                    | Method | Description                 |
| --------------------------- | ------ | --------------------------- |
| `/api/auth/sign-in`         | POST   | Sign in with email/password |
| `/api/auth/sign-up`         | POST   | Create new account          |
| `/api/auth/sign-out`        | POST   | Sign out current session    |
| `/api/auth/get-session`     | GET    | Get current session         |
| `/api/auth/list-sessions`   | GET    | List all sessions           |
| `/api/auth/change-email`    | POST   | Change email address        |
| `/api/auth/change-password` | POST   | Change password             |

## Session Management

Sessions are stored in the database with the following fields:

- `id`: Unique session identifier
- `token`: Secure session token
- `expiresAt`: Session expiration time
- `userId`: Associated user
- `ipAddress`: Client IP address
- `userAgent`: Client user agent

## WebSocket Authentication

WebSocket connections are authenticated using session tokens from headers:

```typescript
.ws("/chat", {
  async open(ws) {
    const headers = new Headers();
    for (const [key, value] of Object.entries(ws.data.headers)) {
      if (value) headers.append(key, value);
    }

    const session = await auth.api.getSession({ headers });

    if (!session) {
      ws.send({ id: secure(), message: "Unauthorized" });
      ws.close(1008, "Unauthorized");
      return;
    }

    ws.send({ id: secure(), message: "Welcome" });
  },
});
```

## Security Considerations

### Production Requirements

- `BETTER_AUTH_SECRET` is **required** in production
- Missing secret throws an error preventing startup
- Development uses random secret (sessions invalidated on restart)

### Trusted Origins

Only specified origins can use auth endpoints:

```typescript
trustedOrigins: [env.BETTER_AUTH_BASE_URL],
```

### Session Security

- Sessions use secure tokens
- IP address and user agent are tracked
- Cascading delete removes all related sessions
