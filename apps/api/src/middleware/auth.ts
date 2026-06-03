import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../config/db.js";
import { env } from "../config/env.js";
import { HttpError } from "./errorHandler.js";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        restaurantId: string;
        role: string;
        email: string;
      };
    }
  }
}

export const signAccessToken = (payload: object) => jwt.sign(payload, env.jwtSecret, { expiresIn: "15m" });
export const signRefreshToken = (payload: object) => jwt.sign(payload, env.jwtRefreshSecret, { expiresIn: "7d" });

export async function authenticate(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : req.cookies?.accessToken;
  if (!token) return next(new HttpError(401, "Authentication required"));

  try {
    const decoded = jwt.verify(token, env.jwtSecret) as { sub: string };
    const user = await prisma.user.findUnique({ where: { id: decoded.sub } });
    if (!user || !user.isActive) throw new HttpError(401, "Invalid session");
    req.user = { id: user.id, restaurantId: user.restaurantId, role: user.role, email: user.email };
    next();
  } catch (error) {
    next(error instanceof HttpError ? error : new HttpError(401, "Invalid or expired token"));
  }
}
