# Environment Variables

This document describes all environment variables used in the application.

## Required Variables

### Server-Side (Backend)

| Variable               | Type   | Description                                                                                                                                     |
| ---------------------- | ------ | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `BETTER_AUTH_SECRET`   | string | Secret key for better-auth. **Required in production** - application will throw an error if not set. Falls back to random value in development. |
| `BETTER_AUTH_BASE_URL` | string | Base URL for authentication callbacks. Format: URI                                                                                              |
| `DATABASE_URL`         | string | Database connection URL. Format: URI                                                                                                            |
| `DATABASE_AUTH_TOKEN`  | string | Database authentication token                                                                                                                   |
| `PORT`                 | number | Server port (default: 3000)                                                                                                                     |
| `TLS_CERT_PATH`        | string | Path to TLS certificate file                                                                                                                    |
| `TLS_KEY_PATH`         | string | Path to TLS key file                                                                                                                            |

### Client-Side (Frontend)

| Variable       | Type   | Description                  |
| -------------- | ------ | ---------------------------- |
| `BASE_URL`     | string | Base URL for the application |
| `API_ENDPOINT` | string | API endpoint URL             |

## Configuration File

The main environment configuration is defined in `src/_env.ts`:

```typescript
export const env = await _createEnv({
  client: {
    BASE_URL: t.String(),
  },
  server: {
    API_ENDPOINT: t.String(),
    BETTER_AUTH_SECRET: t.String(),
    BETTER_AUTH_BASE_URL: t.String({ format: "uri" }),
    DATABASE_URL: t.String({ format: "uri" }),
    DATABASE_AUTH_TOKEN: t.String(),
    PORT: t.Number(),
    TLS_CERT_PATH: t.String(),
    TLS_KEY_PATH: t.String(),
  },
  runtimeEnv: () => ({
    BASE_URL: _getEnv("BASE_URL", _BASE_URL),
    API_ENDPOINT: _getEnv("API_ENDPOINT", `${_BASE_URL}${API_PREFIX}`),
    BETTER_AUTH_BASE_URL: _getEnv("BETTER_AUTH_BASE_URL", `${_BASE_URL}${API_PREFIX}`),
    BETTER_AUTH_SECRET: _getAuthSecret(),
    DATABASE_URL: _getEnv("DATABASE_URL", ""),
    DATABASE_AUTH_TOKEN: _getEnv("DATABASE_AUTH_TOKEN", ""),
    PORT: _getEnv("PORT", _DEFAULT_PORT),
    TLS_CERT_PATH: _getEnv("TLS_CERT_PATH", ""),
    TLS_KEY_PATH: _getEnv("TLS_KEY_PATH", ""),
  }),
});
```

## Default Values

| Variable               | Default Value           |
| ---------------------- | ----------------------- |
| `PORT`                 | 3000 (8787 for workerd) |
| `BASE_URL`             | `http://localhost:3000` |
| `API_ENDPOINT`         | `${BASE_URL}/api`       |
| `BETTER_AUTH_BASE_URL` | `${BASE_URL}/api`       |

## Production Requirements

### BETTER_AUTH_SECRET

**Critical**: In production (`isProduction: true`), `BETTER_AUTH_SECRET` is required. If not set:

```bash
# Development - warning only
⚠️ BETTER_AUTH_SECRET not set, using random value (sessions will be invalidated on restart)

# Production - throws error
Error: BETTER_AUTH_SECRET is required in production
```

### Database URL

The database must be accessible. For local development with Bun:

```bash
DATABASE_URL=file:sqlite.db
```

For Turso (libSQL):

```bash
DATABASE_URL=libsql://your-database.turso.io
DATABASE_AUTH_TOKEN=your-auth-token
```

## Environment Loading

The application supports different environment loading strategies:

- **Bun**: Uses `Bun.env`
- **Node.js**: Loads `.env` file via `dotenv`
- **Cloudflare Workers**: Uses runtime environment

## Validation

Environment variables are validated at startup using TypeScript types defined in the schema. Invalid or missing required variables will cause the application to fail to start with descriptive error messages.
