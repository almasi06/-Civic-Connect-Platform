# Controlled Changes


> **Status:** Living document

## Purpose

This section records significant changes from the M2 baseline that emerged during M3 construction. Each change follows the pattern: **original decision -> implementation evidence/problem -> revised decision -> consequence**.

---

## Conformance Table
Shows which M2 decisions were implemented as planned, and where the implementation differs (or was controlled via change).

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

## Change M3-01: Switch from Prisma ORM to pg driver

- **Approved by:** (pending 2 reviewer PR approval required)
- **Related M2 decision:** [ADR-TECH-01-pern-stack.md](../Architecture_Decision_Record/ADR-TECH-01-pern-stack.md) originally specified Prisma 5
- **Related M3 PR:** (to be linked when PR opens)

### Original decision (M2)

ADR-TECH-01 selected Prisma 5 as the ORM for PostgreSQL, providing type-safe queries and migrations.

### Implementation evidence / problem

When building the backend for M3, the team chose to use raw SQL via the `pg` (node-postgres) driver instead of Prisma for two reasons:

1. **M3 requires visible transaction boundaries.** ADR-PERSIST-01 requires the status-transition operation to be atomic across multiple tables. Using `pg` directly makes the `BEGIN` / `COMMIT` / `ROLLBACK` statements explicit in the codebase which is directly verifiable M3 evidence for ADR-PERSIST-01. Prisma's `$transaction` API hides this from the code.
2. **Lighter dependency footprint.** `pg` is a single well-maintained library; Prisma requires a client binary and migration toolchain. This reduces setup complexity on the free-tier host.

### Revised decision

All database access uses `pg` (node-postgres) with parameterised SQL statements. Migrations are SQL files executed manually via Supabase SQL editor for M3. Automated migration tooling (Prisma Migrate or node-pg-migrate) is deferred to post-M3 (see TD-M3-10).

### Consequence

- ADR-TECH-01 must be updated: "ORM: Prisma 5" -> "Database client: pg (node-postgres)"
- PED section [08-technology-stack.md](08-technology-stack.md) must be updated
- PED section [21-construction-configuration.md](21-construction-configuration.md) reflects the new client
- New technical debt entry TD-M3-10 (manual migrations)
- Verification evidence will include TC-BE-XX tests confirming explicit transaction boundaries

### Related technical debt

- **TD-M3-10** - Migrations run manually via Supabase SQL Editor; no automated migration tool

---

## Change M3-02: Supabase as PostgreSQL host

- **Date:** 2026-10-15
- **Proposed by:** Naledi Moeng
- **Approved by:** (pending 2 reviewer PR approval required)
- **Related M2 decision:** ADR-TECH-01 left the PostgreSQL hosting choice open
- **Related M3 PR:** (to be linked when PR opens)

### Original decision (M2)

ADR-TECH-01 selected PostgreSQL as the persistence engine but did not specify the host.

### Implementation evidence / problem

The team needed a managed PostgreSQL instance that:
- Has a permanent free tier (zero-budget constraint)
- Is IPv4-compatible for South African networks
- Allows shared team access
- Requires no server administration

### Revised decision

Use **Supabase** as the managed PostgreSQL host. Full decision record: [ADR-TECH-02](../Architecture_Decision_Record/ADR-TECH-02-supabase-postgres-hosting.md).

### Consequence

- New ADR (ADR-TECH-02) documents the hosting decision
- New risks: RR-M3-12, RR-M3-13, RR-M3-14
- New technical debt: TD-M3-10, TD-M3-11, TD-M3-12
- No code-level vendor lock-in (standard PostgreSQL 16)

---

## Non-significant changes

*(list minor details that were adjusted without needing a formal ADR add as they arise)*

