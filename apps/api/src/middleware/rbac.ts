import type { NextFunction, Request, Response } from "express";
import { HttpError } from "./errorHandler.js";

export function requireRoles(...roles: string[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) return next(new HttpError(401, "Authentication required"));
    if (req.user.role === "OWNER" || roles.includes(req.user.role)) return next();
    next(new HttpError(403, "Insufficient permissions"));
  };
}
