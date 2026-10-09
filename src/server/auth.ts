import type { Request } from "express";
import type { StaffUser } from "./types";
import { store } from "./store";

export function authenticatedUser(req: Request): StaffUser | undefined {
  const authorization = req.get("authorization");
  if (!authorization?.startsWith("Bearer ")) return undefined;
  const token = authorization.slice("Bearer ".length);
  return [...store.users.values()].find((user) => user.token === token);
}
