import { eq } from "drizzle-orm";
import { db as defaultDb, type DB } from "../db";
import { users, passwords } from "../db/schema";
import { UserService } from "./userService";

export class AuthService {
  private userService: UserService;

  constructor(private db: DB = defaultDb) {
    this.userService = new UserService(db);
  }

  async register(username: string, passwordPlain: string, name: string) {
    // Check if user exists
    const existingUser = await this.userService.getUserByUsername(username);
    if (existingUser) {
      throw new Error("Username already exists");
    }

    // Hash password
    const passwordHash = await Bun.password.hash(passwordPlain);

    // Create user
    const newUser = await this.userService.createUser({
      username,
      name,
    });

    if (!newUser) {
      throw new Error("Failed to create user");
    }

    // Store password
    await this.db.insert(passwords).values({
      userId: newUser.id,
      hash: passwordHash,
    });

    return newUser;
  }

  async login(username: string, passwordPlain: string) {
    const user = await this.userService.getUserByUsername(username);
    if (!user) {
      return null;
    }

    const passwordEntry = await this.db.query.passwords.findFirst({
      where: eq(passwords.userId, user.id),
    });

    if (!passwordEntry) {
      return null;
    }

    const isMatch = await Bun.password.verify(
      passwordPlain,
      passwordEntry.hash
    );
    if (!isMatch) {
      return null;
    }

    return user;
  }
}

export const authService = new AuthService();
