# Development Guide

## Quick Start

```bash
# Install dependencies
bun install

# Start full-stack development (frontend + backend)
bun run dev

# Or run server only
bun run server:dev
```

## Available Commands

### Development

| Command                      | Description                                 |
| ---------------------------- | ------------------------------------------- |
| `bun run dev`                | Full-stack development (frontend + backend) |
| `bun run client:dev`         | Frontend only (Vite + React)                |
| `bun run server:dev`         | Bun server with hot reload                  |
| `bun run server:dev:node`    | Node.js server with hot reload              |
| `bun run server:dev:workerd` | Cloudflare Workers dev server               |
| `bun run server:dev:edge`    | Edge runtime dev server                     |

### Building

| Command                  | Description                     |
| ------------------------ | ------------------------------- |
| `bun run build`          | Build all targets (bun + node)  |
| `bun run build:bun`      | Build standalone Bun executable |
| `bun run build:node`     | Build Node.js server            |
| `bun run client:build`   | Build frontend for production   |
| `bun run client:preview` | Preview production frontend     |

### Database

| Command               | Description                  |
| --------------------- | ---------------------------- |
| `bun run db:generate` | Generate Drizzle schema      |
| `bun run db:migrate`  | Run database migrations      |
| `bun run db:push`     | Push schema to database      |
| `bun run db:pull`     | Pull schema from database    |
| `bun run db:seed`     | Seed database with test data |
| `bun run db:studio`   | Open Drizzle Studio          |

### Deployment

| Command          | Description                  |
| ---------------- | ---------------------------- |
| `bun run deploy` | Deploy to Cloudflare Workers |

### Code Quality

| Command                | Description                  |
| ---------------------- | ---------------------------- |
| `bun run lint`         | Run linting (oxlint + oxfmt) |
| `bun run fmt`          | Format code with oxfmt       |
| `bun run lint:fix`     | Fix linting issues           |
| `bun run typecheck`    | Run TypeScript type checking |
| `bun run react:doctor` | React health check           |

### Testing

| Command             | Description                |
| ------------------- | -------------------------- |
| `bun test`          | Run all tests              |
| `bun test:watch`    | Watch mode for development |
| `bun test:coverage` | Run with coverage report   |

### Changesets (Releases)

| Command                 | Description                 |
| ----------------------- | --------------------------- |
| `bun changeset add`     | Add a changeset for changes |
| `bun changeset version` | Bump versions locally       |
| `bun release`           | Publish release             |

## Project Structure

```bash
src/
├── _api.ts           # API routes (endpoints)
├── _app.ts           # Main application (middleware)
├── _config.ts        # Configuration & logging
├── _env.ts           # Environment variables
├── auth.ts           # better-auth configuration
├── router.tsx        # TanStack Router setup
├── routes/           # Frontend routes
│   ├── __root.tsx    # Root layout
│   └── index.tsx     # Home page
├── middlewares/      # Middleware
│   └── _auth.ts      # Auth middleware
├── features/         # Feature modules
│   └── user/         # User feature
├── db/               # Database layer
│   ├── _client.ts    # DB client
│   └── schema/       # Schema definitions
├── runtime/          # Runtime entry points
│   ├── bun.ts
│   ├── node.ts
│   ├── workerd.ts
│   └── edge.ts
└── components/       # React components

.changeset/           # Changesets for versioning
.github/workflows/    # GitHub Actions CI/CD
test/                 # Test files
```

## Adding New Features

### 1. Create Feature Directory

```bash
src/features/
└── myfeature/
    ├── +index.routes.ts   # API routes
    ├── +index.service.ts  # Business logic
    └── +index.model.ts    # Drizzle model (optional)
```

### 2. Create Routes

```typescript
// src/features/myfeature/+index.routes.ts
import Elysia from "elysia";
import { MyService } from "./+index.service";
import { authMiddleware } from "~/middlewares/_auth";

export const myfeatureRoutes = new Elysia({
  prefix: "/myfeature",
})
  .decorate("myService", new MyService(db))
  .use(authMiddleware)
  .get("/", ({ myService }) => myService.getAll(), {
    detail: {
      summary: "Get all items",
      tags: ["myfeature"],
    },
  });
```

### 3. Create Service

```typescript
// src/features/myfeature/+index.service.ts
export class MyService {
  constructor(private db: DB) {}

  async getAll() {
    // Business logic
  }
}
```

### 4. Register in API

```typescript
// src/_api.ts
import { myfeatureRoutes } from "~/features/myfeature/+index.routes";

export const api = new Elysia({ prefix: API_PREFIX }).use(myfeatureRoutes);
// ...
```

### 5. Add a Changeset

After your feature is merged, add a changeset:

```bash
bun changeset add
```

Select `try-elysia`, choose bump type, and describe your changes.

## Adding Database Schema

### 1. Define Schema

```typescript
// src/db/schema/_main.ts
export const myTable = sqliteTable("my_table", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  // ...
});
```

### 2. Generate Migrations

```bash
bun run db:generate
bun run db:migrate
```

## Testing

Tests are located in the `test/` directory:

```bash
bun test           # Run all tests
bun test:watch     # Watch mode
bun test:coverage  # With coverage
```

## Code Style

The project uses:

- **oxlint** for linting
- **oxfmt** for formatting

Run before committing:

```bash
bun run lint
bun run typecheck
```

## Pre-commit Hooks

Git hooks run automatically on commit:

```bash
bun install --ignore-scripts --offline
bun run lint
bun run typecheck
bun run action:up
bun run react:doctor
```

## Release Process

See [CONTRIBUTING.md](../CONTRIBUTING.md) for detailed information on:

- How changesets work
- Creating releases
- Version bumping
