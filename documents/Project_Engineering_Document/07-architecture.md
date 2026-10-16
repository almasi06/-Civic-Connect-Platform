# Architecture



## Selected Architecture

Layered monolith with in-process domain events.

## Decision

See [ADR-ARCH-01](../Architecture_Decision_Record/ADR-ARCH-01-layered-monolith.md).

## Alternatives Considered

| Alternative | Verdict | Reason |
Architecture choice was evaluated using a weighted decision matrix. Criteria weights reflect M1 constraints, ASRs, and the lecturer's guidance that the organisation may grow.

| Criterion | Weight | **Monolith** | Modular Monolith | **Microservices** | Serverless |
|---|---|---|---|---|---|
| Team capacity (3 students, 12-14 weeks) | 0.20 | **5** | 4 | 2 | 3 |
| Alignment with ASRs (offline, events, uptime) | 0.15 | **5** | 5 | 4 | 3 |
| Transactional integrity (ADR-PERSIST-01) | 0.15 | **5** | 5 | 2 | 2 |
| Integration simplicity (ADR-INT-01) | 0.10 | **5** | 5 | 2 | 3 |
| Operational cost (zero budget) | 0.10 | **5** | 5 | 2 | 4 |
| Deployment simplicity | 0.05 | **5** | 4 | 2 | 3 |
| Natural evolution path | 0.15 | **3** | 4 | 5 | 4 |
| Testing complexity | 0.05 | **5** | 4 | 2 | 3 |
| Future scalability potential | 0.05 | **3** | 4 | 5 | 4 |
| **Weighted score** | **1.00** | **4.60** | **4.50** | **2.90** | **3.05** |

### Calculations

**Monolith (Selected) - 4.60**

| Criterion | Weight | Rating | Product |
|---|---|---|---|
| Team capacity | 0.20 | 5 | 1.00 |
| Alignment with ASRs | 0.15 | 5 | 0.75 |
| Transactional integrity | 0.15 | 5 | 0.75 |
| Integration simplicity | 0.10 | 5 | 0.50 |
| Operational cost | 0.10 | 5 | 0.50 |
| Deployment simplicity | 0.05 | 5 | 0.25 |
| Natural evolution path | 0.15 | 3 | 0.45 |
| Testing complexity | 0.05 | 5 | 0.25 |
| Future scalability | 0.05 | 3 | 0.15 |
| **Total** | **1.00** | - | **4.60** |

**Modular Monolith (Rejected) - 4.50**

| Criterion | Weight | Rating | Product |
|---|---|---|---|
| Team capacity | 0.20 | 4 | 0.80 |
| Alignment with ASRs | 0.15 | 5 | 0.75 |
| Transactional integrity | 0.15 | 5 | 0.75 |
| Integration simplicity | 0.10 | 5 | 0.50 |
| Operational cost | 0.10 | 5 | 0.50 |
| Deployment simplicity | 0.05 | 4 | 0.20 |
| Natural evolution path | 0.15 | 4 | 0.60 |
| Testing complexity | 0.05 | 4 | 0.20 |
| Future scalability | 0.05 | 4 | 0.20 |
| **Total** | **1.00** | - | **4.50** |

**Microservices (Deferred - long-term target) - 2.90**

| Criterion | Weight | Rating | Product |
|---|---|---|---|
| Team capacity | 0.20 | 2 | 0.40 |
| Alignment with ASRs | 0.15 | 4 | 0.60 |
| Transactional integrity | 0.15 | 2 | 0.30 |
| Integration simplicity | 0.10 | 2 | 0.20 |
| Operational cost | 0.10 | 2 | 0.20 |
| Deployment simplicity | 0.05 | 2 | 0.10 |
| Natural evolution path | 0.15 | 5 | 0.75 |
| Testing complexity | 0.05 | 2 | 0.10 |
| Future scalability | 0.05 | 5 | 0.25 |
| **Total** | **1.00** | - | **2.90** |

**Serverless (Rejected) - 3.05**

| Criterion | Weight | Rating | Product |
|---|---|---|---|
| Team capacity | 0.20 | 3 | 0.60 |
| Alignment with ASRs | 0.15 | 3 | 0.45 |
| Transactional integrity | 0.15 | 2 | 0.30 |
| Integration simplicity | 0.10 | 3 | 0.30 |
| Operational cost | 0.10 | 4 | 0.40 |
| Deployment simplicity | 0.05 | 3 | 0.15 |
| Natural evolution path | 0.15 | 3 | 0.45 |
| Testing complexity | 0.05 | 3 | 0.15 |
| Future scalability | 0.05 | 4 | 0.20 |
| **Total** | **1.00** | - | **3.05** |

### Interpretation

- **Monolith selected for M3** - highest score on the highest-weighted criteria (team capacity, ASR alignment, transactional integrity, operational cost).
- **Modular Monolith rejected** - 0.10 behind monolith. It scored higher on evolution path (4 vs 3) but lower on team capacity and deployment simplicity. Modular monolith is a viable intermediate stage but adds discipline overhead not yet justified at our codebase size.
- **Microservices deferred (not rejected)** - scores lowest on team capacity, transactional integrity, integration simplicity, operational cost, and testing complexity. But it scores 5 on natural evolution path and future scalability - the two criteria the lecturer highlighted. **Microservices are documented as the long-term architectural destination.**
- **Serverless rejected** - cold starts threaten NFR-02 (response time < 3s) and offline sync complexity is high.

## Why Microservices Were Considered and the Honest Trade-off

The software industry has broadly moved toward distributed architectures, and the team took seriously the lecturer's guidance that microservices are the direction of modern practice and that monoliths can be seen as outdated.

### The Industry Argument for Microservices (Which We Accept)

| Argument | Why it applies to CivicConnect long-term |
|---|---|
| **Independent scaling** | Reporting (FR-03, FR-14) has different load characteristics than status transitions (FR-05). |
| **Fault isolation** | A failure in notification shouldn't affect citizens submitting reports directly supports ASR-06 (99.5% uptime). |
| **Independent deployment** | Reporting changes shouldn't require redeploying the workflow. |
| **Technology diversity** | Reporting could use Python analytics while the workflow uses Node. |
| **Team scaling** | At 30 engineers, microservices allow parallel ownership. |
| **Organisational alignment** | Conway's Law: systems mirror team structure. |

### The Counter-Arguments for M3 (Which We Also Accept)

| Cost | Why it applies right now |
|---|---|
| **Distributed transactions** | ADR-PERSIST-01 requires ACID across status + audit + assignment. Microservices require a saga pattern with compensating transactions. A2 Task 2 recommends against this at our scale. |
| **Network boundary cost** | Every workflow notification call becomes HTTP. Newman (2021) documents temporal coupling risk. A2 Task 3 recommends in-process for a 3-person team. |
| **Infrastructure overhead** | Service discovery, message broker, distributed tracing, cross-service auth each requires ownership. |
| **Deployment complexity** | Free-tier PaaS typically allows one service. Multi-service exceeds our budget constraint. |
| **Debugging cost** | Cross-service bugs require distributed tracing we don't have time to build. |
| **No proven need** | None of our ASRs require independent scaling at M3 scale (100 concurrent users). |
| **Operational capacity** | 3 students, 12-14 weeks. Building microservices correctly would consume the entire schedule on infrastructure alone. |

### The Engineering Position We Took

**We chose a monolith for M3 not because it's "old" or "simpler", but because it is the correct starting architecture for our constraints with a designed migration path to microservices as the documented long-term destination.**

This is a well-documented industry pattern:

- **Martin Fowler (2014)** - "MonolithFirst": *"You shouldn't start a new project with microservices, even if you're sure your application will be big enough to make it worthwhile."*
- **Sam Newman (2021)** - *Monolith to Microservices*: recommends extracting services only when the pain of the monolith exceeds the cost of distribution.
- **Richards & Ford (2020)** - *Fundamentals of Software Architecture*: warns that premature distribution is one of the most common architecture mistakes.
- **Shopify, Basecamp, Stack Overflow, GitHub** - all run production monoliths at massive scale.

The monolith is not an outdated choice - it is the standard starting point for teams that will eventually extract services.

### What We Are Committing to Instead

Rather than build microservices now, we are building a monolith that preserves every seam required to move to microservices later. Four specific seams:

| Seam | How it preserves the microservices migration path |
|---|---|
| **1. Domain events are contracts, not calls** | The `StatusChanged` event (ADR-INT-01) is defined as a message, not a direct function call. Swapping to a broker becomes a change of transport, not a change of logic. |
| **2. Notification handler is already a subscriber** | It subscribes to events, not called from inside the workflow. In a microservices version, it becomes a separate service consuming from the broker. |
| **3. Layer boundaries are enforced** | The domain layer doesn't leak into presentation or persistence (RR-009 tracks drift). Extracting a service keeps the same boundary. |
| **4. Database schema is modular** | The schema is decomposed by entity (ServiceRequest, StatusHistory, Assignment, Notification) so it can be split along service lines. |

## Growth Path - From Monolith to Microservices

The monolith is the **starting** architecture, not the **final** one. The migration to microservices is documented, triggered, and time-bound.

### Migration Plan (Documented as FE-007)

| Phase | Action | Trigger | Estimated Effort |
|---|---|---|---|
| **Phase 1** | Extract notification service behind a message broker | Notification volume > 10,000/day | 2-3 weeks |
| **Phase 2** | Extract reporting service with its own read replica | Reporting query time > 1s p95 | 3-4 weeks |
| **Phase 3** | Extract auth service with its own session store | Multi-tenant or SSO requirement emerges | 3-4 weeks |
| **Phase 4** | Extract workflow service (last it's the core) | Workflow logic becomes a bottleneck | 4-6 weeks |

None of these phases require rewriting the domain layer each is an extraction, not a rewrite.

### Migration Trigger Criteria

The team commits (via this document and ADR-ARCH-01) to revisiting the architecture decision when **any** of the following becomes true:

| Trigger | Threshold | Current State |
|---|---|---|
| Layered monolith + in-process events | **Selected** | Proportionate for team size, timeline, budget |
| Microservices | Rejected | Premature network boundaries (Richards & Ford, 2020) |
| Serverless / FaaS | Rejected | Cold starts threaten NFR-02; offline sync complexity |

## Proportionality Statement

> A more distributed architecture is not automatically more advanced. Microservices would introduce network boundaries, operational overhead, distributed transaction complexity, and debugging difficulty that CivicConnect's current requirements, team size, budget, and timeline do not justify. The layered monolith with in-process domain events satisfies all ASRs while keeping complexity proportionate.

## Architecture vs Technology

- **Architecture:** Logical structure, responsibilities, boundaries, interactions (layers, modules, events)
- **Technology:** Specific products/versions implementing the architecture
- **Logical layers are not the same as physical deployment tiers:** All four logical layers run in a single deployable unit; the database is the only separate physical tier

## Diagrams

- [Logical architecture](../Architecture/logical-architecture.md)
- [Deployment view](../Architecture/deployment-view.md)
- [Runtime view](../Architecture/runtime-view.md)
- [Component view](../Architecture/component-view.md)
