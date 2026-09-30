# Logical Architecture

> **M2 Addition - PED v2.0**

> **Linked ADR:** [ADR-ARCH-01](../Architecture_Decision_Record/ADR-ARCH-01-layered-monolith.md)

## Diagram

```mermaid
flowchart TD
    subgraph Presentation[Presentation Layer]
        A1[Citizen Web UI]
        A2[Admin Dashboard]
        A3[Field Worker PWA]
    end
    subgraph Application[Application Layer]
        B1[API Controllers]
        B2[Auth Middleware]
        B3[Validation]
        B4[Error Boundary]
    end
    subgraph Domain[Domain Layer]
        C1[Workflow Service]
        C2[Notification Service]
        C3[Reporting Service]
        C4[RBAC Policy Engine]
        C5[Sync/Conflict Resolver]
        C6[Domain Events]
    end
    subgraph Persistence[Persistence Layer]
        D1[Repositories]
        D2[Prisma ORM]
        D3[PostgreSQL]
    end
    A1 --> B1
    A2 --> B1
    A3 --> B1
    B1 --> B2
    B2 --> B3
    B3 --> C1
    C1 --> C2
    C1 --> C6
    C2 --> D1
    C3 --> D1
    C4 --> D1
    C5 --> D1
    D1 --> D2
    D2 --> D3
```

## Responsibilities

### Presentation Layer
- Rendering, client validation, offline caching, sync UI
- Three role-based views: Citizen, Admin, Field Worker PWA
- Communication over HTTPS/TLS (NFR-03)

### Application Layer
- HTTP handling, authentication, request validation
- Response shaping, error translation
- Rate limiting and boundary security

### Domain Layer
- Business rules, workflow state machine, domain events
- RBAC policy engine, sync/conflict resolution
- Observer and Factory Method pattern implementations 

### Persistence Layer
- Data access via repositories, transactional writes
- Prisma ORM, PostgreSQL, migrations
- Integrity constraints, append-only audit storage

## Notes

- All four logical layers run in a single deployable unit (ADR-ARCH-01)
- The database is the only separate physical tier
- Logical layers are a design concept, not physical deployment tiers