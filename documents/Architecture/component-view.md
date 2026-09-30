# Component view - Design Patterns Placement 

>**M2 Addition - PEDv2.0**

## Diagram 

```mermaid 
flowchart TD
     subgraph Domain [Domain Layer]
         WF[Workflow Service<br/>Observable Subject]
         NH[Notification Service<br/>Observer]
         IAN[In-App Notifier]
         EM[Future: Email Notifier]
         SMS[Future: SMS Notifier]
         RF[Request Factory<br/>Factory Method]
         PF[Pothole Factory]
         WTF[Water Factory]
         PWF[Power Factory]

         WF -->|notify|NH
         NH --> IAN
         NH --> EM
         NH --> SMS

         RF --> PF
         RF --> WTF
         RF --> PWF

       end
``` 
| Pattern | Where | Purpose | 
|---|---|---|
| Observer | Workflow -> Notification | Add channels without editing workflow logic | 
|Factory Method | Request creation | One factory per category; no branching intake |

## Evidence 

- ADR-ARCH-01 (architecture context)<br/>
- A2 Task 1 (design problems and pattern selection)<br/>
- Memeber 2's ADRs (ADR-PERSIST-01, ADR-INT-01)