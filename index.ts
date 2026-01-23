import { userController } from "./controllers/userController";

const x = 4444444444444444444;
const server = Bun.serve({
  port: 3000,
  async fetch(req) {
    const url = new URL(req.url);

    if (url.pathname.startsWith("/user")) {
      return userController.handle(req);
    }

    return new Response("Not Found", { status: 404 });
  },
});

console.log(`Listening on http://localhost:${server.port} ...`);
