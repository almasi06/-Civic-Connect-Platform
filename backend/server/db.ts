// =============================================================================
// PostgreSQL connection pool
// =============================================================================
import { Pool } from "pg";

console.log("[db] Loading db.ts...");

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set. Check your backend/.env file.");
}

console.log("[db] URL loaded. Host:", connectionString.split("@")[1]?.split("/")[0] ?? "unknown");
console.log("[db] User:", connectionString.split("://")[1]?.split(":")[0] ?? "unknown");

const useSsl = connectionString.includes("supabase.co") || process.env.PGSSL === "true";

export const pool = new Pool({
  connectionString,
  max: 10,
  idleTimeoutMillis: 60_000,
  connectionTimeoutMillis: 10_000,
  ssl: useSsl ? { rejectUnauthorized: false } : false,
  keepAlive: true,
});

pool.on("error", (err) => {
  console.error("[db] Pool error:", err.message);
});

export async function pingDb(): Promise<boolean> {
  console.log("[db] pingDb() called");
  try {
    const result = await pool.query("SELECT 1");
    console.log("[db] SUCCESS:", result.rows);
    return true;
  } catch (err) {
    console.error("[db] FAILED:", err instanceof Error ? err.message : err);
    console.error("[db] Full error:", err);
    return false;
  }
}

// Graceful shutdown: only close the pool if it's still active
const shutdown = async () => {
  try {
    await pool.end();
  } catch (err) {
    // Ignore "Called end on pool more than once" errors during test teardown
  }
};

process.once("SIGTERM", shutdown);
process.once("SIGINT", shutdown);