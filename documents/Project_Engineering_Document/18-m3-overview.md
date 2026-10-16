# 18 - M3 Overview

> **M3 Addition PED v3.0**


## Purpose

Identifies the implemented scope, release candidate, and current status of M3 construction.

## Implemented Scope

| Area | Status | Evidence |
|---|---|---|
| Citizen request submission |  Implemented | `POST /api/requests` |
| Admin dashboard - status transitions |  Implemented | `PATCH /api/requests/:id/status` |
| Field worker updates |  Implemented | `POST /api/requests/:id/update`, `POST /api/requests/:id/accept` |
| Status history / audit trail |  Implemented | `request_history` table |
| Authentication (JWT) |  Implemented | `POST /api/auth/login` |
| RBAC (admin / field_worker / citizen) |  Implemented | `ROLE_CAN` in `workflow.ts` |
| Request filtering (search / status / category / department) |  Implemented | `request.repository.list` |
| Rate limiting (login) |  Implemented | `express-rate-limit` in `routes/auth.ts` |
| Health endpoint |  Implemented | `GET /health` |
| Frontend - citizen portal |  Implemented | `frontend/src/` (React + Vite) |
| Frontend  PWA / offline |  Partial | Workbox in place; full sync tested separately |
| Performance load test |  Placeholder only | `tests/performance/load-test.js` |

## Release Candidate

| Field | Value |
|---|---|
| Version | `m3-release-v1.0` (to be tagged) |
| Branch | `m3/member3-ci-testing` -> merges into `Documentation` |
| Date frozen | 2026-10-16 |
| PED version | PED v3.0 |

Full details: `documents/Release/release-candidate.md`

## Current Status

| Category | Status |
|---|---|
| Core backend |  Running - 60 tests passing |
| Core frontend |  Running - Vite dev server verified |
| Database schema |  Supabase Postgres, migrations applied |
| Authentication |  JWT + RBAC verified |
| Tests |  60+ tests across unit / integration / E2E / negative |
| CI pipeline |  Workflow defined; will run on push |
| Staging deployment |  In progress - not yet deployed |

## Key M3 Findings

- **DEF-006** - `isAssignedTo` in `request.repository.ts` was reading the wrong table (`request_workers` instead of `requests.assigned_to`). Fixed during E2E testing.
- **DEF-005** - Rate limiter blocked integration tests during local runs. Fixed by env-driven rate limit toggle.
- **M3-01 controlled change** - Prisma -> `pg` driver (see `20-controlled-changes.md`).
- **M3-02 controlled change** - Supabase as PostgreSQL host (see `20-controlled-changes.md`).

## Links

- M2 baseline: `15-baseline.md`
- Controlled changes: `20-controlled-changes.md`
- CI verification: `22-ci-automated-verification.md`
- Release candidate: `../Release/release-candidate.md`
- Release evidence: `../Release/release-evidence-summary.md`