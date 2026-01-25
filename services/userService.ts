import { eq, gt, inArray } from "drizzle-orm";
import { db as defaultDb, type DB } from "../db";
import { users, type NewUser } from "../db/schema";

export class UserService {
  constructor(private db: DB = defaultDb) {}

  async createUser(user: NewUser) {
    const result = await this.db.insert(users).values(user).returning();
    return result[0];
  }

  async getUserByUsername(username: string) {
    const result = await this.db.query.users.findFirst({
      where: eq(users.username, username),
    });
    return result;
  }

  async getUserById(id: number) {
    const result = await this.db.query.users.findFirst({
      where: eq(users.id, id),
    });
    return result;
  }

  async getAllUsers() {
    return await this.db.query.users.findMany();
  }

  async getUsersByUsernames(usernames: string[]) {
    if (usernames.length === 0) return [];
    return await this.db.query.users.findMany({
      where: inArray(users.username, usernames),
    });
  }
}

export const userService = new UserService();
