import type { ErrorRequestHandler } from "express";
import { ZodError } from "zod";

export class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export const asyncHandler =
  <T extends (...args: any[]) => Promise<any>>(fn: T) =>
  (...args: Parameters<T>) => {
    fn(...args).catch(args[2]);
  };

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof ZodError) {
    res.status(400).json({ message: "Validation failed", issues: error.flatten() });
    return;
  }

  const status = error instanceof HttpError ? error.status : 500;
  res.status(status).json({
    message: error.message || "Internal server error"
  });
};
