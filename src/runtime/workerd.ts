import { CloudflareAdapter } from "elysia/adapter/cloudflare-worker";
import { escapeHTML } from "fast-escape-html";
import { runtime } from "std-env";
import { createApp } from "../_app";
import { logger, PORT } from "../_config";
import baseAPI from "../_api";

const app = createApp({
  prefix: "",
  adapter: CloudflareAdapter,
  sanitize: (value) => escapeHTML(value),
})
  .use(baseAPI)
  .listen(PORT);

logger.info(`🦊 ${app.store.name} (${runtime}/${app.store.version}) ${runtime} is running`);

export type App = typeof app;
export default app.compile();
