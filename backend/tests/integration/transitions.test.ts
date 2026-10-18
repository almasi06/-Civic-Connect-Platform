// =============================================================================
// Status transition integration tests. Covers FR-04 (updating, closing).
//
// Requires: server running on http://localhost:4000
// =============================================================================
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { TEST_BASE_URL, loginAsAdmin, loginAsWorker, validReportPayload, cleanupTestData } from "../fixtures/helpers";

describe("Status transitions", () => {
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
  });

  afterAll(async () => {
    await cleanupTestData();
  });

  async function createReport(): Promise<{ id: string; version: number }> {
    const payload = validReportPayload({ reporterDeviceId: "test-device-trans" });
    const res = await fetch(`${TEST_BASE_URL}/api/requests`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const body = await res.json();
    return { id: body.id, version: body.version };
  }

  it("TC-BE-TRANS-01: admin can assign (submitted → assigned)", async () => {
    const { id, version } = await createReport();
    const res = await fetch(`${TEST_BASE_URL}/api/requests/${id}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        to: "assigned",
        expectedVersion: version,
        assignedTo: workerId,
        assignedName: "Thabo Mokoena",
      }),
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.status).toBe("assigned");
    expect(body.version).toBe(version + 1);
  });

  it("TC-BE-TRANS-02 (negative): invalid transition submitted → resolved is rejected", async () => {
    const { id, version } = await createReport();
    const res = await fetch(`${TEST_BASE_URL}/api/requests/${id}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ to: "resolved", expectedVersion: version }),
    });
    expect([400, 403]).toContain(res.status);
  });

  it("TC-BE-TRANS-03 (negative): version mismatch returns 409", async () => {
    const { id } = await createReport();
    const res = await fetch(`${TEST_BASE_URL}/api/requests/${id}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        to: "assigned",
        expectedVersion: 9999,
        assignedTo: workerId,
        assignedName: "Thabo Mokoena",
      }),
    });
    expect(res.status).toBe(409);
  });

  it("TC-BE-TRANS-04 (negative): unauthorised request returns 401", async () => {
    const { id, version } = await createReport();
    const res = await fetch(`${TEST_BASE_URL}/api/requests/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: "assigned",
        expectedVersion: version,
        assignedTo: workerId,
        assignedName: "Thabo Mokoena",
      }),
    });
    expect(res.status).toBe(401);
  });

  it("TC-BE-TRANS-05: history is recorded after a transition", async () => {
    const { id, version } = await createReport();
    await fetch(`${TEST_BASE_URL}/api/requests/${id}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        to: "assigned",
        expectedVersion: version,
        assignedTo: workerId,
        assignedName: "Thabo Mokoena",
      }),
    });
    const res = await fetch(`${TEST_BASE_URL}/api/requests/${id}`);
    const body = await res.json();
    expect(body.history.length).toBeGreaterThan(1);
  });

  it("TC-BE-TRANS-06 (negative): transitioning to an unknown status is rejected", async () => {
    const { id, version } = await createReport();
    const res = await fetch(`${TEST_BASE_URL}/api/requests/${id}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ to: "made_up_status", expectedVersion: version }),
    });
    expect(res.status).toBe(400);
  });
    it("TC-BE-TRANS-07: Field worker can add a field update with note", async () => {
    const { id, version } = await createReport();
    
    // 1. Admin assigns it to a worker
    const assignRes = await fetch(`${TEST_BASE_URL}/api/requests/${id}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        to: "assigned",
        expectedVersion: version,
        assignedTo: workerId,
        assignedName: "Thabo Mokoena",
      }),
    });
    const assigned = await assignRes.json();
    
    // 2. Worker adds a field update
    const updateRes = await fetch(`${TEST_BASE_URL}/api/requests/${id}/update`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${workerToken}`,
      },
      body: JSON.stringify({
        expectedVersion: assigned.version,
        note: "Inspected the site. Repair scheduled.",
      }),
    });
    
    expect(updateRes.status).toBe(200);
    const updated = await updateRes.json();
    expect(updated.history.length).toBeGreaterThan(assigned.history.length);
  });
});