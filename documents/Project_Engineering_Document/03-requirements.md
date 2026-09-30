# Requirements 

## Functional Requirements

### FR-01: Incident Report Submission

| Field | Value |
|---|---|
| **Requirement** | The system shall allow citizens to submit an incident report with a photo and GPS coordinates. |
| **Priority** | Must |
| **Source** | Citizens/Residents |
| **Stakeholder Need** | Fast issue reporting, easy to use interface |
| **Acceptance Criteria ID** | ACFR-01 |
| **Acceptance Criteria** | Given that a citizen opens the report form, when they attach a photo and submit, then the report includes GPS coordinates. |
| **Status** | Proposed (design researched; ADR to be recorded in M2) |

**Design Link:** ADR-CREATE-01 (Factory Method for request creation): each category owns its required fields, validation and department routing; FR-01/03/04 depend on one creation interface. Browser Geolocation and Media Capture APIs (Scope Constraint 1; ED-002). Risks: RR006 (minimum mandatory fields), RR004 (POPIA: location data).

**Test Evidence (planned):** Timed submission test: form open to confirmation; GPS captured; photo attached (PED testability). Automated test: a new category can be added without modifying existing factories.

**Change History:**
- v1.0 08/09/26: baselined.
- v2.0 draft 29/09/26: Design Link, planned tests, risk links added.

---

### FR-02: Offline Job Card Caching & Sync

| Field | Value |
|---|---|
| **Requirement** | The mobile interface shall support offline caching of assigned job cards and sync updates once network connectivity is restored. |
| **Priority** | Must |
| **Source** | Municipal Field Workers/Technicians |
| **Stakeholder Need** | Clear work orders, offline capability, status update tools |
| **Acceptance Criteria ID** | ACFR-02 |
| **Acceptance Criteria** | Given a field worker device is offline, when job cards are assigned, then they must be cached locally and remain fully accessible and editable without connectivity. |
| **Status** | Proposed |

**Design Link:** FE001 technical spike (service worker sync patterns, IndexedDB); chosen conflict strategy to be recorded in an M2 ADR (ID TBD). ADR-PERSIST-01 version-column concurrency for sync conflicts†. Risks: RR001 (Critical), RR132 (keep unsaved data across forced re-authentication).

**Test Evidence (planned):** Airplane-mode test: assign card offline, access/edit, reconnect, verify sync (PED testability). Early M2 spike on sync patterns (RR001).

**Change History:**
- v1.0 08/09/26: baselined.
- v2.0 draft 29/09/26: Design Link, planned tests, risk links added.

---

### FR-03: Map of Unresolved Faults

| Field | Value |
|---|---|
| **Requirement** | The platform should generate a map of unresolved municipal faults categorized per department. |
| **Priority** | Should |
| **Source** | Municipal Administrators/Management |
| **Stakeholder Need** | Analytics dashboards, resource allocation tools |
| **Acceptance Criteria ID** | ACFR-03 |
| **Acceptance Criteria** | When the reporting cycle changes, then a map should generate with department and fault status. |
| **Status** | Proposed (design researched; ADR to be recorded in M2) |

**Design Link:** ADR-CREATE-01: department routing sits in the per-category factories. ADR-PERSIST-01: request status is never cached; only read-heavy aggregate views may be cached, with a short TTL and invalidation on write. FE006: indexing/aggregation strategy is an M2 data-design criterion.

**Test Evidence (planned):** Load one week of fault data, advance the system clock to trigger the reporting cycle, verify map by department and status (PED testability).

**Change History:**
- v1.0 08/09/26: baselined.
- v2.0 draft 29/09/26: Design Link, planned tests, risk links added.

---

### FR-04: Role-Based Administration Dashboard

| Field | Value |
|---|---|
| **Requirement** | The system shall provide a role-based administration dashboard for routing, updating, and closing support tickets. |
| **Priority** | Must |
| **Source** | Municipal Administrators/Management |
| **Stakeholder Need** | Resource allocation tools, audit trails |
| **Acceptance Criteria ID** | ACFR-04 |
| **Acceptance Criteria** | Given an administrator logs in, when they access the dashboard, then they must be able to view, assign, update, and close tickets based on their role permissions. |
| **Status** | Proposed (design researched; ADR to be recorded in M2) |

**Design Link:** ADR-CREATE-01: routing per category. ADR-PERSIST-01†: update/close is a status transition; workflow state machine and role permissions enforced in the application layer, DB constraints as backstop. RBAC per PED Security Constraint 2. Risks: RR083 (central permission module), RR130 (lowest-privilege default role), RR122 (single status enumeration).

**Test Evidence (planned):** Log in with each role; verify each role reaches only permitted actions and data (PED testability). Server-side permission tests (RR083).

**Change History:**
- v1.0 08/09/26: baselined.
- v2.0 draft 29/09/26: Design Link, planned tests, risk links added.

---

### FR-05: Status Change Notifications

| Field | Value |
|---|---|
| **Requirement** | The system shall send notifications when the report status changes. |
| **Priority** | Should |
| **Source** | Citizens/Residents |
| **Stakeholder Need** | Transparent progress updates |
| **Acceptance Criteria ID** | ACFR-05 |
| **Acceptance Criteria** | Given a citizen has submitted a report, when the report status changes to Assigned, In Progress, or Resolved, then an alert is sent on the website. |
| **Status** | Proposed (design researched; ADR to be recorded in M2) |

**Design Link:** ADR-NOTIFY-01 (Observer pattern): one notify(event) hook; new channels (SMS, email, audit log) register as observers. Notification integration ADR (ID TBD): in-process domain event, raised only after the transaction commits; event contract documented so a broker can be introduced later. ADR-PERSIST-01: status update, history insert and assignment change in one transaction. Risks: RR081 (non-blocking/queued dispatch), RR093 (environment configuration).

**Test Evidence (planned):** Submit report, change status, time the website alert (PED testability). Automated test: a new observer receives events without modifying the subject class (A2 Task 5). Automated test: failed write rolls back the whole transition and no event is raised (A2 Task 5).

**Change History:**
- v1.0 08/09/26: baselined.
- v2.0 draft 29/09/26: Design Link, planned tests, risk links added.

---

### FR-06: Unique Tracking Number

| Field | Value |
|---|---|
| **Requirement** | The system shall allow citizens to track the status of their reported issues via a unique tracking number. |
| **Priority** | Could |
| **Source** | Citizens/Residents |
| **Stakeholder Need** | Transparent progress updates |
| **Acceptance Criteria ID** | ACFR-06 |
| **Acceptance Criteria** | Given a citizen has a tracking number, when they enter it into the tracking portal, they must then see the status and complete history of their report. |
| **Status** | Proposed (design researched; ADR to be recorded in M2) |

**Design Link:** ADR-NOTIFY-01 (design-link entry for FR-05/FR-06 per A2). ADR-PERSIST-01†: append-only history/audit table supplies the status history shown. Risks: RR110 (non-sequential random tracking numbers), RR114 (server-side ownership/lookup checks).

**Test Evidence (planned):** Submit report, obtain number, enter in portal, verify status and timestamps (PED testability). Uniqueness and unpredictability test (RR064, RR110).

**Change History:**
- v1.0 08/09/26: baselined.
- v2.0 draft 29/09/26: Design Link, planned tests, risk links added.

---

### FR-07: Field Worker Status Updates

| Field | Value |
|---|---|
| **Requirement** | The system shall allow field workers to update job status with photos and notes from the field. |
| **Priority** | Could |
| **Source** | Municipal Field Workers/Technicians |
| **Stakeholder Need** | Status update tools |
| **Acceptance Criteria ID** | ACFR-07 |
| **Acceptance Criteria** | Given a field worker is onsite at a job location, when they update a job status, then they must be able to attach at least one photo and enter textual notes as part of the update. |
| **Status** | Proposed |

**Design Link:** ADR-PERSIST-01†: a field-worker status update is persisted in one transaction with its history record (who, when, previous status). Browser Media Capture API (Scope Constraint 1). Risks: RR113 (sanitise and encode notes before rendering), RR129 (consistent actor attribution).

**Test Evidence (planned):** On-site update with photo and notes; verify both appear in the system (PED testability). XSS test on notes fields (RR113).

**Change History:**
- v1.0 08/09/26: baselined.
- v2.0 draft 29/09/26: Design Link, planned tests, risk links added.

---

## Non-Functional Requirements (M1 Baseline)

### NFR-01: Offline Sync Performance

| Field | Value |
|---|---|
| **Requirement** | The mobile interface must complete a full offline to online data sync within less than 10 seconds of network reconnection, for job cards containing up to twenty pending status updates. |
| **Priority** | Must |
| **Source** | Municipal Field Workers/Technicians |
| **Stakeholder Need** | Offline capability |
| **Acceptance Criteria ID** | ACNFR-01 |
| **Acceptance Criteria** | Given a field worker device has been offline with up to twenty cached job card updates, when connectivity is restored, then all updates must be confirmed as synced to the server within less than 10 seconds, with a visible confirmation indicator on the device. |
| **Status** | Proposed |

**Design Link:** FE001 spike and conflict strategy (M2 ADR, ID TBD). PED Quality Constraint 2: efficient sync protocol; frontend conflict resolution. Risk: RR001 (Critical).

**Test Evidence (planned):** Perform 20 offline updates, reconnect, time sync to confirmation indicator, under realistic network conditions (PED testability; Quality Constraint 2).

**Change History:**
- v1.0 08/09/26: baselined.
- v2.0 draft 29/09/26: Design Link, planned tests, risk links added.

---

### NFR-02: Web Response Time

| Field | Value |
|---|---|
| **Requirement** | The web interface shall have an average response time of under three seconds during peak usage hours between 9 AM and 5 PM. |
| **Priority** | Must |
| **Source** | Citizens/Residents |
| **Stakeholder Need** | Fast issue reporting |
| **Acceptance Criteria ID** | ACNFR-02 |
| **Acceptance Criteria** | Given one hundred concurrent users are accessing the system during peak hours, when any page is requested, then the median response time across all requests must be under three seconds. |
| **Status** | Proposed (design researched; ADR to be recorded in M2) |

**Design Link:** ADR-PERSIST-01 caching position: no status caching in v1; cache only read-heavy aggregates, on measured evidence. Indexing and query optimisation (Quality Constraint 3; FE006). Risks: RR005 (free-tier hosting limits), RR074 to RR076 (scalability).

**Test Evidence (planned):** Load test with 100 concurrent users at peak; response time under 3 s (PED testability). Plan load testing early (RR005).

**Change History:**
- v1.0 08/09/26: baselined.
- v2.0 draft 29/09/26: Design Link, planned tests, risk links added.

---

### NFR-03: HTTPS/TLS Transmission

| Field | Value |
|---|---|
| **Requirement** | The system shall ensure all citizen-submitted data is transmitted over HTTPS with TLS. |
| **Priority** | Must |
| **Source** | Municipal Administrators/Management |
| **Stakeholder Need** | Security, compliance |
| **Acceptance Criteria ID** | ACNFR-03 |
| **Acceptance Criteria** | Given a citizen submits a report, when the data is transmitted, then it must be encrypted using HTTPS with TLS as verified by browser security inspection tools. |
| **Status** | Proposed |

**Design Link:** PED Security Constraint 1 (HTTPS/TLS, encryption at rest, POPIA). Stack-independent; implementation follows the M2 stack/hosting decision (ED-003). Pre-deployment HTTPS/TLS checklist (RR-033, referenced by RR090). Risk: RR004.

**Test Evidence (planned):** Inspect all API calls and form submissions in browser developer tools (PED testability).

**Change History:**
- v1.0 08/09/26: baselined.
- v2.0 draft 29/09/26: Design Link, planned tests, risk links added.

---

### NFR-04: Responsive Design (360px)

| Field | Value |
|---|---|
| **Requirement** | The mobile web interface shall be responsive and fully functional on screens as small as 360 pixels width. |
| **Priority** | Could |
| **Source** | Citizens/Residents |
| **Stakeholder Need** | Easy to use interface |
| **Acceptance Criteria ID** | ACNFR-04 |
| **Acceptance Criteria** | Given a user accesses the system on a device with a 360 pixels screen width, when they navigate the interface, then all features must be accessible and usable without horizontal scrolling. |
| **Status** | Proposed |

**Design Link:** ED-002 (single web-responsive codebase); Technology Constraint 2 (CSS media queries). Risk: RR120 (include mobile views in accessibility testing).

**Test Evidence (planned):** Simulate a 360 px viewport in developer tools (PED testability).

**Change History:**
- v1.0 08/09/26: baselined.
- v2.0 draft 29/09/26: Design Link, planned tests, risk links added.

---

### NFR-05: Uptime 99.5%

| Field | Value |
|---|---|
| **Requirement** | The system shall achieve 99.5% uptime during operational hours. |
| **Priority** | Should |
| **Source** | Municipal Administrators/Management |
| **Stakeholder Need** | Reliability |
| **Acceptance Criteria ID** | ACNFR-05 |
| **Acceptance Criteria** | Given the system is in production, when availability is measured over a thirty-day period, then uptime must be at least 99.5% during operational hours. |
| **Status** | Proposed |

**Design Link:** FE003 (hosting path, free-tier limits), FE004 (monitoring), FE005 (backup and recovery): M2 stack-decision criteria. Risk: RR094 (free-tier quotas).

**Test Evidence (planned):** Monitor availability over 30 days post-production (PED testability); not possible before deployment.

**Change History:**
- v1.0 08/09/26: baselined.
- v2.0 draft 29/09/26: Design Link, planned tests, risk links added.

---

## Expanded Functional Requirements (M2)

### FR-08: Request History View

| Field | Value |
|---|---|
| **Requirement** | The system shall allow citizens to view a history of their submitted service requests (status, date, category).† |
| **Priority** | TBD |
| **Source** | Citizens/Residents† |
| **Stakeholder Need** | TBD |
| **Acceptance Criteria ID** | ACFR-08 |
| **Acceptance Criteria** | TBD |
| **Status** | Proposed |

**Design Link:** TBD (design not yet produced). Design constraints from risk mitigations: RR074 (pagination or lazy loading), RR114 (server-side ownership checks), RR124 (duplicate-account detection).

**Test Evidence (planned):** Multiple reports with mixed statuses on seeded accounts (RR058). Identifier-manipulation test (RR114).

**Change History:**
- v2.0 draft 29/09/26: added (wording from Risk Register Addendum 2).

---

### FR-09: Staff Search/Filter/Sort

| Field | Value |
|---|---|
| **Requirement** | Staff shall be able to search, filter and sort service requests.† |
| **Priority** | TBD |
| **Source** | TBD |
| **Stakeholder Need** | TBD |
| **Acceptance Criteria ID** | ACFR-09 |
| **Acceptance Criteria** | TBD |
| **Status** | Proposed |

**Design Link:** TBD (M2 schema design). Constraints: indexes around filter/sort fields (RR075), server-side role-scoped filtering (RR108), conventional filter UI (RR121).

**Test Evidence (planned):** Edge-case matrix: empty results, combined and invalid filters (RR059). Results validated against a manually verified data set (RR126).

**Change History:**
- v2.0 draft 29/09/26: added (wording from Risk Register Addendum 2).

---

### FR-10: Job Assignment/Acceptance

| Field | Value |
|---|---|
| **Requirement** | Staff shall be able to be assigned to, and accept, service requests (job assignment/acceptance).† |
| **Priority** | TBD |
| **Source** | Municipal Field Workers/Administrators† |
| **Stakeholder Need** | TBD |
| **Acceptance Criteria ID** | ACFR-10 |
| **Acceptance Criteria** | TBD |
| **Status** | Proposed |

**Design Link:** ADR-PERSIST-01†: assignment change inside the status-transition transaction; optimistic concurrency (version column) so only one acceptance succeeds (A2 lost-update case). Risks: RR083 (central role checks), RR122 (single status enumeration), RR125 (audit events), RR156 (feeds FR-11).

**Test Evidence (planned):** Concurrency test: simultaneous accept, only one succeeds (RR060). Assignment/acceptance events appear in audit log (RR125).

**Change History:**
- v2.0 draft 29/09/26: added (wording from Risk Register Addendum 2).

---

### FR-11: Management Performance Dashboard

| Field | Value |
|---|---|
| **Requirement** | The system shall provide a management performance dashboard (aggregated request metrics and staff activity summaries).† |
| **Priority** | TBD |
| **Source** | Municipal Administrators/Management† |
| **Stakeholder Need** | Analytics dashboards, performance reporting† |
| **Acceptance Criteria ID** | ACFR-11 |
| **Acceptance Criteria** | TBD |
| **Status** | Proposed |

**Design Link:** TBD (design not yet produced). Constraints: separate aggregation from presentation (RR088); pre-aggregated summaries rather than live queries (RR076), consistent with the ADR-PERSIST-01 aggregate-caching position†; single status enumeration (RR122); anonymise citizen detail (RR115); UTC storage (RR127); FE006.

**Test Evidence (planned):** Dashboard figures cross-checked against manually calculated seed data (RR061). Timestamp consistency across dashboard and history (RR127).

**Change History:**
- v2.0 draft 29/09/26: added (wording from Risk Register Addendum 2).

---

### FR-12: Registration & Authentication

| Field | Value |
|---|---|
| **Requirement** | The system shall allow users to register and authenticate (citizen and staff accounts).† |
| **Priority** | TBD |
| **Source** | TBD |
| **Stakeholder Need** | TBD |
| **Acceptance Criteria ID** | ACFR-12 |
| **Acceptance Criteria** | TBD |
| **Status** | Proposed |

**Design Link:** TBD (depends on M2 stack decision, ED-003). Constraints: established auth and hashing libraries (RR112, RR144); rate limiting (RR104); lowest-privilege default role (RR130); identity verification (RR111); duplicate detection (RR124); secure password reset if added (RR133); concurrent-session behaviour (RR134); failed-login logging (RR135); POPIA re-review (RR139).

**Test Evidence (planned):** Authentication suite: valid, invalid, duplicate, boundary, failed-login cases (RR062). Validate in staging that mirrors production (RR098).

**Change History:**
- v2.0 draft 29/09/26: added (wording from Risk Register Addendum 2).

---

### FR-13: Proximity Job Card Search

| Field | Value |
|---|---|
| **Requirement** | The system shall allow field workers to search job cards by location/proximity (search point and radius).† |
| **Priority** | TBD |
| **Source** | Municipal Field Workers/Technicians† |
| **Stakeholder Need** | GPS locations† |
| **Acceptance Criteria ID** | ACFR-13 |
| **Acceptance Criteria** | TBD |
| **Status** | Proposed |

**Design Link:** TBD (M2 stack evaluation). Constraints: lightweight geospatial indexing on free tier (RR077); mask or generalise precise location outside authorised roles (RR109); geospatial query research (RR145); environment configuration (RR093).

**Test Evidence (planned):** Seeded job-card locations at varying distances and radii (RR063). Real-device field test (RR102).

**Change History:**
- v2.0 draft 29/09/26: added (wording from Risk Register Addendum 2).

---

### FR-14: Acknowledgment Receipt

| Field | Value |
|---|---|
| **Requirement** | The system shall issue a unique acknowledgment receipt (including tracking number and submission summary) when a report is submitted.† |
| **Priority** | TBD |
| **Source** | Citizens/Residents† |
| **Stakeholder Need** | TBD |
| **Acceptance Criteria ID** | ACFR-14 |
| **Acceptance Criteria** | TBD |
| **Status** | Proposed |

**Design Link:** TBD (design not yet produced). Constraints: non-sequential random identifiers (RR110); receipt generated from the same validated submission data (RR128).

**Test Evidence (planned):** Large batch of test submissions confirming uniqueness (RR064). Receipt matches submission (RR128).

**Change History:**
- v2.0 draft 29/09/26: added (wording from Risk Register Addendum 2).

---

### FR-15: Estimated Resolution Time

| Field | Value |
|---|---|
| **Requirement** | The system shall display an estimated resolution time to citizens for their requests.† |
| **Priority** | TBD |
| **Source** | Citizens/Residents† |
| **Stakeholder Need** | TBD |
| **Acceptance Criteria ID** | ACFR-15 |
| **Acceptance Criteria** | TBD |
| **Status** | Proposed |

**Design Link:** TBD (design not yet produced). Constraints: category-level estimates cached or recomputed periodically (RR079); early estimates labelled provisional (RR123); plain-language wording (RR119).

**Test Evidence (planned):** Estimation logic against seeded historical data of varying category and workload (RR065). Wording user-tested with non-technical reviewers (RR119).

**Change History:**
- v2.0 draft 29/09/26: added (wording from Risk Register Addendum 2).

---

## Expanded Non-Functional Requirements (M2)

### NFR-06: Audit Log Retention

| Field | Value |
|---|---|
| **Requirement** | Audit-log entries shall be retained for ninety days.† |
| **Priority** | TBD |
| **Source** | TBD |
| **Stakeholder Need** | TBD |
| **Acceptance Criteria ID** | ACNFR-06 |
| **Acceptance Criteria** | TBD |
| **Status** | Proposed (design researched; ADR to be recorded in M2) |

**Design Link:** ADR-PERSIST-01†: append-only history/audit table; corrections recorded as new entries. Constraints: single audit-log schema and reusable audit service (RR137, RR087); restricted access to log store (RR107); explicit retention/archival (RR136, RR078); POPIA re-review (RR139).

**Test Evidence (planned):** Retention policy test (RR136); retention config verified in staging (RR091). Audit test cases include FR-10 events (RR125).

**Change History:**
- v2.0 draft 29/09/26: added (wording from Risk Register Addendum 2).

---

### NFR-07: WCAG 2.1 Level AA

| Field | Value |
|---|---|
| **Requirement** | The system shall meet WCAG 2.1 Level AA accessibility.† |
| **Priority** | TBD |
| **Source** | TBD |
| **Stakeholder Need** | TBD |
| **Acceptance Criteria ID** | ACNFR-07 |
| **Acceptance Criteria** | TBD |
| **Status** | Proposed |

**Design Link:** TBD (design not yet produced). Constraints: accessible components and palette from first mockups (RR086, RR117); UI libraries with built-in accessibility (RR116); accessibility linter in build (RR072); mobile views included (RR120).

**Test Evidence (planned):** Audit-tool compliance checklist (RR138). More than one screen reader/browser combination (RR100); keyboard-only paths per screen (RR118).

**Change History:**
- v2.0 draft 29/09/26: added (wording from Risk Register Addendum 2).

---

### NFR-08: Session Timeout

| Field | Value |
|---|---|
| **Requirement** | User sessions shall time out after thirty minutes of inactivity.† |
| **Priority** | TBD |
| **Source** | TBD |
| **Stakeholder Need** | TBD |
| **Acceptance Criteria ID** | ACNFR-08 |
| **Acceptance Criteria** | TBD |
| **Status** | Proposed |

**Design Link:** TBD (M2 authentication design). Constraints: timeout implemented centrally in the authentication layer (RR131); server-side token invalidation (RR105); preserve unsaved data on forced re-authentication (RR132).

**Test Evidence (planned):** Timeout test per role: citizen, field worker, admin (RR066). Test in production-like staging (RR098).

**Change History:**
- v2.0 draft 29/09/26: added (wording from Risk Register Addendum 2).

---

### NFR-09: User-Friendly Error Handling

| Field | Value |
|---|---|
| **Requirement** | Error handling shall show user-friendly messages without exposing sensitive technical information.† |
| **Priority** | TBD |
| **Source** | TBD |
| **Stakeholder Need** | TBD |
| **Acceptance Criteria ID** | ACNFR-09 |
| **Acceptance Criteria** | TBD |
| **Status** | Proposed |

**Design Link:** TBD (design not yet produced). Constraints: single centralised error-handling layer (RR084); debug output disabled outside local development (RR103).

**Test Evidence (planned):** Test error responses on all endpoints for leaked internals (RR106); verify non-development environments (RR103).

**Change History:**
- v2.0 draft 29/09/26: added (wording from Risk Register Addendum 2).

---

### NFR-10: Cross-Browser Support

| Field | Value |
|---|---|
| **Requirement** | The system shall function across the four named browsers (Chrome, Firefox, Safari, Edge).† |
| **Priority** | TBD |
| **Source** | TBD |
| **Stakeholder Need** | TBD |
| **Acceptance Criteria ID** | ACNFR-10 |
| **Acceptance Criteria** | TBD |
| **Status** | Proposed |

**Design Link:** TBD. Constraint: PED Technology Constraint 2 (modern browsers; responsive CSS).

**Test Evidence (planned):** Pass/fail compatibility log per browser for each milestone (RR140).

**Change History:**
- v2.0 draft 29/09/26: added (wording from Risk Register Addendum 2).

---

### NFR-11: Timezone Consistency

| Field | Value |
|---|---|
| **Requirement** | Timestamps shall be handled consistently across timezones.† |
| **Priority** | TBD |
| **Source** | TBD |
| **Stakeholder Need** | TBD |
| **Acceptance Criteria ID** | ACNFR-11 |
| **Acceptance Criteria** | TBD |
| **Status** | Proposed |

**Design Link:** TBD (design not yet produced). Constraints: store timestamps in standard reference time, convert for display (RR127); shared date/time utility (RR085); centralised timezone configuration (RR069, RR092).

**Test Evidence (planned):** Test with multiple simulated timezones (RR099); verify server timezone at deployment (RR092).

**Change History:**
- v2.0 draft 29/09/26: added (wording from Risk Register Addendum 2).

