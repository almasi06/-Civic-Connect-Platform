# Runtime View - Status Transition to Notification


## Diagram

```mermaid
sequenceDiagram
    participant UI as Admin UI
    participant API as API Layer
    participant WF as Workflow Service
    participant DB as PostgreSQL
    participant Bus as Domain Event Bus
    participant NH as Notification Handler

    UI->>API: PATCH /requests/:id/status
    API->>API: Auth + RBAC check
    API->>WF: transition(requestId, newStatus)
    WF->>WF: Validate state transition
    WF->>DB: BEGIN TRANSACTION
    WF->>DB: UPDATE request (status, version++)
    WF->>DB: INSERT audit_history
    WF->>DB: UPDATE assignment (if applicable)
    WF->>DB: COMMIT
    WF->>Bus: RAISE StatusChanged (post-commit)
    Bus->>NH: notify(event)
    NH->>DB: INSERT in_app_notification
    NH-->>API: acknowledgement
    API-->>UI: 200 OK
```

## Key Properties

- **Atomicity:** All writes in single transaction (A2 Task 2) - status, audit, assignment
- **Post-commit event:** Notification never fires for rolled-back changes
- **In-process:** No network boundary (A2 Task 3)
- **Optimistic concurrency:** Version column on request row detects lost updates
- **Append-only audit:** Audit history records cannot be updated or deleted through normal application code


## ASRs Satisfied

- ASR-02 (Real-Time Status Transparency)
- ASR-03 (RBAC & Audit Accountability)
- ASR-08 (Audit Retention)


## Link

- PED: [07-architecture.md](../Project_Engineering_Document/07-architecture.md)
