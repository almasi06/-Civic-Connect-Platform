// =============================================================================
// Global test setup.
// =============================================================================
import { afterAll } from "vitest";
import { pool } from "../server/db";

// After all tests, close the DB pool so Vitest can exit cleanly.
afterAll(async () => {
  await pool.end();
});