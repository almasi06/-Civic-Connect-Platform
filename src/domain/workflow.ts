// Workflow Service. Validates the state machine and role permissions, commits
// transactionally via the repository, then raises StatusChanged post-commit.
//
// TODO(Member 2): the same RBAC rules must be enforced server-side by the API.
import { eventBus } from "./events";
import { isAssignedToWorker, type Status } from "./types";
import { requestRepository } from "@/persistence/requestRepository";
import type { StaffRole, StaffSession } from "@/application/auth";

const ALLOWED: Record<Status, Status[]> = {
  submitted: ["assigned", "in_progress", "rejected"],
  assigned: ["in_progress", "rejected"],
  in_progress: ["resolved", "rejected"],
  resolved: [],
  rejected: [],
};

const ROLE_CAN: Record<StaffRole, Status[]> = {
  admin: [],
  field_worker: ["in_progress", "resolved"],
};

export const nextStatuses = (s: Status, role?: StaffRole) =>
  ALLOWED[s].filter((t) => !role || ROLE_CAN[role].includes(t));

export function transition(
  id: string,
  to: Status,
  actor: StaffSession,
  expectedVersion: number,
  assignee?: { id: string; name: string },
  field?: { note?: string; photo?: string; teamName?: string },
) {
  const current = requestRepository.get(id);
  if (!current) throw new Error("Report not found");
  if (!ALLOWED[current.status].includes(to)) throw new Error("Invalid status change");
  if (!ROLE_CAN[actor.role].includes(to)) throw new Error("You are not allowed to do this");
  if (actor.role === "field_worker" && !isAssignedToWorker(current, actor.id))
    throw new Error("This job is not assigned to you");
  if (to === "assigned" && !assignee) throw new Error("Choose a field worker first");
  const from = current.status;
  const actorName =
    actor.role === "field_worker" && to === "resolved" && field?.teamName?.trim()
      ? `${actor.name} and ${field.teamName.trim()} Team`
      : actor.name;
  const updated = requestRepository.updateStatusTx(
    id,
    to,
    actorName,
    expectedVersion,
    assignee
      ? { assignedTo: assignee.id, assignedName: assignee.name, note: `Assigned to ${assignee.name}` }
      : {
          ...(field?.note ? { note: field.note.slice(0, 500) } : {}),
          ...(field?.photo ? { photo: field.photo } : {}),
        },
  );
  eventBus.raise({ type: "StatusChanged", version: 1, request: updated, from, to });
  return updated;
}

export function acceptJob(id: string, actor: StaffSession, expectedVersion: number) {
  const r = requestRepository.get(id);
  if (!r) throw new Error("Report not found");
  if (actor.role !== "field_worker" || !isAssignedToWorker(r, actor.id))
    throw new Error("This job is not assigned to you");
  if (r.acceptedAt) return r;
  return requestRepository.patchTx(
    id,
    expectedVersion,
    { acceptedAt: new Date().toISOString() },
    { status: r.status, at: "", by: actor.name, note: "Job accepted" },
  );
}

export function addFieldUpdate(
  id: string,
  actor: StaffSession,
  expectedVersion: number,
  note: string,
  photo?: string,
) {
  const r = requestRepository.get(id);
  if (!r) throw new Error("Report not found");
  if (actor.role === "field_worker" && !isAssignedToWorker(r, actor.id))
    throw new Error("This job is not assigned to you");
  if (!note.trim() && !photo) throw new Error("Add a note or a photo first");
  return requestRepository.patchTx(
    id,
    expectedVersion,
    {},
    {
      status: r.status,
      at: "",
      by: actor.name,
      ...(note.trim() ? { note: note.trim().slice(0, 500) } : {}),
      ...(photo ? { photo } : {}),
    },
  );
}