import { z } from "zod";
import { chatService } from "../services/chatService";
import { authService } from "../services/authService";
import { userService } from "../services/userService";

const createChatSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  users: z.array(z.string()).min(1).max(100), // Adjusted validation slightly
});

const sendMessageSchema = z.object({
  chatId: z.string(),
  message: z.string().min(1).max(1000),
});

const getMessagesSchema = z.object({
  chatId: z.string(),
});

export class ChatController {
  async handle(req: Request): Promise<Response> {
    const url = new URL(req.url);

    // Initial simple router
    if (req.method === "POST" && url.pathname === "/chats") {
      return this.createChat(req);
    }
    if (req.method === "GET" && url.pathname === "/chats") {
      return this.getChats(req);
    }
    if (req.method === "POST" && url.pathname === "/chats/message") {
      return this.sendMessage(req);
    }
    if (req.method === "GET" && url.pathname === "/chats/messages") {
      return this.getMessages(req);
    }

    return new Response("Not Found", { status: 404 });
  }

  // Helper to authenticate and return user info
  private async authenticate(req: Request) {
    const authHeader = req.headers.get("Authorization");
    const token = authHeader?.replace("Bearer ", "");
    if (!token) return null;
    return await authService.verifyToken(token);
  }

  async createChat(req: Request): Promise<Response> {
    try {
      const user = await this.authenticate(req);
      if (!user || typeof user.id !== "number") {
        return new Response("Unauthorized", { status: 401 });
      }

      const body = await req.json();
      const parseResult = createChatSchema.safeParse(body);

      if (!parseResult.success) {
        return new Response(JSON.stringify(parseResult.error.flatten()), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      const { name, users: usernames } = parseResult.data;

      // Resolve usernames to IDs
      const foundUsers = await userService.getUsersByUsernames(usernames);
      const userIds = foundUsers.map((u) => u.id);

      // Ensure the creator is included
      if (!userIds.includes(user.id)) {
        userIds.push(user.id);
      }

      const chat = await chatService.createChat(userIds, name);

      return new Response(JSON.stringify(chat), {
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      return new Response((error as Error).message, { status: 500 });
    }
  }

  async getChats(req: Request): Promise<Response> {
    try {
      const user = await this.authenticate(req);
      if (!user || typeof user.id !== "number") {
        return new Response("Unauthorized", { status: 401 });
      }

      const chats = await chatService.getChatsForUser(user.id);
      return new Response(JSON.stringify(chats), {
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      return new Response((error as Error).message, { status: 500 });
    }
  }

  async sendMessage(req: Request): Promise<Response> {
    try {
      const user = await this.authenticate(req);
      if (!user || typeof user.id !== "number") {
        return new Response("Unauthorized", { status: 401 });
      }

      const body = await req.json();
      const parseResult = sendMessageSchema.safeParse(body);

      if (!parseResult.success) {
        return new Response(JSON.stringify(parseResult.error.flatten()), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      const { chatId, message } = parseResult.data;
      const sentMessage = await chatService.sendMessage(
        Number(chatId),
        user.id,
        message
      );

      return new Response(JSON.stringify(sentMessage), {
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      return new Response((error as Error).message, { status: 500 });
    }
  }

  async getMessages(req: Request): Promise<Response> {
    try {
      const user = await this.authenticate(req);
      if (!user) {
        return new Response("Unauthorized", { status: 401 });
      }

      const url = new URL(req.url);
      const chatIdStr = url.searchParams.get("chatId");

      const parseResult = getMessagesSchema.safeParse({ chatId: chatIdStr });

      if (!parseResult.success) {
        return new Response(JSON.stringify(parseResult.error.flatten()), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      const { chatId } = parseResult.data;
      const messages = await chatService.getMessages(Number(chatId));

      return new Response(JSON.stringify(messages), {
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      return new Response((error as Error).message, { status: 500 });
    }
  }
}

export const chatController = new ChatController();
