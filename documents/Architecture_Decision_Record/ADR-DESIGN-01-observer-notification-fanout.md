# ADR-DESIGN-01: Observer Pattern for Notification Fan-Out

- **Status:** Accepted
- **Deciders:** Davidzo Malapile, Naledi Moeng, Kamohelo Mabena
- **Date:** 10 October 2026
- **Related ADRs:** ADR-INT-01, ADR-PERSIST-01, ADR-ARCH-01

---

## 1. Context

When a CivicConnect service request changes status, multiple parties may need to be
notified: the citizen, the assigned field worker, the departmental manager, and the
audit log. Each notification channel (in-app, email, SMS, audit) has its own delivery
mechanism and data requirements.

If the status-transition logic directly invokes each notification channel, the
status-transition component becomes tightly coupled to notification-specific behaviour.
Adding a new channel — for example, an SMS notifier introduced after M3 — would require
modifying the core workflow logic, retesting it, and redeploying the whole workflow path.

**Design problem:** How can CivicConnect allow additional notification channels to be
added without repeatedly modifying the core status-transition component?

This decision is informed by:
- **ADR-INT-01** (Notification Integration Approach) — establishes the in-process event contract.
- **ADR-PERSIST-01** (Transactional Status Transition) — establishes that events are raised only after commit.
- **A2 design-patterns research** — compared direct calls, Observer, and Mediator.

---

## 2. Decision

CivicConnect will use the **Observer pattern** for notification fan-out.

The `WorkflowService` acts as the Subject and exposes:
- `subscribe(observer)` — register a notification handler.
- `raise(event)` — publish a `StatusChanged` event to all subscribers.

Notification handlers (`InAppNotifier`, future `EmailNotifier`, future `SmsNotifier`,
`AuditLogger`) implement the Observer role and receive `StatusChanged` events after the
database transaction has successfully committed.

---

## 3. Rationale

The Observer pattern provides separation between the subject (workflow service) and the
observers (notification channels) without introducing a network boundary or additional
infrastructure. This is proportionate to CivicConnect's current scope and aligned with
the layered monolith architecture (ADR-ARCH-01).

Adding a new notification channel requires writing a new observer and registering it —
no changes to `WorkflowService` or the transition logic. This is testable and reviewable
in isolation.

---

## 4. Alternatives Considered

| Approach | Description | Advantages | Limitations |
|----------|-------------|-----------|-------------|
| **Direct method calls** | Workflow service calls each notifier function inline. | Simplest to implement. | Tight coupling; every new channel modifies the workflow service. |
| **Observer pattern (selected)** | Workflow service publishes events; observers subscribe. | Decoupling; extensible; testable in isolation. | Indirection; observer lifecycle must be managed. |
| **Mediator pattern** | A central mediator coordinates workflow, notification, and audit components. | Centralised coordination when many components interact. | More indirection than justified; mediator becomes a bottleneck for understanding. |

### 4.1 Decision Matrix

Scoring is relative to the baseline (direct method calls):
- `0` = equivalent
- `+1` / `+2` = better
- `-1` / `-2` = worse

| Criterion | Weight | Baseline: Direct Calls | Option A: Observer (Selected) | Option B: Mediator |
|-----------|--------|------------------------|-------------------------------|--------------------|
| Decoupling (subject ↔ observers) | High | 0 | **+2** | +2 |
| Extensibility (new channels) | High | −2 | **+2** | +1 |
| Implementation complexity | Medium | +1 | **0** | −2 |
| Testability | Medium | 0 | **+1** | −1 |
| Alignment with layered monolith | High | +1 | **+1** | 0 |
| Proportionality to scope | High | +1 | **+1** | −2 |
| Observer lifecycle management | Low | 0 | **−1** | 0 |
| Coupling to specific channels | High | −2 | **+2** | +1 |
| **Total** | | **−1** | **+8** | **−1** |

**Interpretation:** Observer scores highest on decoupling and extensibility. Mediator adds
indirection without solving a problem CivicConnect has (few components, one coordination
point). Direct calls are simple but break extensibility.

---

## 5. Theoretical Foundation

### 5.1 The Observer Pattern

Defined in *Design Patterns: Elements of Reusable Object-Oriented Software*
(Gamma, Helm, Johnson, Vlissides, 1994):

> "Define a one-to-many dependency between objects so that when one object changes
> state, all its dependents are notified and updated automatically."

| Role | CivicConnect Implementation |
|------|-----------------------------|
| Subject | `eventBus` in `backend/server/domain/events.ts` |
| Concrete Subject | `WorkflowService.transition()` |
| Observer interface | `(e: StatusChanged) => void` |
| Concrete Observer | `NotificationHandler` (planned); future Email/SMS notifiers |

### 5.2 Post-Commit Event Semantics

ADR-INT-01 establishes that events are raised **only after** the transaction commits
(see ADR-PERSIST-01). The Observer pattern composes naturally with this: the
`eventBus.raise()` call happens after `COMMIT`, so no observer receives an event for a
rolled-back transition.

### 5.3 Why Not Mediator?

The Mediator pattern centralises coordination when many components must interact.
CivicConnect has one subject, a small set of observers (currently 1, planned 3–4), and
no complex coordination logic. Mediator would add a coordination layer that provides no
benefit — the coordination is already one-to-many (subject → observers), which is exactly
what Observer handles.

---

## 6. Consequences

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

---

## 7. Implementation Implications

| Component | File |
|-----------|------|
| Subject (event bus) | `backend/server/domain/events.ts` |
| Raises `StatusChanged` post-commit | `backend/server/application/workflow.service.ts` |
| Observer (planned) | `backend/server/application/notification.service.ts` |
| Notification persistence (planned) | `backend/server/persistence/notification.repository.ts` |

Registration occurs once at application startup (`backend/server/index.ts`).

---

## 8. Authoritative References

| # | Source | Relevance |
|---|--------|-----------|
| 1 | Gamma, Helm, Johnson, Vlissides, "Design Patterns" (1994), Observer | Foundational pattern |
| 2 | Gamma, Helm, Johnson, Vlissides, "Design Patterns" (1994), Mediator | Justifies why Mediator is not appropriate here |
| 3 | Martin Fowler, "Patterns of Enterprise Application Architecture", Domain Events | In-process event patterns |
| 4 | Chris Richardson, "Transactional Outbox Pattern" | Post-commit event delivery |
| 5 | Vernon, "Implementing Domain-Driven Design" (2013) | Domain events in bounded contexts |

---

## 9. Traceability to Requirements

| Requirement | Nature of Link |
|-------------|----------------|
| FR-05 | Notification on status change — directly implemented by the observer mechanism |
| FR-06 | Citizen status tracking — depends on notification delivery |
| NFR-02 | Async notification reduces response latency |

---

## 10. Traceability to M3 Assessment Areas

| M3 Area | How This ADR Contributes |
|---------|--------------------------|
| A. Controlled Implementation & M2 Conformance | Confirms design pattern applied as per M2 architecture |
| B. Collaborative Construction | Decision recorded as ADR |
| D. Black-box, Integration & System Validation | Defines fan-out and observer-failure tests |
| E. Quality, Defect & Traceability Evidence | Links ADR to FR-05, FR-06 |
| G. Release-Quality Review | Documents observer-lifecycle residual risk |

---

## 11. Verification Evidence Plan

| Evidence ID | Description | Type |
|-------------|-------------|------|
| TC-BE-07 | Successful status transition produces exactly one `StatusChanged` event | Unit + Integration |
| TC-BE-08 | Rolled-back transaction produces no event | Negative |
| TC-BE-16 | Multiple observers receive the same event (fan-out) | Unit |
| TC-BE-17 | Observer failure does not break the workflow | Unit |
| TC-BE-19 | A new observer can be added without modifying `WorkflowService` | Unit (A2 Task 5 pattern) |

---

## 12. Residual Risk

| Risk ID | Description | Probability | Impact | Mitigation |
|---------|-------------|-------------|--------|------------|
| RR-M3-07 | Observer silently fails and event is not persisted | Low | Medium | Logging in `eventBus.raise`; observer tests verify error paths |
| RR-M3-08 | Observer lifecycle not managed (subscriber registered multiple times) | Low | Low | Startup-time registration; `subscribe` returns unsubscribe function |
| RR-M3-09 | Event ordering across observers differs | Very Low | Low | In-process synchronous dispatch is deterministic |

---

## 13. Technical Debt

| Debt ID | Description | Target |
|---------|-------------|--------|
| TD-M3-07 | No observability on observer execution time | Add when >2 observers in production |
| TD-M3-08 | No retry logic for observer failures | Coupled with Outbox adoption |

---

## 14. Related Architecture Views

- [Runtime view](../runtime-view.md) — sequence diagram showing observer notification
- [Component view](../component-view.md) — subject and observer components
- [Logical architecture](../logical-architecture.md) — where the Observer pattern lives

---

## 15. Summary

| Question | Answer |
|----------|--------|
| What was decided? | Observer pattern for notification fan-out |
| Why? | Decoupling; extensibility; proportionate to scope |
| Alternatives rejected? | Direct calls (tight coupling); Mediator (unjustified indirection) |
| Reference framework? | Gamma et al. Observer pattern |
| M3 evidence? | TC-BE-07, TC-BE-08, TC-BE-16, TC-BE-17, TC-BE-19 |
| Residual risk? | Observer failure silently swallowed; lifecycle management |
