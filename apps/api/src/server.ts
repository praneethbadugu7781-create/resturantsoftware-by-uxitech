console.log("UXITECH SERVER: Starting server initialization...");
console.log("UXITECH SERVER: CWD is:", process.cwd());
console.log("UXITECH SERVER: Environment variables - PORT:", process.env.PORT, "NODE_ENV:", process.env.NODE_ENV);

process.on("uncaughtException", (err) => {
  console.error("UXITECH SERVER CRITICAL: Uncaught Exception:", err);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("UXITECH SERVER CRITICAL: Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});

import http from "node:http";
import { Server } from "socket.io";
import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { registerSockets } from "./sockets/index.js";

const httpServer = http.createServer();
const io = new Server(httpServer, {
  cors: { origin: env.frontendUrl, credentials: true }
});

const app = createApp(io);
httpServer.removeAllListeners("request");
httpServer.on("request", app);
registerSockets(io);

httpServer.listen(env.port, () => {
  console.log(`UXITECH API listening on http://localhost:${env.port}/api/v1`);
});
