# 21 - Construction & Configuration

> **M3 Addition - PED v3.0**
> **Status:** Living document

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
│   ├── ISSUE_TEMPLATE/
│   │   ├── adr.md
│   │   ├── bug.md
│   │   └── feature.md
│   ├── workflows/
│   │   ├── ci.yml                 # CI pipeline (frontend, backend, security)
│   │   └── security.yml           # CodeQL, gitleaks, npm audit
│   └── pull_request_template.md
├── backend/
│   ├── migrations/
│   │   └── 001_initial_schema.sql # PostgreSQL schema
│   ├── server/
│   │   ├── application/
│   │   │   └── workflow.service.ts # State machine + RBAC transitions
│   │   ├── persistence/
│   │   │   └── request.repository.ts
│   │   └── db.ts                  # pg Pool (SSL, transactions)
│   ├── tests/
│   │   ├── e2e/
│   │   ├── fixtures/
│   │   ├── integration/
│   │   │   └── transitions.test.ts # TC-BE-TRANS-01 (FR-04)
│   │   ├── unit/
│   │   ├── README.md
│   │   └── setup.ts
│   └── package.json
├── documents/
│   ├── Architecture/
│   ├── Architecture_Decision_Record/
│   │   └── ADR-TECH-01-pern-stack.md
│   ├── Project_Engineering_Document/
│   │   ├── 20-controlled-changes.md
│   │   ├── 21-construction-configuration.md
│   │   ├── 25-performance-reliability.md
│   │   └── 27-release-readiness.md
│   ├── Registers/
│   │   ├── defect-register.md
│   │   └── technical-debt-register.md
│   ├── Release/
│   │   ├── release-evidence-summary.md
│   │   ├── residual-risk-statement.md
│   │   ├── rollback-plan.md
│   │   └── staging-environment.md
│   └── Requirements_Traceability_Matrix/
│       └── RTM.md
├── src/                           # Frontend (React 19 + Vite 6)
├── .env.example
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
