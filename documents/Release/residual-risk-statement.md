# Residual Risk Statement

## Purpose

Honestly lists the risks that remain after all planned testing and mitigation.

## Residual Risks

| ID | Risk | Likelihood | Impact | Why it remains | Acceptance rationale |
|---|---|---|---|---|---|
| RR-R1 | Supabase free-tier connection limits under concurrent load | Medium | High | Cannot simulate production load locally | Acceptable for MVP; monitored; upgrade path exists |
| RR-R2 | Supabase free tier pauses after 7 days inactivity | Medium | Low | Free-tier behaviour | Wake project before demos; documented |
| RR-R3 | Notification event lost if app crashes between commit and dispatch | Low | Medium | No persistent outbox pattern yet | Documented as TD |
| RR-R4 | Browser geolocation API unavailable in older browsers | Low | Low | Progressive enhancement | Acceptable; graceful degradation |
| RR-R5 | Audit retention is 90 days (NFR-06) | Low | Medium | Longer retention costs more on free tier | Documented in ADR-PERSIST-01 |
| RR-R6 | Manual migrations (no automated tooling) | Medium | Medium | Deferred post-M3 (TD-M3-10) | Acceptable for M3 |
| RR-R7 | `request_workers` table unused | Low | Low | Data-model inconsistency (TD-M3-XX) | Acceptable; refactor planned |
| RR-R8 | No multi-region failover | Low | High | Single Supabase region | Acceptable for MVP; requires paid tier |

## Not Covered by M3 Testing

- Production-scale load (100+ concurrent users)
- Multi-region failover
- Disaster recovery at cloud scale
- Payment/financial workflows (excluded by M2 scope)
- Native mobile app behaviour (deferred)

## Supporting Evidence

- Risk register: `../Project_Engineering_Document/12-risk-register.md`
- Defect register: `../Registers/defect-register.md`
- Technical debt register: `../Registers/technical-debt-register.md`
- Performance test: `../Project_Engineering_Document/25-performance-reliability.md`

## Release Readiness Impact

| Risk | Classification |
|---|---|
| RR-R1, RR-R6 | Monitored |
| RR-R2, RR-R3, RR-R4, RR-R5, RR-R7 | Acceptable |
| RR-R8 | Mitigated later (M4) |

This feeds into the Release Evidence Summary.