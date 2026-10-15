# Architecture



## Selected Architecture

**Layered monolith with in-process domain events**, with a documented migration path to microservices as the long-term destination.

## Decision

See [ADR-ARCH-01](../Architecture_Decision_Record/ADR-ARCH-01-layered-monolith.md).

## Architecture Decision Matrix

Architecture choice was evaluated using a weighted decision matrix. Criteria weights reflect M1 constraints, ASRs, and the lecturer's guidance that the organisation may grow.

| Criterion | Weight | **Monolith** | Modular Monolith | **Microservices** | Serverless |
|---|---|---|---|---|---|
| Team capacity (3 students, 12–14 weeks) | 0.20 | **5** | 4 | 2 | 3 |
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

### The Counter-Arguments

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

### Migration Plan

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
| Concurrent users | > 500 (5× NFR-02 target) | Target: 100 |
| Notification volume | > 10,000/day | Estimated: < 500/day at MVP |
| Reporting query time | > 1 second p95 | Target: < 3 seconds p95 |
| Uptime below | 99.5% over 30-day window (NFR-05) | Not yet measurable |
| Team size | > 6 developers | 3 students |
| Single-component failure causes total outage | Any occurrence | Not currently measurable |

When any trigger is hit, the team is committed (by this document) to revisit the architecture decision with a formal ADR.

### Growth Dimensions

**User Scale:**

| Stage | Users | Architecture Response | Trigger |
|---|---|---|---|
| MVP | < 100 | Monolith + managed Postgres (current) | - |
| Pilot | 1,000-5,000 | Add read replica; CDN for PWA assets | Response time > 2s p95 |
| Municipal | 50,000-200,000 | Extract notification service; queue async | Notification volume > 10k/day |
| Multi-municipal | 200,000+ | Extract reporting service; dedicated analytics DB | Reporting query time > 1s p95 |

**Capability Scale:**

| Future Capability | What's Needed | How the Current Architecture Supports It |
|---|---|---|
| Native mobile apps | Mobile API, push notifications, refresh tokens | Clean REST contract; JWT auth extendable; Observer pattern accepts FCM/APNs without workflow change |
| IoT sensor ingestion | Ingestion service, device auth, bulk endpoints | source field on ServiceRequest; domain events accept multiple producers; bulk inserts supported |
| Multi-municipal | Tenant isolation, pertenant config, SSO | Layer boundaries allow tenant middleware; schema extendable with tenantId |
| Predictive analytics | Event store, analytics pipeline, ML serving | Append-only StatusHistory provides structured events; read replica separates analytics workload |
| Public API | Rate limiting, API keys, versioning | PII-free reporting layer; API gateway can wrap monolith endpoints |

**Team Scale:**

| Team Size | Recommended Architecture | Rationale |
|---|---|---|
| 1-5 developers | Monolith (current) | Communication overhead lower than distribution overhead |
| 6-15 developers | Modular monolith | Internal module boundaries allow parallel work |
| 16-40 developers | Selective microservices | Team autonomy exceeds coordination cost |
| 40+ developers | Full microservices | Organisation requires service ownership boundaries |

### Hardware / Operations Cost Projection

| Stage | Users | Infrastructure | Monthly Cost |
|---|---|---|---|
| MVP (M4) | < 100 | Free-tier PaaS + managed Postgres | R0 |
| Pilot | 1,000-5,000 | Basic paid tier + read replica | R500-1,200 |
| Municipal | 50,000-200,000 | Paid PaaS + 2 services + CDN + Redis | R3,000-6,000 |
| Multi-municipal | 200,000+ | Multi-region + managed Kubernetes + dedicated DB | R12,000-25,000 |

## Proportionality Statement

> A more distributed architecture is not automatically more advanced. Microservices are the correct long-term destination for CivicConnect at municipal scale, but they would introduce network boundaries, operational overhead, distributed transaction complexity, and debugging difficulty that the current project constraints 3 students, 12–14 weeks, zero budget, MVP scale cannot justify. The layered monolith with in-process domain events satisfies all ASRs at current scale while preserving four migration seams that make a future move to microservices a controlled refactor rather than a rewrite.

## Architecture vs Technology

- **Architecture:** Logical structure, responsibilities, boundaries, interactions (layers, modules, events)
- **Technology:** Specific products/versions implementing the architecture
- **Logical layers is not the same as physical deployment tiers:** All four logical layers run in a single deployable unit; the database is the only separate physical tier

## Diagrams

- [Logical architecture](../Architecture/logical-architecture.md)
- [Deployment view](../Architecture/deployment-view.md)
- [Runtime view](../Architecture/runtime-view.md)
- [Component view](../Architecture/component-view.md)

## References

- Fowler, M. (2014) *MonolithFirst*. martinfowler.com. Available at: https://martinfowler.com/bliki/MonolithFirst.html
- Newman, S. (2021) *Monolith to Microservices: Evolutionary Patterns to Transform Your Monolith*. O'Reilly Media.
- Newman, S. (2021) *Building Microservices: Designing Fine-Grained Systems*, 2nd edn. O'Reilly Media.
- Richards, M. and Ford, N. (2020) *Fundamentals of Software Architecture: An Engineering Approach*. O'Reilly Media.
- Bass, L., Clements, P. and Kazman, R. (2021) *Software Architecture in Practice*, 4th edn. Addison-Wesley.
- A2 Task 3 (integration research; in-process recommendation for 3-person team).
