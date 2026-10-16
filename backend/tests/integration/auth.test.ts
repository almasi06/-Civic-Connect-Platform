// =============================================================================
// Auth integration tests. Covers FR-04 (RBAC), FR-12 (auth).
//
// Requires: server running on http://localhost:4000
// =============================================================================
import { describe, it, expect, beforeAll } from "vitest";
import { TEST_BASE_URL } from "../fixtures/helpers";

describe("Auth API", () => {
  beforeAll(async () => {
    const res = await fetch(`${TEST_BASE_URL}/health`);
    if (!res.ok) {
      throw new Error(
        `Server not reachable at ${TEST_BASE_URL}. Start it with: npm run dev`,
      );
    }
  });

  // ---------------------------------------------------------------------------
  // POST /api/auth/login
  // ---------------------------------------------------------------------------
  describe("POST /api/auth/login", () => {
    it("TC-BE-AUTH-01: valid credentials return a JWT token", async () => {
      const res = await fetch(`${TEST_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "admin@tshwane.gov.za",
          password: "admin1234",
        }),
      });

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body).toHaveProperty("token");
      expect(body.token).toMatch(/^eyJ/);
      expect(body.email).toBe("admin@tshwane.gov.za");
      expect(body.role).toBe("admin");
      expect(body.id).toBeDefined();
    });

    it("TC-BE-AUTH-02 (negative): wrong password returns 401", async () => {
      const res = await fetch(`${TEST_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "admin@tshwane.gov.za",
          password: "wrong",
        }),
      });

      expect(res.status).toBe(401);
    });

    it("TC-BE-AUTH-03 (negative): unknown email returns 401", async () => {
      const res = await fetch(`${TEST_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "nobody@tshwane.gov.za",
          password: "whatever",
        }),
      });

      expect(res.status).toBe(401);
    });

    it("TC-BE-AUTH-04 (negative): missing fields returns 400", async () => {
      const res = await fetch(`${TEST_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "admin@tshwane.gov.za" }),
      });

      expect(res.status).toBe(400);
    });

    it("TC-BE-AUTH-05 (negative): invalid email format returns 400", async () => {
      const res = await fetch(`${TEST_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "not-an-email", password: "x" }),
      });

      expect(res.status).toBe(400);
    });
  });

  // ---------------------------------------------------------------------------
  // GET /api/auth/me
  // ---------------------------------------------------------------------------
  describe("GET /api/auth/me", () => {
    let token: string;

    beforeAll(async () => {
      const res = await fetch(`${TEST_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "admin@tshwane.gov.za",
          password: "admin1234",
        }),
      });
      const body = await res.json();
      token = body.token;
    });

    it("TC-BE-AUTH-06: with valid token returns current user", async () => {
      const res = await fetch(`${TEST_BASE_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.email).toBe("admin@tshwane.gov.za");
      expect(body.role).toBe("admin");
      expect(body).not.toHaveProperty("password_hash");
    });

    it("TC-BE-AUTH-07 (negative): no token returns 401", async () => {
      const res = await fetch(`${TEST_BASE_URL}/api/auth/me`);
      expect(res.status).toBe(401);
    });

    it("TC-BE-AUTH-08 (negative): malformed token returns 401", async () => {
      const res = await fetch(`${TEST_BASE_URL}/api/auth/me`, {
        headers: { Authorization: "Bearer garbage-token" },
      });
      expect(res.status).toBe(401);
    });

    it("TC-BE-AUTH-09 (negative): token without Bearer prefix returns 401", async () => {
      const res = await fetch(`${TEST_BASE_URL}/api/auth/me`, {
        headers: { Authorization: token },
      });
      expect(res.status).toBe(401);
    });
  });

  // ---------------------------------------------------------------------------
  // POST /api/auth/logout
  // ---------------------------------------------------------------------------
  describe("POST /api/auth/logout", () => {
    it("TC-BE-AUTH-10: returns 204 (JWT is stateless)", async () => {
      const res = await fetch(`${TEST_BASE_URL}/api/auth/logout`, {
        method: "POST",
      });
      expect(res.status).toBe(204);
    });
  });
});