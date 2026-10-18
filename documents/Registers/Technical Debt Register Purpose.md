# Technical Debt Register

**Owner:** Davidzo Malapile, Naledi Moeng, Kamohelo Mabena
**Version:** v1.0 (Milestone 3)
**Last Updated:** 2026-10-15

---

## Purpose

This register records known technical compromises, deferred improvements and
accepted limitations that will be inherited by future iterations. Recording
technical debt openly demonstrates engineering maturity — the team
acknowledges what it has chosen not to solve, and why.

A "technical debt" item is:
- A deliberate compromise accepted to meet M3 constraints
- A known limitation deferred to a future iteration
- An alternative approach that was evaluated but not implemented

Technical debt is **not** the same as a defect. Defects are things that don't
work. Technical debt is things that work but could be better.

---

## Priority Scale

| Priority | Meaning | Action Window |
|----------|---------|---------------|
| **High** | Should be addressed in M4 or before production use | Next milestone |
| **Medium** | Address when the related area is next touched | Future milestone |
| **Low** | Acceptable indefinitely; revisit only if circumstances change | No fixed date |

---
## Categories

| Category | Meaning | Example |
|----------|---------|---------|
| **Architecture** | Structural compromise | No read replicas; monolith instead of microservices |
| **Code** | Implementation shortcut | Duplicated logic; hardcoded values |
| **Test** | Missing or weak test coverage | No E2E tests; coverage gaps |
| **Documentation** | Out-of-date or missing docs | API docs incomplete |
| **Operational** | Deployment, monitoring, or config debt | Manual migrations; no log aggregation |
| **Security** | Deferred hardening or auditing | No token denylist; no rate limit on some endpoints |

---

## Summary

| Metric | Count |
|--------|-------|
| Total debt items | 25 |
| High priority | 4 (TD-M3-13, TD-M3-16, TD-M3-21, TD-M3-23) |
| Medium priority | 8 |
| Low priority | 13 |

**Note:** Several technical debt items are cross-referenced (e.g., TD-M3-01 and
TD-M3-15 both reference the outbox pattern). This is intentional: they are
different aspects of the same underlying design choice.

---

## Relationship to Other Registers

| Register | Purpose |
|----------|---------|
| **Defect Register** | Records things that don't work (bugs) |
| **Technical Debt Register** (this file) | Records known compromises accepted for pragmatic reasons |
| **Risk Register** | Records potential future problems that may or may not occur |
| **ADR / Decision Log** | Records why specific decisions were made |

---
## Review Cadence

This register is reviewed:

- At each milestone boundary
- When a related area is modified
- When a debt item becomes a risk
- When the team identifies new compromises
