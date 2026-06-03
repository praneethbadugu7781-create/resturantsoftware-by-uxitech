import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import path from "node:path";
import { env } from "./config/env.js";
import { apiRateLimiter } from "./middleware/rateLimiter.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { apiRoutes } from "./modules/routes.js";
import type { Server } from "socket.io";

export function createApp(io: Server) {
  const app = express();
  app.use(helmet({ crossOriginResourcePolicy: false }));
  app.use(cors({ origin: env.frontendUrl, credentials: true }));
  app.use(express.json({ limit: "5mb" })); // Increase limit slightly for flexibility
  app.use(cookieParser());
  app.use(apiRateLimiter);
  app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
  app.use("/api/v1", apiRoutes(io));
  app.use(errorHandler);
  return app;
}
