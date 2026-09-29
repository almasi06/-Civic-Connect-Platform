# Document Control

Version:** PED v2.0
**Baseline:** M2 Architecture, Technology & Initial Design
**Date:** 2026-09-28
**Team:** Davidzo Malapile, Naledi Moeng, Kamohelo Mabena

## Version History

| Version | Date | Change | Author |
|---|---|---|---|
| v1.0 | 2026-09-08 | M1 Engineering Foundation & Requirements Baseline | Team |
| v2.0 | 2026-09-28 | M2 Architecture, Technology & Initial Design Baseline | Team |

## Contributors

| Member | M2 Responsibility |
|---|---|
| Davidzo Malapile | Architecture, ASRs, technology stack, baseline |
| Naledi Moeng | Data/persistence, design patterns, integration |
| Kamohelo Mabena | RTM, implementation, documentation, GitHub evidence |

## Section 1.1 — M1 Baseline Inventory

> Preserved from PED v1.0. This catalogue proves M1 was not silently rewritten.

| M1 Artefact | M1 Content Summary | M2 Status |
|---|---|---|
| Problem & Business Need | Transparency gap in municipal service delivery | Preserved |
| Stakeholder Analysis | Citizens, field workers, admins, management | Preserved |
| FR-01 to FR-07 | 7 functional requirements | Preserved |
| NFR-01 to NFR-05 | 5 non-functional requirements | Preserved |
| Scope Baseline | M1 in/out/future scope | Preserved |
| Constraints | Scope, schedule, cost, quality, security, technology | Preserved; tech deferment resolved |
| RTM Structure | Requirement table skeleton | Evolved in M2 |
| Risk Register | RR-001 to RR-004 | Preserved; M2 adds RR-005–009 |
| FE Register | FE-001 to FE-006 | Preserved; M2 updates + FE-007 |
| Decision Log | ED-001, ED-002, ED-003 | Preserved; ED-003 resolved |
| Baseline Sign-Off | M1 sign-off block | Preserved; M2 sign-off added |
| AI Usage Register | M1 entries | Preserved; M2 entries added |

## Section 1.2 — M2 Controlled Change Record

> Every M1 change for M2, with reason and evidence. Controlled change per M2 brief Section 5.1.

| M1 Item | Change Type | M2 Change | Reason | Evidence |
|---|---|---|---|---|
| ED-003 (Deferred tech stack) | Resolved | Stack selected: PERN + TypeScript | M2 is designated decision point | Tech matrix, ADR-TECH-01 |
| RR-003 (Stack pressure) | Mitigated | Decision now evidence-based | Decision matrix applied | ADR-TECH-01 |
| RR-004 (Sensitive info) | Updated | Encryption tied to selected stack | Stack now known | ADR-TECH-01 |
| Architecture section | Added | Layered monolith + in-process events | M2 Section 5.3 | ADR-ARCH-01 |
| ASR section | Added | 8 ASRs identified and linked | M2 Section 5.2 | docs/ped/06-asrs.md |
| Technology section | Added | Full stack + versions + dependencies | M2 Section 5.5 | ADR-TECH-01 |
| Deployment direction | Added | Free-tier PaaS + managed Postgres | M2 Section 5.8 | docs/ped/14-deployment.md |
| New requirements | Added | FR-08, 10, 11, 14, 16, NFR-07, 10, 11, 12 | Scope evolution | PED Section Requirements (Member 3) |
| New risks | Added | RR-005 to RR-009 | M2 introduces new risks | PED Section Risks (Member 3) |
| New FE items | Added | FE-007 (architecture evolution path) | M2 forward planning | PED Section FE (Member 3) |

## Review & Sign-Off

See [15-baseline.md](15-baseline.md).
