import { authService } from "../services/authService";
import { userService } from "../services/userService";

   const a = 123

export class UserController {
  // Simple in-memory session store: token -> username
  private sessions = new Map<string, string>();

  async register(req: Request): Promise<Response> {
    try {
      const body = (await req.json()) as {
        username?: string;
        password?: string;
        name?: string;
      };
      const { username, password, name } = body;

      if (!username || !password || !name) {
        return new Response("Missing required fields", { status: 400 });
      }

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
      const body = (await req.json()) as {
        username?: string;
        password?: string;
      };
      const { username, password } = body;

      if (!username || !password) {
        return new Response("Missing username or password", { status: 400 });
      }

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
