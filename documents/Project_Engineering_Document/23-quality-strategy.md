# 23 - Quality Strategy

> **M3 Addition - PED v3.0**


## Purpose

Explains **which risks received stronger verification and why** the risk-based quality strategy for M3.

## Strategy

Quality effort is prioritised by risk. The three drivers:

1. **High-priority requirements** (Must-have)
2. **High-risk behaviours** (from `12-risk-register.md`)
3. **Architecturally significant requirements** (ASRs from M2)

...receive deeper verification than low-risk, low-priority items.

## Risk-Based Test Prioritisation

| Risk / ASR | Why it matters | Verification approach | Status |
|---|---|---|---|
| RR-001 (offline sync) | NFR-01 must-have; free-tier constraints | Sync tests planned |  Deferred |
| ASR-01 (offline-first) | Core UX for field workers | PWA integration |  Partial |
| ASR-02 (real-time notifications) | Citizen transparency | Post-commit event tests (TC-BE-TRANS-05) |  Verified |
| ASR-03 (RBAC + audit) | Compliance, security | 6 transition tests + 9 auth tests |  Verified |
| ASR-04 (reporting analytics) | Performance-critical | Filter tests TC-BE-REQ-06..09 |  Verified |
| ASR-06 (99.5% uptime) | Availability | Health endpoint TC-API-01 |  Verified |
| ASR-08 (audit retention) | Compliance | History persistence TC-BE-TRANS-05 |  Verified |
| RR-005 (free-tier DB) | Scalability ceiling | K6 load test executed (p95 = 21.67s) |  Measured Failure |
| RR-009 (architecture drift) | Maintainability | Code review discipline |  Ongoing |

## Coverage Approach

- **Unit tests** - domain logic, validation, permission checks (31 tests)
- **Integration tests** - API + DB interactions, transactions (28 tests)
- **E2E tests** - full lifecycle across the system (2 tests)
- **Negative tests** - unauthorised, malformed, failure cases (15+)
- **Performance test** - one performance-sensitive journey (placeholder)

## What We Do NOT Aim For

- **100% code coverage** - M3 does not prescribe a coverage percentage
- A test for every line - meaningless tests earn no credit
- Automated tests for one-off debugging (those become regression tests only if the defect is significant)

## Risk Coverage Matrix

| Requirement | Priority | Risk | Test Coverage | Evidence |
|---|---|---|---|---|
| FR-01 (submit) | Must | High | 4 tests + E2E | `requests.test.ts` |
| FR-02 (offline sync) | Must | Critical (RR-001) | Pending | - |
| FR-03 (map/reporting) | Should | Medium | 1 test | `requests.test.ts` |
| FR-04 (RBAC + transitions) | Must | High | 6 tests | `transitions.test.ts` |
| FR-05 (notifications) | Should | High | 1 test | `transitions.test.ts` |
| FR-06 (track by number) | Must | Medium | 1 test | `requests.test.ts` |
| FR-11 (assign/accept) | Must | Medium | 2 tests | `transitions.test.ts` |
| FR-12 (auth) | Must | High | 9 tests | `auth.test.ts` |
| NFR-03 (HTTPS/TLS) | Must | High | Manual | ADR-TECH-02 |
| NFR-05 (uptime) | Should | Medium | 1 test | `health.test.ts` |
| NFR-08 (session timeout) | Must | Medium | 3 tests | `auth.test.ts` |
| NFR-12 (error handling) | Must | High | 5 tests | `requests.test.ts` + `transitions.test.ts` |

## Interpretation of Coverage

Coverage percentage is **not** a target. What matters is that critical behaviours are protected. Gaps in offline sync (RR-001) and performance (NFR-02) are documented as in-development.

## Links

- Risk register: `12-risk-register.md`
- ASRs: `06-asrs.md`
- Black-box validation: `24-black-box-validation.md`
- Defects: `26-defects-quality.md`
