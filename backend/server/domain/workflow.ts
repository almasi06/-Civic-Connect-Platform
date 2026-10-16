import type { Status, Role } from "../types";

export const ALLOWED: Record<Status, Status[]> = {
  submitted:   ["assigned", "in_progress", "rejected"],
  assigned:    ["in_progress", "rejected"],
  in_progress: ["resolved", "rejected"],
  resolved:    [],
  rejected:    [],
};

export const ROLE_CAN: Record<Role, Status[]> = {
  admin:        ["assigned", "rejected"],
  field_worker: ["in_progress", "resolved"],
};

export function isValidTransition(from: Status, to: Status): boolean {
  return ALLOWED[from].includes(to);
}

export function canRoleTransition(role: Role, to: Status): boolean {
  return ROLE_CAN[role].includes(to);
}