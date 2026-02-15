import Elysia from "elysia";
import { auth } from "~/auth";

// user middleware (compute user and session and pass to routes)
export const authMiddleware = new Elysia({ name: "better-auth" }).mount(auth.handler).macro({
  auth: {
    async resolve({ request: { headers }, status }) {
      const session = await auth.api.getSession({
        headers,
      });

      if (!session)
        return status(401, {
          success: false,
          message: "Unauthorized: Please check your credentials and permissions",
        });

      return {
        user: session.user,
        session: session.session,
      };
    },
  },
});
