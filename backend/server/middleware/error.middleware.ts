// =============================================================================
// Centralised error handling.
//
// - HttpError   — throw these with a status code and message
// - asyncHandler — wraps async route handlers so errors reach errorHandler
// - errorHandler — Express error middleware (must be registered LAST)
// - notFound    — 404 for unmatched routes
// =============================================================================
import type { Request, Response, NextFunction, RequestHandler } from "express";

export class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "HttpError";
  }
}

export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>,
): RequestHandler {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
}

export function notFound(_req: Request, res: Response) {
  res.status(404).json({ message: "Not found." });
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  if (err instanceof HttpError) {
    return res.status(err.status).json({ message: err.message });
  }
  console.error("[errorHandler] unhandled:", err);
  res.status(500).json({ message: "Internal server error." });
}