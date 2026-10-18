# Release

This folder contains the release-candidate identification, staging environment, and release-readiness evidence for M3.

## Files

| File | Purpose |
|---|---|
| [release-candidate.md](release-candidate.md) | Identifies the exact M3 release candidate (tag/commit) |
| [staging-environment.md](staging-environment.md) | Describes the staging environment and demo approach |
| [release-evidence-summary.md](release-evidence-summary.md) | The release-readiness argument (M3 §15) |
| [rollback-plan.md](rollback-plan.md) | Recovery procedure if release fails |
| [residual-risk-statement.md](residual-risk-statement.md) | Known limitations and honest residual risks |

## Release readiness classification

| Classification | Meaning |
|---|---|
| **READY** | All critical checks pass; no blocking defects; residual risks acceptable |
| **CONDITIONALLY READY** | Some non-blocking issues exist; workarounds documented; release proceeds with caution |
| **NOT READY** | Critical failures or high-impact defects unresolved; release must not proceed |

## Cross-references

- CI runs -> GitHub Actions tab
- Test evidence -> `documents/Test_Evidence/` *(if applicable)*
- Defects -> `documents/Registers/defect-register.md`
- Technical debt -> `documents/Registers/technical-debt-register.md`