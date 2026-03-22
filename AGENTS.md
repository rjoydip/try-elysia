# TRY ELYSIA - Development Guide

## Reference Documents

- [README](README.md) - Project overview, file structure, and dev commands

---

## Framework

- **Backend**: ElysiaJS (high-performance Node.js/Bun framework)
- **Frontend**: React Start (TanStack React Router)
- **Runtimes**: Bun, Node.js, Cloudflare Workers (workerd)
- **Database**: Drizzle ORM with SQLite (libSQL)
- **Auth**: better-auth
- **Styling**: TailwindCSS v4
- **API Docs**: OpenAPI/Swagger
- **Monitoring**: OpenTelemetry

---

## Working with this Codebase

### Key Commands

- `bun run dev` - Full stack development (frontend + backend)
- `bun run client:dev` - Frontend only (Vite + React)
- `bun run server:dev` - Bun server (with hot reload)
- `bun run server:dev:node` - Node.js server
- `bun run server:dev:workerd` - Cloudflare Workers dev
- `bun run db:generate` - Generate Drizzle schema
- `bun run db:migrate` - Run database migrations
- `bun run deploy` - Deploy to Cloudflare Workers

### Code Quality

- Linting: `bun run lint` (oxlint + oxfmt)
- Type checking: `bun run typecheck` (tsgo)
