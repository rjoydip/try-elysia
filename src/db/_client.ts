import { isBun } from "std-env";
import { env } from "~/_env";

let dbInstance: Awaited<ReturnType<typeof createDB>> | null = null;

export async function createDB(db_url: string, db_auth_token: string, isBun: boolean = false) {
  if (!db_url) {
    throw new Error("DATABASE_URL is not defined");
  }

  if (db_url.trim() === "") {
    throw new Error("DATABASE_URL cannot be empty");
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

export async function getDB() {
  if (!dbInstance) {
    dbInstance = await createDB(env.DATABASE_URL, env.DATABASE_AUTH_TOKEN, isBun);
  }
  return dbInstance;
}

export const db = await getDB();
export type DB = Awaited<ReturnType<typeof createDB>>;
