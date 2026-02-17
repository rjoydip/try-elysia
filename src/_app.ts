import { bearer } from "@elysiajs/bearer";
import { fromTypes, openapi } from "@elysiajs/openapi";
import { opentelemetry } from "@elysiajs/opentelemetry";
import { serverTiming } from "@elysiajs/server-timing";
import { staticPlugin } from "@elysiajs/static";
import { Elysia, file, type ElysiaConfig } from "elysia";
import { ip } from "elysia-ip";
import { DefaultContext, type Generator, rateLimit } from "elysia-rate-limit";
import { SocketAddress } from "elysia/universal";
import { elysiaHelmet } from "elysiajs-helmet";
import { escapeHTML } from "fast-escape-html";
import { isBun } from "std-env";
import { appConfig, logger, API_NAME, CLIENT_PATH } from "~/_config";

/**
 * Generates a unique identifier for rate limiting based on the request's IP address.
 * @param {*} _r - The request object (unused).
 * @param {*} _s - The response object (unused).
 * @param {{ ip: SocketAddress }} param2 - The context containing the IP address.
 * @returns {string} The IP address or 'unknown' if not available.
 */
const ipGenerator: Generator<{ ip: SocketAddress }> = (_r, _s, { ip }) => ip?.address ?? "unknown";

export const createApp = (config?: ElysiaConfig<any>) =>
  new Elysia({
    ...appConfig,
    ...config,
    sanitize: (value) => (isBun ? Bun.escapeHTML(value) : escapeHTML(value)),
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
    .use(ip())
    .use(bearer())
    .use(opentelemetry())
    .use(
      elysiaHelmet({
        csp: {
          useNonce: true,
        },
        hsts: {
          maxAge: 31_536_000,
          includeSubDomains: true,
          preload: true,
        },
        frameOptions: "DENY",
        referrerPolicy: "strict-origin-when-cross-origin",
        permissionsPolicy: {},
      }),
    )
    .use(
      serverTiming({
        trace: {
          request: true,
          parse: true,
          transform: true,
          beforeHandle: true,
          handle: true,
          afterHandle: true,
          error: true,
          mapResponse: true,
          total: true,
        },
      }),
    )
    .use(
      rateLimit({
        duration: 60_000,
        max: 100,
        headers: true,
        scoping: "scoped",
        countFailedRequest: true,
        errorResponse: new Response(
          JSON.stringify({
            error: "Too many requests",
          }),
          { status: 429 },
        ),
        generator: ipGenerator,
        context: new DefaultContext(10_000),
      }),
    )
    .use(
      async () =>
        await staticPlugin({
          assets: CLIENT_PATH,
        }),
    )

    // Root & Shared endpoint
    .get("/favicon.ico", file("./public/favicon.ico"))

    .trace(
      /**
       * Configures tracing hooks for before/after/error handling.
       * Logs timing and errors for each request.
       */
      async ({ onBeforeHandle, onAfterHandle, onError, onHandle, set }) => {
        onBeforeHandle(({ begin, onStop }) => {
          onStop(({ end }) => {
            const duration =
              typeof begin === "number" && typeof end === "number"
                ? (end - begin).toFixed(4)
                : "0.00";
            logger.debug(`BeforeHandle took durations ${duration} ms`);
          });
        });
        onAfterHandle(({ begin, onStop }) => {
          onStop(({ end }) => {
            const duration =
              typeof begin === "number" && typeof end === "number"
                ? (end - begin).toFixed(4)
                : "0.00";
            logger.debug(`AfterHandle took durations ${duration} ms`);
          });
        });
        onError(({ begin, onStop }) => {
          onStop(({ end, error }) => {
            const elapsed =
              typeof begin === "number" && typeof end === "number"
                ? (end - begin).toFixed(4)
                : "0.00";
            set.headers["X-Elapsed"] = elapsed;
            if (error) {
              logger.error(`Error occurred ${error}, ${elapsed} ms`);
            }
          });
        });
        onHandle(({ onStop }) => {
          onStop(({ elapsed }) => {
            const elapsed_time = typeof elapsed === "number" ? elapsed.toFixed(4) : "0.00";
            set.headers["X-Elapsed"] = elapsed_time;
            logger.trace(`Request took: ${elapsed_time} ms`);
          });
        });
      },
    )
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

export type App = ReturnType<typeof createApp>;
export default createApp;
