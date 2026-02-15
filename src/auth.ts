import { hash, type Options, verify } from "@node-rs/argon2";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { openAPI } from "better-auth/plugins";
import { isBun } from "std-env";
import { db } from "~/db/_client";
import { env } from "~/env";

const hashOpts: Options = {
  memoryCost: 65536, // 64 MiB
  timeCost: 3, // 3 iterations
  parallelism: 4, // 4 lanes
  outputLen: 32, // 32 bytes
  algorithm: 2, // Argon2id
};

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "sqlite", // or "mysql", "sqlite",
  }),
  plugins: [openAPI()],
  emailAndPassword: {
    enabled: true,
    password: {
      hash: async (input: string) =>
        isBun ? await Bun.password.hash(input) : await hash(input, hashOpts),
      verify: async ({ password, hash }) =>
        isBun ? await Bun.password.verify(password, hash) : await verify(hash, password, hashOpts),
    },
  },
  basePath: env.BETTER_AUTH_BASE_URL,
  secret: env.BETTER_AUTH_SECRET,
  trustedOrigins: [env.BETTER_AUTH_BASE_URL],
});

export type Session = typeof auth.$Infer.Session;
