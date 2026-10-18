# ADR-ARCH-01: Layered Monolith with In-Process Domain Events

- **Status:** Accepted
- **Deciders:** Davidzo Malapile, Naledi Moeng, Kamohelo Mabena


## Context

M1 left architecture unspecified. M2 requires a proportionate architecture that satisfies ASR-01 to ASR-08, respects M1 constraints (3-person team, 12-14 weeks, zero budget, web-only), and does not foreclose M2 future-scope items.

## Decision

Adopt a **layered monolith with in-process domain events** for M3, with **microservices documented as the long-term architectural destination** and a controlled migration path.

Four logical layers: presentation, application, domain, persistence. Single deployable unit; one managed PostgreSQL database as the only separate physical tier.

## Alternatives Considered

Four architecture styles were evaluated on a weighted decision matrix (see [07-architecture.md](../Project_Engineering_Document/07-architecture.md)).

### Alternative 1 - Modular Monolith (Rejected for M3)

**What it is:** A single deployable unit with strict internal module boundaries and internal APIs between modules.

**What it would offer CivicConnect:**
- Stronger internal discipline than a plain monolith
- Clearer path to microservices (each module can become a service)
- Same operational simplicity as a monolith (single deployment, single DB)

**Why it was rejected:**
- Adds discipline overhead (internal API contracts between modules) without clear benefit at our codebase size
- The team hasn't yet experienced the pain that internal module boundaries solve
- Scored 4.50 vs monolith's 4.60 - lower on team capacity and deployment simplicity
- Can be revisited as an intermediate stage if the codebase grows (documented in growth path)

**Score: 4.50**

### Alternative 2 - Microservices (Deferred - Long-Term Target)

**What they are:** Separately deployable services communicating over a network, each owning its own data store and deployment pipeline.

**What microservices would offer CivicConnect:**
- **Independent scaling** - notification service could scale separately from reporting, directly serving ASR-04 (reporting performance)
- **Fault isolation** - a crash in reporting wouldn't take down status transitions, directly serving ASR-06 (99.5% uptime)
- **Technology diversity** - each service could use its own stack (e.g., Python for analytics)
- **Team parallelism** - each student could own a service boundary at team-scale
- **Organisational alignment** - Conway's Law supports service boundaries at municipal-team scale



**Why they are deferred (not rejected):**
- **Transactional complexity** - ADR-PERSIST-01 requires ACID across status + audit + assignment. Microservices require either a shared DB (defeats the point) or a saga pattern with compensating transactions.

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

## Consequences of Layered Monolith

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
- source field on request entity (future IoT)
- PII-free reporting layer (future public API)
- Clean API contract (future native apps)
- Structured event/audit history (future analytics)

## Evidence

- A2 Task 1 (design problems and coupling/cohesion)
- A2 Task 3 (integration research; in-process recommendation)
- Richards & Ford (2020), Fundamentals of Software Architecture
- M1 constraints and risk register

## Links

- PED: [07-architecture.md](../Project_Engineering_Document/07-architecture.md)
- ASRs: [06-asrs.md](../Project_Engineering_Document/06-asrs.md)
- Related ADRs: [ADR-TECH-01](ADR-TECH-01-pern-stack.md)
