# ADR-DESIGN-01: Observer Pattern for Notification Fan-Out

- **Status:** Accepted
- **Deciders:** Davidzo Malapile, Naledi Moeng, Kamohelo Mabena
- **Date:** 10 October 2026

## Context

When a CivicConnect service request changes status, multiple parties may need to
be notified: the citizen, the assigned field worker, the departmental manager, and
the audit log. Each notification channel (in-app, email, SMS, audit) has its own
delivery mechanism and its own data requirements.

If the status-transition logic directly invokes each notification channel, the
status-transition component becomes tightly coupled to notification-specific
behaviour. Adding a new channel — for example, an SMS notifier introduced after
M3 — would require modifying the core workflow logic, retesting it, and redeploying
the whole workflow path.

The design problem: **How can CivicConnect allow additional notification channels
to be added without repeatedly modifying the core status-transition component?**

The pattern decision is informed by:
- ADR-INT-01 (Notification Integration Approach) — establishes the in-process
  event contract.
- ADR-PERSIST-01 (Transactional Status Transition) — establishes that events are
  raised only after commit.

## Decision

CivicConnect will use the **Observer pattern** for notification fan-out.

The `WorkflowService` acts as the Subject and exposes:
- `subscribe(observer)` — register a notification handler.
- `raise(event)` — publish a `StatusChanged` event to all subscribers.

Notification handlers (`InAppNotifier`, future `EmailNotifier`, future `SmsNotifier`,
`AuditLogger`) implement the Observer role and receive `StatusChanged` events after
the database transaction has successfully committed.

## Rationale

The Observer pattern provides separation between the subject (workflow service)
and the observers (notification channels) without introducing a network boundary
or additional infrastructure. This is proportionate to CivicConnect's current
scope and aligned with the layered monolith architecture (ADR-ARCH-01).

Adding a new notification channel requires writing a new observer and registering
it — no changes to `WorkflowService` or the transition logic. This is testable
and reviewable in isolation.

## Alternatives Considered

| Approach | Description | Advantages | Limitations |
|----------|-------------|-----------|-------------|
| **Direct method calls** | Workflow service calls each notifier function inline. | Simplest to implement. | Tight coupling; every new channel modifies the workflow service. |
| **Observer pattern (selected)** | Workflow service publishes events; observers subscribe. | Decoupling; extensible; testable in isolation. | Indirection; observer lifecycle must be managed. |
| **Mediator pattern** | A central mediator coordinates workflow, notification, and audit components. | Centralised coordination when many components interact. | More indirection than justified; mediator becomes a bottleneck for understanding. |

The decision matrix is provided in the supporting analysis
(`ADR-DESIGN-01-supporting-analysis.md`).

## Consequences

### Positive

- Additional notification channels require no changes to `WorkflowService`.
- Notification logic is testable in isolation via mock observers.
- Consistent with ADR-INT-01's in-process event contract.
- Post-commit semantics from ADR-PERSIST-01 carry through naturally.

### Negative

- Indirection: tracing a notification requires following the observer chain.
- Observer lifecycle must be managed — subscribers must be registered at startup.
- A failure in one observer must not break the workflow (handled by try/catch in
  `eventBus.raise`).

## Implementation Implications

Concrete application components:
- `backend/server/domain/events.ts` — Subject (`eventBus.subscribe`, `eventBus.raise`).
- `backend/server/application/workflow.service.ts` — Raises `StatusChanged` post-commit.
- `backend/server/application/notification.service.ts` (planned) — Observer.
- `backend/server/persistence/notification.repository.ts` (planned) — Persistence.

Registration occurs once at application startup (in `backend/server/index.ts`).

## Verification Evidence

| Evidence ID | Description | Type |
|-------------|-------------|------|
| TC-BE-07 | Successful status transition produces exactly one `StatusChanged` event | Unit + Integration |
| TC-BE-08 | Rolled-back transaction produces no event | Negative |
| TC-BE-16 | Multiple observers receive the same event (fan-out) | Unit |
| TC-BE-17 | Observer failure does not break the workflow | Unit |
| TC-BE-19 | A new observer can be added without modifying `WorkflowService` | Unit (A2 Task 5 pattern) |

## Related Requirements

- FR-05 — Notification on status change
- FR-06 — Citizen status tracking
- NFR-02 — Response time (async notification prevents latency)

## Related Decisions

- ADR-INT-01 — Notification Integration Approach
- ADR-PERSIST-01 — Transactional Status Transition
- ADR-ARCH-01 — Layered Monolith

## Supporting Analysis

See [ADR-DESIGN-01-supporting-analysis.md](./ADR-DESIGN-01-supporting-analysis.md) for:
- **Decision matrix** comparing direct calls, Observer, and Mediator
- **Theoretical foundation:** Observer pattern (Gamma et al.), post-commit events
- **Authoritative references**
- **Traceability to M3 assessment areas**
- **Verification evidence plan:** TC-BE-07, TC-BE-08, TC-BE-16, TC-BE-17, TC-BE-19
- **Residual risks:** RR-M3-07 to RR-M3-09
- **Technical debt:** TD-M3-07 to TD-M3-08

## Related Architecture Views

- [Runtime view](../runtime-view.md) — sequence diagram showing observer notification
- [Component view](../component-view.md) — subject and observer components
- [Logical architecture](../logical-architecture.md) — where the Observer pattern lives
