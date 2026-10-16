# Performance Tests

Performance/load tests measure how the system behaves under a defined workload.

## Purpose

Per M3 §13: choose one performance-sensitive operation, define a small workload, measure results, and interpret limitations.

## Test scenario

| Field | Value |
|---|---|
| Operation | *(to be filled)* |
| Tool | *(e.g., k6)* |
| Virtual users | *(e.g., 50)* |
| Duration | *(e.g., 60 seconds)* |
| Target endpoint | *(e.g., POST /api/requests)* |

## Files

| File | Purpose |
|---|---|
| `load-test.js` | k6 load test script |

## Running

Install k6: https://k6.io/docs/get-started/installation/

```bash
k6 run tests/performance/load-test.js
```

## Results

Recorded in `documents/Project_Engineering_Document/25-performance-reliability.md`.

## What the test does NOT prove

- Does not prove municipal-scale behaviour
- Does not prove sustained-load behaviour
- Does not replace production monitoring