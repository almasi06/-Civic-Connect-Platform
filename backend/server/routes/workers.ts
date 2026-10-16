

// =============================================================================
// Worker routes: list assignable field workers.
// Owner: Member 2. Persistence: PostgreSQL via userRepository.
// =============================================================================
import { Router } from "express";
import { userRepository } from "../persistence/user.repository";
import { requireAuth, requireRole } from "../middleware/auth.middleware";
import { asyncHandler } from "../middleware/error.middleware";

export const workersRouter = Router();

// =============================================================================
// GET /api/workers — admin: list active field workers
// =============================================================================
workersRouter.get(
  "/",
  requireAuth,
  requireRole("admin"),
  asyncHandler(async (_req, res) => {
    const workers = await userRepository.listActiveFieldWorkers();
    res.json(workers);
  }),
);