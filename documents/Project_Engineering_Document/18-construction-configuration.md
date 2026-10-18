# 21 - Construction & Configuration

## Purpose

Repository strategy, configuration approach, and important implementation notes for future maintainers.

## Repository Strategy

- **Monorepo** - one repository for frontend + backend + docs
- **Branching model:** GitHub Flow (protected `main` and `Documentation`)
- **Review rule:** 2 approvals per substantive PR
- **Merge strategy:** Squash and merge
- **Full rules:** `CONTRIBUTING.md`


## Directory Structure

```text
-Civic-Connect-Platform/
├── .github/
│   ├── workflows/
│   │   ├── ci.yml                 # CI pipeline (frontend, backend, security)
│   │   └── security.yml           # CodeQL, gitleaks, npm audit
├── backend/
│   ├── migrations/
│   │   └── 001_initial_schema.sql # PostgreSQL schema
│   ├── server/
│   │   ├── application/
│   │   │   └── workflow.service.ts # State machine + RBAC transitions
│   │   ├── domain/
│   │   │   ├── workflow.ts         # ALLOWED + ROLE_CAN matrices
│   │   │   ├── events.ts           # In-process event bus
│   │   │   └── city.ts             # Tshwane boundary gate
│   │   ├── middleware/
│   │   │   ├── auth.middleware.ts  # JWT verification + requireRole
│   │   │   ├── error.middleware.ts # HttpError + asyncHandler
│   │   │   └── validate.middleware.ts # Zod schemas
│   │   ├── persistence/
│   │   │   ├── request.repository.ts
│   │   │   ├── user.repository.ts
│   │   │   └── team.repository.ts
│   │   ├── routes/
│   │   │   ├── auth.ts
│   │   │   ├── requests.ts
│   │   │   ├── sync.ts
│   │   │   ├── teams.ts
│   │   │   └── workers.ts
│   │   ├── db.ts                  # pg Pool (SSL, transactions)
│   │   └── index.ts               # Express app entry
│   ├── tests/
│   │   ├── api/
│   │   │   └── health.test.ts     # TC-API-01 (NFR-05)
│   │   ├── e2e/
│   │   │   └── admin-resolve.test.ts # TC-E2E-02 (full lifecycle)
│   │   ├── fixtures/
│   │   │   └── helpers.ts         # loginAsAdmin, cleanupTestData
│   │   ├── integration/
│   │   │   ├── auth.test.ts       # TC-BE-AUTH-01..10
│   │   │   ├── requests.test.ts   # TC-BE-REQ-01..12
│   │   │   ├── sync.test.ts       # TC-BE-SYNC-01..02
│   │   │   └── transitions.test.ts # TC-BE-TRANS-01..06 (FR-04)
│   │   ├── unit/
│   │   │   ├── city.test.ts       # TC-BE-CITY-01..09
│   │   │   ├── smoke.test.ts      # Sanity checks
│   │   │   └── workflow.test.ts   # TC-BE-WF-01..20
│   │   ├── README.md
│   │   └── setup.ts
│   ├── .env
│   ├── package.json
│   └── tsconfig.json
├── documents/
│   ├── Architecture/
│   ├── Architecture_Decision_Record/
│   │   ├── ADR-ARCH-01-layered-monolith.md
│   │   ├── ADR-TECH-01-pern-stack.md
│   │   ├── ADR-TECH-02-supabase-postgres-hosting.md
│   │   ├── ADR-PERSIST-01-transactional-transitions.md
│   │   └── ADR-INT-01-notification-integration.md
│   ├── Project_Engineering_Document/
│   │   ├── 00-document-control.md
│   │   ├── 01-problem-statement.md
│   │   ├── 02-stakeholders.md
│   │   ├── 03-requirements.md
│   │   ├── 04-scope-baseline.md
│   │   ├── 05-constraints.md
│   │   ├── 06-asrs.md
│   │   ├── 07-architecture.md
│   │   ├── 08-technology-stack.md
│   │   ├── 09-data-persistence.md
│   │   ├── 10-design-decisions.md
│   │   ├── 11-integration-api.md
│   │   ├── 12-risk-register.md
│   │   ├── 13-forward-engineering.md
│   │   ├── 14-deployment.md
│   │   ├── 15-baseline.md
│   │   ├── 16-ai-usage-register.md
│   │   ├── 17-decision-log.md
│   │   ├── 18-controlled-changes.md
│   │   ├── 19-construction-configuration.md
│   │   ├── 20-ci-automated-verification.md

│   │   ├── 21-construction-configuration.md
│   │   ├── 22-ci-automated-verification.md
│   │   ├── 23-quality-strategy.md
│   │   ├── 24-black-box-validation.md
│   │   ├── 25-performance-reliability.md
│   │   ├── 26-defects-quality.md
│   │   ├── 27-release-readiness.md
│   │   └── INDEX.md
│   ├── Registers/
│   │   ├── defect-register.md
│   │   ├── technical-debt-register.md
│   │   └── ai-usage-register.md
│   ├── Release/
│   │   ├── release-candidate.md
│   │   ├── release-evidence-summary.md
│   │   ├── residual-risk-statement.md
│   │   ├── rollback-plan.md
│   │   └── staging-environment.md
│   └── Requirements_Traceability_Matrix/
│       └── RTM.md
├── src/                           # Frontend (React 19 + Vite 6)
├── tests/
│   └── performance/
│       └── load-test.js           # K6 performance script
├── .gitignore
├── CONTRIBUTING.md
├── package.json
└── README.md
```

## Configuration Approach

| Concern | Approach |
|---|---|
| Secrets (DB URL, JWT secret) | Environment variables never committed |
| Environment template | `.env.example` (placeholders only) |
| Local dev | `backend/.env` (git-ignored) |
| CI | GitHub Actions Secrets injected into `backend/.env` at runtime |
| Staging | Host-provided env vars |

## Backend

- **Runtime:** Node.js 20 LTS
- **Framework:** Express 4
- **Language:** TypeScript 5
- **Database client:** `pg` (node-postgres) direct parameterised SQL (see Change M3-01)
- **Auth:** JWT (`jsonwebtoken`) + bcryptjs
- **Validation:** Zod 3
- **Rate limiting:** express-rate-limit (10 req / 15 min for login; bypassed when `NODE_ENV=test` or `DISABLE_RATE_LIMIT=1`)
- **Tests:** Vitest 2 + Supertest

## Frontend

- **Framework:** React 19
- **Build:** Vite 6
- **Language:** TypeScript 5
- **Routing:** @tanstack/react-router
- **Data fetching:** @tanstack/react-query
- **Icons:** lucide-react
- **Map:** leaflet

## Database

- **Engine:** PostgreSQL 16
- **Host:** Supabase (managed, permanent free tier) see ADR-TECH-02
- **Connection:** Session Pooler endpoint (IPv4-compatible)
- **Driver:** `pg` (`Pool` with `max: 10`)
- **SSL:** Required by Supabase; `rejectUnauthorized: false` in `db.ts`
- **Migrations:** SQL files executed manually via Supabase SQL Editor (TD-M3-10)
- **Schema tables:**
  - `users` - id, email, password_hash, name, role, is_active
  - `requests` - id, tracking_number, category, description, lat, lng, photo, status, version, reporter_device_id, assigned_to, assigned_name, accepted_at, created_at, updated_at
  - `request_history` - id, request_id, status, by_name, note, photo, at
  - `request_workers` - request_id, user_id (unused; see TD-M3-XX)
  - `idempotency_keys` - key, response (for offline sync dedup)

## Secrets Handling

`.gitignore` excludes:
- `.env`, `.env.local`, `.env.*.local`
- `node_modules/`, `dist/`, `coverage/`
- `*.log`, `.DS_Store`, `.vscode/`

Secrets are provided via environment variables at runtime — never committed.

## Links

- CONTRIBUTING: `../../CONTRIBUTING.md`
- Deployment: `14-deployment.md`
- CI: `22-ci-automated-verification.md`
- Controlled changes: `20-controlled-changes.md`
