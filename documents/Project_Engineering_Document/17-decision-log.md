# Engineering Decision Log

## Decision Log Index

| ID | Decision | ADR / Record | Status |
|---|---|---|---|
| ED-001 | Exclude payment integration from scope | M1 decision | Baselined |
| ED-002 | Web-responsive only release | M1 decision | Baselined |
| ED-003 | Defer final technology stack selection | M1 decision | Superseded by ED-005 |
| ED-004 | Adopt layered monolith with in-process domain events | ADR-ARCH-01 | Accepted |
| ED-005 | Adopt PERN + TypeScript technology stack | ADR-TECH-01 | Accepted |
| ED-006 | Transactional status transition with optimistic concurrency | ADR-PERSIST-01 | Accepted |
| ED-007 | In-process event-based notification integration | ADR-INT-01 | Accepted |
| ED-008 | Observer pattern for notification fan-out | Design decision | Accepted |
| ED-009 | Factory Method for service-request category creation | Design decision | Accepted |
| ED-010 | GitHub Flow with CI quality gates | A2 Task 4 policy | Accepted |
| ED-011 | Initial relational data model and append-only status history | ADR-PERSIST-01 | Accepted |
| ED-012 | Approve M2 Architecture, Technology & Initial Design Baseline | Baseline approval | Accepted |

---

## ED-004: Adopt Layered Monolith with In-Process Domain Events

**Status:** Accepted · 
**Date:** 2026-09-28 · 
**Deciders:** Davidzo Malapile, Naledi Moeng, Kamohelo Mabena · 
**Supersedes:** None · 
**Related:** ADR-TECH-01, ADR-PERSIST-01 · 
**Requirements:** ASR-01 to ASR-08

| Field | Entry |
|---|---|
| **Context** | M1 left architecture unspecified. M2 requires a proportionate architecture that satisfies ASR-01 to ASR-08, respects M1 constraints (3-person team, 12–14 weeks, zero budget, web-only), and does not foreclose future scope. |
| **Constraints** | Team size of 3; fixed schedule; zero budget; web-only initial release; low-bandwidth and intermittent connectivity; NFR-02 response time; NFR-05 availability; POPIA; RBAC; audit retention; A2 Task 3 recommendation to avoid premature network boundaries. |
| **Alternatives** | Layered monolith + in-process events (selected); Modular monolith (deferred, can evolve via FE-007); Microservices; Serverless/FaaS (rejected, cold starts threaten NFR-02 and offline sync complexity). |
| **Decision** | Adopt a layered monolith with in-process domain events. Four logical layers: presentation, application, domain, persistence. Single deployable unit; one managed PostgreSQL database as the only separate physical tier. |
| **Rationale** | ASR-01: single-process sync endpoint + conflict resolver. ASR-02: in-process domain events, post-commit dispatch. ASR-03: centralised RBAC/audit middleware + ACID transactions. ASR-04: same DB, indexed queries; read model can be added later. ASR-05: single API gateway with compression. ASR-06: fewer moving parts = fewer failure modes. ASR-07: clear layer boundaries and unit testability. ASR-08: append-only audit table in same DB with retention at DB level. Aligns with A2 Task 3. |
| **Trade-offs** | Vertical scaling limits; discipline required to maintain layer boundaries; cannot independently scale notification vs workflow; domain event contract must be versioned; layer-boundary discipline enforced via code review. |
| **Risks** | RR-009 layer-boundary discipline; RR-001 offline sync; RR-005 free-tier hosting; RR-008 DB connection exhaustion; future scale limits. |
| **Evidence** | A2 Task 1; A2 Task 3; M1 constraints and risk register; ASR-01 to ASR-08. |
| **Later Consequence** | Can evolve to modular monolith via FE-007. Forward-compatibility seams: notification channel abstraction, `source` field on request entity for future IoT, PII-free reporting layer, clean API contract for future native apps, structured event/audit history for future analytics. |

---

## ED-005: Adopt PERN + TypeScript Technology Stack

**Status:** Accepted · **Date:** 2026-09-29 · **Deciders:** Davidzo Malapile, Naledi Moeng, Kamohelo Mabena · **Supersedes:** ED-003 (Deferred technology stack selection, M1) · **Related:** ADR-ARCH-01, ADR-PERSIST-01, ADR-INT-01 · **Requirements:** ASR-01 to ASR-08

| Field | Entry |
|---|---|
| **Context** | ED-003 deferred final technology stack selection to M2. M2 must resolve it with evidence. The stack must satisfy ASR-01 to ASR-08, respect M1 constraints (3-person team, 12–14 weeks, zero budget, web-only, low-bandwidth), and support FE-001 to FE-007. |
| **Constraints** | 3-person team; fixed delivery window; zero budget; web-only; low-bandwidth environments; free-tier hosting; relational integrity; PWA/offline support; CI compatibility; team capability. |
| **Alternatives** | PERN + TypeScript (selected); MERN/MongoDB (rejected, weak relational integrity for A2 Task 2, transactional audit awkward); Django + React (rejected, Python context-switch, less PWA tooling); Spring Boot + React (rejected, memory footprint incompatible with free tier, steeper learning curve); Serverless/FaaS (rejected, cold starts threaten NFR-02, offline sync complexity). |
| **Decision** | Adopt PERN + TypeScript: React 18 + Vite 5 + TypeScript 5 + Workbox 7; Node.js 20 LTS + Express 4 + TypeScript 5; Prisma 5; PostgreSQL 16; JWT + bcrypt; Zod 3; Vitest + Supertest; GitHub Actions; free-tier PaaS (Render/Railway/Fly.io) with managed PostgreSQL. |
| **Rationale** | PostgreSQL ACID transactions support A2 Task 2. Relational reporting supports FR-03, FR-10, FR-14, FR-16. Node/Express/React minimises context-switching for a JS-fluent team. Workbox supports PWA/offline sync for FR-02 and NFR-01. Prisma provides type-safe queries, migrations and transactions. TypeScript shared types reduce contract drift. All selected technologies have viable free tiers and mature testing ecosystems. |
| **Trade-offs** | npm dependency churn risk; free-tier DB connection limits; Node single-threaded limits at higher scale; TypeScript adds compilation step; lockfile management and Prisma migration discipline required. |
| **Risks** | RR-005 free-tier DB size/connection limits; RR-006 browser API inconsistency; RR-007 npm dependency churn/supply chain; RR-008 PostgreSQL connection exhaustion under concurrent load. |
| **Evidence** | A2 Task 2 persistence research; A2 Task 4 SCM/CI research; technology decision matrix; FE-001 to FE-007; Richards & Ford (2020). |
| **Later Consequence** | Revisit if free-tier limits or scale require managed services. Pin all versions via lockfile. Dependabot and npm audit remain CI warnings. All selected technologies are open-source with permissive licences and satisfy the zero-budget constraint. |

---

## ED-006: Transactional Status Transition with Optimistic Concurrency

**Status:** Accepted · **Date:** 2026-09-29 · **Deciders:** Davidzo Malapile, Naledi Moeng, Kamohelo Mabena · **Supersedes:** None · **Related:** ADR-INT-01, ADR-ARCH-01 · **Requirements:** FR-05, FR-06, NFR-01

| Field | Entry |
|---|---|
| **Context** | A service-request status transition may involve updating the `ServiceRequest` status, inserting a `StatusHistory` record, updating assignment information, and triggering a notification. If these operations are performed independently, a failure between operations could leave the system inconsistent. |
| **Constraints** | Correctness and auditability; FR-05 status tracking; FR-06 notification; NFR-01 offline-to-online sync performance; POPIA; ACID requirements; concurrency control. |
| **Alternatives** | Independent database operations (simpler but risks partial data); Database transaction (selected); Thin service delegating validation to DB only (rejected, trades correctness for small initial speed). A2 Task 2 compared Approach A vs Approach B. |
| **Decision** | Use a database transaction for the status-transition operation. The status update, related `StatusHistory` insertion, and applicable assignment change are treated as one transactional unit. Commit only when all required operations succeed. If any required operation fails, roll back. Use optimistic concurrency via a version column. Raise the notification event only after the transaction commits. Do not cache the current `ServiceRequest` status in v1. |
| **Rationale** | Atomicity prevents partially completed transitions. Supports consistency between current request state, audit history and assignment. Provides a clear persistence boundary before notification. Optimistic concurrency is appropriate because conflicts are expected to be rare and avoids holding pessimistic locks across user think-time. |
| **Trade-offs** | Transaction handling adds implementation complexity. Long-running transactions must be avoided. Correct error handling is required. Version column and transaction boundary must be managed. No status caching may forgo some read performance. |
| **Risks** | Partially completed transitions and audit-trail gaps; lost update; non-repeatable reads during transition; RR-008 DB connection exhaustion; RR-001 offline sync conflict resolution. |
| **Evidence** | A2 Task 2 comparing Approach A and Approach B; Kleppmann (2017); Weikum (2018); Berenson et al. (1995); initial data model; `StatusHistory` design; transaction boundary; version field; database integrity constraints; tests confirming failed transition does not leave partial data. |
| **Later Consequence** | Cache only read-heavy aggregate views with measured evidence. Revisit if scale or performance requires. RTM links to FR-03, FR-05, FR-06 and NFR-01. |

---

## ED-007: In-Process Event-Based Notification Integration

**Status:** Accepted · **Date:** 2026-09-29 · **Deciders:** Davidzo Malapile, Naledi Moeng, Kamohelo Mabena · **Supersedes:** None · **Related:** ADR-PERSIST-01, Observer design decision · **Requirements:** FR-05, FR-06

| Field | Entry |
|---|---|
| **Context** | CivicConnect needs the workflow module to communicate a status change to notification behaviour after a successful status transition. The integration must avoid tight coupling and avoid introducing unnecessary distributed infrastructure. |
| **Constraints** | Small team; fixed timeline; zero budget; notification delivery is not part of the correctness of the status update; future notification channels possible; A2 Task 3 integration research. |
| **Alternatives** | In-process method call (simple but tight coupling); Synchronous REST to separate notification service (network boundary, failures, deployment complexity); Asynchronous event/message broker (loose coupling but additional infrastructure). Selected: in-process event-based. |
| **Decision** | Use an in-process event-based integration approach for the initial implementation. A status-change event is produced only after the transaction commits. Notification observers react to the event. No separate REST notification service or message broker is introduced initially. |
| **Rationale** | Provides separation between status transition and notification behaviour without introducing a network boundary. Proportionate to current project scope. Reduces infrastructure and operational complexity. Works with the Observer-based design decision. Can later migrate to a broker if requirements justify it. |
| **Trade-offs** | Notification processing remains within the application boundary. No independent scaling or failure isolation for notification. May need revisiting if notification complexity grows significantly. |
| **Risks** | Notification failure must not fail the underlying status update. Event contract drift. RR-081 queued/batched notification volume. RR-093 environment configuration. |
| **Evidence** | A2 Task 3 integration research; Newman (2021); Kleppmann (2017); Richards & Ford (2020); component/integration diagram; test confirming successful transition produces a notification event; test confirming rolled-back transaction does not produce a notification event. |
| **Later Consequence** | If notification volume, independent deployment, or delivery guarantees become real requirements, migrate to a message broker by changing dispatch behind the documented event contract. RTM links to FR-05 and FR-06. |

---

## ED-008: Observer Pattern for Notification Fan-Out

**Status:** Accepted · **Date:** 2026-09-29 · **Deciders:** Davidzo Malapile, Naledi Moeng, Kamohelo Mabena · **Supersedes:** None · **Related:** ADR-INT-01, ADR-PERSIST-01 · **Requirements:** FR-05, FR-06

| Field | Entry |
|---|---|
| **Context** | If status-transition logic directly calls each notification channel, the status-transition component becomes tightly coupled to notification-specific behaviour. Adding another notification channel requires modifying already implemented and tested transition logic. |
| **Constraints** | Single channel initially (website alert required by FR-05); future SMS, email or audit-log observers likely; small team; testability; A2 Task 1 design-quality research. |
| **Alternatives** | Direct method calls (simple but tight coupling); Observer pattern (selected); Mediator pattern (centralises coordination but adds indirection and complexity not currently required). |
| **Decision** | Use an Observer-based approach for notification fan-out. The status-transition component acts as the subject and exposes observer registration. Notification behaviour is implemented by separate observers. On a committed status transition, the subject notifies registered observers. Potential observers include notification and audit-related components. |
| **Rationale** | Reduces coupling. Allows additional observers to be added without modifying the subject’s core status-transition logic. Improves testability because observers can be tested against a fake subject. Mediator remains an alternative only if recipient-to-recipient coordination becomes a genuine requirement. |
| **Trade-offs** | Introduces additional structure and observer management. An unbounded opaque observer list can become hard to trace. Keep observer interface to a narrow `notify(event)` and log which observer fired for which event. |
| **Risks** | Notification must not publish for a rolled-back status transition. Observer management complexity. RR-081 notification volume and batching. |
| **Evidence** | A2 Task 1 research; design/component diagram showing subject and observers; application implementation of observer registration and notification; automated test showing a new observer receives a status-change event without modifying the subject’s core status-transition logic; RTM links to FR-05 and FR-06. |
| **Later Consequence** | Revisit Mediator only if recipient coordination becomes a genuine requirement. Keep the observer interface small and diagnosable. |

---

## ED-009: Factory Method for Service-Request Category Creation

**Status:** Accepted · **Date:** 2026-09-29 · **Deciders:** Davidzo Malapile, Naledi Moeng, Kamohelo Mabena · **Supersedes:** None · **Related:** ADR-PERSIST-01 · **Requirements:** FR-01, FR-03, FR-04

| Field | Entry |
|---|---|
| **Context** | CivicConnect supports different service-request categories such as facility faults, damaged equipment, security concerns, IT support and lost property. If all creation, category-specific validation and department routing live in one class or method, the component becomes large, low-cohesion and difficult to maintain. Adding a category requires changing existing creation logic. |
| **Constraints** | Small fixed number of categories at MVP; 12–14 week delivery window; three-person team with limited review capacity; FR-01, FR-03 and FR-04 depend on request creation and routing. |
| **Alternatives** | Conditional/switch-based creation (simple for few categories but central logic grows); Factory Method (selected); Abstract Factory (useful for families of related objects but adds unnecessary complexity if only request creation varies). |
| **Decision** | Use the Factory Method pattern. A common `RequestFactory` interface defines the creation operation. Concrete factories such as `FacilityFaultFactory`, `DamagedEquipmentFactory`, `SecurityConcernFactory`, `ITSupportFactory` and `LostPropertyFactory` contain category-specific creation, validation and routing logic. The rest of the system depends on the common creation interface. |
| **Rationale** | Separates category-specific logic. A new category can be added by introducing a new factory rather than editing a large central method. Applies Single Responsibility and Open/Closed principles. Avoids Abstract Factory complexity because only request creation and validation genuinely vary by category. |
| **Trade-offs** | Introduces additional classes and structure. Adds some indirection. Exact classes and interfaces may be refined during implementation. |
| **Risks** | Over-abstraction if categories do not grow. Category-specific validation drift. RR-082 inconsistent implementation patterns across modules. |
| **Evidence** | A2 Task 1 research; design/class diagram showing factory structure; application implementation demonstrating request creation through the factory interface; tests confirming different request categories can be created correctly; RTM links to FR-01, FR-03 and FR-04. |
| **Later Consequence** | If families of related objects per category become genuinely required, revisit Abstract Factory. Keep factories small, cohesive and independently testable. |

---

## ED-010: GitHub Flow with CI Quality Gates

**Status:** Accepted · **Date:** 2026-09-29 · **Deciders:** Davidzo Malapile, Naledi Moeng, Kamohelo Mabena · **Supersedes:** None · **Related:** A2 Task 4 · **Requirements:** Project-wide SCM/CI, FE-002

| Field | Entry |
|---|---|
| **Context** | M2 requires controlled collaborative engineering: protected `main`, two independent approvals for substantive pull requests, meaningful issues/branches/commits/PRs, and progressive CI adoption. M2 does not require a mature CI/CD pipeline. |
| **Constraints** | Three-person team; few weeks; same controlled GitHub repository; protected `main`; two reviewer approvals; no committed secrets; free-tier CI runners. |
| **Alternatives** | GitFlow (heavyweight long-lived develop/release branches, unnecessary for this team size and timeline); GitHub Flow (selected); no CI/manual only (rejected, integration problems discovered late); full CI/CD pipeline with staged environments (not required by M2). |
| **Decision** | Adopt a GitHub Flow style workflow. Protected `main`; short-lived feature branches created per tracked task/issue; pull requests requiring 2 reviewer approvals. CI runs on every PR open/update and on merge using GitHub Actions. Build and unit tests are blocking checks. Lint and dependency audit are visible warnings. Pin runtime and dependencies via lockfile. Secrets stored in CI encrypted store or environment variables. CI results surfaced directly on the pull request. |
| **Rationale** | Proportionate control for a three-person team. Frequent integration reduces integration problems and deployment failures. Two-reviewer requirement covers design and correctness judgement that automation cannot. Blocking build/unit tests ensure the software does what it claims. Warnings avoid stalling the team over noncritical style or risk findings early in development. |
| **Trade-offs** | Adds process overhead and CI setup time. Warnings may be ignored. As the codebase stabilises closer to final milestones, lint checks can be tightened to blocking. |
| **Risks** | RR-071 broken build blocks team; RR-067 build complexity; RR-007 dependency churn; accidental secret exposure if configuration is careless. |
| **Evidence** | A2 Task 4; Forsgren, Humble and Kim (2018); Winters, Manshreck and Wright (2020); Kim et al. (2021); GitHub Actions workflow; branch protection settings; PR templates; RTM notes. |
| **Later Consequence** | Progressive adoption continues. Mature CI/CD and staged environments are deferred. Each PR references the requirement ID it addresses. Once CI exists, the PR build/unit-test run becomes Test Evidence for that requirement. |

---

## ED-011: Initial Relational Data Model and Append-Only Status History

**Status:** Accepted · **Date:** 2026-09-29 · **Deciders:** Davidzo Malapile, Naledi Moeng, Kamohelo Mabena · **Supersedes:** None · **Related:** ADR-PERSIST-01, ADR-TECH-01 · **Requirements:** FR-01, FR-02, FR-03, FR-05, NFR-01

| Field | Entry |
|---|---|
| **Context** | CivicConnect requires persistent storage for citizen incident reports, service-request status, assignments, departmental information and historical status changes. The persistence model must support submission, tracking, offline synchronisation, departmental reporting and transparent request-status tracking. |
| **Constraints** | Relational integrity; ACID transactions; FR-01, FR-02, FR-03, FR-05; NFR-01 sync performance; POPIA; audit retention; free-tier database limits. |
| **Alternatives** | Document store vs relational (relational selected for integrity and reporting); denormalised current status only vs append-only history (append-only selected for audit); separate read model vs same database (same database initially for proportionality). |
| **Decision** | Use an initial relational model centred on `ServiceRequest`. Entities: `Citizen`, `ServiceRequest`, `Category`, `Department`, `Assignment`, `StatusHistory`, `Officer/FieldWorker`. `ServiceRequest` attributes include `RequestID`, `CitizenID`, `CategoryID`, `Description`, `Photo/PhotoReference`, `Latitude`, `Longitude`, `Status`, `Version`, `CreatedAt`, `UpdatedAt`. `StatusHistory` is append-only with `HistoryID`, `RequestID`, `OldStatus`, `NewStatus`, `ChangedBy`, `ChangedAt`. `Assignment` includes `AssignmentID`, `RequestID`, `DepartmentID`, `OfficerID`, `AssignedAt`. Validation is layered: application business rules, database structural constraints, and client-side validation as usability only. |
| **Rationale** | Relational model supports ACID transactions, foreign keys and reporting by department/status. Append-only history preserves the audit trail. Version column supports optimistic concurrency. Same database keeps architecture proportionate. |
| **Trade-offs** | Schema migrations add discipline. Indexing and query optimisation will be needed as data grows. History growth must be managed. No status caching. Database remains a potential single point of failure. |
| **Risks** | RR-008 DB connection exhaustion; RR-005 free-tier limits; RR-078 audit-log storage growth; RR-122 inconsistent status across features; RR-127 timezone handling; RR-114 insecure direct object references. |
| **Evidence** | A2 Task 2 persistence research; initial ERD; schema/migrations; database constraints; test confirming failed transition does not leave partial data; test confirming notification does not occur on rollback; RTM links to FR-01, FR-02, FR-03, FR-05 and NFR-01. |
| **Later Consequence** | Add indexing and aggregation strategy as data grows. Consider read-model separation for reporting if measured performance requires it. Backup, recovery and availability mechanisms remain later engineering considerations. |

---

## ED-012: Approve M2 Architecture, Technology & Initial Design Baseline

**Status:** Accepted · **Date:** 2026-09-29 · **Deciders:** Davidzo Malapile, Naledi Moeng, Kamohelo Mabena · **Supersedes:** None · **Related:** PED v2.0 baseline · **Requirements:** M2 completion criteria

| Field | Entry |
|---|---|
| **Context** | M2 requires an identifiable Architecture, Technology & Initial Design Baseline. Decisions ED-004 to ED-011 are sufficiently stable to allow controlled development without repeatedly making foundational decisions ad hoc. |
| **Constraints** | M2 does not require complete detailed design, mature CI/CD, production deployment or final API decisions. Known open decisions and deferred concerns must be recorded separately. Any material post-baseline change must follow controlled change/ADR practice. |
| **Alternatives** | (a) Delay baseline until every design/API decision is complete; (b) baseline current architecture, technology, persistence, integration and initial design decisions with known deferrals. Option (b) selected. |
| **Decision** | Approve the M2 Architecture, Technology & Initial Design Baseline v2.0 dated 2026-09-29. Included: ADR-ARCH-01, ADR-TECH-01, ADR-PERSIST-01, ADR-INT-01, Observer design decision, Factory Method design decision, initial relational data model, PERN + TypeScript stack, GitHub Flow/CI policy, ASR-to-architecture mapping. Deferred/open decisions: modular monolith evolution, message broker migration, aggregate caching, mature CI/CD and staged environments, final API versioning, detailed class design, production deployment and full observability. |
| **Rationale** | Provides enough controlled direction for meaningful development while respecting M2 boundaries. Traceable to ASRs, constraints, risks and A2 research. |
| **Trade-offs** | Some later design work remains open. Baseline may require controlled change if stronger evidence arrives. |
| **Risks** | RR-003 technology stack pressure; RR-009 layer-boundary discipline; RR-141 RTM lag; open decisions becoming ad hoc if not tracked. |
| **Evidence** | PED v2.0 decision log; ADR-ARCH-01; ADR-TECH-01; ADR-PERSIST-01; ADR-INT-01; ASR mapping; RTM v2.0 draft; Risk Register Addendum 2; A2 Tasks 1–4. |
| **Later Consequence** | Post-baseline changes must be recorded as new ED/ADR entries. Open decisions revisited at M3/M4 with new evidence. Baseline remains traceable to requirements, ASRs and evidence. |
