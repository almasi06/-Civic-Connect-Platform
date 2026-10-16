# Technical Debt Register

Tracks deferred compromises, shortcuts, and known maintainability concerns accepted during M3.

## Technical Debt Table

| ID | Item | Category | Reason for deferral | Future consequence | Trigger for action | Priority |
|---|---|---|---|---|---|---|
| TD-M3-10 | Migrations run manually via Supabase SQL Editor; no automated migration tool | Operational | Prisma was replaced by `pg` (Change M3-01); no time to adopt node-pg-migrate | Schema drift risk; slower changes | Before M4 schema evolution |  P1 |
| TD-M3-11 | No automated backup verification | Operational | Free-tier Supabase manages backups; verification tooling deferred | Recovery relies on Supabase guarantees | Before production deployment | P2 |
| TD-M3-12 | Connection pool size not tuned for load (max: 10) | Architecture | Current load doesn't exceed pool | May need adjustment for concurrent users | When load test shows contention | P2 |
| TD-M3-13 | `request_workers` table exists but is never populated; assignment stored in `requests.assigned_to` | Architecture | Original schema design vs. implementation divergence | Data-model inconsistency; confusing for maintainers | Before M4 | P1 |
| TD-M3-14 | No refresh token mechanism JWT expires after 8 hours | Security | Acceptable for MVP | Users must re-authenticate | If usage data shows frequent drops | P2 |
| TD-M3-15 | No cache layer for reporting queries | Architecture | No measured performance issue | Reporting may slow as data grows | Response time p95 > 1s | P3 |
| TD-M3-16 | Duplicate `loginAsAdmin` calls across test files (no token cache) | Test | Tests run sequentially; caching not needed yet | Slower tests if suite grows | If tests exceed 3 min | P3 |

## Categories

| Category | Meaning |
|---|---|
| Architecture | Structural compromise |
| Code | Shortcut in implementation |
| Test | Missing or weak test coverage |
| Documentation | Out-of-date or missing docs |
| Operational | Deployment, monitoring, or config debt |
| Security | Deferred hardening or auditing |

## Priority for Payoff

- **P1** - Should be addressed in the next milestone (M4)
- **P2** - Should be addressed within 2 milestones
- **P3** - Acceptable long-term; revisit if triggered

## Relationship to Defects

- **Defects** are broken behaviour -> tracked in `defect-register.md`
- **Technical debt** is accepted compromise -> tracked here
- A defect that is "Won't fix" becomes a technical debt entry

## Relationship to Risks

Some technical debt overlaps with risks in `../Project_Engineering_Document/12-risk-register.md`. Cross-reference where they overlap.