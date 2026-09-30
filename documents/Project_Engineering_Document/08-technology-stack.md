# Technology Stack



> **Linked ADR:** [ADR-TECH-01](../Architecture_Decision_Record/ADR-TECH-01-pern-stack.md)

## Selected Stack

**PERN + TypeScript** - PostgreSQL, Express, React, Node.js.

## Decision Matrix

| Criterion (weight) | MERN | **PERN** | Django + React | Spring Boot + React |
|---|---|---|---|---|
| Team capability (25%) | High | **High** | Medium | Low–Med |
| Free-tier hosting (20%) | Excellent | **Excellent** | Good | Poor |
| Relational integrity / ACID (20%) | Weak | **Strong** | Strong | Strong |
| Offline / PWA support (10%) | Strong | **Strong** | Good | Medium |
| Learning curve (10%) | Low | **Low** | Medium | High |
| Ecosystem / dependency risk (10%) | Medium | **Medium** | Low | Low |
| Deployment compatibility (5%) | Excellent | **Excellent** | Good | Poor |
| **Weighted score** | 3.55 | **4.15** | 3.35 | 2.65 |

**Decisive criteria:** PostgreSQL ACID transactions (A2 Task 2), relational reporting (FR-03/FR-14), team capability, free-tier compatibility.

## Selected Versions

| Layer | Technology | Version | Rationale |
|---|---|---|---|
| Frontend | React | 18.x | Stable; component model supports 3 role-based views |
| Frontend build | Vite | 5.x | Fast dev loop; free |
| Language | TypeScript | 5.x | Type safety across stack |
| PWA | Workbox | 7.x | Service worker + offline caching (FR-02) |
| Client storage | IndexedDB (via idb) | 8.x | FR-02 offline caching |
| Backend runtime | Node.js | 20 LTS | Long-term support; free-tier compatible |
| Backend framework | Express | 4.x | Mature; minimal; team familiar |
| ORM | Prisma | 5.x | Type-safe; migrations; transactions (A2 Task 2) |
| Database | PostgreSQL | 16.x | ACID; relational; free-tier available |
| Auth | JWT + bcrypt | - | RBAC (FR-04); session timeout (NFR-11) |
| Validation | Zod | 3.x | Shared schema validation |
| Testing | Vitest + Supertest | - | Unit + integration (A2 Task 4) |
| CI | GitHub Actions | - | A2 Task 4 recommendation |
| Hosting | Render / Railway / Fly | - | Free-tier PaaS with managed Postgres |
| Monitoring | UptimeRobot / Logtail | - | FE-004; NFR-05 verification |
| Accessibility | axe-core | - | NFR-10 WCAG 2.1 AA |

## Rejected Options

| Option | Reason for Rejection |
|---|---|
| MongoDB (MERN) | Weak relational integrity for A2 Task 2; transactional audit is awkward |
| Django | Python context-switch; less PWA tooling |
| Spring Boot | Memory footprint; learning curve |
| Serverless | Cold starts threaten NFR-02; sync complexity |

## Compatibility Assumptions

- Node 20 LTS runs on all target free-tier hosts
- PostgreSQL 16 available on Render/Railway/Supabase free tiers
- Prisma 5 supports transactions required by A2 Task 2
- Workbox 7 supports offline sync required by NFR-01
- All dependencies pinned via lockfile (A2 Task 4)

## Licensing Summary

All selected technologies are open-source with permissive licences. No paid licences required. Satisfies zero-budget constraint.

## Risks Introduced

| Risk ID | Description | Mitigation |
|---|---|---|
| RR-005 | Free-tier DB size / connection limits under load | Connection pooling; query optimisation; usage monitoring |
| RR-006 | Browser API inconsistency (Geolocation, Media Capture, IndexedDB) | Progressive enhancement; target browser matrix |
| RR-007 | npm dependency churn / supply chain | Lockfile; Dependabot alerts; pinned versions |
| RR-008 | PostgreSQL connection exhaustion under concurrent load | Pooling; short transactions; health checks |

## Evidence

- A2 Task 2 (persistence)
- A2 Task 4 (SCM/CI)
- Decision matrix above
- FE-001 to FE-007 forward engineering considerations

## Links

- ADR: [ADR-TECH-01](../Architecture_Decision_Record/ADR-TECH-01-pern-stack.md)
- Architecture: [07-architecture.md](07-architecture.md)
- Risk Register: RR-005 to RR-008 