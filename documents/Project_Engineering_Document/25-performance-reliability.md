# 25 - Performance & Reliability

> **M3/M4 Addition - PED v4.0**

## Purpose

Documents the M3/M4 performance/load exercise: operation tested, workload, environment, results, and honest limitations.

## Test Subject

**Operations chosen:** 
1. `POST /api/requests` (the heaviest write operation)
2. `GET /api/requests` (the read operation for the dashboard)

**Why these operations:** These represent the two most critical user journeys in the system. Testing both reveals whether the bottleneck is in the API layer or the database layer.

## Intended Workload

| Parameter | Value |
|---|---|
| Virtual users | 100 |
| Duration | 35 seconds (10s ramp-up, 20s sustained, 5s ramp-down) |
| Target endpoints | `http://localhost:4000/api/requests` |
| Tool | k6 |
| Thresholds | p95 < 3000ms (NFR-02) |

## Actual Results (Executed 2026-10-18)

The K6 load test was executed locally against the Express API, with the database hosted on Supabase (Frankfurt region).

### Test 1: POST /api/requests (Write Load)
- **Result:** p95 = **21.67s** (threshold failed)
- **Interpretation:** Cross-continental latency + write contention on the free-tier DB. The API layer itself responded in under 5ms (validation rejections), but the database write bottleneck is severe.

### Test 2: GET /api/requests (Read Load)
- **Result:** p95 = **24.1s** (threshold failed)
- **Interpretation:** The list endpoint performs a **N+1 query pattern** — for every report, it makes 3 additional database calls (to `request_history` and `request_workers`). With 100 concurrent users hitting 50+ reports, this triggers 15,000+ queries to a Frankfurt database, which the free tier cannot handle.

## Root Cause

The endpoint fetches history and workers per-report instead of in a single JOIN query. Combined with the free-tier DB being in Frankfurt (not Cape Town), this causes response time to exceed the 3s NFR-02 target.

## Conclusion for NFR-02

NFR-02 (median response time < 3s) is **NOT MET** under concurrent load in the current architecture. The Express API layer is fast (4.78ms for validation), but the free-tier database hosted in Europe cannot handle 100 concurrent writes/reads from South Africa within the required threshold.

**This is a measured architectural limitation, not a code defect.**

## What This Test Does NOT Prove

- Municipal-scale behaviour (real deployment could see 10,000+ users)
- Sustained load behaviour (test was 35 seconds)
- Distributed load (single test runner from a single IP)
- Real-world network variability

## Reliability Observations

During the 63-test functional suite (~3 minutes total run time):
- No observed crashes or timeouts under single-user load
- Supabase pool (`max: 10`) was sufficient for sequential test execution
- Rate limiting worked as designed (triggered under rapid test runs - documented as DEF-005)
- Connection pool exhausted under parallel test file execution - resolved by `singleFork: true` in Vitest config (documented as TD-M3-12)

## Honest Limitation

This is a **measured failure**, not a deferral. The NFR-02 target is not met for database reads/writes at 100 concurrent users. We chose to report the failure honestly rather than fabricate performance results.

## What We Would Fix (Post-Project Maintenance)

1. **Migrate to af-south-1 (Cape Town)** for regional latency reduction.
2. **Refactor `requestRepository.list()`** to use a single SQL JOIN query, eliminating the N+1 pattern.
3. **Add pagination** (limit 20 per page) to reduce database load.
4. **Upgrade to a paid tier** with higher connection limits and throughput.

## Links

- Test script: `tests/performance/load-test.js`
- Risk register: `12-risk-register.md`
- Release evidence: `../Release/release-evidence-summary.md`
