# Regression Tests

Regression tests ensure that previously fixed defects do not reappear.

## Purpose

When a defect is fixed, a regression test is added to catch the same defect if it re-emerges. M3 §9 requires retaining meaningful corrected-defect tests.

## Files

| File | Defect reference | What it protects |
|---|---|---|
| *(to be added as defects are fixed)* | | |

## Rules

- Every fixed defect with severity Medium or higher should have a regression test
- Regression tests must be traceable to a defect ID
- Regression tests must be retained across milestones (not deleted)

## Traceability

Each regression test should reference:
- The defect ID (`DEF-XXX`)
- The requirement it protects (FR/NFR)
- The fix PR

## Running

```bash
npm run test:regression
```

## Evidence

Regression test results feed into `documents/Release/release-evidence-summary.md`.

## Related

- Defect register: `documents/Registers/defect-register.md`
- Technical debt register: `documents/Registers/technical-debt-register.md`