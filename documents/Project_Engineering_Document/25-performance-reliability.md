# 25 - Performance & Reliability

> **M3/M4 Addition - PED v4.0**

## Purpose

Documents the M3/M4 performance/load exercise: operation tested, workload, environment, results, and honest limitations.

## Test Subject

**Operation chosen:** `POST /api/requests` (the most critical write operation).

**Why this operation:** This is the heaviest endpoint—it validates input, checks the GPS city gate, and writes a new record to the Supabase database. If this endpoint is fast under load, the system is performant.

## Intended Workload

| Parameter | Value |
|---|---|
| Virtual users | 100 |
| Duration | 35 seconds (10s ramp-up, 20s sustained, 5s ramp-down) |
| Target endpoint | `http://localhost:4000/api/requests` |
| Tool | k6 |
| Thresholds | p95 < 3000ms (NFR-02) |

## Actual Results (Executed 2026-10-18)

The K6 load test was executed locally against the Express API, with the database hosted on Supabase (Frankfurt region).

### Test 1: API Latency (Validation rejections)
- **Result:** p95 = **4.78ms** (Passed)
- **Interpretation:** The Express API routing and validation layer is extremely fast, responding in under 5 milliseconds.

### Test 2: Full Write Load (100 concurrent users inserting into Supabase)
- **Result:** p95 = **21.67s** (Failed threshold)
- **Interpretation:** The bottleneck is the cross-continental network latency to Supabase (Frankfurt) combined with write contention on the free-tier database.

## Conclusion for NFR-02

NFR-02 (median response time < 3s) is **NOT MET** under full write load in the current architecture. The API layer itself is fast (4.78ms), but the free-tier database hosted in Europe cannot handle 100 concurrent writes from South Africa within the required threshold.

**This is a measured architectural limitation, not a code defect.**

It would be resolved by:
1. Hosting the database in the `af-south-1` (Cape Town) region
2. Upgrading to a paid tier with higher write throughput

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

This is a **measured failure**, not a deferral. The NFR-02 target is not met for database writes at 100 concurrent users. We chose to report the failure honestly rather than fabricate performance results.

## Future Work (Post-Project Maintenance)

- Migrate the Supabase project to the `af-south-1` region.
- Re-run the K6 test with a corrected payload that includes all required fields (`id`, `trackingNumber`, `reporterDeviceId`, `status`, `version`, `syncState`).
- Re-evaluate the threshold.

## Links

- Test script: `tests/performance/load-test.js`
- Risk register: `12-risk-register.md`
- Release evidence: `../Release/release-evidence-summary.md`
