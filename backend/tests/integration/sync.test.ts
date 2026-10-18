// =============================================================================
// Sync integration tests — regression for DEF-030.
// Requires: server running on http://localhost:4000.
// =============================================================================
import { describe, it, expect, beforeAll } from "vitest";
import { TEST_BASE_URL } from "../fixtures/helpers";

async function getAdminToken(): Promise<string> {
  const res = await fetch(`${TEST_BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "admin@tshwane.gov.za",
      password: "admin1234",
    }),
  });
  if (!res.ok) {
    throw new Error(`Login failed: ${res.status} ${JSON.stringify(await res.json())}`);
  }
  const body = await res.json();
  return body.token;
}

describe("POST /api/sync — DEF-030 regression", () => {
  let token: string;

  beforeAll(async () => {
    token = await getAdminToken();
  });

  it("TC-BE-SYNC-01 (negative): rejects brand-new request not in 'submitted' state", async () => {
    const newId = crypto.randomUUID();

    const res = await fetch(`${TEST_BASE_URL}/api/sync`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        requests: [{
          id: newId,
          trackingNumber: `TST-${Date.now()}`,
          category: "pothole",
          description: "Regression test for DEF-030",
          lat: -25.7479,
          lng: 28.2293,
          status: "resolved",
          version: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          history: [],
          reporterDeviceId: "test-device-def030",
          source: "web",
          syncState: "pending",
        }],
      }),
    });

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.message).toMatch(/submitted/i);
  });

  it("TC-BE-SYNC-02 (positive control): accepts brand-new request in 'submitted' state", async () => {
    const newId = crypto.randomUUID();

    const res = await fetch(`${TEST_BASE_URL}/api/sync`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        requests: [{
          id: newId,
          trackingNumber: `TST-${Date.now()}-OK`,
          category: "pothole",
          description: "Positive control for DEF-030",
          lat: -25.7479,
          lng: 28.2293,
          status: "submitted",
          version: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          history: [],
          reporterDeviceId: "test-device-def030-ok",
          source: "web",
          syncState: "pending",
        }],
      }),
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.accepted).toContain(newId);
  });
});