# M2 Baseline Definition


**Baseline:** Architecture, Technology & Initial Design
**Version:** M2-Baseline-v1.0
**Git tag:** `m2-baseline` 

## Included in Baseline

| Item | Version | Owner |
|---|---|---|
| Architecture style | Layered monolith + in-process events | Kamo |
| Logical layers | Presentation / Application / Domain / Persistence | Kamo |
| ASR set | ASR-01 to ASR-08 | Kamo |
| Technology stack | PERN + TypeScript + Prisma + Workbox | Kamo |
| Database engine | PostgreSQL 16 | Kamo |
| Hosting direction | Free-tier PaaS (provider TBD) | Kamo |
| CI approach | GitHub Actions (build + unit tests blocking) | Davidzo |
| Branching model | GitHub Flow, protected main, 2 reviewers | Davidzo |
| Data model | Initial schema | Naledi |
| Design patterns | Observer + Factory Method | Naledi |
| Notification integration | In-process domain event | Naledi |
| RTM structure | Evolving matrix | Davidzo |

## Traceability

Every baselined item traces to at least one of:
- A requirement (FR-XX, NFR-XX)
- An ASR (ASR-01 to ASR-08)
- An ADR (ADR-ARCH-01, ADR-TECH-01, ADR-PERSIST-01, ADR-INT-01)
- A risk (RR-XXX)
- A forward engineering consideration (FE-XXX)

## Deferred / Open Decisions

| Item | Reason | Evidence needed | Target |
|---|---|---|---|
| Specific hosting provider | Free-tier terms change | Comparison matrix | M3 |
| Message broker | A2 Task 3 recommends in-process | Independent scaling requirement | M3/M4 |
| Read replicas / caching | No measured performance evidence | Load test results | M3/M4 |
| Observability stack | FE-004 | Free-tier monitoring comparison | M3 |
| Detailed design patterns | Member 2 in progress | ADR-PERSIST-01, ADR-INT-01 | M2 |
| Specific class designs | Detailed design not required in M2 | M3 detailed design | M3 |

## Change Control

Any post-baseline change to an included item requires:
1. A new ADR (or amendment to an existing ADR)
2. Team review (2 approvals via PR)
3. Update to this baseline document
4. Update to affected PED sections, RTM, and Risk Register

## Sign-Off

| Role | Name | Date | 
|---|---|---|
| Architecture Lead | Kamohelo Mabena | 2026-09-28 |
| Data & Design Lead | Naledi Moeng | 2026-09-28 |
| Dev & Traceability Lead | Davidzo Malapile | 2026-09-28 |

> Baseline becomes formally accepted when all three signatures are present and the PR is merged into Documentation.

## Links

- Document Control: [00-document-control.md](00-document-control.md)
- ASRs: [06-asrs.md](06-asrs.md)
- Architecture: [07-architecture.md](07-architecture.md)
- Technology: [08-technology-stack.md](08-technology-stack.md)
- Deployment: [14-deployment.md](14-deployment.md)
