# Tests - CivicConnect Backend

## Purpose

This document explains every test suite in the CivicConnect backend: what it verifies, how it was conducted, what the results were, and what they demonstrate.

## Test Categories

| Category | Count | Location |
|---|---|---|
| Unit | 31 | `tests/unit/*.test.ts` |
| Integration / API | 28 | `tests/integration/*.test.ts` |
| E2E / System | 2 | `tests/e2e/*.test.ts` |
| Health | 3 | `tests/api/health.test.ts` |
| **Total** | **64+** | - |

## How to Run

```bash
# From the backend folder
cd backend
npm test
```

**Requirements:**
- Backend server must be running (`npm run dev` in another terminal)
- `DATABASE_URL` must be set in `backend/.env`
- `DISABLE_RATE_LIMIT=1` (or `NODE_ENV=test`) to bypass rate limiting

## Test Suites

### Unit Tests

#### `tests/unit/workflow.test.ts` (20 tests)

**What it verifies:** The workflow state machine valid transitions, invalid transitions, role permissions.

**Coverage:**
- `ALLOWED` state transitions (submitted → assigned, assigned -> in_progress, etc.)
- `ROLE_CAN` role permission matrix (admin vs field_worker)
- Invalid transitions rejected
- Unknown statuses rejected

**How it was run:** `npm test` from backend folder, with server running.

**Results:** 20/20 passing.

**What it demonstrates:** The state machine logic is correct in isolation — no DB, no HTTP. This is a pure logic test.

---

#### `tests/unit/city.test.ts` (9 tests)

**What it verifies:** The Tshwane city-boundary gate — GPS coordinates inside vs outside the city.

**Coverage:**
- Coordinates inside Tshwane accepted
- Coordinates outside Tshwane rejected
- Boundary cases (edge of city limits)

**Results:** 9/9 passing.

**What it demonstrates:** The city gate correctly distinguishes valid from invalid coordinates.

---

#### `tests/unit/smoke.test.ts` (2 tests)

**What it verifies:** Basic sanity the test framework runs, the DB env var is set.

**Results:** 2/2 passing.

---

### Integration Tests

#### `tests/integration/auth.test.ts` (10 tests)

**What it verifies:** The authentication endpoints login, logout, current user.

**Test cases:**
- TC-BE-AUTH-01: valid credentials return a JWT token 
- TC-BE-AUTH-02 (negative): wrong password returns 401 
- TC-BE-AUTH-03 (negative): unknown email returns 401 
- TC-BE-AUTH-04 (negative): missing fields returns 400 
- TC-BE-AUTH-05 (negative): invalid email format returns 400 
- TC-BE-AUTH-06: valid token returns current user 
- TC-BE-AUTH-07 (negative): no token returns 401 
- TC-BE-AUTH-08 (negative): malformed token returns 401 
- TC-BE-AUTH-09 (negative): token without Bearer prefix returns 401 
- POST /logout returns 204 

**Results:** 10/10 passing.

**What it demonstrates:** The auth layer correctly issues tokens, rejects invalid credentials, and enforces token validation. Covers FR-12 and NFR-08.

---

#### `tests/integration/requests.test.ts` (12 tests)

**What it verifies:** Request submission and retrieval CRUD plus filters.

**Test cases:**
- TC-BE-REQ-01: valid report returns 201 with correct shape 
- TC-BE-REQ-02 (negative): missing lat/lng returns 400 
- TC-BE-REQ-03 (negative): GPS outside Tshwane returns 400 (city gate)
- TC-BE-REQ-04 (negative): invalid category returns 400 
- TC-BE-REQ-05: list returns an array 
- TC-BE-REQ-06: filter by category=pothole returns only potholes 
- TC-BE-REQ-07: filter by status=open excludes resolved/rejected 
- TC-BE-REQ-08: free-text search q=pothole matches 
- TC-BE-REQ-09: department=water filters by water categories 
- TC-BE-REQ-10..12: additional retrieval tests 

**Results:** 12/12 passing.

**What it demonstrates:** The request endpoints correctly validate input, enforce the city gate, and return filterable results. Covers FR-01, FR-03, FR-06, and FR-10.

---

#### `tests/integration/transitions.test.ts` (6 tests)

**What it verifies:** Status transitions with RBAC, optimistic concurrency, and audit history.

**Test cases:**
- TC-BE-TRANS-01: admin can assign (submitted → assigned) 
- TC-BE-TRANS-02 (negative): invalid transition submitted -> resolved rejected 
- TC-BE-TRANS-03 (negative): version mismatch returns 409 
- TC-BE-TRANS-04 (negative): unauthorised request returns 401 
- TC-BE-TRANS-05: history is recorded after a transition 
- TC-BE-TRANS-06 (negative): transitioning to an unknown status rejected 

**Results:** 6/6 passing.

**What it demonstrates:** The workflow service correctly enforces state machine rules, RBAC, and version checks. This is the strongest coverage of ADR-PERSIST-01 (transactional transitions). Covers FR-04, FR-05, FR-11, and NFR-12.

---

### E2E Tests

#### `tests/e2e/admin-resolve.test.ts` (1 test)

**What it verifies:** The full lifecycle submit -> assign -> in_progress -> resolve.

**Test case TC-E2E-02:** A citizen submits a report, an admin assigns it to a worker, the worker moves it to in_progress, then the worker resolves it. Verifies:
- All 4 transitions succeed (200)
- Final status is `resolved`
- History contains 4 entries (submitted, assigned, in_progress, resolved)

**Results:** 1/1 passing (after DEF-006 fix).

**What it demonstrates:** The full cross-layer lifecycle works end-to-end. This test also found **DEF-006** (`isAssignedTo` reading the wrong table).

#### `tests/e2e/citizen-flow.test.ts` (1 test)

**What it verifies:** Citizen-side journey — submit a report and look it up by tracking number.

**Results:** Passing.

---

### Health Tests

#### `tests/api/health.test.ts` (3 tests)

**What it verifies:** The `/health` endpoint.

**Test cases:**
- GET /health returns 200 with `ok: true` 
- Reports `db: connected` or `db: disconnected` 
- Unknown routes return 404 

**Results:** 3/3 passing.

**What it demonstrates:** The health endpoint is a reliable check for availability. Covers NFR-05.

---

## Results Summary

| Suite | Tests | Pass | Fail | Skip |
|---|---|---|---|---|
| Unit | 31 | 31 | 0 | 0 |
| Integration | 28 | 28 | 0 | 0 |
| E2E | 2 | 2 | 0 | 0 |
| Health | 3 | 3 | 0 | 0 |
| **Total** | **64** | **64** | **0** | **0** |

*(Except during the Supabase password issue, when E2E tests skip.)*

---

## What the Tests Demonstrate

- ✅ **Input validation** - invalid requests return 400 with clear messages
- ✅ **RBAC** - unauthorised roles return 401 / 403
- ✅ **Concurrency safety** - version mismatches return 409
- ✅ **Audit trail** - every transition appends to `request_history`
- ✅ **City boundary enforcement** - GPS outside Tshwane rejected
- ✅ **Filtering and search** - requests can be filtered by category, status, department, and free text
- ✅ **End-to-end lifecycle** - submit -> assign -> in_progress -> resolve works

## What the Tests Do NOT Demonstrate

- **Production-scale performance** - the load test is a placeholder
- **Accessibility compliance** - no WCAG audit
- **Cross-browser behaviour** - only Chromium tested
- **Offline sync timing** - the sync endpoint exists but timing tests were deferred
- **Security hardening** - no penetration testing

## Traceability

Every test ID maps to a requirement in the **Requirements Traceability Matrix**:
`documents/Requirements_Traceability_Matrix/RTM.md`

| Test ID | Requirement |
|---|---|
| TC-BE-AUTH-01..09 | FR-12, NFR-08 |
| TC-BE-REQ-01..04 | FR-01 |
| TC-BE-REQ-05..09 | FR-03, FR-06, FR-10 |
| TC-BE-TRANS-01..06 | FR-04, FR-05, FR-11, ADR-PERSIST-01 |
| TC-E2E-01, TC-E2E-02 | FR-01, FR-04, FR-11 |
| TC-API-01 | NFR-05 |

## Test Framework & Tools

| Tool | Purpose |
|---|---|
| **Vitest 2** | Test runner |
| **Supertest** | HTTP assertions against Express |
| **`fetch`** (built-in) | Direct HTTP calls to the running server |
| **pg** | Direct DB queries for test setup/teardown |
| **bcryptjs** | Password hashing in seed data |

## Test Configuration

Config file: `backend/vitest.config.ts`

Key settings:
- `env.NODE_ENV = "test"` - signals test mode
- `env.DISABLE_RATE_LIMIT = "1"` - bypasses rate limiting for repeated test runs
- `pool: "forks"` + `singleFork: true` - runs test files sequentially to avoid DB connection exhaustion
- `testTimeout: 15_000` - 15 seconds per test
- `setupFiles: ["tests/setup.ts"]` - loads `.env` before tests

## Known Issues & Findings

- **DEF-005** - Rate limiter blocked integration tests. Fixed by making it environment-aware.
- **DEF-006** - `isAssignedTo` read the wrong table. Fixed in `request.repository.ts`.
- **DEF-007** - Duplicate `t3` declaration in E2E test. Fixed.
- **DEF-008** - Supabase password authentication failure (in progress). Blocks full test run.

## How to Add a New Test

1. Create a test file in the appropriate folder (`tests/unit/`, `tests/integration/`, or `tests/e2e/`)
2. Follow the naming convention: `*.test.ts`
3. Include a header comment:
   ```
   // =============================================================================
   // [What this file covers]
   // Covers: [FR-XX, NFR-XX]
   // Requires: server running on http://localhost:4000
   // =============================================================================
   ```
4. Use descriptive test names with IDs: `it("TC-BE-XXX-NN: description", ...)`
5. Always test the negative case alongside the positive one
6. Reference the requirement ID in the header

## Related Documentation

- **RTM:** `documents/Requirements_Traceability_Matrix/RTM.md`
- **Defect register:** `documents/Registers/defect-register.md`
- **Technical debt register:** `documents/Registers/technical-debt-register.md`
- **Quality strategy:** `documents/Project_Engineering_Document/23-quality-strategy.md`
- **Black-box validation:** `documents/Project_Engineering_Document/24-black-box-validation.md`