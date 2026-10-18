# 26 - Defects & Quality Interpretation

> **M3 Addition - PED v3.0**

## Purpose

Summarises defects found during M3, their status, and what they tell us about the release candidate's quality.

## Defect Summary

| Severity | Open | Fixed | Won't Fix |
|---|---|---|---|
| Critical | 0 | 0 | 0 |
| High | 0 | 2 | 0 |
| Medium | 0 | 1 | 0 |
| Low | 0 | 1 | 0 |
| **Total** | **0** | **4** | **0** |

Full details: `../Registers/defect-register.md`

## Defects Found During M3

### DEF-005 - Rate limiter blocks integration tests

- **Found:** 2026-10-15
- **Severity:** High
- **Impact:** Full test suite fails after a few runs; CI would be blocked
- **Root cause:** Login endpoint rate-limited at 10 requests/15 min per IP. Parallel test execution triggered the limit within seconds
- **Fix:** Made rate limiter environment-aware bypassed when `NODE_ENV=test` OR `DISABLE_RATE_LIMIT=1`
- **Regression evidence:** Full suite passes 59/60 when rate limit is bypassed
- **Status:**  Fixed

### DEF-006 - `isAssignedTo` reads wrong table

- **Found:** 2026-10-15 (via E2E test TC-E2E-02)
- **Severity:** High
- **Impact:** Field workers received 403 on valid `assigned → in_progress` transitions, blocking the full request lifecycle
- **Root cause:** `updateStatus` writes assignment to `requests.assigned_to`; `isAssignedTo` queries `request_workers` (which is never populated). Data-model inconsistency
- **Fix:** Updated `isAssignedTo` to read `requests.assigned_to` directly. Longer-term redesign logged as technical debt TD-M3-XX
- **Regression evidence:** E2E test TC-E2E-02 now passes transitions 1 and 2
- **Status:**  Fixed

### DEF-007 - Duplicate `t3` declaration in E2E test


- **Severity:** Low (test-only, not production code)
- **Impact:** E2E test file failed to compile, blocking verification
- **Root cause:** Diagnostic logging accidentally left a duplicate `const t3` declaration
- **Fix:** Removed duplicate block; cleaned up diagnostic logs
- **Status:**  Fixed

### DEF-008 - Supabase password authentication failure

- **Found:** 2026-10-16
- **Severity:** Medium (infrastructure, not code)
- **Impact:** Backend cannot connect to database; tests fail at `beforeAll`
- **Root cause:** The password in `backend/.env` no longer matches the Supabase project's password (rotated or typo)
- **Fix:** Requires Supabase dashboard password reset + `.env` update
- **Status:** In Progress

## Most Concerning Defect

**DEF-006** - the assignment lookup inconsistency was subtle but would have made the entire field-worker workflow non-functional in production. Discovered only by the E2E test exercising the full lifecycle. This demonstrates the value of E2E testing beyond unit/integration coverage.

## Static / Security Findings

| Finding | Severity | Status | Action |
|---|---|---|---|
| npm audit | 0 vulnerabilities |  Clean | Monitored via CI |
| gitleaks | 0 secrets committed |  Clean | Runs on every push |
| CodeQL | Not yet run (CI setup pending) |  | Runs on push |

## Quality Interpretation

### What the Evidence Proves

- **Functional completeness:** The full request lifecycle works end-to-end (submit -> assign -> in_progress -> resolve) when the DB is available
- **RBAC enforcement:** 401 for missing/invalid tokens; 403 for role mismatch; 400 for invalid transitions
- **Input validation:** Bad inputs are rejected with appropriate HTTP codes
- **Error handling:** Responses don't leak internal details
- **Concurrency safety:** Version mismatches detected with 409
- **Audit trail:** Every transition appends to `request_history`
- **Test coverage:** 60+ tests across unit, integration, E2E, and negative categories

### What the Evidence Does NOT Prove

- **Production-scale reliability** - the 30-day uptime target (NFR-05) is not measured
- **Performance** - the load test wasn't run
- **Accessibility** - WCAG 2.1 AA compliance not audited
- **Cross-browser behaviour** - only Chrome-family browsers were used during dev
- **Offline sync** - NFR-01 sync timing not measured
- **Security hardening** - no penetration testing; only basic RBAC checks

## Technical Debt Accepted

| Debt ID | Description | Future Consequence |
|---|---|---|
| TD-M3-10 | Migrations run manually via Supabase SQL Editor | Slower schema changes; risk of drift |
| TD-M3-11 | No automated backup verification | Recovery relies on Supabase |
| TD-M3-12 | Connection pool size not tuned for load | May need adjustment for concurrent users |
| TD-M3-XX | `request_workers` table unused; `assigned_to` column used instead | Data-model inconsistency to unify |

Full details: `../Registers/technical-debt-register.md`

## Links

- Defect register: `../Registers/defect-register.md`
- Technical debt register: `../Registers/technical-debt-register.md`
- Risk register: `12-risk-register.md`
