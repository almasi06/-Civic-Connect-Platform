import { Router } from "express";
import { MOCK_STAFF } from "../store";
import { authenticatedUser } from "../auth";

export const workersRouter = Router();

/**
 * GET /api/workers
 * List of assignable field workers.
 *
 * TODO(security): require an admin or dispatcher role.
 * DB NOTE: replace MOCK_STAFF with
 *   SELECT id, name FROM staff WHERE role = 'field_worker' AND active = true
 */
workersRouter.get("/", (req, res) => {
  const staff = authenticatedUser(req);
  if (!staff || staff.role !== "admin") {
    return res.status(403).json({ message: "Admin access required." });
  }
  const workers = MOCK_STAFF.filter((u) => u.role === "field_worker").map((u) => ({
    id: u.id,
    name: u.name,
    role: u.role,
  }));
  res.json(workers);
});