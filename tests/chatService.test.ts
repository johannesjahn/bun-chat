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
      const user3 = await userService.createUser({
        username: "u3",
        name: "User 3",
      });
      if (!user1 || !user2 || !user3) throw new Error("Failed to create users");

      // Create 1-on-1 chat (no name allowed)
      const chat1on1 = await chatService.createChat([user1.id, user2.id]);

      expect(chat1on1).toBeDefined();
      expect(chat1on1.name).toBeNull();
      expect(chat1on1.id).toBeDefined();

      // Create group chat (name required)
      const groupChat = await chatService.createChat(
        [user1.id, user2.id, user3.id],
        "Group Room"
      );

      expect(groupChat).toBeDefined();
      expect(groupChat.name).toBe("Group Room");
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
      await chatService.createChat([user1.id, user2.id]); // 1-on-1
      await chatService.createChat([user1.id, user3.id]); // 1-on-1

      // Let's also add a group chat
      await chatService.createChat([user1.id, user2.id, user3.id], "Big Group");

      const chatsForUser1 = await chatService.getChatsForUser(user1.id);
      expect(chatsForUser1).toHaveLength(3);

      const chatsForUser2 = await chatService.getChatsForUser(user2.id);
      expect(chatsForUser2).toHaveLength(2); // 1-on-1 + group
      const privateChat = chatsForUser2.find((c) => c.name === null);
      expect(privateChat).toBeDefined();
      const groupChat = chatsForUser2.find((c) => c.name === "Big Group");
      expect(groupChat).toBeDefined();

      const chatsForUser3 = await chatService.getChatsForUser(user3.id);
      expect(chatsForUser3).toHaveLength(2); // 1-on-1 + group
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

      const chat = await chatService.createChat([user1.id, user2.id]);

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
  testWithChatService(
    "should prevent creating duplicate 1-on-1 chats",
    async ({ chatService, userService }) => {
      const user1 = await userService.createUser({
        username: "u1_dup",
        name: "User 1",
      });
      const user2 = await userService.createUser({
        username: "u2_dup",
        name: "User 2",
      });
      if (!user1 || !user2) throw new Error("Setup failed");

      // Create first chat
      const chat1 = await chatService.createChat([user1.id, user2.id]);
      expect(chat1).toBeDefined();

      // Attempt to create second chat with same participants should fail
      expect(async () => {
        await chatService.createChat([user1.id, user2.id]);
      }).toThrow("Chat already exists between these users");
    }
  );
});
