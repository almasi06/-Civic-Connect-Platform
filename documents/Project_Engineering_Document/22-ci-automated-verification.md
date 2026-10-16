# 22 - CI & Automated Verification

> **M3 Addition - PED v3.0**


## Purpose

Describes the CI pipeline, what each job checks, which checks block merge, and where the evidence lives.

## CI Pipeline

Two workflows under `.github/workflows/`:

### `ci.yml` - Main CI

**Triggers:** Push and pull request on `Documentation`, `main`, `m3/**`.

**Jobs:**

| Job | Blocks merge? | What it checks |
|---|---|---|
| `build-and-test` |  **Yes (quality gate)** | Node 20 setup, root + backend `npm ci`, write `backend/.env` from GitHub Secrets, start backend in background, health-check, typecheck, run backend tests |
| `lint` |  Warning only | ESLint on frontend |
| `security` |  Warning only | `npm audit --audit-level=moderate` |

### `security.yml` - Security Scanning

**Triggers:** Push, pull request, weekly (Monday 06:00 UTC).

**Jobs:**

| Job | Blocks merge? | What it checks |
|---|---|---|
| `codeql` | Reports | CodeQL static analysis on JavaScript / TypeScript |
| `secret-scan` |  Yes | gitleaks  fails if any secret is committed |

## Quality Gate

The **`build-and-test`** job is the quality gate. If it fails, the PR cannot be merged. This satisfies M3 S9's requirement that "at least one meaningful failure must block progression."

## Static Analysis

- **CodeQL** - JavaScript/TypeScript security analysis. Results appear in the GitHub **Security** tab.
- **ESLint** - style and code-quality checks via the `lint` job.

## Dependency / Security Checks

- **Dependabot** - automatic PRs for vulnerable dependencies (configured in repo settings).
- **`npm audit`** - dependency vulnerability scan.
- **gitleaks** - scans every push for accidental secrets.

## GitHub Secrets Required

The CI workflow writes `backend/.env` from repository secrets:

| Secret | Purpose |
|---|---|
| `DATABASE_URL` | Supabase connection string |
| `JWT_SECRET` | JWT signing key |

Both are configured in repository settings -> Secrets -> Actions. They are never committed.

## Backend Startup in CI

The `build-and-test` job:
1. Installs root + backend dependencies
2. Writes `backend/.env` from secrets
3. Starts `npm run dev` in the background
4. Sleeps 15 seconds
5. Runs `curl http://localhost:4000/health` to confirm the backend is live
6. Runs the tests

This ensures the integration / E2E tests can reach `localhost:4000`.

## Evidence Location

| Evidence | Where |
|---|---|
| CI run history | GitHub -> Actions tab |
| Latest run | Actions -> CI workflow |
| CodeQL results | Security -> Code scanning alerts |
| Dependabot alerts | Security -> Dependabot alerts |
| Secret scan results | Actions -> Security Scan workflow |

## What CI Does NOT Prove

- Does not prove the app works end-to-end (that's E2E tests, run separately)
- Does not prove performance under load (that's the performance test)
- Does not replace human code review
- Does not prove security against sophisticated attacks

## Links

- CI files: `.github/workflows/ci.yml`, `.github/workflows/security.yml`
- Test evidence: `../Release/release-evidence-summary.md`
- Test suites: `backend/tests/`