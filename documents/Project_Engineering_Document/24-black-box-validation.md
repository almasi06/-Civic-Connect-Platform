# 24 - Black-Box, Integration & System Validation

> **M3 Addition - PED v3.0**


## Purpose

Documents which black-box test techniques were applied, which critical scenarios were exercised, and what the results demonstrate.

## Techniques Applied

| Technique | Applied to | Example |
|---|---|---|
| **Equivalence Partitioning** | Login credentials, form inputs | Valid email / invalid email / missing field  TC-BE-AUTH-01, TC-BE-AUTH-03, TC-BE-AUTH-04 |
| **Boundary Value Analysis** | GPS coordinates (inside/outside Tshwane) | TC-BE-REQ-03 tests the city boundary |
| **Decision Table** | Status transition rules | TC-BE-TRANS-02  Submitted -> Resolved is rejected |
| **State Transition** | Request lifecycle | TC-E2E-02  Submitted → Assigned -> In Progress → Resolved |
| **Negative testing** | Unauthorised, malformed | TC-BE-TRANS-04 (no token = 401), TC-BE-REQ-02 (missing lat/lng = 400) |

## Critical Scenarios Tested

| Scenario | Requirement | Test Case | Result |
|---|---|---|---|
| Citizen submits request with photo + GPS | FR-01 | TC-BE-REQ-01 |  Pass |
| Missing lat/lng is rejected | FR-01 | TC-BE-REQ-02 |  Pass |
| GPS outside Tshwane is rejected | FR-01 | TC-BE-REQ-03 |  Pass |
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
| E2E: full lifecycle (submit -> assign -> in_progress -> resolve) | FR-01, FR-04, FR-11, ADR-PERSIST-01 | TC-E2E-02 |  In progress |

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
- Quality strategy: `23-quality-strategy.md`
- RTM: `../Requirements_Traceability_Matrix/RTM.md`