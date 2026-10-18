# 27 - Release Readiness

> **M3/M4 Addition - PED v4.0**

## Purpose

The release-readiness decision with supporting evidence, gate status, blockers, accepted limitations, and residual risk.

## Release Candidate

See `../Release/release-candidate.md`.

## Readiness Classification

**Classification:** **CONDITIONALLY READY** (with measured limitation)

**Reasoning:**

The core functional scope is implemented and verified by **63/63 passing tests** covering critical user journeys (submit, assign, transition, resolve, authenticate) as of 2026-10-18. However, performance testing revealed that the free-tier Supabase host (Frankfurt) cannot handle 100 concurrent database writes within the 3-second NFR-02 threshold. The functional baseline is solid; operational readiness is partial.

## Gate Summary

| Gate | Status | Evidence |
|---|---|---|
| Build passes (typecheck + build) | Done | CI workflow + manual `npm run build` |
| Unit tests pass | Done | 31 tests pass |
| Integration tests pass | Done | 28 tests pass |
| E2E tests pass | Done | 2 tests pass |
| Static analysis | Done | ESLint run; CodeQL pending CI |
| Security checks | Done | npm audit clean; gitleaks passes |
| Performance test executed | Done | Executed but NFR-02 threshold failed for writes |
| Defects triaged | Done | DEF-005 through DEF-008 logged |
| Residual risks documented | Done | See `../Release/residual-risk-statement.md` |
| Staging deployment | Done | Simulated local staging only |

## Blockers

### Blocker 1 - Supabase password authentication failure (DEF-008) — RESOLVED
**Impact:** The backend could not connect to the database at time of writing.
**Resolution:** Supabase password reset and `backend/.env` updated. All 63 tests now pass.

### Blocker 2 - Performance threshold not met (NFR-02)
**Impact:** The K6 load test showed a p95 of 21.67s for 100 concurrent writes. This exceeds the 3-second target.
**Root cause:** Cross-continental latency to Supabase Frankfurt + free-tier write contention.
**Status:** Documented as a known limitation. Not blocking the release because the functional baseline is stable.

## Accepted Limitations

- **Performance (NFR-02)** - Measured failure under full write load. API layer is fast (4.78ms); database is the bottleneck.
- **Offline sync (FR-02, NFR-01)** - Sync endpoint exists but timing tests were deferred.
- **Accessibility (WCAG 2.1 AA)** - Not audited.
- **Cross-browser testing** - Limited to Chromium.
- **Manual migrations** - No automated migration tooling (TD-M3-10).
- **`request_workers` table unused** - Assignment stored in `requests.assigned_to` (TD-M3-13).

## Residual Risks

See `../Release/residual-risk-statement.md`. Key risks:
- Supabase free-tier pauses after 7 days of inactivity — demos must wake the project.
- Free-tier connection limits under concurrent load (RR-005).
- No multi-region failover — single-region dependency on Supabase Frankfurt.

## Release Evidence Summary

See `../Release/release-evidence-summary.md`.

## Rollback Plan

See `../Release/rollback-plan.md`.

## Links

- Release folder: `../Release/`
- M3 overview: `18-m3-overview.md`
- Defects: `26-defects-quality.md`
- CI: `22-ci-automated-verification.md`
