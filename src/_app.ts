import { bearer } from "@elysiajs/bearer";
import { fromTypes, openapi } from "@elysiajs/openapi";
import { opentelemetry } from "@elysiajs/opentelemetry";
import { serverTiming } from "@elysiajs/server-timing";
import { Elysia, type ElysiaConfig } from "elysia";
import { appConfig, logger, API_NAME } from "~/_config";

export const createApp = (config?: ElysiaConfig<any>) =>
  new Elysia({
    ...appConfig,
    ...config,
  })
    .use(
      openapi({
        references: fromTypes(),
        documentation: {
          info: {
            title: `${API_NAME} API Documentation`,
            version: "v1",
          },
        },
      }),
    )
    .use(bearer())
    .use(opentelemetry())
    .use(serverTiming())
    .trace(async ({ onHandle, set }) => {
      onHandle(({ onStop }) => {
        onStop(({ elapsed }) => {
          const elapsed_time = elapsed.toFixed(4);
          set.headers["X-Elapsed"] = elapsed_time;
          logger.trace(`Request took: ${elapsed_time} ms`);
        });
      });
    })
    .onError(({ code, error }) => {
      const isJson = typeof error === "object";
      const error_message =
        code === "NOT_FOUND"
          ? JSON.stringify({ error: "Error: Endpoint not found" })
          : isJson
            ? JSON.stringify({ error: error.toString() })
            : error;

      return new Response(error_message, {
        status: code === "NOT_FOUND" ? 404 : 500,
        headers: {
          "Content-Type": `${isJson ? "application/json" : "text/plain"}; charset=utf-8`,
        },
      });
    });

type App = ReturnType<typeof createApp>;
export default createApp;
export { App };
