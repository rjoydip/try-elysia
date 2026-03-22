# Database Schema

The application uses Drizzle ORM with SQLite (libSQL) for data persistence.

## Schema Location

All schema definitions are in `src/db/schema/_main.ts`

## Tables

### User Table

```typescript
export const user = sqliteTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: integer("email_verified", { mode: "boolean" }).default(false).notNull(),
  image: text("image"),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
});
```

| Column        | Type    | Constraints            |
| ------------- | ------- | ---------------------- |
| id            | TEXT    | PRIMARY KEY            |
| name          | TEXT    | NOT NULL               |
| email         | TEXT    | NOT NULL, UNIQUE       |
| emailVerified | INTEGER | BOOLEAN, DEFAULT false |
| image         | TEXT    | NULLABLE               |
| createdAt     | INTEGER | TIMESTAMP_MS, NOT NULL |
| updatedAt     | INTEGER | TIMESTAMP_MS, NOT NULL |

### Session Table

```typescript
export const session = sqliteTable("session", {
  id: text("id").primaryKey(),
  expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
  token: text("token").notNull().unique(),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});
```

| Column    | Type    | Constraints            |
| --------- | ------- | ---------------------- |
| id        | TEXT    | PRIMARY KEY            |
| expiresAt | INTEGER | TIMESTAMP_MS, NOT NULL |
| token     | TEXT    | NOT NULL, UNIQUE       |
| createdAt | INTEGER | TIMESTAMP_MS, NOT NULL |
| updatedAt | INTEGER | TIMESTAMP_MS, NOT NULL |
| ipAddress | TEXT    | NULLABLE               |
| userAgent | TEXT    | NULLABLE               |
| userId    | TEXT    | NOT NULL, FK → user.id |

**Indexes:**

- `session_userId_idx` on `userId`

### Account Table

```typescript
export const account = sqliteTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: integer("access_token_expires_at", { mode: "timestamp_ms" }),
  refreshTokenExpiresAt: integer("refresh_token_expires_at", { mode: "timestamp_ms" }),
  scope: text("scope"),
  password: text("password"),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
});
```

| Column                | Type    | Constraints            |
| --------------------- | ------- | ---------------------- |
| id                    | TEXT    | PRIMARY KEY            |
| accountId             | TEXT    | NOT NULL               |
| providerId            | TEXT    | NOT NULL               |
| userId                | TEXT    | NOT NULL, FK → user.id |
| accessToken           | TEXT    | NULLABLE               |
| refreshToken          | TEXT    | NULLABLE               |
| idToken               | TEXT    | NULLABLE               |
| accessTokenExpiresAt  | INTEGER | TIMESTAMP_MS           |
| refreshTokenExpiresAt | INTEGER | TIMESTAMP_MS           |
| scope                 | TEXT    | NULLABLE               |
| password              | TEXT    | NULLABLE               |
| createdAt             | INTEGER | TIMESTAMP_MS, NOT NULL |
| updatedAt             | INTEGER | TIMESTAMP_MS, NOT NULL |

**Indexes:**

- `account_userId_idx` on `userId`

### Verification Table

```typescript
export const verification = sqliteTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
});
```

| Column     | Type    | Constraints            |
| ---------- | ------- | ---------------------- |
| id         | TEXT    | PRIMARY KEY            |
| identifier | TEXT    | NOT NULL               |
| value      | TEXT    | NOT NULL               |
| expiresAt  | INTEGER | TIMESTAMP_MS, NOT NULL |
| createdAt  | INTEGER | TIMESTAMP_MS, NOT NULL |
| updatedAt  | INTEGER | TIMESTAMP_MS, NOT NULL |

**Indexes:**

- `verification_identifier_idx` on `identifier`

## Relations

```typescript
// User has many sessions and accounts
export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
}));

// Session belongs to one user
export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

// Account belongs to one user
export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));
```

## Database Client

The database client is initialized in `src/db/_client.ts`:

```typescript
export const db = await createDB(env.DATABASE_URL, env.DATABASE_AUTH_TOKEN, isBun);
export type DB = Awaited<ReturnType<typeof createDB>>;
```

### Client Creation

```typescript
async function createDB(db_url: string, db_auth_token: string, isBun: boolean = false) {
  if (isBun) {
    // Uses bun:sqlite for native SQLite
    const { drizzle } = await import("drizzle-orm/bun-sqlite");
    const { Database } = await import("bun:sqlite");
    const client = new Database(/* ... */);
    return drizzle({ client });
  } else {
    // Uses libSQL client for cross-platform
    const { createClient } = await import("@libsql/client");
    const { drizzle } = await import("drizzle-orm/libsql");
    // ...
  }
}
```

## Migrations

```bash
# Generate migration files
bun run db:generate

# Apply migrations
bun run db:migrate

# Push schema to database (development)
bun run db:push

# Pull schema from database
bun run db:pull

# Seed database
bun run db:seed
```
