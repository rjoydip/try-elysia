import { staticPlugin } from "@elysiajs/static";
import { runtime } from "std-env";
import { api } from "~/api";
import { createApp } from "~/_app";
import { API_PREFIX, logger } from "~/_config";
import { env } from "~/env";

const app = createApp({
  sanitize: (value) => Bun.escapeHTML(value),
})
  .use(async () => await staticPlugin({}))
  .use(api)
  .listen({
    port: env.PORT,
    tls:
      env.TLS_CERT_PATH && env.TLS_KEY_PATH
        ? {
            cert: Bun.file(env.TLS_CERT_PATH),
            key: Bun.file(env.TLS_KEY_PATH),
          }
        : undefined,
  });

logger.info(
  `🦊 ${app.store.name} (${runtime} - runtime) is running at ${app.server?.protocol}://${app.server?.hostname}:${app.server?.port}${API_PREFIX}`,
);
logger.info(
  `📚 OpenAPI documentation available at ${app.server?.protocol}://${app.server?.hostname}:${app.server?.port}/openapi`,
);

export type BunApp = typeof app;
export default app;
