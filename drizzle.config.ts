import type { Config } from "drizzle-kit";
import { env } from "~/_env";

if (!env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required");
}

export default {
  out: "./src/db/migrations",
  schema: "./src/db/schema",
  breakpoints: true,
  dialect: "sqlite",
  // Set driver only if you are using aws-data-api, turso, d1-http, or expo
  // driver: 'turso',
  dbCredentials: {
    url: env.DATABASE_URL,
    token: env.DATABASE_AUTH_TOKEN,
  },
  verbose: true,
  casing: "snake_case",
} satisfies Config;
