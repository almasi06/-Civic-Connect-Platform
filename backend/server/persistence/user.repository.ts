// =============================================================================
// User data access. All SQL for the `users` table lives here.
// =============================================================================
import { pool } from "../db";
import type { Role } from "../types";

export interface UserRow {
  id: string;
  email: string;
  password_hash: string;
  name: string;
  role: Role;
  is_active: boolean;
}

export const userRepository = {
  async findByEmail(email: string): Promise<UserRow | null> {
    const { rows } = await pool.query<UserRow>(
      `SELECT id, email, password_hash, name, role, is_active
         FROM users
        WHERE LOWER(email) = LOWER($1)
        LIMIT 1`,
      [email.trim()],
    );
    return rows[0] ?? null;
  },

  async findById(id: string): Promise<UserRow | null> {
    const { rows } = await pool.query<UserRow>(
      `SELECT id, email, password_hash, name, role, is_active
         FROM users
        WHERE id = $1
        LIMIT 1`,
      [id],
    );
    return rows[0] ?? null;
  },

  async listActiveFieldWorkers(): Promise<
    Array<{ id: string; name: string; role: Role }>
  > {
    const { rows } = await pool.query(
      `SELECT id, name, role
         FROM users
        WHERE role = 'field_worker' AND is_active = true
        ORDER BY name ASC`,
    );
    return rows;
  },

  async isActiveFieldWorker(id: string): Promise<boolean> {
    const { rows } = await pool.query(
      `SELECT 1 FROM users
        WHERE id = $1 AND role = 'field_worker' AND is_active = true`,
      [id],
    );
    return rows.length > 0;
  },
};