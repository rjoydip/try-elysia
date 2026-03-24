# Multi-Runtime Support

The application is designed to run on multiple JavaScript runtimes, providing flexibility in deployment options.

## Supported Runtimes

| Runtime            | Entry Point              | Command                      |
| ------------------ | ------------------------ | ---------------------------- |
| Bun                | `src/runtime/bun.ts`     | `bun run server:dev`         |
| Node.js            | `src/runtime/node.ts`    | `bun run server:dev:node`    |
| Cloudflare Workers | `src/runtime/workerd.ts` | `bun run server:dev:workerd` |
| Edge               | `src/runtime/edge.ts`    | `bun run server:dev:edge`    |

## Bun Runtime

High-performance JavaScript runtime with native TypeScript support.

**File:** `src/runtime/bun.ts`

```typescript
const app = createApp({})
  .use(api)
  .listen({
    port: env.PORT,
    tls:
      env.TLS_CERT_PATH && env.TLS_KEY_PATH
        ? {
            cert: Bun.file(env.TLS_CERT_PATH),
            key: Bun.file(env.TLS_KEY_PATH),
          }
        : undefined,
  });
```

**Features:**

- Native `bun:sqlite` for database access
- Built-in TLS support
- Native password hashing (`Bun.password`)

## Node.js Runtime

Standard Node.js environment support.

**File:** `src/runtime/node.ts`

```typescript
import { node } from "@elysiajs/node";

const app = createApp({
  adapter: node(),
})
  .use(api)
  .listen({
    port: PORT,
    tls: /* ... */,
  });
```

**Features:**

- Uses `@elysiajs/node` adapter
- TLS via Node.js `fs` module
- libSQL client for database

## Cloudflare Workers Runtime

Edge deployment on Cloudflare's global network.

**File:** `src/runtime/workerd.ts`

```typescript
import { CloudflareAdapter } from "elysia/adapter/cloudflare-worker";

const app = createApp({
  adapter: CloudflareAdapter,
})
  .use(api)
  .listen({
    port: PORT,
    tls: /* ... */,
  });

export default app.compile();
```

**Features:**

- Uses Cloudflare Workers adapter
- Compiled for workerd runtime
- Deployable to Cloudflare Workers

## Edge Runtime

Serverless edge function deployment.

**File:** `src/runtime/edge.ts`

```typescript
const app = createApp({}).use(api);

export default {
  async fetch(request: Request, _env: Env, _ctx: Context): Promise<Response> {
    return await app.fetch(request);
  },
};
```

**Features:**

- Minimal cold start
- Request/Response pattern
- Environment injection

## Runtime Detection

The application uses `std-env` to detect the current runtime:

```typescript
import { isBun, isNode, isWorkerd } from "std-env";
```

## Runtime-Specific Database Access

The database client adapts based on the runtime:

```typescript
export async function createDB(db_url: string, db_auth_token: string, isBun: boolean = false) {
  if (isBun) {
    // Native SQLite via bun:sqlite
    const { drizzle } = await import("drizzle-orm/bun-sqlite");
    const { Database } = await import("bun:sqlite");
    const client = new Database(db_url.startsWith("file:") ? db_url.slice(5) : db_url);
    return drizzle({ client });
  } else {
    // Cross-platform via libsql
    const { createClient } = await import("@libsql/client");
    const { drizzle } = await import("drizzle-orm/libsql");
    // ...
  }
}
```

## Password Hashing

Password hashing also adapts per runtime:

```typescript
emailAndPassword: {
  password: {
    hash: async (input: string) =>
      isBun
        ? await Bun.password.hash(input)      // Native Bun
        : await hash(input, hashOpts),         // Node.js (Argon2)
    verify: async ({ password, hash }) =>
      isBun
        ? await Bun.password.verify(password, hash)
        : await verify(hash, password, hashOpts),
  },
},
```

## Environment Variables per Runtime

| Variable       | Bun       | Node.js       | Workerd       | Edge          |
| -------------- | --------- | ------------- | ------------- | ------------- |
| `PORT`         | 3000      | 3000          | 8787          | N/A           |
| `DATABASE_URL` | file path | libsql:// URL | libsql:// URL | libsql:// URL |
| TLS Support    | Native    | Node fs       | Not supported | Not supported |

## Deployment

### Deploy to Cloudflare Workers

```bash
bun run deploy
```

This runs `wrangler deploy --minify` using the workerd runtime.

### Build for Bun

```bash
bun run server:build:bun
```

Creates a standalone executable.

### Build for Node.js

```bash
bun run server:build:node
```

Uses tsx for building.
