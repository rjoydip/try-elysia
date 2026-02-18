import { type DB } from "~/db/_client";
import { user } from "~/db/schema/_main";
import { eq, type InferSelectModel } from "drizzle-orm";

type User = InferSelectModel<typeof user>;

interface UserServiceImp {
  getUsers: () => Promise<User[]>;
  getUser: (id: string) => Promise<User[]>;
  createUser: (data: any) => Promise<User>;
  updateUser: (id: string, data: any) => Promise<User>;
  deleteUser: (id: string) => Promise<User | undefined>;
}

export class UserService implements UserServiceImp {
  private db: DB;

  constructor(db: DB) {
    this.db = db;
  }

  async getUsers() {
    return await this.db.select().from(user).all();
  }

  async getUser(id: string) {
    return await this.db.select().from(user).where(eq(user.id, id)).all();
  }

  async createUser(data: any) {
    return await this.db.insert(user).values(data).returning().get();
  }

  async updateUser(id: string, data: any) {
    return await this.db.update(user).set(data).where(eq(user.id, id)).returning().get();
  }

  async deleteUser(id: string) {
    return await this.db.delete(user).where(eq(user.id, id)).returning().get();
  }
}
