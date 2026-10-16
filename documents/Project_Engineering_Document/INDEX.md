# CivicConnect: Project Engineering Document (PED)

## Quick Navigation

| Section | File | Status |
|---|---|---|
| Document Control | [00-document-control.md](00-document-control.md) | Baselined |
| Requirements (FR + NFR) | [03-requirements.md](03-requirements.md) | M1 + M2 additions |
| Scope Baseline | [04-scope-baseline.md](04-scope-baseline.md) | M1 + M2 layers |
| Constraints | [05-constraints.md](05-constraints.md) | M1 baseline |
| **ASRs** | [06-asrs.md](06-asrs.md) | Baselined |
| **Architecture** | [07-architecture.md](07-architecture.md) | Baselined |
| **Technology Stack** | [08-technology-stack.md](08-technology-stack.md) | Baselined |
| Data & Persistence | [09-data-persistence.md](09-data-persistence.md) | M2 |
| Design Decisions | [10-design-decisions.md](10-design-decisions.md) | M2 |
| Integration / API | [11-integration-api.md](11-integration-api.md) | M2 |
| Risk Register | [12-risk-register.md](12-risk-register.md) | M1 + M2 |
| Forward Engineering | [13-forward-engineering.md](13-forward-engineering.md) | M1 + M2 |
| **Deployment** | [14-deployment.md](14-deployment.md) | Baselined |
| **Baseline Definition** | [15-baseline.md](15-baseline.md) | Baselined |
| AI Usage Register | [16-ai-usage-register.md](16-ai-usage-register.md) | M1 + M2 + M3 |

### M3 Additions (PED v3.0)

| Section | File | Status |
|---|---|---|
| **M3 Overview** | [18-m3-overview.md](18-m3-overview.md) | Baselined |
| **M2 Baseline Conformance** | [19-m2-baseline-conformance.md](19-m2-baseline-conformance.md) | Baselined |
| **Controlled Changes** | [20-controlled-changes.md](20-controlled-changes.md) | Baselined |
| **Construction & Configuration** | [21-construction-configuration.md](21-construction-configuration.md) | Baselined |
| **CI & Automated Verification** | [22-ci-automated-verification.md](22-ci-automated-verification.md) | Baselined |
| **Quality Strategy** | [23-quality-strategy.md](23-quality-strategy.md) | Baselined |
| **Black-Box Validation** | [24-black-box-validation.md](24-black-box-validation.md) | Baselined |
| **Performance & Reliability** | [25-performance-reliability.md](25-performance-reliability.md) | Baselined |
| **Defects & Quality** | [26-defects-quality.md](26-defects-quality.md) | Baselined |
| **Release Readiness** | [27-release-readiness.md](27-release-readiness.md) | Baselined |

## Architecture Decision Records (ADRs)

| ADR | Decision | Status |
|---|---|---|
| [ADR-ARCH-01](../Architecture_Decision_Record/ADR-ARCH-01-layered-monolith.md) | Layered monolith + in-process events | Accepted |
| [ADR-TECH-01](../Architecture_Decision_Record/ADR-TECH-01-pern-stack.md) | PERN + TypeScript stack | Accepted |
| [ADR-TECH-02](../Architecture_Decision_Record/ADR-TECH-02-supabase-postgres-hosting.md) | Supabase as PostgreSQL host | Accepted |
| [ADR-INT-01](../Architecture_Decision_Record/ADR-INT-01-notification-integration.md) | In-process Event-based Integration | Accepted |
| [ADR-PERSIST-01](../Architecture_Decision_Record/ADR-PERSIST-01-transactional-transitions.md) | Database Transaction | Accepted |
| [ADR-TECH-02](../Architecture_Decision_Record/ADR-TECH-02-supabase-postgres-hosting.md) | pg node postgres | Accepted |

## Project Registers

| Register | Location |
|---|---|
| Defect Register | [../Registers/defect-register.md](../Registers/defect-register.md) |
| Technical Debt Register | [../Registers/technical-debt-register.md](../Registers/technical-debt-register.md) |
| Risk Register | [12-risk-register.md](12-risk-register.md) |
| AI Usage Register | [16-ai-usage-register.md](16-ai-usage-register.md) |

## Release Evidence

| Document | Location |
|---|---|
| Release Candidate | [../Release/release-candidate.md](../Release/release-candidate.md) |
| Release Evidence Summary | [../Release/release-evidence-summary.md](../Release/release-evidence-summary.md) |
| Residual Risk Statement | [../Release/residual-risk-statement.md](../Release/residual-risk-statement.md) |
| Staging Environment | [../Release/staging-environment.md](../Release/staging-environment.md) |
| Rollback Plan | [../Release/rollback-plan.md](../Release/rollback-plan.md) |

## Requirements Traceability

| Document | Location |
|---|---|
| RTM (full) | [../Requirements_Traceability_Matrix/RTM.md](../Requirements_Traceability_Matrix/RTM.md) |

## Version History

| Version | Date | Change | Author |
|---|---|---|---|
| v1.0 | 2026-09-08 | M1 Engineering Foundation & Requirements Baseline | Team |
| v2.0 | 2026-09-28 | M2 Architecture, Technology & Initial Design Baseline | Team |
| v3.0 | 2026-10-16 | M3 Controlled Construction, Integration, Quality & Release Readiness sections 18-27 added; registers and release evidence populated | Team |
