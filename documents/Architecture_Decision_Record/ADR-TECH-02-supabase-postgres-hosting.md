# ADR-TECH-02: Supabase as PostgreSQL Host

- **Status:** Accepted
- **Deciders:** Davidzo Malapile, Naledi Moeng, Kamohelo Mabena

---

## Context

ADR-TECH-01 selected PostgreSQL as the persistence technology for CivicConnect. The
remaining decision was: **where should the PostgreSQL instance be hosted?**

Constraints from the M1/M2 baseline:
- **No budget** (Cost Constraint 2) — must fit within a free tier.
- **Team of 3 students** (Cost Constraint 1) — no dedicated DBA; minimize operational overhead.
- **Fixed timeline** (Schedule Constraint 1) — setup must be quick.
- **Layered monolith** (ADR-ARCH-01) — a single Postgres instance is sufficient.
- **IPv4 network compatibility** — student networks may not support IPv6.

Considered hosts: Supabase, Render, Railway, self-hosted PostgreSQL.

---

## Decision

CivicConnect will use **Supabase** as the managed PostgreSQL host.

The Express backend connects to Supabase via a standard PostgreSQL connection string
using the **Session Pooler** endpoint (IPv4-compatible, port 5432). The frontend never
talks to Supabase directly — all traffic flows through the Express API.

---

## Rationale

Supabase provides a managed PostgreSQL instance on a permanent free tier, with a
dashboard for schema inspection, automatic backups, and no IPv6 requirement (Session
Pooler). It aligns with the free-tier constraint and requires no server administration
by the team.

Critically, Supabase **is PostgreSQL** — not a proprietary fork. The schema, migrations,
SQL queries, and constraints are identical to any other PostgreSQL 16 host. There is no
vendor lock-in at the code level; migrating to another host later would only require
changing `DATABASE_URL`.

---

## Alternatives Considered

| Host | Free Tier | Notes | Rejected Because |
|------|-----------|-------|------------------|
| **Supabase (selected)** | Permanent free tier; pauses after 7 days inactivity (recoverable) | Managed PostgreSQL 16; IPv4 via Session Pooler; dashboard; backups | — |
| **Render** | Free PostgreSQL **expires 30 days after creation** | Data deleted after 30-day grace period | Expiry would break M3 and post-M3 demonstration |
| **Railway** | Trial plan; 500 hours/month; time-limited | Requires monitoring to stay within limits | Trial expiry creates schedule risk |
| **Self-hosted (local)** | Free | Full control | No shared access for 3-person team; not reachable from staging |
| **AWS RDS / Azure** | Paid only | Production-grade | No free tier; violates Cost Constraint 2 |

### Decision Matrix

Scoring relative to the baseline (self-hosted local PostgreSQL):
- `0` = equivalent
- `+1` / `+2` = better
- `-1` / `-2` = worse

| Criterion | Weight | Baseline: Self-Hosted | Supabase (Selected) | Render | Railway |
|-----------|--------|----------------------|---------------------|--------|---------|
| Free-tier permanence | High | +1 | **+2** | −2 (30-day expiry) | −1 (trial) |
| Team shared access | High | −2 | **+2** | +2 | +2 |
| Operational overhead | High | −2 | **+2** (managed) | +1 | +1 |
| IPv4 compatibility | Medium | +2 | **+1** (via Session Pooler) | +2 | +2 |
| Staging reachable | High | −2 | **+2** | +2 | +2 |
| Vendor lock-in | Medium | +2 | **+1** (standard Postgres) | +1 | +1 |
| Backup / recovery | Medium | −1 | **+1** (automatic) | +1 | +1 |
| Setup time | Medium | −1 | **+2** (minutes) | +2 | +2 |
| Alignment with M2 stack | High | −1 | **+1** | +1 | +1 |
| **Total** | | **−4** | **+14** | **+10** | **+9** |

**Interpretation:** Supabase wins on the two criteria that mattered most in this project —
free-tier permanence and shared team access — while remaining 100% PostgreSQL at the code
level. Render's free tier is disqualified by the 30-day expiry. Railway is disqualified
by time limits. Self-hosted lacks shared access.

---

## Why Not Self-Hosted PostgreSQL?

Self-hosting PostgreSQL locally would require:
- Every team member to run their own database → no shared data
- Manual setup of TLS, backups, and user management
- No way for the staging environment to reach it
- No persistent storage across team member machines
For a 3-person distributed team working on a shared repo, self-hosted is not viable.

---

## Why Not Render or Railway?

**Render:** Render's free PostgreSQL **expires 30 days after creation**, with data deleted
after a grace period. This would break M3 demonstration and any post-M3 work.

**Railway:** Railway's free tier is time-limited (500 hours/month). Sustained use would
exceed the limit or require payment.

Supabase's free tier is **permanent** — it pauses after 7 days of inactivity but the
data is preserved and the project can be resumed.

---

## The Critical Clarification: Supabase Is Just PostgreSQL

A common misunderstanding is that Supabase is a proprietary database. It is not.

| Question | Answer |
|----------|--------|
| What database engine does Supabase run? | **Standard PostgreSQL 16** |
| Can you connect with `psql`, `pg`, Prisma, Drizzle? | Yes — standard PostgreSQL drivers |
| Can you write raw SQL? | Yes |
| Does Supabase lock you into proprietary APIs? | No — the database is standard PostgreSQL |
| Can you migrate to another host later? | Yes — change `DATABASE_URL`, restore a `pg_dump` |

The frontend never talks to Supabase directly. All traffic flows through the Express API
using `pg` (the standard Node.js PostgreSQL driver). **The code is portable.**

---

## Consequences

### Positive

- Permanent free tier (no time limit).
- Shared team access to a single PostgreSQL instance.
- Automatic backups via Supabase dashboard.
- No operational overhead (no server administration).
- Session Pooler provides IPv4 compatibility for South African networks.
- Standard PostgreSQL — no code-level lock-in.

### Negative

- Free tier pauses after 7 days of inactivity — must wake the project before demos.
- Session Pooler has a connection limit (fine for 3-user team, no scaling headroom).
- Supabase's free-tier dashboard is shared with other projects (no dedicated instance).
- Live SQL dashboard access requires dashboard login (not CLI-only).

---

## Implementation

| Aspect | Detail |
|--------|--------|
| Connection string | `postgresql://postgres.[REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres` |
| Connection pool | `backend/server/db.ts` — `pg.Pool` with `max: 10` |
| SSL | `ssl: { rejectUnauthorized: false }` (Supabase requires SSL) |
| Environment variable | `DATABASE_URL` in `backend/.env` (not committed) |
| Template | `backend/.env.example` (committed, placeholder only) |
| Schema migrations | Run manually via Supabase SQL Editor for M3; migrate script planned |

---

## Authoritative References

| # | Source | Relevance |
|---|--------|-----------|
| 1 | Supabase documentation — https://supabase.com/docs | Official hosting reference |
| 2 | PostgreSQL 16 Documentation | Confirms standard SQL semantics |
| 3 | Supabase pricing — https://supabase.com/pricing | Free tier details |
| 4 | Render pricing | Justifies rejection (30-day expiry) |
| 5 | Railway pricing | Justifies rejection (trial limits) |
| 6 | `pg` Node.js driver — https://node-postgres.com | Confirms standard driver compatibility |

---

## Traceability to Requirements

| Requirement | Nature of Link |
|-------------|----------------|
| All FRs | Persistence backend for every feature |
| NFR-01 | Sync performance depends on DB latency |
| NFR-03 | HTTPS/TLS enforced by Supabase connection |
| NFR-05 | Uptime depends on Supabase availability (free tier) |
| Cost Constraint 2 | Free tier satisfies no-budget requirement |
| Technology Constraint 1 | Low-bandwidth: connection pool configured for efficiency |

---

## Traceability to Assessment Areas

| M3 Area | How This ADR Contributes |
|---------|--------------------------|
| A. Controlled Implementation & M2 Conformance | Confirms M2 stack decision is implemented; hosting clarified |
| B. Collaborative Construction | Decision recorded as ADR |
| C. Automated Verification & CI | CI must connect to Supabase test project |
| F. Performance & Release Readiness | Free-tier limits documented |
| G. Release-Quality Review | Supabase availability dependency documented as residual risk |

---

## Verification Evidence Plan

| Evidence ID | Description | Type |
|-------------|-------------|------|
| TC-BE-23 | `db.ts` connects to Supabase over TLS; `/health` returns `"db":"connected"` | Integration |
| TC-BE-24 | Backend rejects non-TLS connection attempts (SSL required by Supabase) | Negative |
| TC-BE-25 | Every persistence operation in the app uses the shared `pool` from `db.ts` | Code review + unit |

---

## Residual Risk

| Risk ID | Description | Probability | Impact | Mitigation |
|---------|-------------|-------------|--------|------------|
| RR-M3-12 | Supabase free tier pauses after 7 days of inactivity; demo would fail if not woken | Medium | Low | Wake project before each demo; document wake procedure in README |
| RR-M3-13 | Supabase free tier has connection limits; concurrent connections could exhaust pool | Low | Medium | `max: 10` in pool; monitor connection usage |
| RR-M3-14 | Supabase outage would affect all persistence operations | Very Low | High | Not mitigated within M3 scope; documented as external dependency |

---

## Technical Debt

| Debt ID | Description | Target |
|---------|-------------|--------|
| TD-M3-10 | Migrations run manually via Supabase SQL Editor; no automated migration tool | Adopt Prisma Migrate or node-pg-migrate post-M3 |
| TD-M3-11 | No automated backup verification | Add post-M3 |
| TD-M3-12 | Connection pool size not tuned for load | Tune when performance evidence requires |

---

## 16. Related Architecture Views

- [Deployment view](../Architecture/deployment-view.md) — shows Supabase as the persistence tier
- [Logical architecture](../Architecture/logical-architecture-view.md) — persistence boundary
- [Runtime view](../Architecture/runtime-view.md) — shows DB transaction flow

---

