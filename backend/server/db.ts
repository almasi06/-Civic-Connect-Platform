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

// SSL: Supabase hosts use "supabase.com" (pooler) or "supabase.co"
// PGSSL=true overrides for other SSL-required hosts
const useSsl =
  connectionString.includes("supabase.com") ||
  connectionString.includes("supabase.co") ||
  process.env.PGSSL === "true";

export const pool = new Pool({
  connectionString,
  max: 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
  ssl: useSsl ? { rejectUnauthorized: false } : false,
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

process.on("SIGTERM", () => pool.end());
process.on("SIGINT", () => pool.end());