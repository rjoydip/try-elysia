import { bearer } from "@elysiajs/bearer";
import { fromTypes, openapi } from "@elysiajs/openapi";
import { opentelemetry } from "@elysiajs/opentelemetry";
import { serverTiming } from "@elysiajs/server-timing";
import { Elysia, type ElysiaConfig } from "elysia";
import { ip } from "elysia-ip";
import { DefaultContext, type Generator, rateLimit } from "elysia-rate-limit";
import { SocketAddress } from "elysia/universal";
import { elysiaHelmet } from "elysiajs-helmet";
import { appConfig, logger, API_NAME } from "~/_config";

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
    .trace(
      /**
       * Configures tracing hooks for before/after/error handling.
       * Logs timing and errors for each request.
       */
      async ({ onBeforeHandle, onAfterHandle, onError, onHandle, set }) => {
        onBeforeHandle(({ begin, onStop }) => {
          onStop(({ end }) => {
            logger.debug(`BeforeHandle took ${{ duration: end - begin }}`);
          });
        });
        onAfterHandle(({ begin, onStop }) => {
          onStop(({ end }) => {
            logger.debug(`AfterHandle took ${{ duration: end - begin }}`);
          });
        });
        onError(({ begin, onStop }) => {
          onStop(({ end, error }) => {
            logger.error(`Error occurred after trace ${error}, ${{ duration: end - begin }}`);
          });
        });
        onHandle(({ onStop }) => {
          onStop(({ elapsed }) => {
            const elapsed_time = elapsed.toFixed(4);
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

type App = ReturnType<typeof createApp>;
export default createApp;
export { App };
