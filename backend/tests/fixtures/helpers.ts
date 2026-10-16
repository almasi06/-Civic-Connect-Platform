// =============================================================================
// Test helpers: login, tokens, DB cleanup.
// =============================================================================
import { pool } from "../../server/db";

const BASE_URL = "http://localhost:4000";

export async function loginAsAdmin(): Promise<string> {
  const res = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "admin@tshwane.gov.za",
      password: "admin1234",
    }),
  });
  if (!res.ok) throw new Error(`Admin login failed: ${res.status}`);
  const { token } = await res.json();
  return token;
}

export async function loginAsWorker(): Promise<{ token: string; id: string }> {
  const res = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "worker@tshwane.gov.za",
      password: "worker1234",
    }),
  });
  if (!res.ok) throw new Error(`Worker login failed: ${res.status}`);
  const body = await res.json();
  return { token: body.token, id: body.id };
}

export async function cleanupTestData(): Promise<void> {
  const { rows } = await pool.query<{ id: string }>(
    `SELECT id FROM requests WHERE reporter_device_id LIKE 'test-device-%'`,
  );
  const ids = rows.map((r) => r.id);

  if (ids.length > 0) {
    await pool.query(`DELETE FROM request_history WHERE request_id = ANY($1)`, [ids]);
    await pool.query(`DELETE FROM request_workers WHERE request_id = ANY($1)`, [ids]);
    await pool.query(`DELETE FROM idempotency_keys WHERE key = ANY($1)`, [ids]);
    await pool.query(`DELETE FROM requests WHERE id = ANY($1)`, [ids]);
  }
}

export function validReportPayload(overrides: Record<string, unknown> = {}) {
  const id = (overrides.id as string) ?? crypto.randomUUID();
  return {
    id,
    trackingNumber: `TSH-${id.slice(0, 6).toUpperCase()}`,
    category: "pothole",
    description: "Test pothole",
    lat: -25.7479,
    lng: 28.2293,
    reporterDeviceId: "test-device-fixture",
    status: "submitted",
    version: 1,
    history: [
      { status: "submitted", at: new Date().toISOString(), by: "citizen" },
    ],
    source: "web",
    syncState: "synced",
    ...overrides,
  };
}

export const TEST_BASE_URL = BASE_URL;