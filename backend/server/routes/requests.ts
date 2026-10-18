

// =============================================================================
// Request routes: list, get, create, transition, accept, field update.
// =============================================================================
import { Router } from "express";
import { z } from "zod";
import { requestRepository, type RequestFilters } from "../persistence/request.repository";
import { transition, acceptJob, addFieldUpdate, assignWorkers } from "../application/workflow.service";
import { requireAuth, requireRole } from "../middleware/auth.middleware";
import { asyncHandler, HttpError } from "../middleware/error.middleware";
import { validateBody } from "../middleware/validate.middleware";
import { isInsideCity } from "../domain/city";
import type { Category, Status, ServiceRequest } from "../types";
import { userRepository } from "../persistence/user.repository";


export const requestsRouter = Router();

// ---------- Validation schemas ----------
const categorySchema = z.enum([
  "pothole", "traffic_light", "waste", "streetlight", "water_leak",
  "road_sign", "sidewalk", "blocked_drain", "illegal_dumping",
  "power_outage", "vandalism", "other",
]);

const createSchema = z.object({
  id: z.string().uuid(),
  trackingNumber: z.string().min(1).max(20),
  category: categorySchema,
  description: z.string().max(500).default(""),
  lat: z.number(),
  lng: z.number(),
  photo: z.string().optional(),
  status: z.literal("submitted").default("submitted"),
  version: z.number().int().default(1),
  history: z.array(z.any()).default([]),
  reporterDeviceId: z.string().min(1).max(64),
  source: z.literal("web").default("web"),
  syncState: z.enum(["pending", "synced"]).default("synced"),
});

const statusSchema = z.object({
  to: z.enum(["submitted", "assigned", "in_progress", "resolved", "rejected"]),
  expectedVersion: z.number().int(),
  assignedTo: z.string().uuid().optional(),
  assignedName: z.string().optional(),
  note: z.string().optional(),
  photo: z.string().optional(),
});

const acceptSchema = z.object({
  expectedVersion: z.number().int(),
});

const updateSchema = z.object({
  expectedVersion: z.number().int(),
  note: z.string().default(""),
  photo: z.string().optional(),
});

// =============================================================================
// GET /api/requests  (with filters)
// =============================================================================
requestsRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const filters: RequestFilters = {
      q: typeof req.query.q === "string" ? req.query.q : undefined,
      status: typeof req.query.status === "string" ? req.query.status : undefined,
      category: typeof req.query.category === "string" ? req.query.category : undefined,
      department: typeof req.query.department === "string" ? req.query.department : undefined,
      sort: typeof req.query.sort === "string" ? req.query.sort : undefined,
    };
    const list = await requestRepository.list(filters);
    res.json(list);
  }),
);

// =============================================================================
// GET /api/requests/:id
// =============================================================================
requestsRouter.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const r = await requestRepository.findById(req.params.id);
    if (!r) throw new HttpError(404, "Report not found");
    res.json(r);
  }),
);

// =============================================================================
// POST /api/requests  (citizen report + server-side city gate)
// =============================================================================
// =============================================================================
// POST /api/requests  (citizen report + server-side city gate)
// =============================================================================
requestsRouter.post(
  "/",
  validateBody(createSchema),
  asyncHandler(async (req, res) => {
    const body = req.body as z.infer<typeof createSchema>;

    // Server-side city gate
    if (!isInsideCity({ lat: body.lat, lng: body.lng })) {
      throw new HttpError(
        400,
        "Reports can only be submitted from inside the City of Tshwane.",
      );
    }

    const created = await requestRepository.create({
      id: body.id,
      trackingNumber: body.trackingNumber,
      category: body.category as Category,
      description: body.description,
      lat: body.lat,
      lng: body.lng,
      photo: body.photo,
      status: body.status,
      version: body.version,
      history: body.history,
      reporterDeviceId: body.reporterDeviceId,
      source: body.source,
      syncState: body.syncState,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    res.status(201).json(created);
  }),
);
// =============================================================================
// PATCH /api/requests/:id/status  (transition)
// =============================================================================
requestsRouter.patch(
  "/:id/status",
  requireAuth,
  validateBody(statusSchema),
  asyncHandler(async (req, res) => {
    const body = req.body as z.infer<typeof statusSchema>;
    const user = await userRepository.findById(req.user!.id);
    if (!user) throw new HttpError(401, "User not found");
    const actor = { id: user.id, name: user.name, role: user.role };

    await transition(
      req.params.id,
      body.to as Status,
      actor,
      body.expectedVersion,
      body.assignedTo && body.assignedName
        ? { id: body.assignedTo, name: body.assignedName }
        : undefined,
      { note: body.note, photo: body.photo },
    );

    const updated = await requestRepository.findById(req.params.id);
    res.json(updated);
  }),
);

// =============================================================================
// POST /api/requests/:id/accept  (worker accepts job)
// =============================================================================
requestsRouter.post(
  "/:id/accept",
  requireAuth,
  validateBody(acceptSchema),
  asyncHandler(async (req, res) => {
    const body = req.body as z.infer<typeof acceptSchema>;
    const user = await userRepository.findById(req.user!.id);
    if (!user) throw new HttpError(401, "User not found");

    await acceptJob(
      req.params.id,
      { id: user.id, name: user.name, role: user.role },
      body.expectedVersion,
    );
    const updated = await requestRepository.findById(req.params.id);
    res.json(updated);
  }),
);

// =============================================================================
// PATCH /api/requests/:id/assign  (admin assigns a team)
// =============================================================================
const assignSchema = z.object({
  expectedVersion: z.number().int(),
  assignedWorkerIds: z.array(z.string().uuid()),
  teamLeaderId: z.string().uuid().optional(),
});

requestsRouter.patch(
  "/:id/assign",
  requireAuth,
  requireRole("admin"),
  validateBody(assignSchema),
  asyncHandler(async (req, res) => {
    const body = req.body as z.infer<typeof assignSchema>;
    const user = await userRepository.findById(req.user!.id);
    if (!user) throw new HttpError(401, "User not found");

    await assignWorkers(
      req.params.id,
      { id: user.id, name: user.name, role: user.role },
      body.expectedVersion,
      body.assignedWorkerIds,
      body.teamLeaderId,
    );

    const updated = await requestRepository.findById(req.params.id);
    res.json(updated);
  }),
);

// =============================================================================
// POST /api/requests/:id/update  (field note/photo)
// =============================================================================
requestsRouter.post(
  "/:id/update",
  requireAuth,
  validateBody(updateSchema),
  asyncHandler(async (req, res) => {
    const body = req.body as z.infer<typeof updateSchema>;
    const user = await userRepository.findById(req.user!.id);
    if (!user) throw new HttpError(401, "User not found");

    await addFieldUpdate(
      req.params.id,
      { id: user.id, name: user.name, role: user.role },
      body.expectedVersion,
      body.note,
      body.photo,
    );
    const updated = await requestRepository.findById(req.params.id);
    res.json(updated);
  }),
);




