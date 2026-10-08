# Initial Design Decisions

## Design Decision 1: Notification Fan-Out
**Design Pattern:** Observer

### 1.1 Design Problem
When a service request changes status, CivicConnect may need to notify interested
parties. If the status-transition logic directly calls each notification channel,
the status-transition component becomes tightly coupled to notification-specific
behaviour.

For example, adding another notification channel would require changes to the
existing status-transition logic. This can increase coupling and make the component
harder to maintain and test.

The design problem is therefore how CivicConnect can allow additional notification
behaviour to be added without repeatedly modifying the core status-transition
component.

### 1.2 Alternatives Considered

Three approaches were considered:

| Approach | Description | Advantages | Limitations |
|---|---|---|---|
| Direct method calls | The status-transition logic directly calls each notification function or service. | Simple to implement and understand for a small system. | Creates tight coupling between status processing and notification behaviour. |
| Observer pattern | A status-transition subject publishes a status-change event to registered observers. | Reduces coupling and allows additional observers to be added without changing the subject. | Introduces additional structure and observer management. |
| Mediator pattern | A central mediator coordinates communication between the status-transition component and notification components. | Centralises coordination when many components need to communicate. | Adds more indirection and complexity than currently required. |

### 1.3 Research Basis

Assignment 2 research compared direct notification calls, the Observer pattern and
the Mediator pattern for the CivicConnect notification fan-out problem.

The research identified the Observer pattern as a proportionate approach for the
current CivicConnect context because it separates the status-transition component
from individual notification behaviours. The Mediator pattern remains an
alternative if the number of interacting components or coordination requirements
increases in future.

The Assignment 2 recommendation is used as research evidence for this M2 decision,
but the final project decision is made against the current CivicConnect design
scope and implementation needs.

### 1.4 Final Project Decision

CivicConnect will use an Observer-based approach for notification fan-out.

The status-transition component will act as the subject and expose a mechanism
for notification observers to register for status-change events. Notification
behaviour can then be implemented by separate observers rather than being embedded
directly inside the status-transition logic.

This allows notification behaviour to be extended without modifying the core
status-transition component for every new notification observer.

### 1.5 Application Translation

The initial application design will represent the notification subject and
observers as separate components.

The subject will provide operations conceptually equivalent to:

- `registerObserver()`
- `removeObserver()`
- `notifyObservers()`

After a valid status transition has successfully committed, the notification mechanism can then notify the registered observers of the status-change event.

Potential observers may include notification or audit-related components. The
specific notification channels and interfaces will be refined during
implementation.

The notification mechanism must not publish an event for a status transition
that has failed and been rolled back.

### 1.6 Decision Evidence

The decision will be evidenced through:

- An ADR documenting the Observer decision and alternatives considered.
- A design/component diagram showing the subject and notification observers.
- An application implementation demonstrating observer registration and notification.
- An automated test demonstrating that an additional observer can receive a
  status-change event without modifying the subject's core status-transition logic.
- Traceability to the relevant CivicConnect functional requirements, particularly
  the status tracking and notification requirements.

## Design Decision 2: Service-Request Category Creation
**Design Pattern:** Factory Method

### 2.1 Design Problem

CivicConnect supports different types of service requests, such as facility faults,
damaged equipment, security concerns, IT support and lost property.

If all request creation, category-specific validation and department-routing logic
is placed inside one class or method, the component can become increasingly large
and difficult to maintain. Adding a new service-request category would also require
changes to existing creation logic.

The design problem is therefore how CivicConnect can create different types of
service requests while keeping category-specific creation and validation logic
separate and allowing new categories to be added with limited modification to
existing code.

### 2.2 Alternatives Considered

Three approaches were considered:

| Approach | Description | Advantages | Limitations |
|---|---|---|---|
| Conditional/switch-based creation | A central method uses conditions or a switch statement to determine which request category to create. | Simple and easy to understand for a small number of categories. | The central creation logic grows as categories are added and requires modification for new categories. |
| Factory Method | Request creation is delegated to separate factory implementations while the rest of the system depends on a common creation interface. | Separates creation logic and allows new categories to be added through additional factory implementations. | Introduces additional classes and structure. |
| Abstract Factory | Provides an interface for creating families of related objects. | Useful when multiple related objects must vary together. | Adds unnecessary complexity if CivicConnect only needs variation in request creation. |

### 2.3 Research Basis

Assignment 2 research considered a conditional/switch-based approach, Factory Method
and Abstract Factory for the CivicConnect service-request creation problem.

The research identified Factory Method as a proportionate approach because it
separates category-specific creation logic while avoiding the additional complexity
of Abstract Factory when families of related objects are not required.

The Assignment 2 research is used as evidence informing this M2 decision. The final
decision is considered against the current CivicConnect requirements and initial
implementation scope.

### 2.4 Final Project Decision

CivicConnect will use the Factory Method pattern for service-request category
creation.

The application will use a common request-creation interface while category-specific
factory implementations will contain the creation and relevant validation logic
for their respective service-request categories.

This means that adding a new service-request category can be handled by introducing
the required factory implementation rather than modifying a large central creation
method.

### 2.5 Application Translation

The initial application design will separate service-request creation from the
category-specific logic used to create each request.

A common factory interface will define the request-creation operation. Concrete
factory implementations will provide the category-specific creation behaviour.

Conceptually, the design may contain:

- `RequestFactory` - common creation interface.
- `FacilityFaultFactory` - creates facility-fault requests.
- `DamagedEquipmentFactory` - creates damaged-equipment requests.
- `SecurityConcernFactory` - creates security-related requests.
- `ITSupportFactory` - creates IT-support requests.
- `LostPropertyFactory` - creates lost-property requests.

The exact classes and interfaces may be refined during implementation.

### 2.6 Decision Evidence

The decision will be evidenced through:

- An ADR documenting the Factory Method decision and alternatives considered.
- A class or component diagram showing the factory structure.
- An application implementation demonstrating request creation through the factory
  interface.
- Tests demonstrating that different request categories can be created correctly.
- Traceability to the relevant CivicConnect functional requirements, particularly
  service-request submission and categorisation requirements.
