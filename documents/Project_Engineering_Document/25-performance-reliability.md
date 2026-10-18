# 25 - Performance & Reliability

> **M3 Addition - PED v3.0**


## Purpose

Documents the M3 performance/load exercise: operation tested, workload, environment, results, and honest limitations.

## Test Subject

**Operation chosen:** `GET /health` the baseline API endpoint for measuring round-trip latency.

**Why this operation:**
- Simplest endpoint measures the API's base response time without DB or business logic
- Serves as a lower bound for all other endpoints
- Used by monitoring tools to check availability (NFR-05)

**Secondary consideration:** `GET /api/requests/:id` reads from Supabase, exercises the DB connection pool.

## Intended Workload

| Parameter | Value |
|---|---|
| Virtual users | 20 |
| Duration | 30 seconds |
| Target endpoint | `http://localhost:4000/health` |
| Tool | k6 (script prepared at `tests/performance/load-test.js`) |
| Thresholds | p95 < 3000ms (NFR-02); error rate < 5% |

## Status

 **Performance test not executed in M3.**

The k6 script exists at `tests/performance/load-test.js`. Execution was deferred due to deadline constraints.

## Why Deferred

- Time prioritised for functional test coverage (60+ tests across unit / integration / E2E)
- k6 tool installation on Windows exceeded remaining schedule
- **Functionally verified via integration test execution metrics:** observed single-request latency during the 60-test suite averaged 300–800ms per HTTP request

## What the Test Would Measure

When executed, the k6 script would:

1. Simulate 20 virtual users hitting `/health` for 30 seconds
2. Record response time distribution (p50, p90, p95, p99)
3. Report error rate
4. Compare against NFR-02 (p95 < 3000ms)

## Predicted Results (Based on Observed Latency)

Based on observed single-request latency during the functional test suite:

| Metric | Target | Predicted | Verdict |
|---|---|---|---|
| Response time p50 | < 3000ms | 200-400ms |  Expected to pass |
| Response time p95 | < 3000ms | 500-900ms |  Expected to pass |
| Success rate | > 99% | > 99.5% |  Expected to pass |

**Reasoning:** Integration tests complete in 300-800ms per request against the Supabase Frankfurt pooler from a local machine. Even with 20 concurrent users, the p95 should stay well under 3 seconds.

## Comparison to NFR Targets

| NFR | Target | Status |
|---|---|---|
| NFR-01 (offline sync < 10s) | < 10 s for 20 updates |  Not measured |
| NFR-02 (response p95 < 3s) | < 3 s at 100 concurrent |  Predicted to pass; not measured |
| NFR-05 (99.5% uptime) | 99.5% over 30 days |  Requires production deployment |

## What This Test Would NOT Prove

- Does not prove municipal-scale behaviour (real deployment could see 10,000+ users)
- Does not prove sustained load behaviour (test is short)
- Does not cover distributed load (single test runner)
- Does not account for real-world network variability
- Does not prove behaviour after free-tier auto-pausing

## Reliability Observations

During the 60-test functional suite (~10 minutes total run time):

- No observed crashes or timeouts under single-user load
- Supabase pool (`max: 10`) was sufficient for sequential test execution
- Rate limiting worked as designed (triggered under rapid test runs - documented as DEF-005)
- Connection pool exhausted under parallel test file execution - resolved by `singleFork: true` in Vitest config (documented as TD-M3-12)

## Honest Limitation

This is a **deferral, not a verification**. The NFR-02 target remains **unproven** until the test is executed against a running system. The prediction above is based on indirect evidence (integration test latency) and should not be treated as a substitute for measured results.

## Future Work (M4)

- Install k6 in CI runner or use an equivalent tool
- Execute the load test against staging
- Extend workload to 50-100 concurrent users
- Add a DB-read scenario
- Record results in this section

## Links

- Test script: `tests/performance/load-test.js`
- Risk register: `12-risk-register.md`
- Release evidence: `../Release/release-evidence-summary.md`
