# Architecture-Significant Requirements (ASRs)

> **M2 Addition — PED v2.0**
> **Owner:** Davidzo Malapile
> **Date:** 2026-09-28
> **Linked ADRs:** ADR-ARCH-01, ADR-TECH-01

## ASR-01: Offline-First Field Worker Sync

- **Source:** FR-02, NFR-01
- **Stakeholder:** Municipal Field Workers
- **Constraint:** Web-only (browser storage: IndexedDB, Service Workers)
- **Risk link:** RR-001 (Critical)
- **Architectural influence:** PWA architecture, client-side persistence, sync endpoint, conflict-resolution strategy
- **Satisfied by:** ADR-ARCH-01

## ASR-02: Real-Time Status Transparency

- **Source:** FR-05, FR-06, FR-08
- **Stakeholder:** Citizens
- **Quality driver:** Availability, freshness
- **Architectural influence:** Event-based notification, post-commit dispatch, no caching of status field, tracking read model
- **Satisfied by:** ADR-ARCH-01

## ASR-03: Role-Based Access Control & Audit Accountability

- **Source:** FR-04, FR-11, FR-16, NFR-03, NFR-11, Security Constraint 2
- **Stakeholder:** Municipal Administrators
- **Quality driver:** Security, auditability
- **Architectural influence:** Auth layer, RBAC middleware, append-only audit store, session management
- **Satisfied by:** ADR-ARCH-01

## ASR-04: Reporting, Filtering & Service Activity Analytics

- **Source:** FR-03, FR-10, FR-14, FR-16
- **Stakeholder:** Municipal Management
- **Quality driver:** Performance (NFR-02), scalability (FE-006)
- **Architectural influence:** Query/index design, aggregation strategy, possible read-model separation, PII-free reporting layer
- **Satisfied by:** ADR-ARCH-01, ADR-TECH-01

## ASR-05: Low-Bandwidth / Intermittent Connectivity

- **Source:** Technology Constraint 1
- **Stakeholder:** Field Workers, Citizens
- **Architectural influence:** Lightweight payloads, compression, PWA, caching strategy
- **Satisfied by:** ADR-TECH-01

## ASR-06: Availability Target (99.5%)

- **Source:** NFR-05
- **Stakeholder:** All
- **Architectural influence:** Free-tier hosting, stateless service, SPOF avoidance, health checks
- **Satisfied by:** ADR-ARCH-01

## ASR-07: Testability & Measurable Acceptance

- **Source:** Quality Constraint 1
- **Architectural influence:** Layered architecture, dependency injection, separation of concerns, initial automated verification
- **Satisfied by:** ADR-ARCH-01

## ASR-08: Audit Retention & Accountability (NEW in M2)

- **Source:** NFR-07 (90-day retention), FR-16 (resolution times, staff activity)
- **Stakeholder:** Municipal Administrators, Management
- **Quality driver:** Auditability, data retention, compliance
- **Architectural influence:** Append-only event store, retention policy, backup/restore, DB storage sizing, separation of current state from history
- **Satisfied by:** ADR-ARCH-01, ADR-PERSIST-01 (Member 2)

## ASR-to-Architecture Mapping

| ASR | Quality Driver | Architecture Response | ADR Link |
|---|---|---|---|
| ASR-01 | Offline capability, sync performance | PWA + IndexedDB + sync endpoint + conflict resolver | ADR-ARCH-01 |
| ASR-02 | Real-time transparency, availability | Event-driven notification, post-commit dispatch | ADR-ARCH-01 |
| ASR-03 | Security, auditability | Auth middleware, RBAC, append-only audit | ADR-ARCH-01 |
| ASR-04 | Performance, scalability | Indexed queries, aggregation, PII-free reporting | ADR-ARCH-01, ADR-TECH-01 |
| ASR-05 | Bandwidth efficiency | Lightweight payloads, compression, PWA | ADR-TECH-01 |
| ASR-06 | Availability | Stateless service, managed DB, health checks | ADR-ARCH-01 |
| ASR-07 | Testability | Layered, DI, separation of concerns | ADR-ARCH-01 |
| ASR-08 | Audit retention, compliance | Append-only event store, retention policy | ADR-ARCH-01 |

## Cross-cutting Non-ASR Constraints

- **NFR-10 (WCAG 2.1 AA):** React + a11y library (axe-core in CI)
- **NFR-12 (Error handling):** Centralised error boundary; no stack traces in user responses