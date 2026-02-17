import { readFileSync } from "node:fs";
import { node } from "@elysiajs/node";
import { runtime } from "std-env";
import { createApp } from "~/_app";
import { api } from "~/_api";
import { API_PREFIX, logger } from "~/_config";
import { env } from "~/_env";

const PORT = env.PORT;

const app = createApp({
  adapter: node(),
})
  .use(api)
  .listen({
    port: PORT,
    tls:
      env.TLS_CERT_PATH && env.TLS_KEY_PATH
        ? {
            cert: readFileSync(env.TLS_CERT_PATH),
            key: readFileSync(env.TLS_KEY_PATH),
          }
        : undefined,
  });

logger.info(
  `🦊 ${app.store.name} (${runtime} - runtime) is running at ${PORT}, API prefix ${API_PREFIX}`,
);

logger.info(`📚 OpenAPI documentation available at /openapi`);

export type NodeApp = typeof app;
export default app;
