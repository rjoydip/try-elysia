# Try Elysia

[![React Doctor](https://www.react.doctor/share/badge?p=try-elysia&s=96&w=29&f=26)](https://www.react.doctor/share?p=try-elysia&s=96&w=29&f=26)
[![CI](https://github.com/rjoydip/try-elysia/actions/workflows/ci.yml/badge.svg)](https://github.com/rjoydip/try-elysia/actions/workflows/ci.yml)
[![Release](https://github.com/rjoydip/try-elysia/actions/workflows/release.yml/badge.svg)](https://github.com/rjoydip/try-elysia/actions/workflows/release.yml)

A high-performance full-stack server application built with [ElysiaJS](https://elysiajs.com) and [TanStack Start](https://tanstack.com/start), designed to run on multiple JavaScript runtimes.

## Features

- **Multi-Runtime Support** - Deploy to Bun, Node.js, or Cloudflare Workers
- **Type-Safe API** - End-to-end type safety with ElysiaJS and OpenAPI
- **Authentication** - Secure auth with better-auth and session management
- **Database** - Type-safe database access with Drizzle ORM
- **Real-time** - WebSocket and Server-Sent Events (SSE) support
- **Security** - Helmet middleware, rate limiting, CORS
- **Observability** - OpenTelemetry integration for tracing
- **Automated Releases** - Changesets for semantic versioning and changelogs

## Tech Stack

| Category | Technology                       |
| -------- | -------------------------------- |
| Backend  | ElysiaJS                         |
| Frontend | React Start (TanStack Router)    |
| Runtimes | Bun, Node.js, Cloudflare Workers |
| Database | Drizzle ORM + SQLite (libSQL)    |
| Auth     | better-auth                      |
| Styling  | TailwindCSS v4                   |
| Docs     | OpenAPI/Swagger                  |
| Releases | Changesets + GitHub Actions      |

## Prerequisites

- [Bun](https://bun.sh) v1.0 or later
- [Node.js](https://nodejs.org) v18 or later (optional, for Node runtime)

```bash
# Install Bun
curl -fsSL https://bun.sh/install | bash
```

## Quick Start

```bash
# Install dependencies
bun install

# Start full-stack development
bun run dev

# Open in browser
open http://localhost:3000/
```

## Scripts Overview

### Development

```bash
bun run dev              # Quick start (server + client)
bun run server:dev       # Bun server with hot reload
bun run server:dev:node  # Node.js server with hot reload
bun run server:dev:workerd # Cloudflare Workers dev
bun run server:dev:edge  # Edge runtime dev
bun run client:dev       # Frontend only (Vite)
```

### Build

```bash
bun run build           # Build all targets
bun run build:bun       # Standalone Bun binary
bun run build:node      # Node.js executable
bun run client:build    # Frontend build
```

### Database

```bash
bun run db:generate     # Generate Drizzle schema
bun run db:migrate       # Run migrations
bun run db:push          # Push schema to database
bun run db:pull          # Pull schema from database
bun run db:seed          # Seed database with data
bun run db:studio        # Open Drizzle Studio
```

### Code Quality

```bash
bun run lint            # Lint with oxlint + format check
bun run lint:fix        # Fix lint issues
bun run fmt             # Format code
bun run typecheck       # TypeScript type checking
bun run react:doctor    # React health check
```

### Testing

```bash
bun test               # Run all tests
bun test:watch         # Watch mode
bun test:coverage      # With coverage report
```

### Releases (Changesets)

```bash
bun changeset add       # Add a changeset for your changes
bun changeset version   # Bump versions (CI uses this)
bun release            # Publish release
```

## Project Structure

```bash
src/
├── _api.ts              # API routes definition
├── _app.ts              # Main application + middleware
├── _config.ts           # Configuration and logger
├── _env.ts              # Environment variables
├── auth.ts              # better-auth configuration
├── router.tsx           # TanStack Router setup
├── routes/              # Frontend routes
│   ├── __root.tsx      # Root layout
│   └── index.tsx        # Home page
├── middlewares/          # Middleware implementations
│   └── _auth.ts         # Authentication middleware
├── features/             # Feature modules
│   └── user/            # User feature (routes, service)
├── db/                   # Database layer
│   ├── _client.ts       # Database client
│   └── schema/          # Drizzle schema
├── runtime/              # Multi-runtime entries
│   ├── bun.ts           # Bun runtime
│   ├── node.ts          # Node.js runtime
│   ├── workerd.ts       # Cloudflare Workers
│   └── edge.ts          # Edge functions
└── components/           # React components

.changeset/               # Changesets for versioning
.github/workflows/         # GitHub Actions CI/CD
```

## API Endpoints

### Authentication

| Method | Endpoint             | Description         |
| ------ | -------------------- | ------------------- |
| POST   | `/api/auth/sign-in`  | Sign in             |
| POST   | `/api/auth/sign-up`  | Sign up             |
| POST   | `/api/auth/sign-out` | Sign out            |
| GET    | `/api/auth/session`  | Get current session |

### Users (Protected)

| Method | Endpoint        | Description               |
| ------ | --------------- | ------------------------- |
| GET    | `/api/user`     | Get all users (paginated) |
| GET    | `/api/user/:id` | Get user by ID            |
| POST   | `/api/user`     | Create user               |
| PUT    | `/api/user/:id` | Update user               |
| DELETE | `/api/user/:id` | Delete user               |

### Public

| Method | Endpoint      | Description        |
| ------ | ------------- | ------------------ |
| GET    | `/api/`       | API welcome        |
| GET    | `/api/health` | Health check       |
| GET    | `/api/sse`    | Server-Sent Events |
| WS     | `/api/chat`   | WebSocket chat     |

API documentation available at `/openapi` when server is running.

## Environment Variables

### Required

```env
BETTER_AUTH_SECRET=your-secret-key
BETTER_AUTH_BASE_URL=http://localhost:3000/api
DATABASE_URL=file:sqlite.db
```

### Optional

```env
PORT=3000
DATABASE_AUTH_TOKEN=your-token
TLS_CERT_PATH=/path/to/cert.pem
TLS_KEY_PATH=/path/to/key.pem
```

See [docs/environment-variables.md](docs/environment-variables.md) for full documentation.

## Deployment

### Cloudflare Workers

```bash
bun run deploy
```

### Bun

```bash
bun run build:bun
./server
```

### Node.js

```bash
bun run build:node
node dist/server.js
```

## Contributing

We use [Changesets](https://github.com/changesets/changesets) for versioning and changelogs.

### Making Changes

1. **Make your changes** in a feature branch
2. **Add a changeset** to describe what changed:

   ```bash
   bun changeset add
   ```

   - Select the `try-elysia` package
   - Choose bump type: `patch`, `minor`, or `major`
   - Write a description of your changes

3. **Commit** your changes including the changeset file
4. **Open a PR** - CI will run tests and linting

### Release Process

Releases are **automated** via GitHub Actions when changes are merged to `main`:

1. Changesets detects new changeset files
2. Updates version in `package.json`
3. Generates `CHANGELOG.md` with PR links
4. Creates GitHub Release with binaries
5. Publishes to GitHub Packages (if applicable)

### Nightly Builds

Dev builds are automatically created nightly at midnight UTC. They include:

- Latest code from `main`
- Version: `0.0.0-dev.YYYYMMDD.commitCount`
- Download from the "Nightly Dev" GitHub Release

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed contribution guidelines.

## Generate Auth Schema

For regenerating `better-auth` schema:

```bash
bun x @better-auth/cli@latest generate --output ./src/db/schema/auth.ts
```

## Documentation

- [Project Overview](docs/project-overview.md)
- [Development Guide](docs/development.md)
- [API Reference](docs/api-reference.md)
- [Authentication](docs/authentication.md)
- [Database Schema](docs/database-schema.md)
- [Architecture](docs/architecture.md)
- [Middleware](docs/middleware.md)
- [Multi-Runtime](docs/multi-runtime.md)
- [Environment Variables](docs/environment-variables.md)
- [Contributing Guide](CONTRIBUTING.md)

## License

MIT
