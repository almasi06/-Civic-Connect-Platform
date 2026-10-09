import { Router } from "express";
import { authenticatedUser } from "../auth";
import { store } from "../store";
import type { ServiceRequest, Status } from "../types";

export const syncRouter = Router();

/**
 * POST /api/sync
 * Drains the client's offline queue.
 * Body: { requests: ServiceRequest[] }
 * Returns: { accepted: string[] } — ids that were stored successfully.
 */
syncRouter.post("/", (req, res) => {
  const incoming = (req.body?.requests ?? []) as ServiceRequest[];
  const accepted: string[] = [];
  const staff = authenticatedUser(req);

  // DB NOTE: the Postgres equivalent is a single transaction that upserts
  // each row with `WHERE version = $expected`. Rows that fail the version
  // check are skipped and NOT added to `accepted`.
  for (const r of incoming) {
    const existing = store.requests.get(r.id);
    if (existing && existing.version > r.version) continue;
    if (existing) {
      const oldWorkers = existing.assignedWorkerIds ?? (existing.assignedTo ? [existing.assignedTo] : []);
      const newWorkers = r.assignedWorkerIds ?? (r.assignedTo ? [r.assignedTo] : []);
      const assignmentChanged =
        [...oldWorkers].sort().join("\u0000") !== [...newWorkers].sort().join("\u0000")
        || (existing.teamLeaderId ?? existing.assignedTo) !== (r.teamLeaderId ?? r.assignedTo);
      const statusChanged = existing.status !== r.status;

      if (assignmentChanged && staff?.role !== "admin") {
        return res.status(403).json({ message: "Only administrators can update team assignments." });
      }
      if (statusChanged) {
        if (staff?.role !== "field_worker") {
          return res.status(403).json({ message: "Only assigned field workers can change report status." });
        }
        if (!oldWorkers.includes(staff.id)) {
          return res.status(403).json({ message: "This report is not assigned to you." });
        }
        const transitions: Record<Status, Status[]> = {
          submitted: ["in_progress"],
          assigned: ["in_progress"],
          in_progress: ["resolved"],
          resolved: [],
          rejected: [],
        };
        if (!transitions[existing.status].includes(r.status)) {
          return res.status(400).json({ message: "This status transition is not allowed." });
        }
      }
    }
    store.requests.set(r.id, { ...r, syncState: "synced" });
    accepted.push(r.id);
  }
  res.json({ accepted });
});