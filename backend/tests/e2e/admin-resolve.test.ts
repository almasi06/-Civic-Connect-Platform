// =============================================================================
// E2E: Admin resolves a request through the full lifecycle
// submitted -> assigned -> in_progress -> resolved
//
// Covers: FR-04 (update/close), FR-05 (notify), ADR-PERSIST-01 (transactions)
// Requires: server running on http://localhost:4000
// =============================================================================
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import {
  TEST_BASE_URL,
  loginAsAdmin,
  loginAsWorker,
  validReportPayload,
  cleanupTestData,
} from "../fixtures/helpers";

describe("E2E: Admin resolves a request through full lifecycle", () => {
  let adminToken: string;
  let workerToken: string;
  let workerId: string;

  beforeAll(async () => {
    const res = await fetch(`${TEST_BASE_URL}/health`);
    if (!res.ok) throw new Error(`Server not reachable at ${TEST_BASE_URL}`);
    adminToken = await loginAsAdmin();
    const worker = await loginAsWorker();
    workerToken = worker.token;
    workerId = worker.id;
    await cleanupTestData();
  }, 60_000);

  afterAll(async () => {
    await cleanupTestData();
  }, 60_000);

  it("TC-E2E-02: request moves through the full lifecycle", async () => {
    // Setup: create a report
    const payload = validReportPayload({
      reporterDeviceId: "test-device-e2e-02",
      description: "E2E test — water leak lifecycle",
    });
    const createRes = await fetch(`${TEST_BASE_URL}/api/requests`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const created = await createRes.json();
    const id = created.id;
    let version = created.version;

    // Transition 1: submitted -> assigned (by admin)
    const t1 = await fetch(`${TEST_BASE_URL}/api/requests/${id}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        to: "assigned",
        expectedVersion: version,
        assignedTo: workerId,
        assignedName: "Test Worker",
      }),
    });
    expect(t1.status).toBe(200);
    version = (await t1.json()).version;

    // Transition 2: assigned -> in_progress (by worker)
    const t2 = await fetch(`${TEST_BASE_URL}/api/requests/${id}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${workerToken}`,
      },
      body: JSON.stringify({
        to: "in_progress",
        expectedVersion: version,
      }),
    });
    expect(t2.status).toBe(200);
    version = (await t2.json()).version;

    // Transition 3: in_progress -> resolved (by worker)
    const t3 = await fetch(`${TEST_BASE_URL}/api/requests/${id}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${workerToken}`,
      },
      body: JSON.stringify({
        to: "resolved",
        expectedVersion: version,
        note: "Leak repaired",
      }),
    });
    expect(t3.status).toBe(200);
    const finalBody = await t3.json();

    // Verify final state
    expect(finalBody.status).toBe("resolved");
    expect(finalBody.history.length).toBeGreaterThanOrEqual(4);

    // Verify audit trail shows all transitions
    const historyStatuses = finalBody.history.map((h: any) => h.status);
    expect(historyStatuses).toContain("submitted");
    expect(historyStatuses).toContain("assigned");
    expect(historyStatuses).toContain("in_progress");
    expect(historyStatuses).toContain("resolved");
  }, 60_000);
});