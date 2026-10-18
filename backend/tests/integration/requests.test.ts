// =============================================================================
// Request integration tests. Covers FR-01 (submit), FR-03 (categorization),
// FR-06 (tracking).
//
// Requires: server running on http://localhost:4000
// =============================================================================
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { TEST_BASE_URL, validReportPayload, cleanupTestData } from "../fixtures/helpers";

describe("Requests API", () => {
  beforeAll(async () => {
    const res = await fetch(`${TEST_BASE_URL}/health`);
    if (!res.ok) {
      throw new Error(`Server not reachable at ${TEST_BASE_URL}. Start it with: npm run dev`);
    }
    await cleanupTestData();
  });

  afterAll(async () => {
    await cleanupTestData();
  });

  // ---------------------------------------------------------------------------
  // POST /api/requests
  // ---------------------------------------------------------------------------
  describe("POST /api/requests", () => {
    it("TC-BE-REQ-01: valid report returns 201 with correct shape", async () => {
      const payload = validReportPayload({ reporterDeviceId: "test-device-req-01" });
      const res = await fetch(`${TEST_BASE_URL}/api/requests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      expect(res.status).toBe(201);
      const body = await res.json();
      expect(body.id).toBe(payload.id);
      expect(body.trackingNumber).toBe(payload.trackingNumber);
      expect(body.status).toBe("submitted");
      expect(body.lat).toBeCloseTo(-25.7479, 3);
      expect(body.lng).toBeCloseTo(28.2293, 3);
      expect(Array.isArray(body.history)).toBe(true);
    });

    it("TC-BE-REQ-02 (negative): missing lat/lng returns 400", async () => {
      const payload = validReportPayload({
        reporterDeviceId: "test-device-req-02",
        lat: undefined,
      });
      const res = await fetch(`${TEST_BASE_URL}/api/requests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      expect(res.status).toBe(400);
    });

    it("TC-BE-REQ-03 (negative): GPS outside Tshwane returns 400 (city gate)", async () => {
      const payload = validReportPayload({
        reporterDeviceId: "test-device-req-03",
        lat: -33.9249,
        lng: 18.4241, // Cape Town
      });
      const res = await fetch(`${TEST_BASE_URL}/api/requests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.message).toMatch(/inside the city/i);
    });

    it("TC-BE-REQ-04 (negative): invalid category returns 400", async () => {
      const payload = validReportPayload({
        reporterDeviceId: "test-device-req-04",
        category: "not-a-category",
      });
      const res = await fetch(`${TEST_BASE_URL}/api/requests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      expect(res.status).toBe(400);
    });
  });

  // ---------------------------------------------------------------------------
  // GET /api/requests (list + filters)
  // ---------------------------------------------------------------------------
  describe("GET /api/requests", () => {
    let potholeId: string;
    let waterLeakId: string;

    beforeAll(async () => {
      // Seed two reports of different categories
      const pothole = validReportPayload({
        reporterDeviceId: "test-device-list-01",
        category: "pothole",
        description: "Test pothole list marker",
      });
      const water = validReportPayload({
        reporterDeviceId: "test-device-list-02",
        category: "water_leak",
        description: "Test water leak list marker",
      });

      await fetch(`${TEST_BASE_URL}/api/requests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pothole),
      });
      potholeId = pothole.id;

      await fetch(`${TEST_BASE_URL}/api/requests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(water),
      });
      waterLeakId = water.id;
    });

    it("TC-BE-REQ-05: list returns an array", async () => {
      const res = await fetch(`${TEST_BASE_URL}/api/requests`);
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(Array.isArray(body)).toBe(true);
    });

    it("TC-BE-REQ-06: filter by category=pothole returns only potholes", async () => {
      const res = await fetch(`${TEST_BASE_URL}/api/requests?category=pothole`);
      const body = await res.json();
      expect(body.every((r: { category: string }) => r.category === "pothole")).toBe(true);
    });

    it("TC-BE-REQ-07: filter by status=open excludes resolved and rejected", async () => {
      const res = await fetch(`${TEST_BASE_URL}/api/requests?status=open`);
      const body = await res.json();
      expect(
        body.every((r: { status: string }) => r.status !== "resolved" && r.status !== "rejected"),
      ).toBe(true);
    });

    it("TC-BE-REQ-08: free-text search q=pothole matches", async () => {
      const res = await fetch(`${TEST_BASE_URL}/api/requests?q=pothole`);
      const body = await res.json();
      expect(body.length).toBeGreaterThan(0);
    });

    it("TC-BE-REQ-09: department=water filters by water categories", async () => {
      const res = await fetch(`${TEST_BASE_URL}/api/requests?department=water`);
      const body = await res.json();
      const allowedCategories = ["water_leak", "blocked_drain"];
      expect(
        body.every((r: { category: string }) => allowedCategories.includes(r.category)),
      ).toBe(true);
    });
  });

  // ---------------------------------------------------------------------------
  // GET /api/requests/:id
  // ---------------------------------------------------------------------------
  describe("GET /api/requests/:id", () => {
    let existingId: string;

    beforeAll(async () => {
      const payload = validReportPayload({ reporterDeviceId: "test-device-get-01" });
      const res = await fetch(`${TEST_BASE_URL}/api/requests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = await res.json();
      existingId = body.id;
    });

    it("TC-BE-REQ-10: returns full report with history", async () => {
      const res = await fetch(`${TEST_BASE_URL}/api/requests/${existingId}`);
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.id).toBe(existingId);
      expect(Array.isArray(body.history)).toBe(true);
      expect(body.history.length).toBeGreaterThan(0);
    });

    it("TC-BE-REQ-11 (negative): unknown ID returns 404", async () => {
      const res = await fetch(`${TEST_BASE_URL}/api/requests/00000000-0000-0000-0000-000000000000`);
      expect(res.status).toBe(404);
    });

    it("TC-BE-REQ-12 (negative): malformed UUID returns 500 or 404", async () => {
      const res = await fetch(`${TEST_BASE_URL}/api/requests/not-a-uuid`);
      expect([404, 500]).toContain(res.status);
    });
    
  });
      // ---------------------------------------------------------------------------
  // FR-08: Citizen Request History
  // ---------------------------------------------------------------------------
  describe("FR-08: Citizen History", () => {
    it("TC-BE-REQ-13: can filter requests by reporterDeviceId", async () => {
      const deviceId = "test-device-history-01";
      const payload = validReportPayload({ reporterDeviceId: deviceId });
      await fetch(`${TEST_BASE_URL}/api/requests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      // The API uses q= for free-text, but the frontend filters by deviceId locally.
      // We test that the list endpoint returns the report with the deviceId.
      const res = await fetch(`${TEST_BASE_URL}/api/requests?q=${payload.trackingNumber}`);
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.length).toBe(1);
      expect(body[0].reporterDeviceId).toBe(deviceId);
    });
  });

  // ---------------------------------------------------------------------------
  // FR-09: Staff Search/Filter
  // ---------------------------------------------------------------------------
  describe("FR-09: Staff Search and Filter", () => {
    it("TC-BE-REQ-14: can filter by multiple criteria (status + category)", async () => {
      const payload = validReportPayload({
        reporterDeviceId: "test-device-search-01",
        category: "pothole",
        status: "submitted",
      });
      await fetch(`${TEST_BASE_URL}/api/requests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      // Filter by category=pothole AND status=submitted
      const res = await fetch(`${TEST_BASE_URL}/api/requests?category=pothole&status=submitted`);
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.every((r: any) => r.category === "pothole" && r.status === "submitted")).toBe(true);
    });
  });
});
