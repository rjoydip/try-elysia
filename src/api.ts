import { v4 as secure } from "@lukeed/uuid/secure";
import { Elysia, t, sse } from "elysia";
import { API_NAME, logger, API_PREFIX } from "~/_config";
import { userRoutes } from "~/features/user/+index.routes";
import { authService } from "~/services/auth";

export const api = new Elysia({
  prefix: API_PREFIX,
})
  .state("name", API_NAME)
  .use(authService)

  // Features routes
  .use(userRoutes)

  .ws("/chat", {
    body: t.Object({
      id: t.String(),
      message: t.String(),
    }),
    response: t.Object({
      id: t.String(),
      message: t.String(),
    }),
    async open(ws) {
      logger.info("WebSocket connection opened");
      // TODO: Authorize WS
      ws.send({ id: secure(), message: "Welcome" });
    },
    message(ws, message) {
      ws.send(message);
    },
  })
  .get(
    "/sse",
    function* () {
      yield sse("hello world");
      yield sse({
        event: "message",
        data: {
          message: "This is SSR message",
          timestamp: new Date().toISOString(),
        },
      });
    },
    {
      detail: {
        summary: "Get SSE",
        description: "Get SSE",
        tags: ["sse"],
        responses: {
          200: {
            description: "Success",
          },
        },
      },
    },
  )
  .get("/meta", async ({ store: { name } }) => ({ name }), {
    detail: {
      summary: "Get API metadata",
      description: "Get API metadata",
      tags: ["meta"],
      responses: {
        200: {
          description: "Success",
        },
      },
    },
  })
  .get(
    "/",
    ({ store: { name }, set }) => {
      set.headers["Content-Type"] = "text/plain; charset=utf-8";
      return `Welcome to (🦊) ${name}`;
    },
    {
      detail: {
        summary: "Get API root",
        description: "Get API root",
        tags: ["root"],
        responses: {
          200: {
            description: "Success",
          },
        },
      },
    },
  );

export type API = typeof api;
