import { Router } from "express";
import { randomUUID } from "node:crypto";
import { authenticatedUser } from "../auth";
import { store } from "../store";
import type { ServiceRequest, Status } from "../types";

export const requestsRouter = Router();

/**
 * GET /api/requests
 * Returns all reports, newest first.
 */
requestsRouter.get("/", (_req, res) => {
  const all = [...store.requests.values()].sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt),
  );
  res.json(all);
});

/**
 * GET /api/requests/:id
 */
requestsRouter.get("/:id", (req, res) => {
  const r = store.requests.get(req.params.id);
  if (!r) return res.status(404).json({ message: "Report not found" });
  res.json(r);
});

/**
 * POST /api/requests
 * Citizen report. Photo (base64 data URL) is stored inline for now.
 *
 * TODO(security): reject payloads larger than ~2MB and strip unknown keys.
 */
requestsRouter.post("/", (req, res) => {
  const body = req.body as Partial<ServiceRequest>;
  if (!body.category || typeof body.lat !== "number" || typeof body.lng !== "number") {
    return res.status(400).json({ message: "category, lat and lng are required" });
  }
  const now = new Date().toISOString();
  const id = randomUUID();
  const created: ServiceRequest = {
    id,
    trackingNumber: `TSH-${id.replace(/-/g, "").slice(0, 6).toUpperCase()}`,
    category: body.category,
    description: (body.description ?? "").slice(0, 500),
    lat: body.lat,
    lng: body.lng,
    photo: body.photo,
    status: "submitted",
    version: 1,
    createdAt: now,
    updatedAt: now,
    history: [{ status: "submitted", at: now, by: "citizen" }],
    reporterDeviceId: body.reporterDeviceId ?? "unknown",
    source: "web",
    syncState: "synced",
  };
  store.requests.set(id, created);
  res.status(201).json(created);
});

/**
 * PATCH /api/requests/:id/status
 * Body: { to: Status, expectedVersion: number, assignedTo?, assignedName?, note?, photo? }
 *
 * TODO(Member 2 / security): require an authenticated staff user and check
 * that their role is allowed to make this transition.
 */
requestsRouter.patch("/:id/status", (req, res) => {
  const { to, expectedVersion, note, photo } = req.body ?? {};
  const r = store.requests.get(req.params.id);
  if (!r) return res.status(404).json({ message: "Report not found" });
  const staff = authenticatedUser(req);
  if (!staff || staff.role !== "field_worker") {
    return res.status(403).json({ message: "Only assigned field workers can change report status." });
  }
  const assignedWorkers = r.assignedWorkerIds ?? (r.assignedTo ? [r.assignedTo] : []);
  if (!assignedWorkers.includes(staff.id)) {
    return res.status(403).json({ message: "This report is not assigned to you." });
  }
  const transitions: Record<Status, Status[]> = {
    submitted: ["in_progress"],
    assigned: ["in_progress"],
    in_progress: ["resolved"],
    resolved: [],
    rejected: [],
  };
  if (
    typeof to !== "string" ||
    !Object.hasOwn(transitions, to) ||
    !transitions[r.status].includes(to as Status)
  ) {
    return res.status(400).json({ message: "This status transition is not allowed." });
  }
  if (r.version !== expectedVersion) {
    return res.status(409).json({ message: "This report was changed by someone else. Refresh." });
  }

  const now = new Date().toISOString();
  const updated: ServiceRequest = {
    ...r,
    status: to as Status,
    version: r.version + 1,
    updatedAt: now,
    history: [
      ...r.history,
      { status: to as Status, at: now, by: "staff", ...(note ? { note } : {}), ...(photo ? { photo } : {}) },
    ],
  };
  store.requests.set(r.id, updated);
  res.json(updated);
});

/**
 * POST /api/requests/:id/accept
 * Body: { expectedVersion }
 */
requestsRouter.post("/:id/accept", (req, res) => {
  const { expectedVersion } = req.body ?? {};
  const r = store.requests.get(req.params.id);
  if (!r) return res.status(404).json({ message: "Report not found" });
  if (r.version !== expectedVersion) {
    return res.status(409).json({ message: "This report was changed by someone else. Refresh." });
  }
  const now = new Date().toISOString();
  const updated: ServiceRequest = {
    ...r,
    acceptedAt: now,
    version: r.version + 1,
    updatedAt: now,
    history: [...r.history, { status: r.status, at: now, by: "staff", note: "Job accepted" }],
  };
  store.requests.set(r.id, updated);
  res.json(updated);
});

/**
 * POST /api/requests/:id/update
 * Body: { expectedVersion, note, photo? }
 * Field note / photo without a status change.
 */
requestsRouter.post("/:id/update", (req, res) => {
  const { expectedVersion, note, photo } = req.body ?? {};
  const r = store.requests.get(req.params.id);
  if (!r) return res.status(404).json({ message: "Report not found" });
  if (r.version !== expectedVersion) {
    return res.status(409).json({ message: "This report was changed by someone else. Refresh." });
  }
  if (!note && !photo) return res.status(400).json({ message: "Add a note or a photo first" });

  const now = new Date().toISOString();
  const updated: ServiceRequest = {
    ...r,
    version: r.version + 1,
    updatedAt: now,
    history: [
      ...r.history,
      { status: r.status, at: now, by: "staff", ...(note ? { note } : {}), ...(photo ? { photo } : {}) },
    ],
  };
  store.requests.set(r.id, updated);
  res.json(updated);
});