import { reset, seed } from "drizzle-seed";
import { createDB } from "~/db/_client";
import * as schema from "~/db/schema/_main";
import { logger } from "~/_config";
import { env } from "~/_env";

async function main() {
  const db = await createDB(env.DATABASE_URL, env.DATABASE_AUTH_TOKEN, true);

  logger.info("🌱 Starting seed...");

  await reset(db, schema);

  // Seed random users
  await seed(db, schema).refine((f) => ({
    user: {
      count: 10,
      columns: {
        name: f.fullName(),
        email: f.email(),
        emailVerified: f.boolean(),
      },
    },
    session: {
      count: 20,
      columns: {
        token: f.uuid(),
        expiresAt: f.date(),
      },
    },
    account: {
      count: 10,
      columns: {
        providerId: f.valuesFromArray({ values: ["google", "github", "discord"] }),
        accountId: f.uuid(),
        accessToken: f.uuid(),
        refreshToken: f.uuid(),
      },
    },
    verification: {
      count: 5,
      columns: {
        identifier: f.email(),
        value: f.uuid(),
        expiresAt: f.date(),
      },
    },
  }));

  logger.info("✅ Seeding complete!");
  process.exit(0);
}

main().catch((err) => {
  logger.error("❌ Seeding failed");
  logger.error(err);
  process.exit(1);
});
