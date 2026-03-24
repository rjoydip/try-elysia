import type { Config } from "drizzle-kit";
import "dotenv/config";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("DATABASE_URL is required");
}

export default {
  out: "./src/db/migrations",
  schema: "./src/db/schema",
  breakpoints: true,
  dialect: "sqlite",
  dbCredentials: {
    url: databaseUrl,
    token: process.env.DATABASE_AUTH_TOKEN,
  },
  verbose: true,
  casing: "snake_case",
} satisfies Config;
