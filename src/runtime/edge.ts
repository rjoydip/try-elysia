import { Context } from "elysia";
import { escapeHTML } from "fast-escape-html";
import { runtime } from "std-env";
import { api } from "~/_api";
import { createApp } from "~/_app";
import { API_PREFIX, logger } from "~/_config";
import { Env } from "~/_env";

const app = createApp({
  sanitize: (value) => escapeHTML(value),
}).use(api);

logger.info(`🦊 ${app.store.name} (${runtime} - runtime) is running at ${API_PREFIX}`);
logger.info(`📚 OpenAPI documentation available at /openapi`);

export type EdgeApp = typeof app;

export default {
  async fetch(request: Request, _env: Env, _ctx: Context): Promise<Response> {
    return await app.fetch(request);
  },
};
