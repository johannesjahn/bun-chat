import { describe, expect } from "bun:test";
import { testWithService } from "./testUtils";

describe("UserService", () => {
  testWithService("should create a user", async ({ userService }) => {
    const newUser = {
      name: "Test User",
      email: "test@example.com",
    };

    const createdUser = await userService.createUser(newUser);

    if (!createdUser) {
      throw new Error("Created user is undefined");
    }

    expect(createdUser.id).toBeDefined();
    expect(createdUser.name).toBe(newUser.name);
    expect(createdUser.email).toBe(newUser.email);
    expect(createdUser.createdAt).toBeInstanceOf(Date);
  });

  testWithService("get all users should be empty", async ({ userService }) => {
    const allUsers = await userService.getAllUsers();
    expect(allUsers).toHaveLength(0);
  });

  testWithService(
    "get all users should return all users",
    async ({ userService }) => {
      const newUser = {
        name: "Test User",
        email: "test@example.com",
      };

      await userService.createUser(newUser);
      const allUsers = await userService.getAllUsers();
      expect(allUsers).toHaveLength(1);
    }
  );
});
