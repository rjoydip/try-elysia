import { beforeAll, describe, expect, it } from "bun:test";
import { UserService, UserNotFoundError } from "~/features/user/+index.service";
import { db } from "~/db/_client";
import { user } from "~/db/schema/_main";
import { eq } from "drizzle-orm";

describe("UserService", () => {
  let userService: UserService;

  beforeAll(async () => {
    userService = new UserService(db);
  });

  async function cleanupTestUsers(email: string) {
    await db.delete(user).where(eq(user.email, email)).run();
  }

  describe("createUser", () => {
    it("should create a new user", async () => {
      const testEmail = `test-${Date.now()}@example.com`;
      try {
        const newUser = await userService.createUser({
          name: "Test User",
          email: testEmail,
        });

        expect(newUser).toBeDefined();
        expect(newUser.name).toBe("Test User");
        expect(newUser.email).toBe(testEmail);
        expect(newUser.id).toBeDefined();
      } finally {
        await cleanupTestUsers(testEmail);
      }
    });

    it("should create a user with optional image", async () => {
      const testEmail = `test-image-${Date.now()}@example.com`;
      try {
        const newUser = await userService.createUser({
          name: "Test User",
          email: testEmail,
          image: "https://example.com/avatar.png",
        });

        expect(newUser.image).toBe("https://example.com/avatar.png");
      } finally {
        await cleanupTestUsers(testEmail);
      }
    });
  });

  describe("getUsers", () => {
    it("should return users with default pagination", async () => {
      const users = await userService.getUsers();

      expect(Array.isArray(users)).toBe(true);
      expect(users.length).toBeGreaterThanOrEqual(0);
    });

    it("should respect limit parameter", async () => {
      const users = await userService.getUsers({ limit: 2 });

      expect(users.length).toBeLessThanOrEqual(2);
    });

    it("should accept offset parameter", async () => {
      const users = await userService.getUsers({ limit: 10, offset: 0 });

      expect(Array.isArray(users)).toBe(true);
    });
  });

  describe("getUser", () => {
    it("should return a user by id", async () => {
      const testEmail = `test-get-${Date.now()}@example.com`;
      try {
        const created = await userService.createUser({
          name: "Test User",
          email: testEmail,
        });

        const result = await userService.getUser(created.id);

        expect(result).toBeDefined();
        expect(result.id).toBe(created.id);
        expect(result.name).toBe("Test User");
      } finally {
        await cleanupTestUsers(testEmail);
      }
    });

    it("should throw UserNotFoundError for non-existent user", async () => {
      await expect(userService.getUser("non-existent-id")).rejects.toThrow(UserNotFoundError);
    });
  });

  describe("updateUser", () => {
    it("should update an existing user", async () => {
      const testEmail = `test-update-${Date.now()}@example.com`;
      try {
        const created = await userService.createUser({
          name: "Original Name",
          email: testEmail,
        });

        const updated = await userService.updateUser(created.id, {
          name: "Updated Name",
        });

        expect(updated.name).toBe("Updated Name");
        expect(updated.id).toBe(created.id);
      } finally {
        await cleanupTestUsers(testEmail);
      }
    });

    it("should throw UserNotFoundError when updating non-existent user", async () => {
      await expect(userService.updateUser("non-existent-id", { name: "New Name" })).rejects.toThrow(
        UserNotFoundError,
      );
    });
  });

  describe("deleteUser", () => {
    it("should delete an existing user", async () => {
      const testEmail = `test-delete-${Date.now()}@example.com`;
      try {
        const created = await userService.createUser({
          name: "To Delete",
          email: testEmail,
        });

        const deleted = await userService.deleteUser(created.id);

        expect(deleted.id).toBe(created.id);

        await expect(userService.getUser(created.id)).rejects.toThrow(UserNotFoundError);
      } finally {
        await cleanupTestUsers(testEmail);
      }
    });

    it("should throw UserNotFoundError when deleting non-existent user", async () => {
      await expect(userService.deleteUser("non-existent-id")).rejects.toThrow(UserNotFoundError);
    });
  });
});
