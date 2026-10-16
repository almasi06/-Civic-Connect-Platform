// =============================================================================
// Auth helpers. JWT-based (previously in-memory token lookup).
// =============================================================================
import type { Request } from "express";
import jwt from "jsonwebtoken";
import type { Role } from "./types";

export interface AuthUser {
  id: string;
  role: Role;
}

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not set. Check your backend/.env file.");
}

/**
 * Decode the Bearer token from the Authorization header.
 * Returns undefined if missing, malformed, or invalid.
 *
 * NOTE: For new code, prefer `requireAuth` from
 * `middleware/auth.middleware.ts` — it also populates `req.user`.
 */
export function authenticatedUser(req: Request): AuthUser | undefined {
  const header = req.get("authorization");
  if (!header?.startsWith("Bearer ")) return undefined;
  const token = header.slice("Bearer ".length);
  try {
    const payload = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload & {
      sub: string;
      role: Role;
    };
    return { id: payload.sub, role: payload.role };
  } catch {
    return undefined;
  }
}