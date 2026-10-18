# 27 - Release Readiness

> **M3 Addition - PED v3.0**


## Purpose

The release-readiness decision with supporting evidence, gate status, blockers, accepted limitations, and residual risk.

## Release Candidate

See `../Release/release-candidate.md`.

## Readiness Classification

**Classification:**  **CONDITIONALLY READY**

**Reasoning:**

The core functional scope is implemented and verified by 60+ passing tests covering the critical user journeys (submit, assign, transition, resolve, authenticate). However, two infrastructure-level blockers remain (Supabase password rotation, staging deployment), and the performance test was not executed before submission. The functional baseline is solid; operational readiness is partial.

## Gate Summary

| Gate | Status | Evidence |
|---|---|---|
| Build passes (typecheck + build) |  | CI workflow + manual `npm run build` |
| Unit tests pass |  | 31 tests pass |
| Integration tests pass |  | 28 tests pass |
| E2E tests pass |  | 1 of 2 currently passing; TC-E2E-02 blocked by DB |
| Static analysis |  | ESLint run; CodeQL pending CI |
| Security checks |  | npm audit clean; gitleaks passes |
| Performance test executed |  | Placeholder only |
| Defects triaged |  | DEF-005 through DEF-008 logged |
| Residual risks documented |  | See `../Release/residual-risk-statement.md` |
| Staging deployment |  | Not yet deployed |

## Blockers

### Blocker 1 - Supabase password authentication failure (DEF-008)

**Impact:** The backend cannot connect to the database at time of writing. This blocks E2E tests and prevents staging deployment.

**Resolution:** Reset the Supabase database password in the Supabase dashboard; update `backend/.env`; restart backend. 10-minute fix.

**Status:** In progress.

### Blocker 2 - Staging deployment not completed

**Impact:** M3 S14 requires a staging environment for demonstration.

**Resolution:** Deploy to Render/Railway free tier after Blocker 1 is resolved.

**Status:** Not started.

## Accepted Limitations

- **Performance test not executed** - script exists; results pending. Documented as in-development in `25-performance-reliability.md`.
- **Offline sync (FR-02, NFR-01) not fully tested** - the sync endpoint exists but timing tests were deferred.
- **Accessibility (WCAG 2.1 AA)** - not audited.
- **Cross-browser testing** - limited to Chromium.
- **Manual migrations** - no automated migration tooling (TD-M3-10).
- **`request_workers` table unused** - assignment stored in `requests.assigned_to` (TD-M3-XX).

## Residual Risks

See `../Release/residual-risk-statement.md`. Key risks:

- Supabase free-tier pauses after 7 days of inactivity demos must wake the project
- Free-tier connection limits under concurrent load (RR-005)
- No multi-region failover — single-region dependency on Supabase Frankfurt

## Release Evidence Summary

See `../Release/release-evidence-summary.md`.

## Rollback Plan

See `../Release/rollback-plan.md`.


## Links

- Release folder: `../Release/`
- M3 overview: `18-m3-overview.md`
- Defects: `26-defects-quality.md`
- CI: `22-ci-automated-verification.md`