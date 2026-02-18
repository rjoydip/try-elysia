import { type Context } from "elysia";
import { runtime } from "std-env";
import { api } from "~/_api";
import { createApp } from "~/_app";
import { API_PREFIX, logger } from "~/_config";
import { type Env } from "~/_env";

const app = createApp({}).use(api);

logger.info(`🦊 ${app.store.name} (${runtime} - runtime) is running at ${API_PREFIX}`);
logger.info(`📚 OpenAPI documentation available at /openapi`);

export type EdgeApp = typeof app;

export default {
  async fetch(request: Request, _env: Env, _ctx: Context): Promise<Response> {
    return await app.fetch(request);
  },
};
