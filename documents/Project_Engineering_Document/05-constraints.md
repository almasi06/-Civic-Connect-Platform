# Constraints

## Scope Constraints

1. **Web Only Initial Release:** No native mobile apps; browser APIs for GPS (Geolocation API) and camera (Media Capture API); offline storage via IndexedDB.
2. **No Payment Gateway Integration:** Avoids PCI DSS compliance, transaction auditing, financial reconciliation.
3. **No IoT Sensor Integration:** Relies on citizen reports and manual field worker updates only.
4. **Municipal Workflow Integration:** Complements existing workflows; does not replace them.

**Engineering Implication:** Mobile devices will utilize browser APIs for features like GPS and camera, with the Geolocation API and Media Capture API ensuring compliance with functional requirements. Offline job card storage will employ Indexed DB for a unified codebase, minimizing development overhead. This method sidesteps PCI DSS compliance issues, focusing instead on civic issue tracking via citizen reports and manual updates, and eliminates the need for complex data pipelines. The system will integrate with current municipal workflows, featuring an administration dashboard for ticket management and audit logging.

---

## Schedule Constraints

1. **Fixed Timeline:** Delivered by end of October, approximately 12–14 weeks after M1.
2. **Fixed Milestone Deadlines:** Cannot be extended; each milestone must deliver a demonstrable baseline.

**Engineering Implication:** Only must-have requirements are guaranteed for initial release. Should-have requirements may be deferred if time runs short. Work structured into weekly sprints with clear deliverables and regular progress tracking.

---

## Cost and Resource Constraints

1. **Team Size of Three Students:** Varying skill levels; work must be distributed evenly; peer review necessary.
2. **No Budget for Paid Services:** Free-tier hosting, tools, and services only.

**Engineering Implication:** Technology stack selection must be within collective skill set. Work must be distributed evenly, and peer review must be necessary to ensure quality and knowledge transfer.

---

## Quality Constraints

1. **Measurable Acceptance Criteria:** All acceptance criteria must be measurable, demonstrable, and objectively verifiable. Each requirement must have a clear pass or fail condition.
2. **Offline Sync Performance:** NFR-01 requires offline-to-online sync less than 10 seconds for job cards containing up to twenty pending status updates. Backend must support efficient sync protocols; frontend must handle conflict resolution; performance testing under realistic network conditions.
3. **Response Time Performance:** NFR-02 requires median response times under three seconds during peak usage hours with one hundred concurrent users. Frontend optimization and API design must prioritize speed; database indexing and query optimization required; load testing must validate performance.

**Engineering Implication:** Each requirement must have a clear pass or fail condition, refined to measurable statements, ensuring objective quality demonstration. The backend should support efficient synchronization protocols, while the frontend must handle conflict resolution. Performance testing should occur under realistic network conditions. Optimization in both frontend and backend is crucial, prioritizing speed, with database indexing and query optimization necessary. Load testing must validate performance during peak conditions.

---

## Security Constraints

1. **Protection of Personally Identifiable Information:** System handles citizen names, contact details, and location data. Secure authentication, HTTPS with TLS, data encryption at rest, and role-based access control required. POPIA Act compliance required.
2. **Role-Based Access Control:** Municipal administrators require RBAC for audit and accountability. Citizens access only their own reports; field workers access assigned job cards; administrators access dashboards and full ticket management.

**Engineering Implication:** Secure authentication, HTTPS with TLS, data encryption at rest, and role-based access control are essential. Compliance with POPIA Act principles is necessary. Granular permission management is required, allowing citizens access to their own reports, field workers to assigned job cards, and administrators to dashboards and full ticket management.

---

## Technology Constraints

1. **Low-Bandwidth and Intermittent Connectivity:** Offline-first design required (FR-02); data cached locally and synced efficiently; UX must indicate offline status and sync progress.
2. **Browser Compatibility:** Responsive to Chrome, Firefox, Safari, Edge; screens as small as 360px; CSS media queries.
3. **Technology Stack Deferment:** Final stack selection deferred to M2 (ED-003). Requirements must not preclude reasonable technology options.

**Engineering Implication:** Offline-first design is mandated, requiring local data caching and efficient synchronization upon connectivity restoration. The user experience should indicate offline status and sync progress. The interface must support modern browsers and responsive design via CSS media queries. While specific technologies cannot be committed to in Milestone 1, requirements must allow for reasonable technology options, with selections informed by infrastructure needs and team skills.
