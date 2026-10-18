# 19 - M2 Baseline Conformance

> **M3 Addition - PED v3.0**


## Purpose

Shows which M2 decisions were implemented as planned, and where the implementation differs (or was controlled via change).

## Conformance Table

| M2 Decision | ADR Reference | Implementation Status | Deviation? |
|---|---|---|---|
| Layered monolith + in-process events | ADR-ARCH-01 |  Implemented - `backend/server/{routes,application,middleware,persistence}/` | No |
| PERN stack (Postgres, Express, React, Node) | ADR-TECH-01 |  Implemented - verified in `package.json` | No |
| ACID transactions for status transitions | ADR-PERSIST-01 |  Implemented - `BEGIN/COMMIT/ROLLBACK` in `requestRepository.updateStatus` | No |
| In-process notification event | ADR-INT-01 | Implemented - `eventBus.raise()` post-commit | No |
| Observer pattern for notification fan-out | M2 S10 design decision |  Implemented - `domain/events.ts` | No |
| Factory Method for request categories | M2 S10 design decision |  Implemented- `domain/requestFactory.ts` (frontend) | No |
| Free-tier PaaS hosting | ADR-TECH-01 |  Implemented - Supabase free tier |  Clarified by ADR-TECH-02 |
| ORM: Prisma 5 | ADR-TECH-01 |  **Controlled change** - switched to `pg` driver | See Change M3-01 |
| Database host: unspecified | ADR-TECH-01 |  **Clarified** - Supabase chosen | See Change M3-02 |

## Significant Deviations

### Change M3-01 - Prisma -> `pg` driver

- **Original M2 decision:** Prisma 5 as ORM
- **Implementation evidence:** Team chose raw SQL via `pg` (node-postgres) to keep transaction boundaries visible for M3 evidence of ADR-PERSIST-01, and to reduce dependency footprint on free tier
- **Revised decision:** All database access uses `pg` with parameterised SQL
- **Consequence:** Manual migrations for M3; automated migration tooling deferred (TD-M3-10)
- **Full record:** `20-controlled-changes.md` S Change M3-01

### Change M3-02 - Supabase as PostgreSQL host

- **Original M2 decision:** PostgreSQL selected, host unspecified
- **Implementation evidence:** Needed permanent free tier + IPv4 compatibility + shared team access
- **Revised decision:** Supabase (managed PostgreSQL 16)
- **Consequence:** No code-level vendor lock-in (standard Postgres)
- **Full record:** `20-controlled-changes.md` S Change M3-02

## Minor Deviations (No ADR Required)

- **Rate limiter environment-aware** - `NODE_ENV=test` and `DISABLE_RATE_LIMIT=1` bypass rate limiting to unblock automated tests. The production behaviour (10 requests / 15 min) is unchanged.
- **Audit history column names** - `by_name` used instead of `by` in the DB; `hydrate()` maps back to the API contract.

## Verification of Conformance

| ADR | File |
|---|---|
| ADR-ARCH-01 | `documents/Architecture_Decision_Record/ADR-ARCH-01-layered-monolith.md` |
| ADR-TECH-01 | `documents/Architecture_Decision_Record/ADR-TECH-01-pern-stack.md` |
| ADR-TECH-02 | `documents/Architecture_Decision_Record/ADR-TECH-02-supabase-postgres-hosting.md`  |
| ADR-PERSIST-01 | `documents/Architecture_Decision_Record/ADR-PERSIST-01-transactional-transitions.md` |
| ADR-INT-01 | `documents/Architecture_Decision_Record/ADR-INT-01-notification-integration.md` |

## Links

- Controlled changes: `20-controlled-changes.md`
- CI verification: `22-ci-automated-verification.md`
- Defects: `26-defects-quality.md`
