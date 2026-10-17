// =============================================================================
// Sync route. Drains the client's offline queue.
//
// Contract:
//   POST /api/sync
//   Body: { requests: ServiceRequest[] }
//   Returns: { accepted: string[] }
// =============================================================================
import { Router } from "express";
import { z } from "zod";
import { pool } from "../db";
import { requestRepository } from "../persistence/request.repository";
import { requireAuth } from "../middleware/auth.middleware";
import { asyncHandler, HttpError } from "../middleware/error.middleware";
import { validateBody } from "../middleware/validate.middleware";
import { ALLOWED, ROLE_CAN } from "../domain/workflow";
import { eventBus } from "../domain/events";
import type { Status } from "../types";

export const syncRouter = Router();

const categorySchema = z.enum([
  "pothole", "traffic_light", "waste", "streetlight", "water_leak",
  "road_sign", "sidewalk", "blocked_drain", "illegal_dumping",
  "power_outage", "vandalism", "other",
]);

const statusSchema = z.enum([
  "submitted", "assigned", "in_progress", "resolved", "rejected",
]);

const historyEntrySchema = z.object({
  status: statusSchema,
  at: z.string(),
  by: z.string(),
  note: z.string().optional(),
  photo: z.string().optional(),
});

const incomingRequestSchema = z.object({
  id: z.string().uuid(),
  trackingNumber: z.string().min(1).max(20),
  category: categorySchema,
  description: z.string().max(500).default(""),
  lat: z.number(),
  lng: z.number(),
  photo: z.string().optional(),
  status: statusSchema,
  version: z.number().int().min(1),
  createdAt: z.string(),
  updatedAt: z.string(),
  history: z.array(historyEntrySchema).default([]),
  reporterDeviceId: z.string().min(1).max(64),
  source: z.literal("web").default("web"),
  syncState: z.enum(["pending", "synced"]).default("pending"),
  assignedTo: z.string().uuid().optional(),
  assignedName: z.string().optional(),
  assignedWorkerIds: z.array(z.string().uuid()).optional(),
  teamLeaderId: z.string().uuid().optional(),
  acceptedAt: z.string().optional(),
});

const syncSchema = z.object({
  requests: z.array(incomingRequestSchema),
});

syncRouter.post(
  "/",
  requireAuth,
  validateBody(syncSchema),
  asyncHandler(async (req, res) => {
    const { requests } = req.body as z.infer<typeof syncSchema>;
    const actor = { id: req.user!.id, role: req.user!.role };
    const accepted: string[] = [];

    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      for (const incoming of requests) {
        const idem = await client.query(
          `SELECT 1 FROM idempotency_keys WHERE key = $1`,
          [incoming.id],
        );
        if (idem.rows.length > 0) continue;

        const { rows: existingRows } = await client.query(
          `SELECT * FROM requests WHERE id = $1 FOR UPDATE`,
          [incoming.id],
        );
        const existing = existingRows[0];

        if (existing && existing.version > incoming.version) continue;

        if (existing) {
          const oldWorkers: string[] =
            (await client.query(
              `SELECT user_id FROM request_workers WHERE request_id = $1`,
              [incoming.id],
            )).rows.map((r) => r.user_id);
          const newWorkers = incoming.assignedWorkerIds ?? [];
          const assignmentChanged =
            [...oldWorkers].sort().join(",") !== [...newWorkers].sort().join(",");
          const statusChanged = existing.status !== incoming.status;

          if (assignmentChanged && actor.role !== "admin") {
            throw new HttpError(403, "Only administrators can update team assignments.");
          }
          if (statusChanged) {
            if (!ALLOWED[existing.status as Status].includes(incoming.status as Status)) {
              throw new HttpError(400, "This status transition is not allowed.");
            }
            if (!ROLE_CAN[actor.role].includes(incoming.status as Status)) {
              throw new HttpError(403, "You are not allowed to make this status change.");
            }
          }
        }

        
        // A brand-new synced request must arrive as 'submitted'.
        // Otherwise a client could bypass the workflow state machine entirely.
        if (!existing && incoming.status !== "submitted") {
          throw new HttpError(400, "New synced requests must start as 'submitted'.");
        }

        await client.query(
          `INSERT INTO requests (
             id, tracking_number, category, description, lat, lng, photo,
             status, version, reporter_device_id, source, sync_state,
             assigned_to, assigned_name, team_leader_id, accepted_at
           ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
           ON CONFLICT (id) DO UPDATE SET
             status = EXCLUDED.status,
             version = EXCLUDED.version,
             description = EXCLUDED.description,
             photo = EXCLUDED.photo,
             sync_state = 'synced',
             assigned_to = EXCLUDED.assigned_to,
             assigned_name = EXCLUDED.assigned_name,
             team_leader_id = EXCLUDED.team_leader_id,
             accepted_at = EXCLUDED.accepted_at,
             updated_at = now()`,
          [
            incoming.id,
            incoming.trackingNumber,
            incoming.category,
            incoming.description,
            incoming.lat,
            incoming.lng,
            incoming.photo ?? null,
            incoming.status,
            incoming.version,
            incoming.reporterDeviceId,
            incoming.source,
            "synced",
            incoming.assignedTo ?? null,
            incoming.assignedName ?? null,
            incoming.teamLeaderId ?? null,
            incoming.acceptedAt ? new Date(incoming.acceptedAt) : null,
          ],
        );

        if (incoming.assignedWorkerIds) {
          await client.query(`DELETE FROM request_workers WHERE request_id = $1`, [incoming.id]);
          for (const workerId of incoming.assignedWorkerIds) {
            await client.query(
              `INSERT INTO request_workers (request_id, user_id) VALUES ($1, $2)
               ON CONFLICT DO NOTHING`,
              [incoming.id, workerId],
            );
          }
        }

        for (const h of incoming.history) {
          const dup = await client.query(
            `SELECT 1 FROM request_history
              WHERE request_id = $1 AND status = $2 AND at = $3`,
            [incoming.id, h.status, h.at],
          );
          if (dup.rows.length === 0) {
            await client.query(
              `INSERT INTO request_history (request_id, status, by_name, note, photo, at)
               VALUES ($1, $2, $3, $4, $5, $6)`,
              [incoming.id, h.status, h.by, h.note ?? null, h.photo ?? null, h.at],
            );
          }
        }

        await client.query(
          `INSERT INTO idempotency_keys (key, result) VALUES ($1, $2)`,
          [incoming.id, JSON.stringify({ accepted: true })],
        );

        accepted.push(incoming.id);
      }

      await client.query("COMMIT");
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }

    for (const id of accepted) {
      try {
        const updated = await requestRepository.findById(id);
        if (updated) {
          eventBus.raise({
            type: "StatusChanged",
            version: 1,
            request: updated,
            from: updated.status,
            to: updated.status,
          });
        }
      } catch (err) {
        console.error("[sync] event raise failed for", id, err);
      }
    }

    res.json({ accepted });
  }),
);