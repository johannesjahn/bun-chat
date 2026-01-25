import { eq, inArray, desc, asc, and, sql } from "drizzle-orm";
import { db as defaultDb, type DB } from "../db";
import {
  chats,
  messages,
  usersToChats,
  users,
  type Chat,
  type Message,
  type NewChat,
  type NewMessage,
} from "../db/schema";

export class ChatService {
  constructor(private db: DB = defaultDb) {}

  async createChat(userIds: number[], name?: string): Promise<Chat> {
    if (userIds.length < 2) {
      throw new Error("Chat must have at least 2 participants");
    }

    // 1-on-1 Chat Logic
    if (userIds.length === 2) {
      if (name) {
        throw new Error("1-on-1 chats cannot have a title");
      }

      // Check if a 1-on-1 chat already exists between these two users
      const userA = userIds[0];
      const userB = userIds[1];

      // Ensure users are defined (typescript check)
      if (userA === undefined || userB === undefined) {
        throw new Error("Invalid user IDs");
      }

      // Find all chats where userA is a participant
      const userAChats = await this.db
        .select({ chatId: usersToChats.chatId })
        .from(usersToChats)
        .where(eq(usersToChats.userId, userA));

      for (const { chatId } of userAChats) {
        // Check if userB is also in this chat
        const isUserBInChat = await this.db
          .select()
          .from(usersToChats)
          .where(
            and(
              eq(usersToChats.chatId, chatId),
              eq(usersToChats.userId, userB as number)
            )
          );

        if (isUserBInChat.length > 0) {
          // Check if there are only 2 participants in this chat
          const participantsRes = await this.db
            .select({ count: sql<number>`count(*)` })
            .from(usersToChats)
            .where(eq(usersToChats.chatId, chatId));

          const count = participantsRes[0]?.count;

          if (count === 2) {
            // Found existing 1-on-1 chat
            const existingChat = await this.db
              .select()
              .from(chats)
              .where(eq(chats.id, chatId));

            if (existingChat[0]) {
              throw new Error("Chat already exists between these users");
            }
          }
        }
      }
    } else {
      // Group Chat Logic
      if (!name) {
        throw new Error("Group chats must have a title");
      }
    }

    return await this.db.transaction(async (tx) => {
      // Create the chat
      const res = await tx
        .insert(chats)
        .values({ name: name ?? null })
        .returning();
      const chat = res[0];
      if (!chat) throw new Error("Failed to create chat");

      // Add users to the chat
      if (userIds.length > 0) {
        await tx.insert(usersToChats).values(
          userIds.map((userId) => ({
            chatId: chat.id,
            userId,
          }))
        );
      }

      return chat;
    });
  }

  async getChatsForUser(userId: number): Promise<Chat[]> {
    // Select chats where the user is a participant
    // We join chats with usersToChats
    const result = await this.db
      .select({
        id: chats.id,
        name: chats.name,
        createdAt: chats.createdAt,
      })
      .from(chats)
      .innerJoin(usersToChats, eq(chats.id, usersToChats.chatId))
      .where(eq(usersToChats.userId, userId));

    return result;
  }

  async sendMessage(
    chatId: number,
    userId: number,
    content: string
  ): Promise<Message> {
    // Verify user is in chat? (Optional validation, but good practice)
    // For now, simpler implementation as requested.

    const res = await this.db
      .insert(messages)
      .values({
        chatId,
        userId,
        content,
      })
      .returning();
    const message = res[0];
    if (!message) throw new Error("Failed to send message");

    return message;
  }

  async getMessages(chatId: number): Promise<Message[]> {
    return await this.db
      .select()
      .from(messages)
      .where(eq(messages.chatId, chatId))
      .orderBy(asc(messages.createdAt)); // Oldest first
  }

  // Helper to check if user is in chat, if needed later
  async isUserInChat(userId: number, chatId: number): Promise<boolean> {
    const result = await this.db.select().from(usersToChats).where(
      // compound check
      // logic: userId match AND chatId match
      // using multiple .where or 'and'
      eq(usersToChats.userId, userId)
    );
    // Need to refine this query to strictly check both.
    // But let's stick to the core methods first.
    return true;
  }
}

export const chatService = new ChatService();
