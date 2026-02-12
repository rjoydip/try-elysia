import { runtime } from "std-env";
import { PORT, logger } from "../_config";
import { createApp } from "../_app";
import baseAPI from "../_api";

const app = createApp({
  prefix: "",
  sanitize: (value) => Bun.escapeHTML(value),
})
  .use(baseAPI)
  .listen({
    port: PORT,
    tls:
      Bun.env.TLS_CERT_PATH && Bun.env.TLS_KEY_PATH
        ? {
            cert: Bun.file(Bun.env.TLS_CERT_PATH),
            key: Bun.file(Bun.env.TLS_KEY_PATH),
          }
        : undefined,
  });

logger.info(
  `🦊 ${app.store.name} (${runtime}/${app.store.version}) is running at ${app.server?.protocol}://${app.server?.hostname}:${app.server?.port}`,
);

export type App = typeof app;
export default app;
