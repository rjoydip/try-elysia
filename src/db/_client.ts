import { isBun } from "std-env";
import { env } from "~/env";

export async function createDB(db_url: string, db_auth_token: string, isBun: boolean = false) {
  if (!db_url) {
    throw new Error("DATABASE_URL is not defined");
  }

  if (isBun) {
    const { drizzle } = await import("drizzle-orm/bun-sqlite");
    const { Database } = await import("bun:sqlite");
    const client = new Database(db_url.startsWith("file:") ? db_url.slice(5) : db_url);
    return drizzle({ client });
  } else {
    const { createClient } = await import("@libsql/client");
    const { drizzle } = await import("drizzle-orm/libsql");

    if (db_auth_token && db_url) {
      const client = createClient({
        url: db_url,
        authToken: db_auth_token,
      });

      return drizzle(client, {});
    } else {
      return drizzle(db_url, {});
    }
  }
}

export const db = await createDB(env.DATABASE_URL, env.DATABASE_AUTH_TOKEN, isBun);
export type DB = Awaited<ReturnType<typeof createDB>>;
