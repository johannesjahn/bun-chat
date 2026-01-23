import { describe, expect } from "bun:test";
import { testWithAuthService } from "./testUtils";

describe("AuthService", () => {
  testWithAuthService("should register a user", async ({ authService, userService }) => {
    const newUser = await authService.register(
      "testuser",
      "password123",
      "Test User"
    );

    expect(newUser).toBeDefined();
    expect(newUser.username).toBe("testuser");

    const userInDb = await userService.getUserByUsername("testuser");
    expect(userInDb).toBeDefined();
    expect(userInDb?.username).toBe("testuser");
  });

  testWithAuthService("should fail duplicate registration", async ({ authService }) => {
    await authService.register("user1", "pw", "User");

    // Duplicate username
    expect(authService.register("user1", "pw2", "User2"))
        .rejects.toThrow("Username already exists");
  });

  testWithAuthService("should login successfully", async ({ authService }) => {
     await authService.register("user1", "password123", "User");

     const user = await authService.login("user1", "password123");
     expect(user).toBeDefined();
     expect(user?.username).toBe("user1");
  });

  testWithAuthService("should fail login with wrong password", async ({ authService }) => {
    await authService.register("user1", "password123", "User");

    const user = await authService.login("user1", "wrongpassword");
    expect(user).toBeNull();
  });

  testWithAuthService("should fail login with non-existent user", async ({ authService }) => {
    const user = await authService.login("nonexistent", "pw");
    expect(user).toBeNull();
  });
});
