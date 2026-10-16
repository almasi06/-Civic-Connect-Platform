// =============================================================================
// E2E: Citizen journey
// Submits a report -> tracks it by number -> admin assigns it → status updates
//
// Covers: FR-01 (submit), FR-06 (track), FR-04 (admin update), FR-05 (notify)
// Requires: server running on http://localhost:4000
// =============================================================================
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import {
  TEST_BASE_URL,
  loginAsAdmin,
  validReportPayload,
  cleanupTestData,
} from "../fixtures/helpers";

describe("E2E: Citizen submits and tracks a report", () => {
  let adminToken: string;

  beforeAll(async () => {
    const res = await fetch(`${TEST_BASE_URL}/health`);
    if (!res.ok) throw new Error(`Server not reachable at ${TEST_BASE_URL}`);
    adminToken = await loginAsAdmin();
    await cleanupTestData();
  });

  afterAll(async () => {
    await cleanupTestData();
  });

  it("TC-E2E-01: citizen submits, tracks, and receives status update", async () => {
    // --- STEP 1: Citizen submits a report ---
    const payload = validReportPayload({
      reporterDeviceId: "test-device-e2e-01",
      description: "E2E test — pothole on Church Street",
      category: "pothole",
    });

    const submitRes = await fetch(`${TEST_BASE_URL}/api/requests`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    expect(submitRes.status).toBe(201);
    const submitted = await submitRes.json();
    expect(submitted.status).toBe("submitted");
    expect(submitted.trackingNumber).toBe(payload.trackingNumber);
    expect(submitted.version).toBe(1);

    const trackingNumber = submitted.trackingNumber;
    const requestId = submitted.id;

    // --- STEP 2: Citizen tracks by number (no auth needed) ---
    const trackRes = await fetch(
      `${TEST_BASE_URL}/api/requests/track/${trackingNumber}`,
    );
    expect(trackRes.status).toBe(200);
    const tracked = await trackRes.json();
    expect(tracked.trackingNumber).toBe(trackingNumber);
    expect(tracked.status).toBe("submitted");
    expect(Array.isArray(tracked.history)).toBe(true);
    expect(tracked.history.length).toBeGreaterThan(0);

    // --- STEP 3: Admin assigns the request (status change) ---
    const assignRes = await fetch(
      `${TEST_BASE_URL}/api/requests/${requestId}/status`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          to: "assigned",
          expectedVersion: submitted.version,
        }),
      },
    );

    expect(assignRes.status).toBe(200);
    const assigned = await assignRes.json();
    expect(assigned.status).toBe("assigned");
    expect(assigned.version).toBe(submitted.version + 1);

    // --- STEP 4: Citizen tracks again and sees updated status ---
    const reTrackRes = await fetch(
      `${TEST_BASE_URL}/api/requests/track/${trackingNumber}`,
    );
    expect(reTrackRes.status).toBe(200);
    const reTracked = await reTrackRes.json();
    expect(reTracked.status).toBe("assigned");
    expect(reTracked.history.length).toBeGreaterThan(tracked.history.length);
  });
});