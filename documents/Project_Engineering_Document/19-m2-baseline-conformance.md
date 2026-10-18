# 19 - M2 Baseline Conformance

> **M3 Addition - PED v3.0**


## Purpose





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
