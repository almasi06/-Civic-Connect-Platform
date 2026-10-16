// =============================================================================
// Team data access. All SQL for teams + team_workers.
// =============================================================================
import { pool } from "../db";
import type { Team } from "../types";

// Row type matching the `teams` table
interface TeamRow {
  id: string;
  name: string;
  description: string;
  department: string;
  contact_email: string;
  contact_phone: string;
  created_at: Date;
  updated_at: Date;
}

// Hydrate a team row + worker ids into a Team object
async function hydrate(row: TeamRow): Promise<Team> {
  const { rows: workerRows } = await pool.query<{ user_id: string }>(
    `SELECT user_id FROM team_workers WHERE team_id = $1`,
    [row.id],
  );
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    department: row.department,
    contactEmail: row.contact_email,
    contactPhone: row.contact_phone,
    workerIds: workerRows.map((r) => r.user_id),
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
  };
}

// TeamInput: fields accepted by create/update (no id, timestamps, or workerIds here — workerIds handled separately)
export interface TeamInput {
  name: string;
  description: string;
  department: string;
  contactEmail: string;
  contactPhone: string;
  workerIds: string[];
}

export const teamRepository = {
  // =========================================================================
  // LIST ALL TEAMS
  // =========================================================================
  async listAll(): Promise<Team[]> {
    const { rows } = await pool.query<TeamRow>(
      `SELECT * FROM teams ORDER BY name ASC`,
    );
    return Promise.all(rows.map(hydrate));
  },

  // =========================================================================
  // LIST TEAMS A WORKER BELONGS TO
  // =========================================================================
  async listByWorker(userId: string): Promise<Team[]> {
    const { rows } = await pool.query<TeamRow>(
      `SELECT t.*
         FROM teams t
         JOIN team_workers tw ON tw.team_id = t.id
        WHERE tw.user_id = $1
        ORDER BY t.name ASC`,
      [userId],
    );
    return Promise.all(rows.map(hydrate));
  },

  // =========================================================================
  // FIND ONE
  // =========================================================================
  async findById(id: string): Promise<Team | null> {
    const { rows } = await pool.query<TeamRow>(
      `SELECT * FROM teams WHERE id = $1`,
      [id],
    );
    return rows[0] ? hydrate(rows[0]) : null;
  },

  // =========================================================================
  // FIND BY DEPARTMENT (used by assignment logic)
  // =========================================================================
  async findByDepartment(department: string): Promise<Team[]> {
    const { rows } = await pool.query<TeamRow>(
      `SELECT * FROM teams WHERE department = $1 ORDER BY name ASC`,
      [department],
    );
    return Promise.all(rows.map(hydrate));
  },

  // =========================================================================
  // CREATE
  // =========================================================================
  async create(input: TeamInput): Promise<Team> {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const { rows } = await client.query<{ id: string }>(
        `INSERT INTO teams (name, description, department, contact_email, contact_phone)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id`,
        [input.name, input.description, input.department, input.contactEmail, input.contactPhone],
      );
      const teamId = rows[0].id;

      for (const workerId of input.workerIds) {
        await client.query(
          `INSERT INTO team_workers (team_id, user_id) VALUES ($1, $2)
           ON CONFLICT DO NOTHING`,
          [teamId, workerId],
        );
      }

      await client.query("COMMIT");
      const created = await this.findById(teamId);
      if (!created) throw new Error("Created team not found");
      return created;
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  },

  // =========================================================================
  // UPDATE
  // =========================================================================
  async update(id: string, input: TeamInput): Promise<Team | null> {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const result = await client.query(
        `UPDATE teams
            SET name = $1,
                description = $2,
                department = $3,
                contact_email = $4,
                contact_phone = $5,
                updated_at = now()
          WHERE id = $6`,
        [input.name, input.description, input.department, input.contactEmail, input.contactPhone, id],
      );
      if (result.rowCount === 0) {
        await client.query("ROLLBACK");
        return null;
      }

      // Replace worker assignments atomically
      await client.query(`DELETE FROM team_workers WHERE team_id = $1`, [id]);
      for (const workerId of input.workerIds) {
        await client.query(
          `INSERT INTO team_workers (team_id, user_id) VALUES ($1, $2)
           ON CONFLICT DO NOTHING`,
          [id, workerId],
        );
      }

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
  // DELETE
  // =========================================================================
  async remove(id: string): Promise<boolean> {
    const { rowCount } = await pool.query(
      `DELETE FROM teams WHERE id = $1`,
      [id],
    );
    return (rowCount ?? 0) > 0;
  },
};