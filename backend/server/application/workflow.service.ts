// =============================================================================
// Workflow service. Validates state machine + RBAC, updates via repository,
// raises StatusChanged event AFTER the transaction commits.
// =============================================================================
import { eventBus } from "../domain/events";
import { ALLOWED, ROLE_CAN } from "../domain/workflow";
import { requestRepository } from "../persistence/request.repository";
import { userRepository } from "../persistence/user.repository";
import { HttpError } from "../middleware/error.middleware";
import type { Role, Status } from "../types";


export async function transition(
  id: string,
  to: Status,
  actor: { id: string; name: string; role: Role },
  expectedVersion: number,
  assignee?: { id: string; name: string },
  field?: { note?: string; photo?: string; teamName?: string },
): Promise<void> {
  // 1. Load request (no lock — we validate, then update with version check)
  const current = await requestRepository.findById(id);
  if (!current) throw new HttpError(404, "Report not found");

  // 2. Validate state transition
  if (!ALLOWED[current.status].includes(to)) {
    throw new HttpError(400, "Invalid status change");
  }

  // 3. Validate role permission
  if (!ROLE_CAN[actor.role].includes(to)) {
    throw new HttpError(403, "You are not allowed to do this");
  }

  // 4. Field worker must be assigned
  if (actor.role === "field_worker") {
    const assigned = await requestRepository.isAssignedTo(id, actor.id);
    if (!assigned) throw new HttpError(403, "This job is not assigned to you");
  }

  // 5. Assignee required for "assigned" transition
  if (to === "assigned" && !assignee) {
    throw new HttpError(400, "Choose a field worker first");
  }

    // 5b. Assignee must be an active field worker
  if (to === "assigned" && assignee) {
    const ok = await userRepository.isActiveFieldWorker(assignee.id);
    if (!ok) {
      throw new HttpError(400, "Assignee is not an active field worker");
    }
  }

  // 6. Compute actor display name
  const actorName =
    actor.role === "field_worker" && to === "resolved" && field?.teamName?.trim()
      ? `${actor.name} and ${field.teamName.trim()} Team`
      : actor.name;

  // 7. Update via repository (transaction + version check)
  const updated = await requestRepository.updateStatus(
    id,
    to,
    actorName,
    expectedVersion,
    assignee
      ? { assignedTo: assignee.id, assignedName: assignee.name, note: `Assigned to ${assignee.name}` }
      : { note: field?.note, photo: field?.photo },
  );

  // 8. Handle version mismatch
  if (!updated) {
    throw new HttpError(409, "This report was changed by someone else. Refresh.");
  }

  // 9. Raise event AFTER commit (post-commit pattern)
  eventBus.raise({
    type: "StatusChanged",
    version: 1,
    request: updated,
    from: current.status,
    to,
  });
}

export async function acceptJob(
  id: string,
  actor: { id: string; name: string; role: Role },
  expectedVersion: number,
): Promise<void> {
  const r = await requestRepository.findById(id);
  if (!r) throw new HttpError(404, "Report not found");

  if (actor.role !== "field_worker" || !(await requestRepository.isAssignedTo(id, actor.id))) {
    throw new HttpError(403, "This job is not assigned to you");
  }

  if (r.acceptedAt) return; // already accepted

  const updated = await requestRepository.acceptJob(id, actor.name, expectedVersion);
  if (!updated) throw new HttpError(409, "This report was changed by someone else. Refresh.");
}

export async function addFieldUpdate(
  id: string,
  actor: { id: string; name: string; role: Role },
  expectedVersion: number,
  note: string,
  photo?: string,
): Promise<void> {
  const r = await requestRepository.findById(id);
  if (!r) throw new HttpError(404, "Report not found");

  if (actor.role === "field_worker" && !(await requestRepository.isAssignedTo(id, actor.id))) {
    throw new HttpError(403, "This job is not assigned to you");
  }

  if (!note.trim() && !photo) {
    throw new HttpError(400, "Add a note or a photo first");
  }

  const updated = await requestRepository.fieldUpdate(
    id,
    actor.name,
    expectedVersion,
    note.trim() ? note.trim().slice(0, 500) : undefined,
    photo,
  );
  if (!updated) throw new HttpError(409, "This report was changed by someone else. Refresh.");
}