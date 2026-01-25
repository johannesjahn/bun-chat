import { userController } from "./controllers/userController";
import { chatController } from "./controllers/chatController";

const server = Bun.serve({
  port: 3000,
  async fetch(req) {
    const url = new URL(req.url);

    if (url.pathname.startsWith("/user")) {
      return userController.handle(req);
    }

    if (url.pathname.startsWith("/chats")) {
      return chatController.handle(req);
    }

    return new Response("Not Found", { status: 404 });
  },
});

console.log(`Listening on http://localhost:${server.port} ...`);
