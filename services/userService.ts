import { eq, gt } from "drizzle-orm";
import { db as defaultDb, type DB } from "../db";
import { users, type NewUser } from "../db/schema";

export class UserService {
  constructor(private db: DB = defaultDb) {}

  async createUser(user: NewUser) {
    const result = await this.db.insert(users).values(user).returning();
    return result[0];
  }

  async getUserById(id: number) {
    const result = await this.db.query.users.findFirst({
      where: eq(users.id, id),
    });
    return result;
  }

  async getUserByEmail(email: string) {
    const result = await this.db.query.users.findFirst({
      where: eq(users.email, email),
    });
    return result;
  }

  async getAllUsers() {
    return await this.db.query.users.findMany();
  }
}

export const userService = new UserService();
