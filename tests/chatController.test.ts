import { describe, expect, test, spyOn, afterAll } from "bun:test";
import { chatController } from "../controllers/chatController";
import { authService } from "../services/authService";

// Mock authService to return a valid user
const authSpy = spyOn(authService, "verifyToken").mockResolvedValue({
  id: 1,
  username: "u1",
  name: "User 1",
});

describe("ChatController Routing", () => {
  // We need to cleanup or reset mocks if other tests depended on real auth,
  // but for unit tests usually we want isolation.
  // However, since we mock the SINGLETON, this might affect other tests running in the same process
  // if Bun runs them in the same context.
  // bun test --concurrent runs files in parallel? No, usually separate processes or workers.
  // But let's be safe.

  afterAll(() => {
    authSpy.mockRestore();
  });

  test("GET /chats (Unauthorized) should return 401", async () => {
    // No Authorization header -> authenticate returns null
    const req = new Request("http://localhost:3000/chats", { method: "GET" });
    const res = await chatController.handle(req);
    expect(res.status).toBe(401);
  });

  test("POST /chats (Bad Request) should return 400 for invalid body", async () => {
    // Auth succeeds (default mock), but body is empty
    const req = new Request("http://localhost:3000/chats", {
      method: "POST",
      body: JSON.stringify({}),
      headers: { Authorization: "Bearer valid_token" },
    });
    const res = await chatController.handle(req);
    expect(res.status).toBe(400);
  });

  test("POST /chats/message (Bad Request) should return 400 for invalid body", async () => {
    const req = new Request("http://localhost:3000/chats/message", {
      method: "POST",
      body: JSON.stringify({}),
      headers: { Authorization: "Bearer valid_token" },
    });
    const res = await chatController.handle(req);
    expect(res.status).toBe(400);
  });

  test("GET /chats/messages (Bad Request) should return 400 if chatId missing", async () => {
    // Missing chatId param
    const req = new Request("http://localhost:3000/chats/messages", {
      method: "GET",
      headers: { Authorization: "Bearer valid_token" },
    });
    const res = await chatController.handle(req);
    expect(res.status).toBe(400);
  });

  test("Unknown route should return 404", async () => {
    const req = new Request("http://localhost:3000/chats/unknown", {
      method: "GET",
    });
    const res = await chatController.handle(req);
    expect(res.status).toBe(404);
  });
});
