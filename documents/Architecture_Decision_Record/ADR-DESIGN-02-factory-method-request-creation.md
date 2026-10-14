# ADR-DESIGN-02: Factory Method for Service-Request Creation

- **Status:** Accepted
- **Deciders:** Davidzo Malapile, Naledi Moeng, Kamohelo Mabena

---

## Context

CivicConnect supports different categories of service request: pothole, water leak,
power outage, illegal dumping, and several others. Each category has distinct attributes,
validation rules, and department routing.

If all category-specific creation logic lives inside one central method (a large `switch`
or chained `if/else`), the method grows with every new category. Adding a category
requires modifying the central method — risking regression in existing categories.

**Design problem:** How can CivicConnect create different categories of service request
while keeping category-specific validation and routing separate and allowing new
categories to be added without modifying existing creation code?

This decision is informed by:
- **A2 design-patterns research** — compared conditional/switch, Factory Method,
  Abstract Factory, and Builder.
- **ADR-ARCH-01** — the pattern must be compatible with the layered monolith.

---

## Decision

CivicConnect will use the **Factory Method pattern** for service-request creation.

A common creation interface (`createRequest(category, input)`) is provided to the rest
of the system. Category-specific creation logic is delegated to concrete factory
implementations for each category. The system depends on the interface, not on
individual factories.

---

## Rationale

The Factory Method pattern separates creation logic per category. Adding a new category
is a local change — add a new factory, register it — without modifying the central
request-creation path. This supports the Open/Closed Principle and keeps the codebase
adaptable to evolving municipal reporting needs.

The decision is informed by A2 design-patterns research, which identified Factory Method
as appropriate for CivicConnect's category-variation problem.

---

## Alternatives Considered

| Approach | Description | Advantages | Limitations |
|----------|-------------|-----------|-------------|
| **Conditional / switch** | Central method branches on category. | Simple for few categories. | Central method grows; regression risk. |
| **Factory Method (selected)** | Each category has its own factory implementation. | Extensible; local change per category. | Additional classes; one extra level of indirection. |
| **Abstract Factory** | Interface for creating families of related objects. | Useful when multiple related objects must vary together. | Unnecessary complexity — CivicConnect only varies the request itself. |
| **Builder** | Step-by-step construction of complex objects. | Useful for complex multi-part construction. | Overkill — request creation is a single step. |

### Decision Matrix

Scoring relative to the baseline (central `switch` statement):
- `0` = equivalent
- `+1` / `+2` = better
- `-1` / `-2` = worse

| Criterion | Weight | Baseline: Switch | Factory Method (Selected) | Abstract Factory | Builder |
|-----------|--------|------------------|---------------------------|------------------|---------|
| Extensibility (new category) | High | 0 (modify switch) | **+2** (add factory) | +2 | +1 |
| Coupling to creation logic | High | 0 | **+2** | +2 | +1 |
| Complexity | Medium | +1 | **0** | −2 | −2 |
| Testability | Medium | 0 | **+1** | +1 | +1 |
| Alignment with Open/Closed Principle | High | −2 | **+2** | +2 | +1 |
| Proportionality to CivicConnect scope | High | +1 | **+1** | −2 | −2 |
| Category-specific validation colocation | High | −1 | **+2** | +1 | +1 |
| **Total** | | **0** | **+10** | **+5** | **0** |

**Interpretation:** Factory Method scores highest. Abstract Factory is architecturally
stronger but solves a problem CivicConnect doesn't have (families of related objects
varying together). Builder is overkill for single-step creation. The switch approach is
simple but blocks extension.

---

## 5. Theoretical Foundation

### The Factory Method Pattern

Defined in *Design Patterns* (Gamma et al., 1994):

> "Define an interface for creating an object, but let subclasses decide which class
> to instantiate."

The pattern separates the *interface* of object creation from the *implementation*.
Clients depend on the interface; the choice of concrete creation logic is deferred.

### The Open/Closed Principle

Bertrand Meyer, *Object-Oriented Software Construction* (1988):

> "Software entities should be open for extension but closed for modification."

The Factory Method pattern supports this principle: adding a category extends the system
without modifying existing creation code.

### Why Not Abstract Factory?

Abstract Factory is used when a family of related objects must vary together (e.g., a UI
toolkit where buttons, menus, and scrollbars must all match a theme). CivicConnect only
varies the *request itself* — one object, not a family. Abstract Factory would add
indirection without benefit.

---

## Consequences of Factory Method

### Positive

- Adding a new category requires only a new factory.
- Category-specific validation is colocated with the category.
- Testable: each factory can be unit tested in isolation.
- Aligns with the Open/Closed Principle.

### Negative

- Introduces additional classes (one per category).
- Adds one level of indirection — a factory is selected by category.
- Requires a factory registry (map of category → factory).

---

## Implementation Implications

| Component | File |
|-----------|------|
| Factory registry + `createRequest(category, input)` | `backend/server/domain/requestFactory.ts` |
| One factory per category | (may be functions in a registry rather than classes) |

The rest of the system (routes, services) depends only on the `createRequest` interface —
never on individual factories.

---

## Authoritative References

| # | Source | Relevance |
|---|--------|-----------|
| 1 | Gamma, Helm, Johnson, Vlissides, "Design Patterns" (1994), Factory Method | Foundational pattern |
| 2 | Gamma, Helm, Johnson, Vlissides, "Design Patterns" (1994), Abstract Factory | Justifies rejection |
| 3 | Bertrand Meyer, "Object-Oriented Software Construction" (1988) | Open/Closed Principle |
| 4 | Robert C. Martin, "Clean Architecture" (2017), SOLID principles | OCP in practice |
| 5 | Fowler, "Patterns of Enterprise Application Architecture" | Creational patterns context |

---

## Traceability to Requirements

| Requirement | Nature of Link |
|-------------|----------------|
| FR-01 | Report submission depends on `createRequest(category, input)` |
| FR-03 | Fault map categorization depends on category |
| FR-04 | Department routing depends on category → department mapping |

---

## Traceability Assessment Areas

| M3 Area | How This ADR Contributes |
|---------|--------------------------|
| A. Controlled Implementation & M2 Conformance | Confirms the design decision made in M2 is applied |
| B. Collaborative Construction | Decision recorded as ADR |
| D. Black-box, Integration & System Validation | Defines per-category tests |
| E. Quality, Defect & Traceability Evidence | Links ADR to FR-01, FR-03, FR-04 |
| F. Performance & Release Readiness | No performance impact (in-process factory selection) |

---

## Verification Evidence Plan

| Evidence ID | Description | Type |
|-------------|-------------|------|
| TC-BE-20 | Each of the 12 categories is created with the correct shape | Unit |
| TC-BE-21 | Adding a new category does not require modifying existing factories | Unit (Open/Closed test) |
| TC-BE-22 | Invalid category returns a validation error | Negative |

---

## 12. Residual Risk

| Risk ID | Description | Probability | Impact | Mitigation |
|---------|-------------|-------------|--------|------------|
| RR-M3-10 | Factory registry grows with each new category; no dead-code removal | Low | Low | Periodic review of unused factories |
| RR-M3-11 | Adding a category without adding validation could produce malformed requests | Low | Medium | Zod validation at API boundary; factory-level validation tested |

---

## Technical Debt

| Debt ID | Description | Target |
|---------|-------------|--------|
| TD-M3-09 | Category-to-factory registry is a plain object; no compile-time completeness check | Add exhaustive type check post-M3 |

---

## 14. Related Architecture Views

- [Component view](../Architecture/component-view.md) — request factories
- [Logical architecture](../Architecture/logical-architecture.md) — factory boundary

