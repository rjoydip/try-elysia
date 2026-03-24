# Project Overview

| Property            | Value              |
| ------------------- | ------------------ |
| **Name**            | try-elysia         |
| **Version**         | 0.0.0              |
| **Type**            | ES Module          |
| **Entry Point**     | src/runtime/bun.ts |
| **Dependencies**    | 27                 |
| **DevDependencies** | 17                 |

A high-performance full-stack server application built with modern web technologies, designed to run on multiple JavaScript runtimes.

## Tech Stack

| Category               | Technology                                 |
| ---------------------- | ------------------------------------------ |
| **Backend Framework**  | ElysiaJS                                   |
| **Frontend Framework** | React Start (TanStack React Router)        |
| **Runtimes**           | Bun, Node.js, Cloudflare Workers (workerd) |
| **Database**           | Drizzle ORM with SQLite (libSQL)           |
| **Authentication**     | better-auth                                |
| **Styling**            | TailwindCSS v4                             |
| **API Documentation**  | OpenAPI/Swagger                            |
| **Monitoring**         | OpenTelemetry                              |

## Project Structure

```bash
src/
├── _api.ts           # API routes definition
├── _app.ts           # Main application with middleware
├── _config.ts        # Configuration and logger setup
├── _env.ts           # Environment variables management
├── auth.ts           # better-auth configuration
├── router.tsx        # TanStack Router setup
├── routes/           # Frontend routes
│   ├── __root.tsx    # Root layout component
│   └── index.tsx     # Home page
├── middlewares/       # Middleware implementations
│   └── _auth.ts      # Authentication middleware
├── features/         # Feature modules
│   └── user/         # User feature
│       ├── +index.routes.ts   # User API routes
│       ├── +index.service.ts  # User business logic
│       └── +index.model.ts    # User Drizzle model
├── db/               # Database layer
│   ├── _client.ts    # Database client
│   ├── seed.ts       # Database seeding
│   └── schema/       # Drizzle schema definitions
├── runtime/          # Multi-runtime support
│   ├── bun.ts        # Bun runtime entry
│   ├── node.ts       # Node.js runtime entry
│   ├── workerd.ts    # Cloudflare Workers entry
│   └── edge.ts       # Edge runtime entry
└── components/       # React components
```

## Key Features

- **Multi-Runtime Support**: Deploy to Bun, Node.js, or Cloudflare Workers
- **Type-Safe API**: End-to-end type safety with ElysiaJS
- **Authentication**: Secure auth with better-auth
- **Database**: Type-safe database access with Drizzle ORM
- **API Documentation**: Auto-generated OpenAPI docs
- **Security**: Helmet middleware, rate limiting, CORS
- **Monitoring**: OpenTelemetry integration for observability

## Getting Started

```bash
# Install dependencies
bun install

# Start development
bun run dev

# Run specific runtime
bun run server:dev      # Bun
bun run server:dev:node # Node.js
bun run server:dev:workerd # Cloudflare Workers
```

## Environment Variables

See [Environment Variables](./environment-variables.md) for detailed configuration.

## API Documentation

API documentation is auto-generated and available at `/openapi` when the server is running.

## Dependencies

### Production Dependencies

| Package                 | Version  | Purpose               |
| ----------------------- | -------- | --------------------- |
| elysia                  | ^1.4.28  | Backend framework     |
| @tanstack/react-router  | ^1.168.1 | Routing               |
| @tanstack/react-start   | ^1.167.2 | React Start framework |
| better-auth             | ^1.5.5   | Authentication        |
| drizzle-orm             | ^0.45.1  | Database ORM          |
| @libsql/client          | ^0.17.2  | SQLite client         |
| @elysiajs/openapi       | ^1.4.14  | OpenAPI docs          |
| @elysiajs/opentelemetry | ^1.4.10  | Observability         |
| elysia-rate-limit       | ^4.5.1   | Rate limiting         |
| elysiajs-helmet         | ^1.0.4   | Security headers      |
| tailwindcss             | ^4.2.2   | Styling               |

### Dev Dependencies

| Package      | Version  | Purpose              |
| ------------ | -------- | -------------------- |
| oxlint       | ^1.56.0  | Linting              |
| oxfmt        | ^0.28.0  | Formatting           |
| drizzle-kit  | ^0.31.10 | Database migrations  |
| wrangler     | ^4.76.0  | Cloudflare Workers   |
| tsx          | ^4.21.0  | TypeScript execution |
| react-doctor | ^0.0.26  | React diagnostics    |

## Quick Reference

| Command               | Description                  |
| --------------------- | ---------------------------- |
| `bun run dev`         | Full-stack development       |
| `bun run lint`        | Lint + format check          |
| `bun run typecheck`   | TypeScript check             |
| `bun run db:generate` | Generate Drizzle schema      |
| `bun run deploy`      | Deploy to Cloudflare Workers |
