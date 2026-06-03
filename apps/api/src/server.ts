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
