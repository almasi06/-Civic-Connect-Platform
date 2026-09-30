# Architecture



## Selected Architecture

Layered monolith with in-process domain events.

## Decision

See [ADR-ARCH-01](../Architecture_Decision_Record/ADR-ARCH-01-layered-monolith.md).

## Alternatives Considered

| Alternative | Verdict | Reason |
|---|---|---|
| Layered monolith + in-process events | **Selected** | Proportionate for team size, timeline, budget |
| Modular monolith | Deferred | Can evolve from A later (FE-007) |
| Microservices | Rejected | Premature network boundaries (Richards & Ford, 2020) |
| Serverless / FaaS | Rejected | Cold starts threaten NFR-02; offline sync complexity |

## Proportionality Statement

> A more distributed architecture is not automatically more advanced. Microservices would introduce network boundaries, operational overhead, distributed transaction complexity, and debugging difficulty that CivicConnect's current requirements, team size, budget, and timeline do not justify. The layered monolith with in-process domain events satisfies all ASRs while keeping complexity proportionate.

## Architecture vs Technology

- **Architecture:** Logical structure, responsibilities, boundaries, interactions (layers, modules, events)
- **Technology:** Specific products/versions implementing the architecture
- **Logical layers ≠ physical deployment tiers:** All four logical layers run in a single deployable unit; the database is the only separate physical tier

## Diagrams

- [Logical architecture](../Architecture/logical-architecture.md)
- [Deployment view](../Architecture/deployment-view.md)
- [Runtime view](../Architecture/runtime-view.md)
- [Component view](../Architecture/component-view.md)
