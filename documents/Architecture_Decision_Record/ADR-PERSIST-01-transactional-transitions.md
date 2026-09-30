# ADR-PERSIST-01: Transactional Status Transition

- **Status:** Accepted
- **Deciders:** Davidzo Malapile, Naledi Moeng, Kamohelo Mabena

## Context

A CivicConnect service-request status transition can involve multiple related
persistence operations. These may include updating the current status of the
`ServiceRequest`, creating a `StatusHistory` record, and updating assignment
information where applicable.

If these operations are performed independently, one operation could succeed while
another fails. This could leave the service request and its history or assignment
data inconsistent.

The system therefore requires a persistence approach that maintains consistency
across the related operations that make up a status transition.

## Decision

CivicConnect will use a database transaction for the status-transition operation.

The status update, related status-history insertion, and applicable assignment
change will be treated as one transactional unit.

The transaction will be committed only when all required operations succeed. If a
required operation fails, the transaction will be rolled back so that the partial
transition is not persisted.

## Rationale

A transaction provides atomicity for the related persistence operations. This
means that the transition is treated as an all-or-nothing operation.

This supports the requirement that the current service-request status and its
audit/history information remain consistent.

The approach also provides a clear persistence boundary for the notification
integration: a status-change notification should only be published after the
transaction has successfully committed.

## Alternatives Considered

### Independent database operations

Each persistence operation could be executed separately.

This is simpler to implement but could leave partial data if one operation
succeeds and a later operation fails.

### Database transaction

The related operations can be committed or rolled back together.

This provides stronger consistency for the status-transition workflow and is
therefore the selected approach.

## Consequences

### Positive consequences

- Related status-transition changes are committed atomically.
- Failed transitions can be rolled back.
- Status history remains consistent with the current request status.
- The approach provides a clear boundary before a notification event is published.

### Negative consequences

- Transaction handling adds implementation complexity.
- Long-running transactions should be avoided because they can increase database
  contention.
- Correct error handling is required to ensure failed transactions are rolled
  back.

## Implementation Implications

The application should begin a transaction before performing the related
status-transition persistence operations.

Conceptually:

1. Begin transaction.
2. Validate the requested status transition.
3. Update the `ServiceRequest` status.
4. Insert the corresponding `StatusHistory` record.
5. Update assignment information if required.
6. Commit the transaction.
7. Publish the status-change notification only after successful commit.

If any required operation fails, the transaction must be rolled back.

## Verification Evidence

The decision will be verified through:

- Database transaction implementation.
- A test where all status-transition operations succeed and are committed.
- A failure test demonstrating that a failed operation causes the related changes
  to roll back.
- A test confirming that a notification is not published when the transaction
  fails.
- Traceability to the relevant requirements in the RTM.

## Related Requirements

- FR-05 — Status tracking/transition behaviour.
- FR-06 — Notification behaviour.
- NFR-01 — Offline-to-online synchronisation performance, where status updates
  are synchronised with the server.

## Related Design Decisions

- Optimistic concurrency control using a version value.
- Observer-based notification fan-out.
