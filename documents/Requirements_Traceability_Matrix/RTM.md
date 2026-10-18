# Civic Connect: Requirements Traceability Matrix

## Requirements Traceability Matrix

## Purpose

This RTM evolves across three milestones and preserves each stage. Each sheet is a frozen record of that milestone's state. The M3 sheet is the *working* view updated as implementation progresses.

- **M1 sheet** - the requirements baseline: what must be built and for whom
- **M2 sheet** - the architecture trace: how each requirement maps to architecture, data, design and technology
- **M3 sheet** - the implementation trace: what has been built, tested and verified

## Version History
| Version | Date | Change | Author |
|---|---|---|---|
| v1.0 | 2026-09-08 | M1 RTM baseline (FR-01–FR-07, NFR-01–NFR-05) | Naledi |
| v2.0 draft | 2026-09-28 | M2 update added FR-08–FR-15, NFR-06–NFR-11 | Davidzo |


## M3 Test Summary

| Test Category | Count | Files |
|---|---|---|
| Unit tests | 31 | `backend/tests/unit/city.test.ts` (9), `backend/tests/unit/workflow.test.ts` (20), `backend/tests/unit/smoke.test.ts` (2) |
| API/Integration tests | 28 | `backend/tests/integration/requests.test.ts` (12), `backend/tests/integration/auth.test.ts` (10), `backend/tests/integration/transitions.test.ts` (6) |
| E2E tests | 2 | `backend/tests/e2e/admin-resolve.test.ts`, `backend/tests/e2e/citizen-flow.test.ts` |
| Health/API tests | 3 | `tests/api/health.test.ts` |
| Negative tests | 15+ | Marked `(negative)` across all files |
| **Total** | **60+** | - |

## Coverage Against M3 Requirements

| M3 Requirement | Minimum | Have | Status |
|---|---|---|---|
| Unit tests | 5 | 31 |  Exceeded |
| Black-box functional | 5 | Covered by integration tests |  |
| API/integration | 3 | 28 |  Exceeded |
| E2E/system | 2 | 2 |  |
| Negative/failure | 3 | 15+ |  Exceeded |
| High-priority coverage | 5 | Verified |  |
| Performance | 1 | Placeholder `tests/performance/load-test.js` |  In Development |

## Traceability to ASRs (from M2)

| ASR | Requirement Source | Test Coverage |
|---|---|---|
| ASR-01 (offline sync) | FR-02, NFR-01 | Sync endpoint tests in development |
| ASR-02 (real-time transparency) | FR-05, FR-06, FR-08 | TC-BE-TRANS-05, TC-BE-REQ-08 |
| ASR-03 (RBAC + audit) | FR-04, FR-11, FR-16, NFR-03, NFR-11 | TC-BE-TRANS-01..06, TC-BE-AUTH-01..09 |
| ASR-04 (reporting analytics) | FR-03, FR-10, FR-14, FR-16 | TC-BE-REQ-06..09 |
| ASR-05 (low bandwidth) | Technology Constraint 1 | PWA in frontend |
| ASR-06 (99.5% uptime) | NFR-05 | TC-API-01 |
| ASR-07 (testability) | Quality Constraint 1 | Layered architecture |
| ASR-08 (audit retention) | NFR-07 (90 days) | `request_history` table |

---

## Version History

| Version | Date | Change | Author |
|---|---|---|---|
| v1.0 | 2026-09-08 | M1 RTM baseline (FR-01–FR-07, NFR-01–NFR-05) | Naledi |
| v2.0 | 2026-09-28 | M2 update added FR-08–FR-15, NFR-06–NFR-11 | Davidzo |
| v3.0 | 2026-10-16 | M3 update added M3 Implementation column, M3 Test Evidence (IDs), verification status, test summary, ASR traceability | Kamohelo  |
