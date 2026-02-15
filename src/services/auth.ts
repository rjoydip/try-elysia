import type { Context } from "elysia";
import { Elysia } from "elysia";
import { auth } from "~/auth";

const authService = new Elysia().all("/api/auth/*", (context: Context & { request: Request }) => {
  const BETTER_AUTH_ACCEPT_METHODS = ["POST", "GET"];
  // validate request method
  if (BETTER_AUTH_ACCEPT_METHODS.includes(context.request.method)) {
    return auth.handler(context.request);
    // biome-ignore lint/style/noUselessElse: <explanation>
  } else {
    context.set.status = 405;
    context.set.headers["Allow"] = BETTER_AUTH_ACCEPT_METHODS.join(", ");
    return "Method Not Allowed";
  }
});

export { authService };
export type AuthService = typeof authService;
