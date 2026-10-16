// =============================================================================
// Request data access. All SQL for requests + request_history + request_workers.
// =============================================================================
import { pool } from "../db";
import type { ServiceRequest, Status, HistoryEntry, Category } from "../types";

// ---------- Row type (matches the `requests` table) ----------
interface RequestRow {
  id: string;
  tracking_number: string;
  category: Category;
  description: string;
  lat: string;              // Postgres DECIMAL comes back as string
  lng: string;
  photo: string | null;
  status: Status;
  version: number;
  reporter_device_id: string;
  source: string;
  sync_state: string;
  assigned_to: string | null;
  assigned_name: string | null;
  team_leader_id: string | null;
  accepted_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

// ---------- Hydrate a row + history + workers into a ServiceRequest ----------
async function hydrate(row: RequestRow): Promise<ServiceRequest> {
  const [historyRes, workersRes] = await Promise.all([
    pool.query(
      `SELECT status, at, by_name AS by, note, photo
         FROM request_history
        WHERE request_id = $1
        ORDER BY at ASC`,
      [row.id],
    ),
    pool.query<{ user_id: string }>(
      `SELECT user_id FROM request_workers WHERE request_id = $1`,
      [row.id],
    ),
  ]);

  return {
    id: row.id,
    trackingNumber: row.tracking_number,
    category: row.category,
    description: row.description,
    lat: Number(row.lat),
    lng: Number(row.lng),
    photo: row.photo ?? undefined,
    status: row.status,
    version: row.version,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
    history: historyRes.rows as HistoryEntry[],
    reporterDeviceId: row.reporter_device_id,
    source: "web",
    syncState: row.sync_state as "pending" | "synced",
    assignedTo: row.assigned_to ?? undefined,
    assignedName: row.assigned_name ?? undefined,
    assignedWorkerIds: workersRes.rows.map((r) => r.user_id),
    teamLeaderId: row.team_leader_id ?? undefined,
    acceptedAt: row.accepted_at?.toISOString(),
  };
}

// ---------- Filters interface ----------
export interface RequestFilters {
  q?: string;
  status?: string;
  category?: string;
  department?: string;
  sort?: string;
}

// Department → category mapping (mirrors frontend CATEGORY_DEPARTMENT)
const DEPARTMENT_CATEGORIES: Record<string, string[]> = {
  roads:       ["pothole", "traffic_light", "road_sign", "sidewalk"],
  electricity: ["streetlight", "power_outage"],
  water:       ["water_leak", "blocked_drain"],
  waste:       ["waste", "illegal_dumping"],
  community:   ["vandalism", "other"],
};

export const requestRepository = {
  // =========================================================================
  // LIST with filters
  // =========================================================================
  async list(filters: RequestFilters = {}): Promise<ServiceRequest[]> {
    const conditions: string[] = [];
    const params: unknown[] = [];
    let i = 1;

    // q — multi-field LIKE search
    if (filters.q?.trim()) {
      const like = `%${filters.q.trim().toLowerCase()}%`;
      conditions.push(`(
        LOWER(tracking_number) LIKE $${i}
        OR LOWER(description) LIKE $${i}
        OR LOWER(COALESCE(assigned_name, '')) LIKE $${i}
        OR LOWER(category::text) LIKE $${i}
      )`);
      params.push(like);
      i++;
    }

    // status — 'any' | 'open' | specific
    if (filters.status && filters.status !== "any") {
      if (filters.status === "open") {
        conditions.push(`status NOT IN ('resolved', 'rejected')`);
      } else {
        conditions.push(`status = $${i}`);
        params.push(filters.status);
        i++;
      }
    }

    // category
    if (filters.category && filters.category !== "any") {
      conditions.push(`category = $${i}`);
      params.push(filters.category);
      i++;
    }

    // department → expand to category list
    if (filters.department && filters.department !== "any") {
      const cats = DEPARTMENT_CATEGORIES[filters.department];
      if (cats && cats.length > 0) {
        conditions.push(`category = ANY($${i}::text[])`);
        params.push(cats);
        i++;
      }
    }

    // sort
    let orderBy = "created_at DESC";
    switch (filters.sort) {
      case "oldest":   orderBy = "created_at ASC"; break;
      case "updated":  orderBy = "updated_at DESC"; break;
      case "category": orderBy = "category ASC"; break;
      case "status":   orderBy = "status ASC"; break;
      case "newest":
      default:         orderBy = "created_at DESC"; break;
    }

    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
    const sql = `SELECT * FROM requests ${where} ORDER BY ${orderBy}`;

    const { rows } = await pool.query<RequestRow>(sql, params);
    return Promise.all(rows.map(hydrate));
  },

  // =========================================================================
  // FIND BY ID
  // =========================================================================
  async findById(id: string): Promise<ServiceRequest | null> {
    const { rows } = await pool.query<RequestRow>(
      `SELECT * FROM requests WHERE id = $1`,
      [id],
    );
    return rows[0] ? hydrate(rows[0]) : null;
  },

  // =========================================================================
  // FIND BY ID with row lock (for transitions)
  // =========================================================================
  async findByIdForUpdate(
    client: { query: typeof pool.query },
    id: string,
  ): Promise<ServiceRequest | null> {
    const { rows } = await client.query<RequestRow>(
      `SELECT * FROM requests WHERE id = $1 FOR UPDATE`,
      [id],
    );
    return rows[0] ? hydrate(rows[0]) : null;
  },

  // =========================================================================
  // FIND BY TRACKING NUMBER
  // =========================================================================
  async findByTracking(tracking: string): Promise<ServiceRequest | null> {
    const { rows } = await pool.query<RequestRow>(
      `SELECT * FROM requests WHERE tracking_number = $1`,
      [tracking],
    );
    return rows[0] ? hydrate(rows[0]) : null;
  },

  // =========================================================================
  // CREATE — insert new request + initial history
  // =========================================================================
  async create(input: ServiceRequest): Promise<ServiceRequest> {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      await client.query(
        `INSERT INTO requests (
          id, tracking_number, category, description, lat, lng, photo,
          status, version, reporter_device_id, source, sync_state
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
        [
          input.id,
          input.trackingNumber,
          input.category,
          input.description,
          input.lat,
          input.lng,
          input.photo ?? null,
          input.status,
          input.version,
          input.reporterDeviceId,
          input.source,
          input.syncState,
        ],
      );

      // Initial history entry
      if (input.history?.length) {
        for (const h of input.history) {
          await client.query(
            `INSERT INTO request_history (request_id, status, by_name, note, photo, at)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [input.id, h.status, h.by, h.note ?? null, h.photo ?? null, h.at],
          );
        }
      }

      await client.query("COMMIT");
      const created = await this.findById(input.id);
      if (!created) throw new Error("Created request not found");
      return created;
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  },

  // =========================================================================
  // UPDATE STATUS (transactional, version-checked)
  // =========================================================================
  async updateStatus(
    id: string,
    to: Status,
    actorName: string,
    expectedVersion: number,
    extra?: {
      assignedTo?: string;
      assignedName?: string;
      note?: string;
      photo?: string;
    },
  ): Promise<ServiceRequest | null> {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const { rows } = await client.query<{ version: number }>(
        `UPDATE requests
            SET status = $1,
                version = version + 1,
                updated_at = now(),
                assigned_to = COALESCE($2, assigned_to),
                assigned_name = COALESCE($3, assigned_name)
          WHERE id = $4 AND version = $5
          RETURNING version`,
        [
          to,
          extra?.assignedTo ?? null,
          extra?.assignedName ?? null,
          id,
          expectedVersion,
        ],
      );

      if (rows.length === 0) {
        await client.query("ROLLBACK");
        return null; // version mismatch or not found
      }

      await client.query(
        `INSERT INTO request_history (request_id, status, by_name, note, photo)
         VALUES ($1, $2, $3, $4, $5)`,
        [id, to, actorName, extra?.note ?? null, extra?.photo ?? null],
      );

      await client.query("COMMIT");
      return this.findById(id);
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  },

  // =========================================================================
  // ACCEPT JOB (worker accepts; no status change)
  // =========================================================================
  async acceptJob(
    id: string,
    actorName: string,
    expectedVersion: number,
  ): Promise<ServiceRequest | null> {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const { rows } = await client.query<{ version: number }>(
        `UPDATE requests
            SET accepted_at = now(),
                version = version + 1,
                updated_at = now()
          WHERE id = $1 AND version = $2 AND accepted_at IS NULL
          RETURNING version`,
        [id, expectedVersion],
      );

      if (rows.length === 0) {
        await client.query("ROLLBACK");
        return null;
      }

      await client.query(
        `INSERT INTO request_history (request_id, status, by_name, note)
         SELECT id, status, $2, 'Job accepted'
           FROM requests WHERE id = $1`,
        [id, actorName],
      );

      await client.query("COMMIT");
      return this.findById(id);
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  },

  // =========================================================================
  // FIELD UPDATE (note and/or photo; no status change)
  // =========================================================================
  async fieldUpdate(
    id: string,
    actorName: string,
    expectedVersion: number,
    note: string | undefined,
    photo: string | undefined,
  ): Promise<ServiceRequest | null> {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const { rows } = await client.query<{ version: number }>(
        `UPDATE requests
            SET version = version + 1,
                updated_at = now()
          WHERE id = $1 AND version = $2
          RETURNING version`,
        [id, expectedVersion],
      );

      if (rows.length === 0) {
        await client.query("ROLLBACK");
        return null;
      }

      await client.query(
        `INSERT INTO request_history (request_id, status, by_name, note, photo)
         SELECT id, status, $2, $3, $4
           FROM requests WHERE id = $1`,
        [id, actorName, note ?? null, photo ?? null],
      );

      await client.query("COMMIT");
      return this.findById(id);
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  },

  // =========================================================================
  // IS WORKER ASSIGNED TO REQUEST
  // =========================================================================
  async isAssignedTo(id: string, workerId: string): Promise<boolean> {
  const { rows } = await pool.query(
    `SELECT 1 FROM requests
      WHERE id = $1
        AND (assigned_to = $2 OR team_leader_id = $2)`,
    [id, workerId],
  );
  return rows.length > 0;
},
};