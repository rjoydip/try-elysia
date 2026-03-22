import { v4 as secure } from "@lukeed/uuid/secure";
import { type DB } from "~/db/_client";
import { user } from "~/db/schema/_main";
import { eq, type InferSelectModel } from "drizzle-orm";

export class UserNotFoundError extends Error {
  constructor(id: string) {
    super(`User with id ${id} not found`);
    this.name = "UserNotFoundError";
  }
}

type User = InferSelectModel<typeof user>;

interface CreateUserInput {
  name: string;
  email: string;
  image?: string | null;
}

interface UpdateUserInput {
  name?: string;
  email?: string;
  image?: string | null;
}

interface PaginationOptions {
  limit?: number;
  offset?: number;
}

interface UserServiceImp {
  getUsers: (options?: PaginationOptions) => Promise<User[]>;
  getUser: (id: string) => Promise<User>;
  createUser: (data: CreateUserInput) => Promise<User>;
  updateUser: (id: string, data: UpdateUserInput) => Promise<User>;
  deleteUser: (id: string) => Promise<User>;
}

export class UserService implements UserServiceImp {
  private db: DB;

  constructor(db: DB) {
    this.db = db;
  }

  async getUsers(options?: PaginationOptions) {
    const limit = options?.limit ?? 100;
    const offset = options?.offset ?? 0;
    return await this.db.select().from(user).limit(limit).offset(offset).all();
  }

  async getUser(id: string) {
    const result = await this.db.select().from(user).where(eq(user.id, id)).get();
    if (!result) {
      throw new UserNotFoundError(id);
    }
    return result;
  }

  async createUser(data: CreateUserInput) {
    const id = secure();
    return await this.db
      .insert(user)
      .values({ id, ...data })
      .returning()
      .get();
  }

  async updateUser(id: string, data: UpdateUserInput) {
    const result = await this.db.update(user).set(data).where(eq(user.id, id)).returning().get();
    if (!result) {
      throw new UserNotFoundError(id);
    }
    return result;
  }

  async deleteUser(id: string) {
    const result = await this.db.delete(user).where(eq(user.id, id)).returning().get();
    if (!result) {
      throw new UserNotFoundError(id);
    }
    return result;
  }
}
