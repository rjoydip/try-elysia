import { node } from "@elysiajs/node";
import { escapeHTML } from "fast-escape-html";
import { runtime } from "std-env";
import { PORT, logger } from "../_config";
import { createApp } from "../_app";
import baseAPI from "../_api";

const app = createApp({
  prefix: "",
  adapter: node(),
  sanitize: (value) => escapeHTML(value),
})
  .use(baseAPI)
  .listen(PORT);

logger.info(`🦊 ${app.store.name} (${runtime}/${app.store.version}) is running at ${PORT}`);

export type App = typeof app;
export default app;
