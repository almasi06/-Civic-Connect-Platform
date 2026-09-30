# M2 Baseline Definition

> **M2 Addition - PED v2.0**

**Baseline:** Architecture, Technology & Initial Design
**Version:** M2-Baseline-v1.0
**Git tag:** `m2-baseline` (to be applied after PR merge)

## Included in Baseline

| Item | Version | Owner |
|---|---|---|
| Architecture style | Layered monolith + in-process events | Member 1 |
| Logical layers | Presentation / Application / Domain / Persistence | Member 1 |
| ASR set | ASR-01 to ASR-08 | Member 1 |
| Technology stack | PERN + TypeScript + Prisma + Workbox | Member 1 |
| Database engine | PostgreSQL 16 | Member 1 |
| Hosting direction | Free-tier PaaS (provider TBD) | Member 1 |
| CI approach | GitHub Actions (build + unit tests blocking) | Member 3 |
| Branching model | GitHub Flow, protected main, 2 reviewers | Member 3 |
| Data model | Initial schema | Member 2 |
| Design patterns | Observer + Factory Method | Member 2 |
| Notification integration | In-process domain event | Member 2 |
| RTM structure | Evolving matrix | Member 3 |

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
| Detailed design patterns | Member 2 in progress | ADR-PERSIST-01, ADR-INT-01 | M2 (this milestone) |
| Specific class designs | Detailed design not required in M2 | M3 detailed design | M3 |

## Change Control

Any post-baseline change to an included item requires:
1. A new ADR (or amendment to an existing ADR)
2. Team review (2 approvals via PR)
3. Update to this baseline document
4. Update to affected PED sections, RTM, and Risk Register

## Sign-Off

| Role | Name | Date | Approved |
|---|---|---|---|
| Architecture Lead | Davidzo Malapile | 2026-09-29 | ✅ |
| Data & Design Lead | Naledi Moeng | pending | ⏳ |
| Dev & Traceability Lead | Kamohelo Mabena | pending | ⏳ |

**Baseline becomes formally accepted when all three signatures are present and the PR is merged into Documentation.**

## Links

- Document Control: [00-document-control.md](00-document-control.md)
- ASRs: [06-asrs.md](06-asrs.md)
- Architecture: [07-architecture.md](07-architecture.md)
- Technology: [08-technology-stack.md](08-technology-stack.md)
- Deployment: [14-deployment.md](14-deployment.md)