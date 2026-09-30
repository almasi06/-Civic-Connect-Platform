# ADR-INT-01: Notification Integration Approach

## Status

Accepted

## Context

CivicConnect needs to communicate a service-request status change to notification
behaviour after a successful status transition.

Assignment 2 considered three integration approaches:

- In-process method calls
- Synchronous REST communication
- Asynchronous event/message-based communication

The integration approach must provide sufficient separation between the core
application and notification behaviour while remaining proportionate to the
current CivicConnect project scope.

Introducing a separate network service or message broker would add infrastructure
and operational complexity. The initial design therefore needs to consider whether
that complexity is justified by the current requirements.

## Decision

CivicConnect will use an **in-process event-based notification integration**
approach for the initial implementation.

The status-transition logic will produce a status-change event after the
transaction has successfully committed. Notification components can subscribe to
or observe this event without the status-transition component directly depending
on each notification implementation.

The initial implementation will not introduce a separate notification server,
REST service or message broker unless later requirements provide sufficient
justification for such an architectural boundary.

## Rationale

An in-process event-based approach provides separation between the status
transition and notification behaviour without introducing an additional network
boundary.

This is proportionate to the current project scope and reduces the infrastructure
and operational complexity that would result from introducing a distributed
notification service at this stage.

The approach also works with the Observer-based design decision documented in
the design decisions section.

## Alternatives Considered

### In-process method call

The status-transition component could directly call the notification component.

This is straightforward for a small implementation but creates stronger coupling
between the status-transition logic and notification behaviour.

### Synchronous REST integration

The application could communicate with a separate notification service through a
REST API.

This provides a network boundary and independent service separation, but it also
introduces additional deployment, failure and communication considerations.

### Asynchronous event/message integration

The application could publish status-change events through a message broker or
event infrastructure.

This provides stronger decoupling and asynchronous processing but introduces
additional infrastructure and operational complexity.

### Selected approach

The in-process event-based approach provides the required separation for the
initial CivicConnect scope without introducing unnecessary distributed-system
complexity.

## Consequences

### Positive consequences

- Notification behaviour is separated from the core status-transition logic.
- No additional notification server or message broker is required for the initial
  implementation.
- The approach can support additional notification observers.
- The integration remains relatively simple to develop and test.

### Negative consequences

- Notification processing remains within the application boundary.
- It does not provide the same independent scaling or failure isolation as a
  separate service.
- If notification requirements become significantly more complex, the integration
  approach may need to be revisited.

## Implementation Implications

The status-transition workflow should follow this sequence:

1. Validate the status transition.
2. Begin the persistence transaction.
3. Update the service-request status.
4. Insert the status-history record.
5. Update assignment information where applicable.
6. Commit the transaction.
7. Publish the status-change event.
8. Notify registered observers.

A notification event must not be published if the transaction fails or is rolled
back.

The specific interfaces and event structure will be refined during implementation.

## Verification Evidence

The decision will be verified through:

- An integration/component diagram showing the status-transition component and
  notification integration.
- Application code demonstrating publication of the status-change event after
  successful persistence.
- A test confirming that a successful status transition produces the expected
  notification event.
- A failure test confirming that a rolled-back transaction does not produce a
  notification event.
- RTM traceability linking the integration decision to the relevant functional
  requirements.

## Related Requirements

- FR-05 — Status tracking/transition behaviour.
- FR-06 — Notification behaviour.

## Related Decisions

- ADR-PERSIST-01 — Transactional Status Transition.
- Observer-based notification fan-out design decision.
