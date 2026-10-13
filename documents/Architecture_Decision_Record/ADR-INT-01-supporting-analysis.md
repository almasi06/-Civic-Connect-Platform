# ADR-INT-01 — Supporting Analysis

**Parent ADR:** ADR-INT-01: Notification Integration Approach
**Status:** Accepted
**Deciders:** Davidzo Malapile, Naledi Moeng, Kamohelo Mabena
**Date:** October 2026

---

## 1. Purpose of This Section

ADR-INT-01 records the decision to use an **in-process event-based notification integration** approach for the initial CivicConnect implementation. This supporting analysis provides:

- A **decision matrix** comparing the four integration alternatives
- The **theoretical foundation** for event-based integration (Observer pattern, Transactional Outbox, Decoupling)
- **Authoritative references** supporting the choice
- **Traceability** to M3 assessment areas and requirements
- **Verification evidence** the team will produce

This section does not repeat the decision — it justifies it.

---

## 2. Decision Matrix

The following matrix scores each alternative against the criteria that matter for CivicConnect's notification integration. Scoring is relative to the **baseline** (in-process method calls), where:

- `0` = equivalent to baseline
- `+1` / `+2` = better than baseline
- `-1` / `-2` = worse than baseline

| Criterion | Weight | Baseline: In-Process Method Call | Option A: In-Process Event (Selected) | Option B: Synchronous REST | Option C: Async Message Broker |
|-----------|--------|----------------------------------|---------------------------------------|----------------------------|--------------------------------|
| **Decoupling (subject ↔ observer)** | High | 0 (tight coupling) | **+2** (Observer pattern) | +2 (network boundary) | +2 (broker boundary) |
| **Infrastructure complexity** | High | 0 (none) | **0** (none) | −2 (separate service) | −3 (broker + workers) |
| **Operational overhead** | High | 0 | **0** | −2 (deployment, monitoring) | −3 (broker, queues, dead-letter) |
| **Failure isolation** | Medium | 0 | **−1** (same process) | +1 (isolated) | +2 (queue decouples) |
| **Delivery guarantee** | High | 0 (sync) | **0** (in-process; at-most-once within process) | 0 (sync) | +1 (at-least-once with retries) |
| **Team capability fit** | High | +1 (trivial) | **+1** (Observer pattern is well understood) | −1 (network expertise) | −2 (distributed systems) |
| **Alignment with M2 architecture (layered monolith)** | High | +1 | **+1** (matches ADR-ARCH-01) | −2 (introduces service boundary) | −3 (implies microservices) |
| **Post-commit event correctness** | High | 0 | **+1** (event only after commit) | 0 (risks phantom notifications) | +1 (broker can replay) |
| **Proportionality to project scope** | High | +1 | **+1** | −2 (disproportionate) | −3 (disproportionate) |
| **Testability** | Medium | 0 | **+1** (in-process spy/stub) | −1 (requires mock server) | −2 (requires broker harness) |
| **Total** | | **+4** | **+6** | **−6** | **−10** |

**Interpretation:** The in-process event-based approach scores highest on the criteria that matter for CivicConnect's current scope: decoupling without infrastructure cost, alignment with the layered monolith, and clean post-commit semantics. Synchronous REST and message brokers are **architecturally stronger** for systems with independent scaling or cross-team boundaries — but neither exists in CivicConnect.

---

## 3. Theoretical Foundation

### 3.1 The Observer Pattern

The decision applies the **Observer design pattern**, in which a subject (the workflow service) notifies a set of observers (notification handlers) without knowing their concrete types.

| Role | CivicConnect Implementation |
|------|-----------------------------|
| **Subject** | `WorkflowService` (raises `StatusChanged`) |
| **Concrete Subject** | `transition()` in `backend/server/application/workflow.service.ts` |
| **Observer interface** | `eventBus.subscribe(handler)` in `backend/server/domain/events.ts` |
| **Concrete Observers** | `NotificationHandler` (planned); future: EmailNotifier, SmsNotifier |
| **Event** | `StatusChanged { request, from, to, version }` |

*Reference: Gamma, Helm, Johnson, Vlissides, "Design Patterns: Elements of Reusable Object-Oriented Software" (1994), Observer pattern.*

### 3.2 Post-Commit Event Raising

The ADR requires that the event is raised **only after the transaction commits**. This is a critical correctness property — the event must never fire for a status change that was rolled back.

**Two failure modes prevented:**

1. **Phantom notification** — event fires for a rolled-back transition. Prevented by raising the event **after** `COMMIT`, not inside the transaction.
2. **Missing notification** — event lost because the process crashes between `COMMIT` and the event handler running. **This is not solved by in-process events alone.** The industry standard is the **Transactional Outbox Pattern**, documented as a future iteration in the Technical Debt Register.

*Reference: Chris Richardson, "Transactional Outbox Pattern" — https://microservices.io/patterns/data/transactional-outbox.html*

### 3.3 Why Not a Message Broker (Yet)?

The asynchronous message broker option is architecturally superior for systems that require:

- Independent scaling of notification processing
- Cross-team or cross-service boundaries
- Delivery guarantees across process failures

CivicConnect requires **none of these** for the initial implementation:

- The notification handler runs in the same Node.js process as the workflow service
- There is one team, one codebase, one deployable unit
- The event volume (up to 20 sync updates per reconnect per field worker) is trivial

Introducing a broker now would:

- Add Kafka/RabbitMQ infrastructure — **not free-tier compatible** (Cost Constraint)
- Require broker monitoring, dead-letter queues, consumer groups — **disproportionate to a 3-student team** (Team Constraint)
- Break the layered monolith architecture (**ADR-ARCH-01**)

*Reference: Sam Newman, "Monolith to Microservices" (2019), Ch. 1 — "When to split".*

### 3.4 Why Not Synchronous REST?

A REST-based notification service would:

- Introduce a network boundary where there is no independent service
- Add latency to the status-transition response, risking **NFR-02** (response time under 3s)
- Require the workflow service to handle network failures — conflating business logic with integration error handling

For a monolith serving a single municipal deployment, **in-process events are the correct level of decoupling**.

---

## 4. Authoritative References

| # | Source | Relevance |
|---|--------|-----------|
| 1 | Gamma, Helm, Johnson, Vlissides, "Design Patterns" (1994), Observer | Foundational pattern for subject-observer decoupling |
| 2 | Chris Richardson, "Transactional Outbox Pattern" | Post-commit event publishing; failure modes |
| 3 | Sam Newman, "Monolith to Microservices" (2019) | When a network boundary is justified |
| 4 | Martin Fowler, "Patterns of Enterprise Application Architecture", Domain Events | In-process event patterns |
| 5 | Vernon, "Implementing Domain-Driven Design" (2013), Ch. 8 | Domain events in bounded contexts |
| 6 | PostgreSQL 16 Documentation, "Transactions" | Commit semantics underlying post-commit events |

---

## 5. Traceability to M3 Assessment Areas

| M3 Area | How This ADR Contributes |
|---------|--------------------------|
| **A. Controlled Implementation & M2 Baseline Conformance** | Confirms monolith (ADR-ARCH-01) is not replaced with distributed notification infrastructure |
| **B. Collaborative Construction & Configuration Control** | Decision recorded as ADR; alternative considered documented |
| **D. Black-box, Integration & System Validation** | Defines the integration test needed (event fires post-commit) |
| **E. Quality, Defect & Traceability Evidence** | Links ADR to FR-05 and FR-06 |
| **F. Performance & Release Readiness** | Notes that synchronous REST would hurt NFR-02 |
| **G. Release-Quality Review & Residual Risk** | Documents in-process event delivery limitation |

---

## 6. Traceability to Requirements (RTM Rows)

| Requirement | Nature of Link |
|-------------|----------------|
| **FR-05** | Notification behaviour triggered by status change; the event contract is defined by this ADR |
| **FR-06** | Citizen-facing status tracking relies on the notification path; the ADR confirms it is called only after commit |
| **NFR-02** | Synchronous REST was rejected partly because it would add latency to the status-transition response |

---

## 7. Verification Evidence Plan

| Evidence ID | Description | Type |
|-------------|-------------|------|
| **TC-BE-07** | Successful status transition → `StatusChanged` event fires exactly once | Unit + Integration |
| **TC-BE-08** | Rolled-back transaction → no `StatusChanged` event fires | Negative |
| **TC-BE-16** | Multiple observers receive the same event (fan-out) | Unit |
| **TC-BE-17** | Observer failure does not break the workflow (fault tolerance in `eventBus.raise`) | Unit |
| **TC-BE-18** | Event payload matches the documented contract (`request`, `from`, `to`, `version`) | Unit |

---

## 8. Residual Risk

| Risk ID | Description | Probability | Impact | Mitigation |
|---------|-------------|-------------|--------|------------|
| **RR-M3-04** | Event lost between `COMMIT` and observer execution (process crash) | Low | Medium | Documented; Transactional Outbox pattern planned for future iteration |
| **RR-M3-05** | Observer exception silently swallowed by `eventBus` try/catch, hiding bugs | Low | Low | Logging in `eventBus.raise`; observer unit tests verify error paths |
| **RR-M3-06** | Notification path cannot scale independently under load | Very Low | Low | Not a requirement for M3; revisit if notification volume increases |

---

## 9. Technical Debt

| Debt ID | Description | Rationale | Target |
|---------|-------------|-----------|--------|
| **TD-M3-04** | In-process events are at-most-once within process lifetime | Acceptable for M3 demonstration | Adopt Transactional Outbox pattern in post-M3 iteration |
| **TD-M3-05** | No external event observability (no metrics, no tracing) | Team size and scope | Add when notification volume increases |
| **TD-M3-06** | No dead-letter queue for failed notification persistence | No queue exists yet | Coupled with Outbox adoption |

---

## 10. Summary

| Question | Answer |
|----------|--------|
| What was decided? | In-process event-based notification, post-commit, Observer pattern |
| Why? | Decoupling without infrastructure; aligned with layered monolith; proportionate to scope |
| Alternatives rejected? | In-process method call (tight coupling); synchronous REST (network cost, latency); message broker (disproportionate) |
| Reference framework? | Observer pattern; Transactional Outbox; Sam Newman's split criteria |
| M3 evidence? | TC-BE-07, TC-BE-08, TC-BE-16, TC-BE-17, TC-BE-18 |
| Residual risk? | Event loss on crash (documented; Outbox deferred) |
