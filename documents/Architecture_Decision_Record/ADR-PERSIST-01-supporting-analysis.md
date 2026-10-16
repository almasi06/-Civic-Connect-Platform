# ADR-PERSIST-01: Supporting Analysis

**Parent ADR:** ADR-PERSIST-01: Transactional Status Transition
**Status:** Accepted
**Deciders:** Davidzo Malapile, Naledi Moeng, Kamohelo Mabena

---

## Purpose of This Section

ADR-PERSIST-01 records the decision to use a single database transaction for status transitions, with the notification event published only after commit. This supporting analysis provides:

- A **decision matrix** comparing alternatives against measurable criteria
- The **theoretical foundation** (ACID properties, Transactional Outbox pattern)
- **Authoritative references** supporting the choice
- **Traceability** to specific M3 assessment areas and requirements
- **Verification evidence** the team will produce
This section does not repeat the decision it justifies it.

---

## Decision Matrix

The following matrix scores each alternative against the criteria that matter for CivicConnect's status-transition workflow. Scoring is relative to the **baseline** (independent operations):

- `0` = equivalent to baseline
- `+1` / `+2` = better than baseline
- `-1` / `-2` = worse than baseline

| Criterion | Weight | Baseline: Independent Operations | Option A: Database Transaction (Selected) | Option B: Application-Level Saga |
|-----------|--------|----------------------------------|-------------------------------------------|----------------------------------|
| Data consistency (atomicity) | High | 0 | **+1** | +1 |
| Implementation complexity | Medium | 0 | **−1** | −2 |
| Auditability / traceability | High | 0 | **+1** | −1 |
| Notification integrity | High | −1 | **+1** | 0 |
| Operational overhead | Medium | 0 | **0** | −2 |
| Team capability fit | Medium | +1 | **0** | −2 |
| Verification complexity | Medium | 0 | **+1** | −2 |
| Alignment with M2 baseline (layered monolith) | High | +1 | **+1** | −2 |
| **Total** | | **+1** | **+4** | **−10** |

**Interpretation:** The database-transaction approach scores highest on every criterion that affects correctness and auditability, with acceptable complexity. The saga pattern is only justified when operations span independent services — which CivicConnect does not have (see ADR-ARCH-01: Layered Monolith).

---

## Theoretical Foundation

### ACID Properties

| Property | How It Applies |
|----------|----------------|
| **Atomicity** | All operations in a status transition either all succeed or all fail |
| **Consistency** | No intermediate state is observable to external readers |
| **Isolation** | Enforced by PostgreSQL's `READ COMMITTED` + `FOR UPDATE` row locks |
| **Durability** | Provided by Supabase's PostgreSQL persistence guarantees |

*Reference: PostgreSQL 16 Documentation, "Transaction Isolation" — https://www.postgresql.org/docs/16/transaction-iso.html*

### Post-Commit Event Problem and the Transactional Outbox

The ADR requires that the `StatusChanged` event is raised **only after commit**. This pattern has a subtle failure mode:

> **Failure mode:** If the application crashes between `COMMIT` and the event handler running, the status change persists but the notification is lost forever.

The industry-standard solution is the **Transactional Outbox Pattern**, documented as the target state for a future iteration.

| Aspect | Current M3 Implementation | Target State (Future Iteration) |
|--------|---------------------------|----------------------------------|
| Event raising | In-process `eventBus.raise()` after `COMMIT` | Insert event row into `outbox` table within the same transaction |
| Delivery guarantee | At-most-once | At-least-once |
| Complexity | Low | Medium |
| Justification | Acceptable for demo + test environment | Required for production |

*References:*
- *Chris Richardson, "Transactional Outbox Pattern" — https://microservices.io/patterns/data/transactional-outbox.html*
- *Gunnar Morling, "Reliable Microservices Data Exchange with the Outbox Pattern" — https://debezium.io/blog/2019/02/19/reliable-microservices-data-exchange-with-the-outbox-pattern/*

### Why Not the Saga Pattern?

The Saga pattern is standard when operations span **multiple services**. CivicConnect's M2 architecture (ADR-ARCH-01) is a **layered monolith**, so all operations live in one process and one database. Introducing sagas would add infrastructure complexity, require compensation logic, and break atomic guarantees that POPIA-adjacent accountability requires.

*Reference: Hector Garcia-Molina & Kenneth Salem, "Sagas" (1987), ACM SIGMOD*

---

## Authoritative References

| # | Source | Relevance |
|---|--------|-----------|
| 1 | PostgreSQL 16 Documentation, "Transactions" | Defines ACID guarantees |
| 2 | PostgreSQL 16 Documentation, "Transaction Isolation" | Justifies `READ COMMITTED` + `FOR UPDATE` |
| 3 | Chris Richardson, "Transactional Outbox Pattern" | Post-commit event problem and solution |
| 4 | Garcia-Molina & Salem, "Sagas" (SIGMOD 1987) | When saga alternatives are warranted |
| 5 | Martin Kleppmann, *Designing Data-Intensive Applications*, Ch. 7 | Transaction isolation trade-offs |
| 6 | Fowler, *Patterns of Enterprise Application Architecture*, Unit of Work | Justifies transaction boundary |

---

## Traceability to Assessment Areas

| M3 Area | How This ADR Contributes |
|---------|--------------------------|
| A. Controlled Implementation & M2 Conformance | Confirms layered monolith is not replaced with distributed transactions |
| B. Collaborative Construction & Configuration | Decision recorded as ADR; changes tracked in change log |
| D. Black-box, Integration & System Validation | Defines integration tests (commit path, rollback path) |
| E. Quality, Defect & Traceability Evidence | Links ADR to FR-04, FR-05, FR-06, NFR-01 |
| F. Performance & Release Readiness | Notes long-running transactions as a known limitation |
| G. Release-Quality Review & Residual Risk | Documents post-commit event loss as residual risk |

---

## Traceability to Requirements

| Requirement | Nature of Link |
|-------------|----------------|
| FR-04 | Status transition is atomic; no partial ticket state observable |
| FR-05 | Notification fires only after commit; phantom notifications prevented |
| FR-06 | History inserted in same transaction as status change; tracking view always consistent |
| NFR-01 | `/api/sync` uses per-request transactions; batch integrity relies on this ADR |
| Security Constraint 2 | Audit trail written atomically; RBAC enforced before transaction |

---

## Verification Evidence Plan

| Evidence ID | Description | Type |
|-------------|-------------|------|
| TC-BE-04 | Status transition succeeds end-to-end | Integration |
| TC-BE-05 | Deliberate failure mid-transaction → no state change persisted | Negative |
| TC-BE-06 | Version mismatch → 409 Conflict; no partial write | Negative |
| TC-BE-07 | Post-commit event fired only after successful commit | Unit + integration |
| TC-BE-08 | Notification NOT persisted when transaction fails | Negative |
| TC-BE-09 | Concurrent updates — one wins, other gets 409 | Concurrency |

---

## Residual Risk

| Risk ID | Description | Probability | Impact | Mitigation |
|---------|-------------|-------------|--------|------------|
| RR-M3-01 | Post-commit event lost on application crash | Low | Medium | Documented; Outbox planned |
| RR-M3-02 | Long-running transactions cause lock contention | Low | Low | Keep transactions short; batch limits |
| RR-M3-03 | Version-mismatch conflicts under concurrent load | Low | Low | Optimistic concurrency tested |

---

## Technical Debt

| Debt ID | Description | Rationale | Target |
|---------|-------------|-----------|--------|
| TD-M3-01 | Event delivery is at-most-once (in-process) | Acceptable for M3 | Outbox pattern post-M3 |
| TD-M3-02 | No saga-based recovery | No cross-service transactions yet | Revisit if architecture evolves |
| TD-M3-03 | No automated outbox test | Out of M3 scope | Add when adopted |
