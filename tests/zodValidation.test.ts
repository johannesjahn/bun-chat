import { describe, expect, test } from "bun:test";
import { userController } from "../controllers/userController";

describe("Validation Logic", () => {
  test("Register with missing fields returns Zod errors", async () => {
    const req = new Request("http://localhost:3000/user/register", {
      method: "POST",
      body: JSON.stringify({ username: "test" }), // missing password and name
    });
    const res = await userController.handle(req);
    expect(res.status).toBe(400);
    const data = (await res.json()) as { fieldErrors: any };
    expect(data.fieldErrors).toBeDefined();
    expect(data.fieldErrors.password).toBeDefined();
    expect(data.fieldErrors.name).toBeDefined();
  });

  test("Login with missing fields returns Zod errors", async () => {
    const req = new Request("http://localhost:3000/user/login", {
      method: "POST",
      body: JSON.stringify({ username: "test" }), // missing password
    });
    const res = await userController.handle(req);
    expect(res.status).toBe(400);
    const data = (await res.json()) as { fieldErrors: any };
    expect(data.fieldErrors).toBeDefined();
    expect(data.fieldErrors.password).toBeDefined();
  });
});
