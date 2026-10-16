


// =============================================================================
// Team routes: list, create, update, delete.
// Owner: Member 2. Persistence: PostgreSQL via teamRepository.
// =============================================================================
import { Router } from "express";
import { z } from "zod";
import { teamRepository, type TeamInput } from "../persistence/team.repository";
import { userRepository } from "../persistence/user.repository";
import { requireAuth, requireRole } from "../middleware/auth.middleware";
import { asyncHandler, HttpError } from "../middleware/error.middleware";
import { validateBody } from "../middleware/validate.middleware";

export const teamsRouter = Router();

const departmentSchema = z.enum(["roads", "electricity", "water", "waste", "community"]);

const teamInputSchema = z.object({
  name: z.string().trim().min(1).max(100),
  description: z.string().trim().max(1000).default(""),
  department: departmentSchema,
  contactEmail: z.string().trim().max(255).email().or(z.literal("")),
  contactPhone: z.string().trim().max(50).default(""),
  workerIds: z.array(z.string().uuid()).default([]),
});

// =============================================================================
// GET /api/teams/mine — field worker's own teams
// =============================================================================
teamsRouter.get(
  "/mine",
  requireAuth,
  requireRole("field_worker"),
  asyncHandler(async (req, res) => {
    const teams = await teamRepository.listByWorker(req.user!.id);
    // Return the reduced WorkerTeam shape (hide workerIds, description, timestamps)
    const reduced = teams.map(({ id, name, department, contactEmail, contactPhone }) => ({
      id,
      name,
      department,
      contactEmail,
      contactPhone,
    }));
    res.json(reduced);
  }),
);

// =============================================================================
// GET /api/teams — admin: list all teams
// =============================================================================
teamsRouter.get(
  "/",
  requireAuth,
  requireRole("admin"),
  asyncHandler(async (_req, res) => {
    const teams = await teamRepository.listAll();
    res.json(teams);
  }),
);

// =============================================================================
// POST /api/teams — admin: create team
// =============================================================================
teamsRouter.post(
  "/",
  requireAuth,
  requireRole("admin"),
  validateBody(teamInputSchema),
  asyncHandler(async (req, res) => {
    const body = req.body as z.infer<typeof teamInputSchema>;

    // Validate that every worker id is an active field worker
    for (const workerId of body.workerIds) {
      const ok = await userRepository.isActiveFieldWorker(workerId);
      if (!ok) {
        throw new HttpError(400, `Worker ${workerId} is not an active field worker.`);
      }
    }

    const created = await teamRepository.create(body as TeamInput);
    res.status(201).json(created);
  }),
);

// =============================================================================
// PATCH /api/teams/:id — admin: update team
// =============================================================================
teamsRouter.patch(
  "/:id",
  requireAuth,
  requireRole("admin"),
  validateBody(teamInputSchema),
  asyncHandler(async (req, res) => {
    const body = req.body as z.infer<typeof teamInputSchema>;

    for (const workerId of body.workerIds) {
      const ok = await userRepository.isActiveFieldWorker(workerId);
      if (!ok) {
        throw new HttpError(400, `Worker ${workerId} is not an active field worker.`);
      }
    }

    const updated = await teamRepository.update(req.params.id, body as TeamInput);
    if (!updated) throw new HttpError(404, "Team not found.");
    res.json(updated);
  }),
);

// =============================================================================
// DELETE /api/teams/:id — admin: delete team
// =============================================================================
teamsRouter.delete(
  "/:id",
  requireAuth,
  requireRole("admin"),
  asyncHandler(async (req, res) => {
    const ok = await teamRepository.remove(req.params.id);
    if (!ok) throw new HttpError(404, "Team not found.");
    res.status(204).end();
  }),
);