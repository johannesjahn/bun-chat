import { describe, expect } from "bun:test";
import { testWithChatService } from "./testUtils";

describe("ChatService", () => {
  testWithChatService(
    "should create a chat with users",
    async ({ chatService, userService }) => {
      // Setup users
      const user1 = await userService.createUser({
        username: "u1",
        name: "User 1",
      });
      const user2 = await userService.createUser({
        username: "u2",
        name: "User 2",
      });
      if (!user1 || !user2) throw new Error("Failed to create users");

      // Create chat
      const chat = await chatService.createChat("General Room", [
        user1.id,
        user2.id,
      ]);

      expect(chat).toBeDefined();
      expect(chat.name).toBe("General Room");
      expect(chat.id).toBeDefined();
    }
  );

  testWithChatService(
    "should get chats for a specific user",
    async ({ chatService, userService }) => {
      const user1 = await userService.createUser({
        username: "u1",
        name: "User 1",
      });
      const user2 = await userService.createUser({
        username: "u2",
        name: "User 2",
      });
      const user3 = await userService.createUser({
        username: "u3",
        name: "User 3",
      });
      if (!user1 || !user2 || !user3) throw new Error("Setup failed");

      // user1 is in both chats
      // user2 is in chat1
      // user3 is in chat2
      await chatService.createChat("Chat 1", [user1.id, user2.id]);
      await chatService.createChat("Chat 2", [user1.id, user3.id]);

      const chatsForUser1 = await chatService.getChatsForUser(user1.id);
      expect(chatsForUser1).toHaveLength(2);

      const chatsForUser2 = await chatService.getChatsForUser(user2.id);
      expect(chatsForUser2).toHaveLength(1);
      expect(chatsForUser2[0]!.name).toBe("Chat 1");

      const chatsForUser3 = await chatService.getChatsForUser(user3.id);
      expect(chatsForUser3).toHaveLength(1);
      expect(chatsForUser3[0]!.name).toBe("Chat 2");
    }
  );

  testWithChatService(
    "should send and retrieve messages",
    async ({ chatService, userService }) => {
      const user1 = await userService.createUser({
        username: "u1",
        name: "User 1",
      });
      const user2 = await userService.createUser({
        username: "u2",
        name: "User 2",
      });
      if (!user1 || !user2) throw new Error("Setup failed");

      const chat = await chatService.createChat("Msg Room", [
        user1.id,
        user2.id,
      ]);

      const msg1 = await chatService.sendMessage(
        chat.id,
        user1.id,
        "Hello from user 1"
      );
      expect(msg1.content).toBe("Hello from user 1");
      expect(msg1.userId).toBe(user1.id);
      expect(msg1.chatId).toBe(chat.id);

      // Initial retrieval
      let messages = await chatService.getMessages(chat.id);
      expect(messages).toHaveLength(1);
      expect(messages[0]!.content).toBe("Hello from user 1");

      // Second message
      await chatService.sendMessage(chat.id, user2.id, "Reply from user 2");
      messages = await chatService.getMessages(chat.id);
      expect(messages).toHaveLength(2);
      expect(messages[1]!.content).toBe("Reply from user 2");
    }
  );
});
