import Elysia from "elysia";
import { db } from "~/db/_client";
import { UserService } from "./+index.service";
import { createUser, deleteUser, getUser, getUsers, updateUser } from "./+index.model";
import { authMiddleware } from "~/middlewares/_auth";

export const userRoutes = new Elysia({
  prefix: "/user",
})
  .decorate("userService", new UserService(db))
  .model({
    getUsers,
    getUser,
    createUser,
    updateUser,
    deleteUser,
  })
  .use(authMiddleware)
  .guard({
    auth: false,
  })
  .get("/", ({ userService }) => userService.getUsers(), {
    detail: {
      summary: "Get all users",
      description: "Get all users",
      tags: ["user"],
      responses: {
        200: {
          description: "Success",
        },
      },
    },
  })
  .get("/:id", ({ userService, params }) => userService.getUser(params.id), {
    detail: {
      summary: "Get user by id",
      description: "Get user by id",
      tags: ["user"],
      responses: {
        200: {
          description: "Success",
        },
      },
    },
  })
  .post("/", ({ userService, body }) => userService.createUser(body), {
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
  })
  .put("/:id", ({ userService, params, body }) => userService.updateUser(params.id, body), {
    detail: {
      summary: "Update user",
      description: "Update user",
      tags: ["user"],
      responses: {
        200: {
          description: "Success",
        },
      },
    },
  })
  .delete("/:id", ({ userService, params }) => userService.deleteUser(params.id), {
    detail: {
      summary: "Delete user",
      description: "Delete user",
      tags: ["user"],
      responses: {
        200: {
          description: "Success",
        },
      },
    },
  });
