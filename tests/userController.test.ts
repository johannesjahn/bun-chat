import { describe, expect, test } from "bun:test";
import { userController } from "../controllers/userController";

describe("UserController Routing", () => {
    test("GET /user should route correctly (expecting 401 Unauthorized due to missing token)", async () => {
        const req = new Request("http://localhost:3000/user", { method: "GET" });
        const res = await userController.handle(req);
        // getUsers checks for auth header/token. If it returns 401, it means it reached getUsers.
        // If routing failed, it would return 404.
        expect(res.status).toBe(401); 
    });

    test("POST /user/register should route correctly (expecting 400 Bad Request due to empty body)", async () => {
        const req = new Request("http://localhost:3000/user/register", { 
            method: "POST",
            body: JSON.stringify({}) 
        });
        const res = await userController.handle(req);
        // register checks validation. 400 means it reached register.
        expect(res.status).toBe(400); 
    });

    test("POST /user/login should route correctly (expecting 400 Bad Request due to empty body)", async () => {
         const req = new Request("http://localhost:3000/user/login", { 
            method: "POST",
            body: JSON.stringify({}) 
        });
        const res = await userController.handle(req);
        expect(res.status).toBe(400);
    });

    test("Unknown route should return 404", async () => {
        const req = new Request("http://localhost:3000/user/unknown", { method: "GET" });
        const res = await userController.handle(req);
        expect(res.status).toBe(404);
    });
});
