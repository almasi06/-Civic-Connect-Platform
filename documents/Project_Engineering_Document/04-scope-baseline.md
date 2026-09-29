# Scope Baseline

## Milestone 1 (M1) Scope Baseline
*Engineering Foundation & Requirements Baseline*

### In Scope
- Citizen web and mobile responsive portal for logging municipal service faults.
- Role-based administration dashboard for routing, updating and closing support tickets.
- Integrated notification system for tracking reported issues.
- Reporting metrics and audit logs for municipal managers.
- Problem statement, business need and stakeholder analysis.
- Functional requirements FR-01 to FR-07 and non-functional requirements NFR-01 to NFR-05.
- Acceptance criteria for all baselined requirements.
- Assumptions and constraints: scope, schedule, cost, resources, quality, security.
- Initial Requirements Traceability Matrix (RTM).
- Initial Risk Register (RR-001 to RR-057).
- Initial Engineering Decision Log (ED-001 to ED-003).
- Process/project approach and team working agreement.
- GitHub repository and mandatory governance controls.
- AI Usage Register.
- Initial deployment/operational considerations.
- PED v1.0 baseline and sign-off.

### Out of Scope
- Direct integration with municipal financial billing or automated payment gateways.
- Proprietary native mobile applications (iOS/Android App Store releases; initial scope is web responsive).
- Automated IoT sensor network ingestion.
- Detailed architecture, technology stack selection, and design patterns (deferred to M2).
- Implementation, CI/CD pipelines, and automated testing (deferred to M3).
- Final product, production deployment, and engineering defence (deferred to M4).

### Future Scope
- Predictive maintenance analytics driven by historical fault data.
- Multi-language localization for South African official languages beyond English.
- Expanded requirements (FR-08 to FR-15, NFR-06 to NFR-11) identified during M2.

---

## Milestone 2 (M2) Scope Baseline
*Architecture, Design & Engineering Decisions*

### In Scope
- Architecture alternatives and justified selection (layered monolith + in-process events).
- Architecture diagrams and ADRs (ADR-ARCH-01, ADR-TECH-01).
- Technology-stack decision (PERN + TypeScript) with security, cost, schedule, team-capability and deployment implications.
- Data/persistence design (ADR-PERSIST-01: transactional status transitions, optimistic concurrency, post-commit events, no status caching).
- Information architecture and user-interface/interaction design.
- Wireframes/prototypes and usability/accessibility rationale.
- API contracts and integration design (in-process domain event between workflow and notification).
- Relevant design principles/patterns (Observer, Factory Method) and explicit avoidance of unnecessary complexity.
- Initial working/design prototype where required.
- Updated RTM, Risk Register, Decision Log and PED v2.0.
- Evidence of responsible AI-assisted research/design where used.
- Expanded requirements FR-08 to FR-15 and NFR-06 to NFR-11 (from Risk Register).
- Architecturally significant requirements (ASRs) identification.

### Out of Scope
- Substantial working implementation (deferred to M3).
- Formal change request and impact analysis (deferred to M3).
- Automated build, CI, and quality gates (deferred to M3).
- Staging deployment and production-readiness review (deferred to M3).
- Final product, production deployment, and engineering defence (deferred to M4).
- Payment gateway integration, native mobile apps, IoT sensor integration (remain excluded from entire project).

### Future Scope
- Controlled construction, integration, quality and release readiness activities (M3).
- Final product, project success evaluation, and engineering defence (M4).
- Any remaining should/could requirements prioritised for later implementation.
- Operational monitoring, rollback, and recovery concepts (to be refined in M3).

---

## Milestone 3 (M3) Scope Baseline
*Controlled Construction, Integration, Quality & Release Readiness*

### In Scope
- Substantial working implementation integrated into `main`.
- Formal lecturer/client change request and impact analysis.
- Controlled implementation of approved change.
- Feature branches, meaningful commits and traceable Pull Requests.
- Two-reviewer approval evidence and meaningful review/rework.
- Automated build and dependency restoration.
- Automated unit/integration/regression tests.
- Static analysis and dependency/vulnerability checks.
- Quality gates and build/test failure handling.
- Requirements-to-code-to-test traceability.
- Quality/test strategy and evidence.
- White-box, black-box, integration/system and performance evidence as appropriate.
- Defect register and residual risk.
- Staging deployment and environment-parity evidence.
- Configuration/secrets handling.
- Security assurance/threat review and mitigations.
- Production-readiness review, rollback planning and operational monitoring concept.
- Updated technical-debt register, Risk Register, Decision Log/ADRs, RTM and PED v3.0.

### Out of Scope
- Final product release to production (deferred to M4).
- Final stakeholder validation and acceptance (deferred to M4).
- Final project success evaluation (deferred to M4).
- Final engineering defence and PED v4.0 (deferred to M4).
- Any new functional requirements beyond the approved baseline (changes must go through formal change control).
- Payment gateway integration, native mobile apps, IoT sensor integration (remain excluded).

### Future Scope
- Final product demonstration, production deployment, and operational handover (M4).
- Decision consequence reflection and learning (M4).
- Post-project maintenance and evolution planning (beyond M4).
- Any deferred lower-priority requirements (subject to must/should/could re-prioritisation per RR142/RR150).

---

## Milestone 4 (M4) Scope Baseline
*Final Product, Project Success & Engineering Defence*

### In Scope
- Final working product and production/release evidence.
- Stakeholder validation against original needs and acceptance criteria.
- Delivered scope compared with approved baseline.
- Schedule performance and variance analysis.
- Cost/resource evaluation and likely operational cost.
- Quality and security evidence summary.
- Deployment, rollback, observability and operational readiness evidence.
- Final Risk Register, technical-debt/evolution view and known limitations.
- Final RTM and PED v4.0.
- Decision consequence reflection on significant earlier decisions.
- AI use and verification record across the lifecycle.
- Professional final product demonstration and individual engineering defence.
- Evaluation of project success against: stakeholder value, scope, schedule, cost/resources, quality, security, risk, deployment/operations, maintainability/evolution.

### Out of Scope
- Any new feature development not in the approved baseline (post-M4 scope).
- Post-project operational support and maintenance (unless explicitly agreed).
- Further milestone deliverables beyond M4.
- Payment gateway integration, native mobile apps, IoT sensor integration (remain excluded).

### Future Scope
- Post-project maintenance and support.
- Evolution for new stakeholder needs (e.g., additional languages, predictive analytics).
- Operational improvements identified during M4 reflection.
- Potential future integration with municipal billing or IoT sensors (if stakeholder demand arises).
- Any technical debt remediation beyond the project timeline.

---

## Summary of Scope Evolution Across Milestones
| Milestone | Primary Focus | In Scope | Out of Scope | Future Scope |
|---|---|---|---|---|
| **M1** | Engineering Foundation & Requirements Baseline | Requirements, stakeholders, initial RTM, risk register, decision log, GitHub governance, PED v1.0 | Architecture, technology stack, design patterns, implementation, CI/CD, final product | Predictive maintenance, multi-language, expanded requirements (FR-08–FR-15, NFR-06–NFR-11) |
| **M2** | Architecture, Design & Engineering Decisions | Architecture, technology stack (PERN+TS), data persistence, design patterns, integration, ASRs, expanded requirements, PED v2.0 | Substantial implementation, CI/CD, staging deployment, final product | M3 activities (construction, integration, quality, release readiness), M4 activities (final product, defence) |
| **M3** | Controlled Construction, Integration, Quality & Release Readiness | Working implementation, change control, CI, tests, quality gates, staging deployment, security, PED v3.0 | Final production release, final stakeholder validation, final defence, PED v4.0 | M4 activities, post-project maintenance, deferred lower-priority requirements |
| **M4** | Final Product, Project Success & Engineering Defence | Final product, production evidence, stakeholder validation, project success evaluation, decision reflection, PED v4.0, final defence | New feature development, post-project support, further milestones | Post-project maintenance, evolution, operational improvements, potential future integrations |
