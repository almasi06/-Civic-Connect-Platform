# ADR-TECH-01: PERN + TypeScript Technology Stack

- **Status:** Accepted
- **Date:** 2026-09-29
- **Deciders:** Davidzo Malapile, Naledi Moeng, Kamohelo Mabena
- **Supersedes:** ED-003 (Deferred technology stack selection, M1)
- **Related:** ADR-ARCH-01, ADR-PERSIST-01 , ADR-INT-01 
- **Requirement(s):** ASR-01 to ASR-08

## Context

ED-003 deferred final technology stack selection to M2. M2 must resolve it with evidence. The stack must satisfy ASR-01 to ASR-08, respect M1 constraints (3-person team, 12–14 weeks delivery window, zero budget, web-only, low-bandwidth environments), and support FE-001 to FE-007 forward-engineering considerations.

No stack was preselected by the project brief. Every technology decision here must be justified against project-specific evidence, not preference.

## Decision

Adopt the **PERN stack with TypeScript**:

- **Frontend:** React 18 + Vite 5 + TypeScript 5 + Workbox 7
- **Backend:** Node.js 20 LTS + Express 4 + TypeScript 5
- **ORM:** Prisma 5
- **Database:** PostgreSQL 16
- **Auth:** JWT + bcrypt
- **Validation:** Zod 3
- **Testing:** Vitest + Supertest
- **CI:** GitHub Actions
- **Hosting:** Free-tier PaaS (Render / Railway / Fly.io) with managed Postgres

## Alternatives Considered

| Alternative | Verdict | Reason |
|---|---|---|
| PERN + TypeScript | **Selected** | Best fit for ASRs, team capability, budget |
| MERN (MongoDB) | Rejected | Weak relational integrity for A2 Task 2; transactional audit is awkward |
| Django + React | Rejected | Python context-switch for a JS-fluent team; less PWA tooling |
| Spring Boot + React | Rejected | Memory footprint incompatible with free tier; steeper learning curve |
| Serverless / FaaS | Rejected | Cold starts threaten NFR-02; offline sync complexity |

## Rationale

- **PostgreSQL** is required for ACID transactions (A2 Task 2) across status update + audit + assignment, and for relational reporting (FR-03, FR-10, FR-14, FR-16).
- **Node/Express/React** minimises context-switching for a JS-fluent team; single language across stack reduces integration risk.
- **Workbox** supports the PWA + offline sync pattern required by FR-02 and NFR-01.
- **Prisma** provides type-safe queries, migrations, and transactions - supporting ASR-03 and ASR-08.
- **TypeScript** shared types between frontend and backend reduce contract drift.
- All selected technologies have viable free tiers (zero-budget constraint).
- All selected technologies have mature testing ecosystems (A2 Task 4 CI requirement).

## Consequences

**Positive:**
- ACID transactions for audit integrity
- Single-language stack (JS/TS everywhere)
- Strong free-tier hosting path
- Type safety across frontend and backend
- Mature testing ecosystem (Vitest + Supertest)
- Single dependency manager (npm)

**Negative / Trade-offs:**
- npm dependency churn risk (RR-007)
- Free-tier DB connection limits (RR-008)
- Node single-threaded - acceptable at current scale
- TypeScript adds a compilation step (acceptable given type safety benefit)

**Complexity introduced:**
- Lockfile management (to be enforced in CI)
- Prisma migration workflow discipline

## Versions and Compatibility

| Layer | Technology | Version | Compatible with |
|---|---|---|---|
| Runtime | Node.js | 20 LTS | All target PaaS hosts |
| Database | PostgreSQL | 16 | Render/Railway/Supabase free tiers |
| ORM | Prisma | 5.x | PostgreSQL 16 |
| Frontend | React | 18.x | All modern browsers |
| PWA | Workbox | 7.x | NFR-01 offline sync |
| Language | TypeScript | 5.x | Node + React |

## Licensing

All selected technologies are open-source with permissive licences:
- Node.js - MIT
- Express - MIT
- React - MIT
- Prisma - Apache 2.0
- PostgreSQL - PostgreSQL Licence
- Workbox - Apache 2.0
- TypeScript - Apache 2.0

No paid licences required. Satisfies the zero-budget constraint.

## Security Notes

- JWT + bcrypt for authentication (FR-04, NFR-11)
- HTTPS/TLS at the presentation boundary (NFR-03)
- Secrets via environment variables; never committed
- Dependabot + npm audit as CI warnings (A2 Task 4)
- Prisma parameterised queries prevent SQL injection

## Evidence

- A2 Task 2 (persistence and transactional integrity)
- A2 Task 4 (SCM/CI and quality gates)
- Technology decision matrix: [08-technology-stack.md](../Project_Engineering_Document/08-technology-stack.md)
- FE-001 to FE-007 forward engineering considerations
- Richards & Ford (2020) - technology decisions must be justified, not assumed

## Links

- PED: [08-technology-stack.md](../Project_Engineering_Document/08-technology-stack.md)
- Related ADRs: [ADR-ARCH-01](ADR-ARCH-01-layered-monolith.md)
- Risk Register: RR-005, RR-006, RR-007, RR-008
- RTM: technology column 