import { eq } from "drizzle-orm";
import { SignJWT, jwtVerify } from "jose";
import { db as defaultDb, type DB } from "../db";
import { users, passwords } from "../db/schema";
import { UserService } from "./userService";

export class AuthService {
  private userService: UserService;
  private readonly JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || "default_fallback_secret"
  );

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

    // Generate JWT
    const token = await new SignJWT({
      username: user.username,
      name: user.name,
      id: user.id,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("24h")
      .sign(this.JWT_SECRET);

    return token;
  }

  async verifyToken(token: string) {
    try {
      const { payload } = await jwtVerify(token, this.JWT_SECRET);
      return payload;
    } catch (error) {
      return null;
    }
  }
}

export const authService = new AuthService();
