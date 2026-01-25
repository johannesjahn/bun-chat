import { authService } from "../services/authService";
import { userService } from "../services/userService";
import { z } from "zod";

const registerSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
  name: z.string().min(1, "Name is required"),
});

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export class UserController {
  // Simple in-memory session store: token -> username
  private sessions = new Map<string, string>();

  async handle(req: Request): Promise<Response> {
    const url = new URL(req.url);

    if (req.method === "POST" && url.pathname === "/user/register") {
      return this.register(req);
    }

    if (req.method === "POST" && url.pathname === "/user/login") {
      return this.login(req);
    }

    if (req.method === "GET" && url.pathname === "/user") {
      return this.getUsers(req);
    }

    return new Response("Not Found", { status: 404 });
  }

  async register(req: Request): Promise<Response> {
    try {
      const body = await req.json();
      const parseResult = registerSchema.safeParse(body);

      if (!parseResult.success) {
        return new Response(JSON.stringify(parseResult.error.flatten()), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }
      const { username, password, name } = parseResult.data;

      const user = await authService.register(username, password, name);
      return new Response(JSON.stringify(user), {
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      return new Response((error as Error).message, { status: 400 });
    }
  }

  async login(req: Request): Promise<Response> {
    try {
      const body = await req.json();
      const parseResult = loginSchema.safeParse(body);

      if (!parseResult.success) {
        return new Response(JSON.stringify(parseResult.error.flatten()), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }
      const { username, password } = parseResult.data;

      const user = await authService.login(username, password);
      if (!user) {
        return new Response("Invalid credentials", { status: 401 });
      }

      // Generate a simple session token
      const token = crypto.randomUUID();
      this.sessions.set(token, user.username);

      return new Response(JSON.stringify({ token, user }), {
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error(error);
      return new Response((error as Error).message, { status: 500 });
    }
  }

  async getUsers(req: Request): Promise<Response> {
    const authHeader = req.headers.get("Authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!token || !this.sessions.has(token)) {
      return new Response("Unauthorized", { status: 401 });
    }

    const users = await userService.getAllUsers();
    return new Response(JSON.stringify(users), {
      headers: { "Content-Type": "application/json" },
    });
  }
}

export const userController = new UserController();
