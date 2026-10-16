// =============================================================================
// Unit tests for the workflow state machine.
// Pure logic — no DB, no HTTP.
//
// Covers: FR-04 (status transitions), RBAC role rules.
// =============================================================================
import { describe, it, expect } from "vitest";
import { ALLOWED, ROLE_CAN, isValidTransition, canRoleTransition } from "../../server/domain/workflow";
import type { Status, Role } from "../../server/types";

describe("Workflow state machine", () => {
  // ---------------------------------------------------------------------------
  // ALLOWED transitions
  // ---------------------------------------------------------------------------
  describe("ALLOWED transitions", () => {
    it("TC-BE-WF-01: submitted → assigned is allowed", () => {
      expect(isValidTransition("submitted", "assigned")).toBe(true);
    });

    it("TC-BE-WF-02: submitted → in_progress is allowed", () => {
      expect(isValidTransition("submitted", "in_progress")).toBe(true);
    });

    it("TC-BE-WF-03: submitted → rejected is allowed", () => {
      expect(isValidTransition("submitted", "rejected")).toBe(true);
    });

    it("TC-BE-WF-04: assigned → in_progress is allowed", () => {
      expect(isValidTransition("assigned", "in_progress")).toBe(true);
    });

    it("TC-BE-WF-05: in_progress → resolved is allowed", () => {
      expect(isValidTransition("in_progress", "resolved")).toBe(true);
    });

    it("TC-BE-WF-06: in_progress → rejected is allowed", () => {
      expect(isValidTransition("in_progress", "rejected")).toBe(true);
    });
  });

  // ---------------------------------------------------------------------------
  // INVALID transitions
  // ---------------------------------------------------------------------------
  describe("INVALID transitions", () => {
    it("TC-BE-WF-07 (negative): resolved → anything is blocked", () => {
      expect(isValidTransition("resolved", "submitted")).toBe(false);
      expect(isValidTransition("resolved", "assigned")).toBe(false);
      expect(isValidTransition("resolved", "in_progress")).toBe(false);
      expect(isValidTransition("resolved", "rejected")).toBe(false);
    });

    it("TC-BE-WF-08 (negative): rejected → anything is blocked", () => {
      expect(isValidTransition("rejected", "submitted")).toBe(false);
      expect(isValidTransition("rejected", "assigned")).toBe(false);
      expect(isValidTransition("rejected", "in_progress")).toBe(false);
      expect(isValidTransition("rejected", "resolved")).toBe(false);
    });

    it("TC-BE-WF-09 (negative): submitted → resolved skips required steps", () => {
      expect(isValidTransition("submitted", "resolved")).toBe(false);
    });

    it("TC-BE-WF-10 (negative): assigned → resolved skips in_progress", () => {
      expect(isValidTransition("assigned", "resolved")).toBe(false);
    });
  });

  // ---------------------------------------------------------------------------
  // Role permissions
  // ---------------------------------------------------------------------------
  describe("ROLE_CAN permissions", () => {
    it("TC-BE-WF-11: admin can transition to assigned and rejected", () => {
      expect(canRoleTransition("admin", "assigned")).toBe(true);
      expect(canRoleTransition("admin", "rejected")).toBe(true);
    });

    it("TC-BE-WF-12: admin cannot transition to in_progress or resolved", () => {
      expect(canRoleTransition("admin", "in_progress")).toBe(false);
      expect(canRoleTransition("admin", "resolved")).toBe(false);
    });

    it("TC-BE-WF-13: field_worker can transition to in_progress and resolved", () => {
      expect(canRoleTransition("field_worker", "in_progress")).toBe(true);
      expect(canRoleTransition("field_worker", "resolved")).toBe(true);
    });

    it("TC-BE-WF-14 (negative): field_worker cannot transition to assigned or rejected", () => {
      expect(canRoleTransition("field_worker", "assigned")).toBe(false);
      expect(canRoleTransition("field_worker", "rejected")).toBe(false);
    });
  });

  // ---------------------------------------------------------------------------
  // Combined: role + transition
  // ---------------------------------------------------------------------------
  describe("Combined role + transition rules", () => {
    it("TC-BE-WF-15: admin can assign a submitted report", () => {
      const from: Status = "submitted";
      const to: Status = "assigned";
      const role: Role = "admin";
      expect(isValidTransition(from, to) && canRoleTransition(role, to)).toBe(true);
    });

    it("TC-BE-WF-16: field worker cannot assign — even though the transition is valid", () => {
      const from: Status = "submitted";
      const to: Status = "assigned";
      const role: Role = "field_worker";
      // The transition is valid in the state machine, but the role cannot perform it
      expect(isValidTransition(from, to)).toBe(true);
      expect(canRoleTransition(role, to)).toBe(false);
    });

    it("TC-BE-WF-17: field worker can move an in_progress report to resolved", () => {
      const from: Status = "in_progress";
      const to: Status = "resolved";
      const role: Role = "field_worker";
      expect(isValidTransition(from, to) && canRoleTransition(role, to)).toBe(true);
    });
  });

  // ---------------------------------------------------------------------------
  // Table consistency (defensive)
  // ---------------------------------------------------------------------------
  describe("ALLOWED table consistency", () => {
    it("TC-BE-WF-18: resolved and rejected are terminal states", () => {
      expect(ALLOWED.resolved).toEqual([]);
      expect(ALLOWED.rejected).toEqual([]);
    });

    it("TC-BE-WF-19: every non-terminal status has at least one transition", () => {
      expect(ALLOWED.submitted.length).toBeGreaterThan(0);
      expect(ALLOWED.assigned.length).toBeGreaterThan(0);
      expect(ALLOWED.in_progress.length).toBeGreaterThan(0);
    });

    it("TC-BE-WF-20: admin role has permissions defined for at least one status", () => {
      expect(ROLE_CAN.admin.length).toBeGreaterThan(0);
      expect(ROLE_CAN.field_worker.length).toBeGreaterThan(0);
    });
  });
});