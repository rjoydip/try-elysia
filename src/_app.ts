import { openapi } from "@elysiajs/openapi";
import { bearer } from "@elysiajs/bearer";
import { opentelemetry } from "@elysiajs/opentelemetry";
import { serverTiming } from "@elysiajs/server-timing";
import { staticPlugin } from "@elysiajs/static";
import { Elysia, type ElysiaConfig } from "elysia";
import { appConfig, logger } from "./_config";

export const createApp = (config?: ElysiaConfig<any>) =>
  new Elysia({
    ...appConfig,
    ...config,
  })
    .use(openapi())
    .use(bearer())
    .use(staticPlugin())
    .use(opentelemetry())
    .use(serverTiming())
    .trace(async ({ onHandle }) => {
      onHandle(({ onStop }) => {
        onStop(({ elapsed }) => {
          logger.trace(`Request took: ${elapsed.toFixed(3)} ms`);
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
