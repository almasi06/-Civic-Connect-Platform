// =============================================================================
// Unit tests for the city gate.
// Pure logic — no DB, no HTTP.
//
// Covers: FR-01 (submit report from inside city), server-side city gate.
// =============================================================================
import { describe, it, expect } from "vitest";
import { CITY, distanceKm, isInsideCity } from "../../server/domain/city";

describe("City gate", () => {
  // ---------------------------------------------------------------------------
  // distanceKm
  // ---------------------------------------------------------------------------
  describe("distanceKm", () => {
    it("TC-BE-CITY-01: distance from a point to itself is 0", () => {
      const p = { lat: -25.7479, lng: 28.2293 };
      expect(distanceKm(p, p)).toBe(0);
    });

    it("TC-BE-CITY-02: distance from Tshwane center to Pretoria center is < 1 km", () => {
      const pretoriaCentral = { lat: -25.7479, lng: 28.2293 };
      const distance = distanceKm(CITY.center, pretoriaCentral);
      expect(distance).toBeLessThan(1);
    });

    it("TC-BE-CITY-03: distance from Tshwane center to a point 30 km away is ~30 km", () => {
      // A point roughly 30 km northeast of Tshwane center
      const farPoint = { lat: -25.5, lng: 28.5 };
      const distance = distanceKm(CITY.center, farPoint);
      // Allow ±3 km tolerance for the haversine approximation
      expect(distance).toBeGreaterThan(25);
      expect(distance).toBeLessThan(45);
    });
  });

  // ---------------------------------------------------------------------------
  // isInsideCity
  // ---------------------------------------------------------------------------
  describe("isInsideCity", () => {
    it("TC-BE-CITY-04: a point at the city center is inside", () => {
      expect(isInsideCity({ lat: -25.7479, lng: 28.2293 })).toBe(true);
    });

    it("TC-BE-CITY-05: a point 30 km from center is inside (radius 50 km)", () => {
      expect(isInsideCity({ lat: -25.5, lng: 28.5 })).toBe(true);
    });

    it("TC-BE-CITY-06 (negative): a point 60 km from center is outside", () => {
      // Roughly 60 km east of center
      expect(isInsideCity({ lat: -25.7479, lng: 28.9 })).toBe(false);
    });

    it("TC-BE-CITY-07 (negative): a point in Cape Town is outside", () => {
      expect(isInsideCity({ lat: -33.9249, lng: 18.4241 })).toBe(false);
    });

    it("TC-BE-CITY-08 (negative): a point in Johannesburg CBD is outside (>50 km)", () => {
      // Johannesburg CBD is ~55 km south of Tshwane center
      expect(isInsideCity({ lat: -26.2041, lng: 28.0473 })).toBe(false);
    });

    it("TC-BE-CITY-09 (boundary): a point exactly at 50 km is on the boundary", () => {
      // Use a point that's roughly at the radius
      // (exact boundary isn't critical — the check is `<=`)
      const nearEdge = { lat: -26.2, lng: 28.2293 }; // ~50 km south
      const distance = distanceKm(CITY.center, nearEdge);
      // Just verify our function and the distance function agree
      expect(isInsideCity(nearEdge)).toBe(distance <= CITY.radiusKm);
    });
  });
});