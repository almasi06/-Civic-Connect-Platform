# Technical Debt Register

**Owner:** Member 3 (coordinator); all members contribute
**Version:** v1.0 (M3)
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

## Technical Debt Items

| Debt ID | Description | Rationale | Consequence | Target Resolution | Owner | Priority |
|---------|-------------|-----------|-------------|-------------------|-------|----------|
| TD-M3-01 | Event delivery is at-most-once (in-process `eventBus`). No outbox pattern. | Acceptable for M3 demonstration; implemented as documented in ADR-INT-01 | If Node.js process crashes between `COMMIT` and event handler, `StatusChanged` events are lost; notifications not sent | Implement Transactional Outbox pattern (ADR-INT-01 §3.2) | Backend | Medium |
| TD-M3-02 | No saga-based recovery for partial failures across future services | Not applicable — layered monolith has no cross-service transactions | None at current scale | Revisit only if architecture evolves to microservices | Backend | Low |
| TD-M3-03 | No automated test for outbox pattern | Outbox pattern not yet implemented | Once adopted, need test coverage for at-least-once delivery | Add integration test when pattern is adopted | Backend | Low |
| TD-M3-04 | In-process events are at-most-once within process lifetime | Acceptable for M3 demonstration | See TD-M3-01 | Adopt Transactional Outbox pattern | Backend | Medium |
| TD-M3-05 | No external event observability (no metrics, no tracing on observer execution) | Team size and M3 scope | Hard to diagnose observer failures in production | Add metrics/tracing when notification volume increases | Backend | Low |
| TD-M3-06 | No dead-letter queue for failed notification persistence | No queue exists yet | Failed notifications are logged but not retried | Coupled with Outbox adoption (TD-M3-01) | Backend | Low |
| TD-M3-07 | No observability on observer execution time | Team size and M3 scope | Cannot measure observer performance impact | Add timing instrumentation when >2 observers in production | Backend | Low |
| TD-M3-08 | No retry logic for observer failures | Simpler for M3; failures are logged | Transient observer failures are not retried | Coupled with Outbox adoption | Backend | Low |
| TD-M3-09 | Category-to-factory registry is a plain object; no compile-time completeness check | Simpler for M3 implementation | Adding a new category could forget to register it, causing runtime failure | Add exhaustive `Record<Category, Factory>` type check | Backend | Low |
| TD-M3-10 | Database migrations run manually via Supabase SQL Editor; no automated migration tool | Team of 3 students; M3 timeline; no Prisma/ORM adopted | Schema changes risk drift between dev and staging; harder to reproduce environment | Adopt `node-pg-migrate` or Prisma Migrate | Backend | Medium |
| TD-M3-11 | No automated backup verification for Supabase database | Free-tier provides automatic backups but no restore drill executed | Unknown recovery time if data loss occurs; untested DR path | Execute restore drill before M4 if promoted to production | Backend | Low |
| TD-M3-12 | Connection pool size not tuned for concurrent load; default of 10 may be insufficient at scale | Current load (100 concurrent users per NFR-02) is within limits, but no load testing has validated it | Potential connection pool exhaustion under sustained load | Run load test with 100 concurrent users; tune pool size | Backend | Medium |
| TD-M3-13 | Photos stored as base64 in `requests.photo` TEXT column instead of object storage | Simpler for M3; no additional infrastructure (S3/Supabase Storage) needed | Database bloat; 33% storage overhead vs binary; slower queries; not scalable beyond a few thousand reports | Adopt Supabase Storage or S3; save only the URL in the DB | Backend | High |
| TD-M3-14 | Frontend `list()` reads from localStorage cache, not directly from API; `refresh()` must be triggered separately | Offline-first PWA design from M2 architecture | Stale data possible if `refresh()` not triggered; localStorage quota limits scale | Adopt React Query with staleTime + cache invalidation | Frontend | Medium |
| TD-M3-15 | No outbox pattern for `StatusChanged` events (same as TD-M3-01, cross-referenced for clarity) | Same as TD-M3-01 | Same as TD-M3-01 | Same as TD-M3-01 | Backend | Medium |
| TD-M3-16 | Migrations run against production Supabase from local machine; no CI check ensures migrations are applied in staging first | No CI/CD pipeline yet (Member 3 owns) | Schema drift between environments; inconsistent migration application | Add migration verification step to CI pipeline | Backend + Member 3 | High |
| TD-M3-17 | Rate limiter uses in-memory store; state resets on server restart | Simpler for M3; no external Redis dependency | Rate limit state lost on restart; not suitable for multi-instance deployment | Adopt Redis-backed store when scaling beyond single instance | Backend | Low |
| TD-M3-18 | Logout is client-side only; JWT tokens remain valid until expiry | JWT is stateless; documented in ADR-PERSIST-01 context | If a token is compromised, it remains valid until expiry (8 hours) | Add token denylist table or short-lived tokens with refresh | Backend | Low |
| TD-M3-19 | No separate staging environment; staging is "run locally with production config" | No budget; single Supabase project used for both dev and demo | Cannot test deployment configuration without affecting production data | Create a staging branch of Supabase project with separate data | Team | Medium |
| TD-M3-20 | Frontend has no retry logic for failed API calls | Simpler for M3 | Transient network failures result in error to user; user must retry manually | Add exponential backoff retry in `api-client.ts` | Frontend | Low |
| TD-M3-21 | No formal frontend testing (no Vitest tests for React components) | Frontend was Member 1's responsibility; M3 timeline | Regressions in UI are not caught by automated tests | Add Vitest + Testing Library tests for critical components | Frontend | High |
| TD-M3-22 | Base64 photos exceed 4 MB are rejected by `express.json` limit | Backend `limit: "4mb"` sized for typical compressed photo | Very high-resolution photos fail to upload | Increase limit or implement chunked upload / direct-to-storage upload | Backend | Low |

---

## Summary

| Metric | Count |
|--------|-------|
| Total debt items | 22 |
| High priority | 3 (TD-M3-13, TD-M3-16, TD-M3-21) |
| Medium priority | 6 |
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

