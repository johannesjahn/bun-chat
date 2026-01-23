import { describe, expect } from "bun:test";
import { testWithService } from "./testUtils";

describe("UserService", () => {
  testWithService("should create a user", async ({ userService }) => {
    const newUser = {
      username: "testuser",
      name: "Test User",
    };

    const createdUser = await userService.createUser(newUser);

    if (!createdUser) {
      throw new Error("Created user is undefined");
    }

    expect(createdUser.id).toBeDefined();
    expect(createdUser.name).toBe(newUser.name);
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
        username: "testuser2",
        name: "Test User",
      };

      await userService.createUser(newUser);
      const allUsers = await userService.getAllUsers();
      expect(allUsers).toHaveLength(1);
    }
  );
});
