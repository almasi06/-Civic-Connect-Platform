# Deployment Direction


## Current Direction

| Item | Direction |
|---|---|
| Deployment model | Single-region free-tier PaaS |
| Hosting candidates | Render / Railway / Fly.io |
| Database | Managed PostgreSQL 16 (same provider) |
| Environments | Development + staging (production deferred to M3/M4) |
| Configuration | Environment variables; no committed secrets |
| CI | GitHub Actions (build + unit tests blocking; lint/deps warning) |
| Container | Single deployable unit (layered monolith) |

## Compatibility Check Against ASRs

| Selected Decision | Deployment Compatibility |
|---|---|
| Layered monolith (ADR-ARCH-01) | Single container deploy |
| PostgreSQL 16 (ADR-TECH-01) | Managed Postgres available on all candidates  |
| Node 20 LTS | Supported on all candidates  |
| Prisma migrations | Run at deploy time  |
| Workbox PWA | Static assets served from same host  |
| HTTPS/TLS (NFR-03) | Provided by PaaS by default  |
| Stateless app (ASR-06) | Supports horizontal scaling if needed  |

## Known Implications

- **Free-tier limits:** DB size, connection count, build minutes — monitored (RR-005, RR-008)
- **Secrets:** Managed via host env vars; never committed to repository
- **State:** All persistent state in PostgreSQL; app is stateless
- **Networking:** Single public endpoint; DB not publicly exposed
- **Availability:** Free-tier uptime SLAs are limited - consistent with NFR-05 commitment

## Deliberately Deferred Deployment Decisions

| Item | Reason | Evidence needed | Target |
|---|---|---|---|
| Specific host provider | Free-tier terms change over time | Current free-tier comparison matrix | M3 |
| Production environment | M2 out-of-scope per brief Section 11 | M3 release-readiness review | M3 |
| Observability stack | FE-004 | Free-tier monitoring comparison | M3 |
| Multi-region deployment | M2 out-of-scope | Not committed | Not planned |
| Custom authentication provider | M2 out-of-scope | Not committed | Not planned |
| Production-grade observability | M2 out-of-scope | Not committed | M3/M4 |

## Evidence

- ADR-ARCH-01 (single deployable unit)
- ADR-TECH-01 (stack compatibility with free tier)
- M2 brief Section 5.8 (deployment compatibility)
- FE-003 (deployment environment forward engineering)

## Links

- Architecture: [07-architecture.md](07-architecture.md)
- Technology Stack: [08-technology-stack.md](08-technology-stack.md)
- Baseline: [15-baseline.md](15-baseline.md)
