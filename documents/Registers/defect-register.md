# Defect Register

Tracks every defect discovered during M3 development, testing, or code review.

## Defect Table

| ID | Title | Date | Severity | Status | Related requirement/test | Fix reference | Regression evidence |
|---|---|---|---|---|---|---|---|
| DEF-005 | Rate limiter blocks integration tests on repeated runs   | 2026-10-15 | High | Fixed | NFR-03, test infrastructure | Made rate limiter environment-aware (`NODE_ENV=test` or `DISABLE_RATE_LIMIT=1` bypasses) | Full suite passes when limit disabled |
| DEF-006 | `isAssignedTo` queries wrong table workers get 403 on valid transitions  | 2026-10-15 | High | Fixed | FR-04, ADR-PERSIST-01 | Updated `isAssignedTo` in `request.repository.ts` to read `requests.assigned_to` | E2E TC-E2E-02 now passes transitions 1–2 |
| DEF-007 | Duplicate `t3` declaration in E2E test |  2026-10-16 | Low | Fixed | Test-only | Removed duplicate block from `admin-resolve.test.ts` | E2E test file compiles |
| DEF-008 | Supabase password authentication failure |  2026-10-16 | Medium | Open | Infrastructure | Reset Supabase password; update `backend/.env` | Pending |

## Severity Definitions

| Severity | Meaning |
|---|---|
| **Critical** | Blocks release. Core functionality broken. No workaround. |
| **High** | Major functionality broken. Workaround exists but expensive. |
| **Medium** | Minor functionality broken. Workaround acceptable. |
| **Low** | Cosmetic or trivial. No user impact. |

## Status Values

| Status | Meaning |
|---|---|
| Open | Reported, not yet investigated |
| In progress | Being fixed |
| Fixed | Code fix merged |
| Verified | Regression test passes, defect confirmed closed |
| Won't fix | Accepted as-is, documented in technical debt register |
| Duplicate | Already covered by another defect entry |

## Linkage Rules

- Every defect should trace to at least one of: a requirement (FR/NFR), a risk (RR), or a test case (TC)
- Every fixed defect must have regression evidence
- Defects that are "Won't fix" must be cross-referenced in the Technical Debt Register