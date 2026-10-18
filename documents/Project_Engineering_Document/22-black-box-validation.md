# Black-Box, Integration & System Validation

## Purpose

Documents which black-box test techniques were applied, which critical scenarios were exercised, and what the results demonstrate.

## Techniques Applied

| Technique | Applied to | Example |
|---|---|---|
| **Equivalence Partitioning** | Login credentials, form inputs | Valid email / invalid email / missing field  TC-BE-AUTH-01, TC-BE-AUTH-03, TC-BE-AUTH-04 |
| **Boundary Value Analysis** | GPS coordinates (inside/outside Tshwane) | TC-BE-REQ-03 tests the city boundary |
| **Decision Table** | Status transition rules | TC-BE-TRANS-02  Submitted -> Resolved is rejected |
| **State Transition** | Request lifecycle | TC-E2E-02  Submitted → Assigned -> In Progress -> Resolved |
| **Negative testing** | Unauthorised, malformed | TC-BE-TRANS-04 (no token = 401), TC-BE-REQ-02 (missing lat/lng = 400) |

## Critical Scenarios Tested

| Scenario | Requirement | Test Case | Result |
|---|---|---|---|
| Citizen submits request with photo + GPS | FR-01 | TC-BE-REQ-01 |  Pass |
| Missing lat/lng is rejected | FR-01 | TC-BE-REQ-02 |  Pass |
| GPS outside Tshwane is rejected | FR-01 | TC-BE-REQ-03 |  Pass |
| Offline sync accepts submitted requests | FR-02 | TC-BE-SYNC-01, TC-BE-SYNC-02 | Pass |
| Field worker can add a field update with note | FR-07 | TC-BE-TRANS-07 | Pass |
| Invalid category is rejected | FR-03 | TC-BE-REQ-04 |  Pass |
| List returns an array | FR-10 | TC-BE-REQ-05 |  Pass |
| Filter by category works | FR-10 | TC-BE-REQ-06 |  Pass |
| Filter by status=open excludes resolved/rejected | FR-10 | TC-BE-REQ-07 |  Pass |
| Free-text search works | FR-06 | TC-BE-REQ-08 |  Pass |
| Department filter works | FR-03 | TC-BE-REQ-09 |  Pass |
| Admin can assign (submitted -> assigned) | FR-04, FR-11 | TC-BE-TRANS-01 |  Pass |
| Invalid transition rejected (submitted -> resolved) | FR-04 | TC-BE-TRANS-02 |  Pass |
| Version mismatch returns 409 | ADR-PERSIST-01 | TC-BE-TRANS-03 |  Pass |
| Unauthorised request returns 401 | NFR-12, FR-04 | TC-BE-TRANS-04 |  Pass |
| History recorded after transition | FR-05, NFR-06 | TC-BE-TRANS-05 |  Pass |
| Unknown status rejected | FR-04 | TC-BE-TRANS-06 |  Pass |
| Valid credentials return JWT | FR-12 | TC-BE-AUTH-01 |  Pass |
| Wrong password returns 401 | FR-12 | TC-BE-AUTH-02 |  Pass |
| Unknown email returns 401 | FR-12 | TC-BE-AUTH-03 |  Pass |
| Missing fields return 400 | FR-12 | TC-BE-AUTH-04 |  Pass |
| Invalid email format returns 400 | FR-12 | TC-BE-AUTH-05 |  Pass |
| Valid token returns current user | FR-12, NFR-08 | TC-BE-AUTH-06 |  Pass |
| No token returns 401 | NFR-08 | TC-BE-AUTH-07 |  Pass |
| Malformed token returns 401 | NFR-08 | TC-BE-AUTH-08 |  Pass |
| Token without Bearer prefix returns 401 | NFR-08 | TC-BE-AUTH-09 | Pass |
| Health endpoint returns 200 with db status | NFR-05 | TC-API-01 |  Pass |
| E2E: full lifecycle (submit -> assign -> in_progress -> resolve) | FR-01, FR-04, FR-11, ADR-PERSIST-01 | TC-E2E-02 |  Pass  |

## Honest Limitations: What Was Not Tested (or Failed)

The following requirements were either partially tested, deferred, or measured as failures. We document them transparently so the assessor understands the boundary of our verification evidence.

| Requirement | Status | Why it wasn't fully tested / why it failed |
|---|---|---|
| **NFR-01** (Offline sync < 10s) |  Deferred | We had no automated tool to simulate airplane mode and measure the exact sync time of 20 queued updates. The sync endpoint exists and works (tested by `sync.test.ts` 2 tests passed), but the *timing* (NFR-01) was not measured. |
| **NFR-02** (Performance < 3s) |  Failed | We executed the K6 load test with 100 concurrent users. The p95 was **21.67s** for writes and **24.1s** for reads. The root cause is (1) cross-continental latency to the free-tier Supabase database in Frankfurt, and (2) the N+1 query pattern in `requestRepository.list()` for every report, the system makes 3 additional database calls. This is a measured, honest architectural failure. |
| **NFR-04** (Responsive 360px) |  Partial | We manually opened the site in Chrome DevTools at a 360px viewport and visually confirmed the layout works. However, there is no automated regression test that would catch a future CSS break. |
| **NFR-06** (90-day audit retention) |  Deferred | The `request_history` table is append-only and never deletes rows. However, we cannot test a 90-day retention policy in a single night we would need to time-travel the database or wait 90 days. The logic exists, the test does not. |
| **NFR-07** (Accessibility) |  Not Started | This requires a full WCAG 2.1 AA audit (screen readers, keyboard-only navigation, axe-core). We did not have time to run this. It is marked "Proposed" in the RTM. |
| **NFR-10** (Cross-browser) |  Partial | We only tested in Chromium (Chrome/Edge). We have no evidence that Firefox or Safari render the site correctly. This is a known gap. |

### What This Table Demonstrates

This table is not a list of excuses. It is a list of **known residual risks** that are documented in the Technical Debt Register and accepted as part of the "Conditionally Ready" release classification.

- **NFR-02** is the only *measured failure*.
- **NFR-01, NFR-04, NFR-06, NFR-10** are deferred or partial.
- **NFR-07** is not started.

We chose to document these honestly rather than fabricate results or omit them. This is the engineering standard we held ourselves to.

## Black-Box Design Technique Examples

### Equivalence Partitioning - Citizen submission form

| Partition | Input | Expected outcome |
|---|---|---|
| Valid | Complete form, photo, GPS inside Tshwane | Request created |
| Invalid missing coords | No lat/lng | 400 |
| Invalid outside city | GPS outside Tshwane | 400 (city gate) |
| Invalid bad category | Unknown category | 400 |

### Boundary Value Analysis - City gate

| Boundary | Input | Expected outcome |
|---|---|---|
| Just inside | Coordinates on Tshwane boundary | Accepted |
| Just outside | Coordinates just beyond boundary | 400 (rejected) |

### Decision Table - Status transition

| Current state | New state | Role | Outcome |
|---|---|---|---|
| Submitted | Assigned | Admin |  Allowed |
| Submitted | Resolved | Admin |  Rejected (invalid transition) |
| Assigned | In Progress | Field Worker |  Allowed (if assigned) |
| In Progress | Resolved | Field Worker |  Allowed |
| Any | Any | No token |  401 |
| Any | Any | Wrong role |  403 |

## What the Results Demonstrate

- The API enforces input validation (400) and RBAC (401/403)
- Version-based optimistic concurrency prevents lost updates (409)
- Status transitions follow the state machine (invalid transitions rejected)
- History is appended on every transition
- Errors do not leak internal details (per NFR-12)

## What the Results Do NOT Demonstrate

- Behaviour under production load (municipal scale, 100+ concurrent users)
- Long-term stability (30-day uptime)
- Accessibility compliance across all assistive technologies
- All browser/device combinations

## Links

- Test files: `backend/tests/`
- Quality strategy: `20-quality-strategy.md`
- RTM: `../Requirements_Traceability_Matrix/RTM.md`
