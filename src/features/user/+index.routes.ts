import Elysia from "elysia";
import { db } from "~/db/_client";
import { UserService } from "./+index.service";
import { createUser, deleteUser, updateUser } from "./+index.model";
import { authMiddleware } from "~/middlewares/_auth";

export const userRoutes = new Elysia({
  prefix: "/user",
})
  .decorate("userService", new UserService(db))
  .model({
    createUser,
    updateUser,
    deleteUser,
  })
  .use(authMiddleware)
  .get(
    "/",
    ({ userService, query }) => {
      const limit = query?.limit ? Number(query.limit) : undefined;
      const offset = query?.offset ? Number(query.offset) : undefined;
      return userService.getUsers({ limit, offset });
    },
    {
      detail: {
        summary: "Get all users",
        description: "Get all users with optional pagination",
        tags: ["user"],
        responses: {
          200: {
            description: "Success",
          },
        },
      },
    },
  )
  .get("/:id", ({ userService, params }) => userService.getUser(params.id), {
    detail: {
      summary: "Get user by id",
      description: "Get user by id",
      tags: ["user"],
      responses: {
        200: {
          description: "Success",
        },
        404: {
          description: "User not found",
        },
      },
    },
  })
  .post(
    "/",
    ({ userService, body }) =>
      userService.createUser(body as { name: string; email: string; image?: string }),
    {
      detail: {
        summary: "Create user",
        description: "Create user",
        tags: ["user"],
        responses: {
          200: {
            description: "Success",
          },
        },
      },
    },
  )
  .put(
    "/:id",
    ({ userService, params, body }) =>
      userService.updateUser(params.id, body as { name?: string; email?: string; image?: string }),
    {
      detail: {
        summary: "Update user",
        description: "Update user",
        tags: ["user"],
        responses: {
          200: {
            description: "Success",
          },
          404: {
            description: "User not found",
          },
        },
      },
    },
  )
  .delete("/:id", ({ userService, params }) => userService.deleteUser(params.id), {
    detail: {
      summary: "Delete user",
      description: "Delete user",
      tags: ["user"],
      responses: {
        200: {
          description: "Success",
        },
        404: {
          description: "User not found",
        },
      },
    },
  });
