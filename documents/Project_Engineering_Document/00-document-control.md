# Document Control

**Version:** PED v3.0
**Baseline:** M3 Controlled Construction, Integration, Quality & Release Readiness
**Date:** 2026-10-13
**Team:** Davidzo Malapile, Naledi Moeng, Kamohelo Mabena

## Version History

| Version | Date | Change | Author |
|---|---|---|---|
| v1.0 | 2026-09-08 | M1 Engineering Foundation & Requirements Baseline | Team |
| v2.0 | 2026-09-28 | M2 Architecture, Technology & Initial Design Baseline | Team |
| v3.0 | 2026-10-13 | M3 Controlled Construction, Integration, Quality & Release Readiness | Team |

## Contributors

| Member | M2 Responsibility |
|---|---|
| Davidzo Malapile | Architecture, ASRs, technology stack, baseline |
| Naledi Moeng | Data/persistence, design patterns, integration |
| Kamohelo Mabena | RTM, implementation, documentation, GitHub evidence |

| Member | M3 Responsibility |
|---|---|
| Davidzo Malapile | Frontend, RTM, GitHub evidence, CI integration |
| Naledi Moeng | Backend, API, database, persistence transactions |
| Kamohelo Mabena | Architecture views, ADRs, ASRs, design decisions |

## Section 1.1 - M1 Baseline Inventory

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
| Risk Register | RR-001 to RR-007 | Preserved; M2 adds RR-005–009 |
| FE Register | FE-001 to FE-006 | Preserved; M2 updates  |
| Decision Log | ED-001, ED-002, ED-003 | Preserved; ED-003 resolved |
| Baseline Sign-Off | M1 sign-off block | Preserved; M2 sign-off added |
| AI Usage Register | M1 entries | Preserved; M2 entries added |

## Section 1.2 - M2 Controlled Change Record

> Every M1 change for M2, with reason and evidence. Controlled change per M2 brief Section 5.1.

| M1 Item | Change Type | M2 Change | Reason | Evidence |
|---|---|---|---|---|
| ED-003 (Deferred tech stack) | Resolved | Stack selected: PERN + TypeScript | M2 is designated decision point | Tech matrix, ADR-TECH-01 |
| RR-003 (Stack pressure) | Mitigated | Decision now evidence-based | Decision matrix applied | ADR-TECH-01 |
| RR-004 (Sensitive info) | Updated | Encryption tied to selected stack | Stack now known | ADR-TECH-01 |
| Architecture section | Added | Layered monolith + in-process events | M2 Section 5.3 | ADR-ARCH-01 |
| ASR section | Added | 8 ASRs identified and linked | M2 Section 5.2 | 06-asrs.md |
| Technology section | Added | Full stack + versions + dependencies | M2 Section 5.5 | ADR-TECH-01 |
| Deployment direction | Added | Free-tier PaaS + managed Postgres | M2 Section 5.8 | 14-deployment.md |
| New requirements | Added | FR-08, 09, 10, 11, 13, 14, 15 NFR-07, 08, 09, 10, 11 | Scope evolution | PED Section Requirements  |
| New risks | Added | RR-008 to RR-157 | M2 introduces new risks | PED Section Risks  |
| Decision Log | Added | ED-004 to ED-012 | PED shows what was decided, why, on what evidence, what was rejected and how it is controlled  | 17-decision-log.md |

## Section 1.3 - M3 Controlled Change Record

> Every M2 change for M3, with reason and evidence. Controlled change per M3 brief Section 5.

| M2 Item | Change Type | M3 Change | Reason | Evidence |
|---|---|---|---|---|
| ED-003 (Deferred tech stack) | Resolved | Stack implemented: PERN + TypeScript + Supabase PostgreSQL | Implementation confirmed; Supabase chosen as host for the selected PostgreSQL | ADR-TECH-01, `backend/server/db.ts` |
| Architecture — persistence boundary | Added | ADR-PERSIST-01: transactional status transition | Status changes require atomic persistence of request + history + assignment | ADR-PERSIST-01-transactional-transitions.md, ADR-PERSIST-01-supporting-analysis.md |
| Architecture — notification integration | Added | ADR-INT-01: post-commit event raising | Notifications must not fire for rolled-back changes | ADR-INT-01-notification-integration.md |
| RR-M3-01 | Added | Post-commit event loss risk (mitigated by planned Outbox pattern) | Honest residual risk after ADR-PERSIST-01 | 12-risk-register.md §Persistence |
| RR-M3-02 | Added | Long-running transaction lock contention risk | Known trade-off of the chosen transaction boundary | 12-risk-register.md §Persistence |
| RR-M3-03 | Added | Version-mismatch conflict risk under concurrent load | Optimistic concurrency trade-off | 12-risk-register.md §Persistence |
| TD-M3-01 to TD-M3-03 | Added | Technical Debt Register entries | Outbox pattern deferred; saga pattern not applicable to monolith | Technical Debt Register (to be created in M3) |
| RTM — FR-01, FR-04, FR-06, NFR-03 | Status change | Proposed → Verified (M3) | Implementation and tests completed | Requirements_Traceability_Matrix/README.md |
| RTM — FR-02, FR-03, FR-05, FR-07 | Status change | Proposed → In Development (M3) | Partial implementation; further testing required | Requirements_Traceability_Matrix/README.md |
| Runtime view | Updated | Added ADR-PERSIST-01, ADR-INT-01, requirements and verification evidence links | Traceability from sequence diagram to decision records | Architecture/runtime-view.md |
| Data persistence document | Updated | Section 8 + Section 14 updated with ADR links, verification evidence plan, residual risks, technical debt | Direct linkage of persistence decision to ADR and evidence | 09-data-persistence.md |
| ADR-PERSIST-01 | Added | Full ADR + supporting analysis | M3 requires controlled decision records with traceable justification | ADR-PERSIST-01-transactional-transitions.md, ADR-PERSIST-01-supporting-analysis.md |
| AI Usage Register | Updated | M3 entries added | M3 requires AI contribution tracking | 16-ai-usage-register.md |
| Decision Log | Updated | ED-013 onward (if applicable) | Continuous controlled decision recording | 17-decision-log.md |
| Backend implementation | Added | Express + PostgreSQL backend with repositories, services, middleware | M2 → M3 transition from mock to real persistence | `backend/server/` |
| Test suite | Added | Backend integration + negative tests (TC-BE-01 to TC-BE-15+) | M3 requires meaningful verification evidence | `backend/tests/` (to be completed) |
| CI pipeline | Added | GitHub Actions running tests + typecheck + lint | M3 requires automated verification | `.github/workflows/` (Member 3) |

---

## Review & Sign-Off

See [15-baseline.md](15-baseline.md).
