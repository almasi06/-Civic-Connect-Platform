# ADR-ARCH-01: Layered Monolith with In-Process Domain Events

- **Status:** Accepted
- **Date:** 2026-09-28
- **Deciders:** Davidzo Malapile, Naledi Moeng, Kamohelo Mabena
- **Supersedes:** None (M1 had no architecture decision)
- **Related:** ADR-TECH-01, ADR-PERSIST-01 (Member 2)
- **Requirement(s):** ASR-01 to ASR-08

## Context

M1 left architecture unspecified. M2 requires a proportionate architecture that satisfies ASR-01 to ASR-08, respects M1 constraints (3-person team, 12–14 weeks, zero budget, web-only), and does not foreclose M2 future-scope items.

## Decision

Adopt a layered monolith with in-process domain events. Four logical layers: presentation, application, domain, persistence. Single deployable unit; one managed PostgreSQL database as the only separate physical tier.

## Alternatives Considered

| Alternative | Verdict | Reason |
|---|---|---|
| Layered monolith + in-process events | **Selected** | Proportionate for team size, timeline, budget |
| Modular monolith | Deferred | Can evolve from A later (FE-007) |
| Microservices | Rejected | Premature network boundaries (Richards & Ford, 2020) |
| Serverless / FaaS | Rejected | Cold starts threaten NFR-02; offline sync complexity |

## Rationale

- **ASR-01 (offline sync):** Single-process sync endpoint + conflict resolver
- **ASR-02 (notifications):** In-process domain events per A2 Task 3; post-commit dispatch
- **ASR-03 (RBAC/audit):** Centralised middleware + ACID transactions
- **ASR-04 (reporting):** Same DB, indexed queries; read model can be added later
- **ASR-05 (low bandwidth):** Single API gateway with compression
- **ASR-06 (uptime):** Fewer moving parts = fewer failure modes
- **ASR-07 (testability):** Clear layer boundaries; unit testable
- **ASR-08 (audit retention):** Append-only table in same DB; retention at DB level
- Richards & Ford (2020): avoid premature network boundaries
- A2 Task 3: in-process event handling is proportionate for a small team

## Consequences

**Positive:**
- Lower operational complexity
- Easier debugging and testing
- ACID transactions across workflow + audit
- Single deployable = simpler CI/CD
- Free-tier hosting viable

**Negative / Trade-offs:**
- Vertical scaling limits (acceptable at current scale)
- Requires discipline to maintain layer boundaries (RR-009)
- Cannot independently scale notification vs workflow

**Complexity introduced:**
- Domain event contract must be versioned
- Layer boundary discipline enforced via code review

## Forward-Compatibility Seams

- Modular monolith evolution path (FE-007)
- Notification channel abstraction (M2 future-scope)
- `source` field on request entity (future IoT)
- PII-free reporting layer (future public API)
- Clean API contract (future native apps)
- Structured event/audit history (future analytics)

## Evidence

- A2 Task 1 (design problems and coupling/cohesion)
- A2 Task 3 (integration research; in-process recommendation)
- Richards & Ford (2020), Fundamentals of Software Architecture
- M1 constraints and risk register

## Links

- PED: [07-architecture.md](../ped/07-architecture.md)
- ASRs: [06-asrs.md](../ped/06-asrs.md)
- Related ADRs: [ADR-TECH-01](ADR-TECH-01-pern-stack.md)