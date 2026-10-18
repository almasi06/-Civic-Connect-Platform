# 26 - Defects & Quality Interpretation

> **M3/M4 Addition - PED v4.0**

## Purpose

Summarises defects found during M3/M4, their final status, and what they tell us about the release candidate's quality.

## Defect Summary

Based on the final execution on 2026-10-18, the defect register now shows:

| Severity | Open | Closed | Won't Fix |
|---|---|---|---|
| Critical | 0 | 5 | 0 |
| High | 0 | 12 | 0 |
| Medium | 0 | 8 | 0 |
| Low | 0 | 3 | 0 |
| **Total** | **0** | **28** | **0** |

Full details: `../Registers/defect-register.md` and `../Registers/Defect_Register.xlsx`

## Key Defects Found During M3

### DEF-006 - `isAssignedTo` reads wrong table (High)
- **Root cause:** `updateStatus` wrote assignment to `requests.assigned_to`; `isAssignedTo` queried `request_workers`. Data-model inconsistency.
- **Fix:** Updated `isAssignedTo` to read `requests.assigned_to` directly.
- **Regression evidence:** E2E test `TC-E2E-02` now passes transitions 1-3.
- **Status:**  Closed

### DEF-008 - Supabase password authentication failure (Medium)
- **Root cause:** The password in `backend/.env` no longer matched the Supabase project's password.
- **Fix:** Password reset and `.env` updated by the team.
- **Regression evidence:** All 63 tests pass after the fix.
- **Status:**  Closed

### DEF-020 - Rate limiter blocked integration tests (Low)
- **Root cause:** Login rate limiter (10 attempts / 15 min) triggered during rapid test runs.
- **Fix:** Rate limiter bypassed when `DISABLE_RATE_LIMIT=1` or `NODE_ENV=test`.
- **Regression evidence:** Full suite passes with the bypass active.
- **Status:**  Closed

## Most Concerning Defect

**DEF-006** — the assignment lookup inconsistency would have made the entire field-worker workflow non-functional in production. It was discovered only by the E2E test (`TC-E2E-02`) exercising the full lifecycle. This demonstrates the value of E2E testing beyond unit/integration coverage.

## Static / Security Findings

| Finding | Severity | Status | Action |
|---|---|---|---|
| npm audit | 0 vulnerabilities |  Clean | Monitored via CI |
| gitleaks | 0 secrets committed |  Clean | Runs on every push |
| CodeQL | Pending CI setup |  | Runs on push |

## Quality Interpretation

### What the Evidence Proves
- **Functional completeness:** The full request lifecycle works end-to-end (submit → assign → in_progress → resolve) — 63/63 tests pass.
- **RBAC enforcement:** 401 for missing/invalid tokens; 403 for role mismatch; 400 for invalid transitions.
- **Input validation:** Bad inputs are rejected with appropriate HTTP codes.
- **Error handling:** Responses don't leak internal details (NFR-09).
- **Concurrency safety:** Version mismatches detected with 409.
- **Audit trail:** Every transition appends to `request_history`.

### What the Evidence Does NOT Prove
- **Production-scale reliability** — the 30-day uptime target (NFR-05) is not measured.
- **Performance** — the K6 load test failed the threshold (p95 = 21.67s vs 3s target).
- **Accessibility** — WCAG 2.1 AA compliance not audited.
- **Cross-browser behaviour** — only Chromium tested.
- **Offline sync timing** — NFR-01 not measured.

## Technical Debt Accepted

| Debt ID | Description | Future Consequence |
|---|---|---|
| TD-M3-10 | Migrations run manually via Supabase SQL Editor | Slower schema changes; risk of drift |
| TD-M3-11 | No automated backup verification | Recovery relies on Supabase |
| TD-M3-12 | Connection pool size not tuned for load | May need adjustment for concurrent users |
| TD-M3-13 | `request_workers` table unused; `assigned_to` column used instead | Data-model inconsistency to unify |

Full details: `../Registers/technical-debt-register.md`

## Links

- Defect register: `../Registers/defect-register.md`
- Technical debt register: `../Registers/technical-debt-register.md`
- Risk register: `12-risk-register.md`
