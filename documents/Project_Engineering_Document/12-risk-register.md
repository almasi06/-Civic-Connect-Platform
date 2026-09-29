# Risk Register

### Testing

| Risk ID | Description | Prob. | Impact | Priority | Mitigation Plan | Owner | Status |
|---|---|---|---|---|---|---|---|
| RR058 | Insufficient test coverage for request-history view (FR-08) could allow incorrect status, date, or category data to be displayed to citizens undetected. | Medium | Medium | Medium | Include FR-08 acceptance-criteria scenarios (multiple reports, mixed statuses) in M2 test plan; verify against seeded test accounts. | Naledi | Open |
| RR059 | Search, filter, and sort functionality for staff (FR-09) may not be tested against edge cases such as empty result sets, combined filters, or invalid filter combinations. | Medium | Medium | Medium | Define specific edge-case test matrix for FR-09 covering empty results, combined filters, invalid inputs before M3 sign-off. | Naledi | Open |
| RR060 | Job assignment/acceptance logic (FR-10) may not be tested for race conditions where two staff members attempt to accept same request simultaneously. | Medium | High | High | Write concurrency test simulating simultaneous accept actions; verify only one assignment succeeds. | Kamo | Open |
| RR061 | Management performance dashboard (FR-11) may not be tested for accuracy of aggregated metrics against underlying raw data. | Medium | Medium | Medium | Cross-check dashboard aggregate figures against manually calculated values from seeded test data before baseline sign-off. | Davidzo | Open |
| RR062 | Registration and authentication flows (FR-12) may not be sufficiently tested for invalid input handling, duplicate accounts, or failed login attempts. | Medium | High | High | Build dedicated authentication test suite covering valid, invalid, duplicate, and boundary registration/login scenarios. | Davidzo | Open |
| RR063 | Location/proximity-based job card search (FR-13) may not be tested across sufficient range of coordinates and radii to confirm correct filtering. | Medium | Medium | Medium | Test FR-13 using spread of seeded job-card locations at varying distances from sample search points. | Naledi | Open |
| RR064 | Unique acknowledgment receipt generation (FR-14) may not be tested for uniqueness and collision risk under high submission volume. | Low | Medium | Low | Generate large batch of test submissions to confirm tracking-number uniqueness before relying on it in production. | Kamo | Open |
| RR065 | Estimated resolution time display (FR-15) may not be validated against actual historical resolution data, risking misleading estimates shown to citizens. | Medium | Medium | Medium | Test estimation logic against seeded historical data sets of varying category/workload combinations; compare to expected ranges. | Naledi | Open |
| RR066 | Session-timeout behaviour (NFR-08) may not be tested consistently across all user roles, risking sessions that fail to terminate as required. | Medium | Medium | Medium | Include session-timeout verification for each role (citizen, field worker, admin) in M2/M3 test plan. | Davidzo | Open |

### Building

| Risk ID | Description | Prob. | Impact | Priority | Mitigation Plan | Owner | Status |
|---|---|---|---|---|---|---|---|
| RR067 | Adding authentication (FR-12) and role-based dashboards (FR-11) increases build complexity; untested build configuration could break existing FR-01–FR-07 functionality. | Medium | Medium | Medium | Maintain regression build checklist covering prior milestone features whenever new modules integrated. | Kamo | Open |
| RR068 | Introducing new dependencies for accessibility tooling (NFR-07) or geolocation search (FR-13) without version pinning could destabilise build. | Medium | Low | Low | Pin all new dependency versions in lockfile; document why each was added. | Kamo | Open |
| RR069 | Build scripts may not account for environment-specific configuration needed for timestamp/timezone handling (NFR-11), causing inconsistent builds across machines. | Low | Medium | Low | Centralise timezone configuration in single build-time settings file rather than hardcoding per environment. | Kamo | Open |
| RR070 | Growing number of functional modules (15 FRs) increases risk of build process becoming slow, discouraging frequent local builds and testing. | Medium | Low | Low | Modularise codebase; consider incremental/partial build support once stack selected. | Kamo | Deferred to M2 |
| RR071 | Without automated build verification (FE-002), broken build introduced by one team member could block other two members' work. | Medium | High | High | Treat basic CI build verification as non-negotiable M2 priority given growing feature set. | Kamo | Deferred to M2 |
| RR072 | Build configuration for accessibility linting (NFR-07) may be overlooked if not explicitly included in build pipeline requirements. | Medium | Medium | Medium | Add automated accessibility linter to build pipeline once tooling selected. | Davidzo | Deferred to M2 |
| RR073 | Increasing feature scope (FR-08–FR-15) without shared build definition could lead to 'it builds on my machine' issues among three students. | Medium | Medium | Medium | Document single canonical build command and required tool versions in repository README as soon as stack chosen. | Team | Deferred to M2 |

### Scalability

| Risk ID | Description | Prob. | Impact | Priority | Mitigation Plan | Owner | Status |
|---|---|---|---|---|---|---|---|
| RR074 | Request-history view (FR-08) may perform poorly for citizen accounts with very large number of historical submissions. | Low | Medium | Low | Implement pagination or lazy loading for request-history list rather than retrieving all records at once. | Naledi | Open |
| RR075 | Staff search/filter/sort functionality (FR-09) may degrade in performance as total number of service requests grows over time. | Medium | Medium | Medium | Ensure database indexes designed around FR-09 filter/sort fields identified during M2 schema design. | Kamo | Deferred to M2 |
| RR076 | Management dashboard (FR-11), if built on real-time aggregation queries, may not scale as request volume and staff activity history grow. | Medium | Medium | Medium | Consider pre-aggregated summary tables or scheduled aggregation jobs rather than computing dashboard metrics on every page load. | Davidzo | Deferred to M2 |
| RR077 | Proximity-based job card search (FR-13) could become computationally expensive at scale if not backed by appropriate spatial indexing. | Low | Medium | Low | Evaluate lightweight geospatial indexing options compatible with free-tier hosting during M2 stack evaluation. | Kamo | Deferred to M2 |
| RR078 | Audit log retention of ninety days (NFR-06) could result in significant data growth over time, risking free-tier storage limits being exceeded. | Medium | Medium | Medium | Monitor audit-log storage usage against free-tier thresholds; implement archiving or summarisation for older entries. | Kamo | Open |
| RR079 | Estimated resolution time calculations (FR-15) based on historical workload data may become slower to compute as historical data volume increases. | Low | Low | Low | Cache or periodically recompute category-level estimates rather than calculating them live on every request view. | Naledi | Open |
| RR080 | Growth in number of registered citizen accounts (FR-12) could strain authentication infrastructure under free-tier limits. | Low | Medium | Low | Confirm free-tier authentication service limits during M2 evaluation; monitor account growth against them. | Davidzo | Deferred to M2 |
| RR081 | Notification volume may scale poorly if every status change (FR-05), combined with growing user base, results in high frequency of alerts to process. | Low | Medium | Low | Use queued/batched notification approach rather than sending each alert synchronously as status changes occur. | Davidzo | Open |

### Maintainability

| Risk ID | Description | Prob. | Impact | Priority | Mitigation Plan | Owner | Status |
|---|---|---|---|---|---|---|---|
| RR082 | Expanded requirement set (15 FRs, 11 NFRs) increases risk of inconsistent implementation patterns across modules built by different team members. | Medium | Medium | Medium | Maintain shared architecture/style guide; review new modules against it before merging. | Team | Open |
| RR083 | Role-based logic (FR-04, FR-10, NFR-08) implemented ad hoc across multiple features could become difficult to maintain if not centralised. | Medium | Medium | Medium | Centralise role/permission checks in single reusable module rather than duplicating logic per feature. | Davidzo | Open |
| RR084 | Error-handling logic required by NFR-09 may be implemented inconsistently across growing number of modules. | Medium | Medium | Medium | Implement single centralised error-handling/formatting layer used by all modules rather than per-feature error handling. | Davidzo | Open |
| RR085 | Timestamp/timezone handling (NFR-11) implemented independently in multiple features could create inconsistent behaviour hard to maintain later. | Medium | Medium | Medium | Use single shared date/time utility library and standard reference time across all modules from outset. | Kamo | Open |
| RR086 | Accessibility requirements (NFR-07) retrofitted after initial development of FR-08–FR-15 could require significant rework rather than being maintainable from start. | Medium | Medium | Medium | Apply accessibility-friendly components and patterns from start of M2 rather than retrofitting later. | Team | Open |
| RR087 | Audit-logging code (NFR-06) duplicated across each feature that requires it could increase long-term maintenance effort. | Medium | Low | Low | Implement single reusable audit-logging service/middleware called by all ticket-action features. | Kamo | Open |
| RR088 | Analytics/reporting logic for management dashboard (FR-11) tightly coupled to UI could make future changes to metrics difficult to maintain. | Medium | Low | Low | Separate data-aggregation logic from presentation logic so dashboard metrics can be updated independently of UI. | Davidzo | Open |
| RR089 | Without documented data model covering all 15 FRs, future changes to one feature (e.g., FR-09) risk unintentionally breaking related features (e.g., FR-11). | Medium | Medium | Medium | Maintain single documented data model/schema reference updated whenever feature changes related fields. | Team | Open |

### Deployment

| Risk ID | Description | Prob. | Impact | Priority | Mitigation Plan | Owner | Status |
|---|---|---|---|---|---|---|---|
| RR090 | Deploying authentication (FR-12) and session-management (NFR-08) features introduces additional configuration (secrets, token expiry) that could be missed during deployment. | Medium | High | High | Add authentication/session configuration items to pre-deployment checklist established for HTTPS/TLS (RR-033). | Davidzo | Open |
| RR091 | Deploying updated audit-log retention settings (NFR-06) incorrectly could result in logs being purged before required ninety-day period. | Low | Medium | Low | Verify retention configuration in staging environment before promoting to production. | Kamo | Deferred to M2 |
| RR092 | Deployment omitting proper timezone/server-clock configuration (NFR-11) could cause incorrect timestamps in production despite correct behaviour in development. | Low | Medium | Low | Explicitly set and verify server timezone configuration as part of deployment checklist. | Kamo | Open |
| RR093 | New environment variables required for geolocation/proximity search (FR-13) or notification services (FR-05) may not be consistently configured across deployment targets. | Medium | Medium | Medium | Maintain single source-of-truth list of required environment variables; check before every deployment. | Kamo | Open |
| RR094 | Deploying growing feature set under free-tier hosting limits could risk exceeding request or storage quotas shortly after go-live. | Medium | Medium | Medium | Re-confirm free-tier quotas against expanded 15-FR/11-NFR feature set before each milestone deployment. | Kamo | Open |
| RR095 | Accessibility-related build assets (fonts, ARIA libraries) required for NFR-07 may not be correctly bundled during deployment, silently degrading accessibility in production. | Low | Medium | Low | Verify accessibility asset bundling as part of deployment smoke-test checklist. | Davidzo | Open |
| RR096 | Deployment rollback triggered after failed release could inadvertently revert audit-log data or user accounts created under NFR-06/FR-12 if not handled carefully. | Low | High | Medium | Ensure rollback plans (per RR-031) explicitly separate application-code rollback from data preservation. | Davidzo | Deferred to M2 |
| RR097 | Incremental deployment of new FRs (FR-08–FR-15) across sprints could introduce partially deployed features visible to users before they are complete. | Medium | Medium | Medium | Use feature flags or staged rollout so incomplete features remain hidden until fully tested. | Team | Open |

### Environments

| Risk ID | Description | Prob. | Impact | Priority | Mitigation Plan | Owner | Status |
|---|---|---|---|---|---|---|---|
| RR098 | Testing authentication and session timeout (FR-12, NFR-08) only in local development environment may not reflect production session behaviour. | Medium | Medium | Medium | Validate session/auth behaviour in staging environment configured to mirror production settings. | Davidzo | Deferred to M2 |
| RR099 | Differences in system clock/timezone settings between team members' development environments could mask timestamp bugs related to NFR-11. | Medium | Low | Low | Standardise development environment timezone settings or explicitly test with multiple simulated timezones. | Kamo | Open |
| RR100 | Accessibility testing (NFR-07) conducted only in one team member's browser/screen-reader setup may not reflect range of assistive technologies used by real citizens. | Medium | Medium | Medium | Test with more than one screen reader/browser combination across environments before M3 sign-off. | Davidzo | Open |
| RR101 | Free-tier environment limitations may prevent exact production-equivalent staging environment, risking undetected environment-specific issues. | Medium | Medium | Medium | Document known differences between staging and production; manually verify high-risk features directly in production after deployment. | Kamo | Deferred to M2 |
| RR102 | Geolocation-dependent testing (FR-13) may behave differently between local/emulated environments and real mobile browser environments used by field workers. | Medium | Medium | Medium | Perform at least one round of real-device field testing for proximity search before final milestone sign-off. | Naledi | Open |
| RR103 | Environment-specific error-logging configuration (NFR-09) could accidentally expose sensitive technical details in misconfigured staging or production environment. | Low | High | Medium | Explicitly verify that verbose/debug error output is disabled in any environment other than local development. | Davidzo | Open |

### Security

| Risk ID | Description | Prob. | Impact | Priority | Mitigation Plan | Owner | Status |
|---|---|---|---|---|---|---|---|
| RR104 | Registration and authentication (FR-12) may be vulnerable to brute-force login attempts if rate limiting not implemented. | Medium | High | High | Implement login attempt throttling/rate limiting as part of authentication design in M2. | Davidzo | Deferred to M2 |
| RR105 | Session tokens for thirty-minute inactivity timeout (NFR-08) may not be securely invalidated, allowing token reuse after expiry. | Medium | High | High | Ensure session/token invalidation is enforced server-side, not only through client-side timers. | Davidzo | Deferred to M2 |
| RR106 | Error messages intended to hide technical details (NFR-09) could still leak sensitive information (stack traces, query text) if not carefully implemented. | Medium | High | High | Explicitly test error responses across all endpoints to confirm no internal details exposed to end users. | Davidzo | Open |
| RR107 | Audit logs (NFR-06) themselves could become target for tampering if access controls on log store insufficient. | Low | High | Medium | Restrict audit-log write/read access to authorised backend processes only, with no direct user-facing edit capability. | Davidzo | Open |
| RR108 | Search/filter functionality for staff (FR-09) could be exploited for data exfiltration if access controls do not correctly scope results to user's role. | Medium | High | High | Enforce server-side role-based filtering on all search/filter queries, not just client-side UI restrictions. | Davidzo | Open |
| RR109 | Proximity-based search (FR-13) could expose precise citizen or field-worker location data if access not properly restricted to authorised roles. | Low | High | Medium | Limit precise location data visibility to roles that require it; mask or generalise elsewhere. | Davidzo | Open |
| RR110 | Unique tracking numbers (FR-06, FR-14) generated in predictable sequence could allow unauthorised users to guess and view other citizens' reports. | Medium | High | High | Use non-sequential, sufficiently random identifiers for tracking numbers rather than incrementing integers. | Kamo | Open |
| RR111 | Account registration (FR-12) without email/identity verification could allow creation of fraudulent citizen or staff accounts. | Medium | Medium | Medium | Implement basic email verification or equivalent low-cost identity check during registration. | Davidzo | Deferred to M2 |
| RR112 | Password storage for registered accounts (FR-12) could be vulnerable if weak hashing used under time pressure. | Low | High | Medium | Use established, well-reviewed password-hashing library rather than custom hashing logic. | Davidzo | Deferred to M2 |
| RR113 | Cross-site scripting risk from citizen-entered notes or field-worker notes (FR-07) could compromise other users if input rendered without sanitisation. | Medium | High | High | Sanitise and encode all user-generated text before rendering in dashboard, history, or notification view. | Davidzo | Open |
| RR114 | Insecure direct object references in request-history view (FR-08) could allow citizen to access another citizen's report by manipulating request identifier. | Medium | High | High | Enforce server-side ownership checks on every request-history and tracking-number lookup, not just UI-level filtering. | Davidzo | Open |
| RR115 | Management dashboard exports or reports (FR-11) could unintentionally expose personally identifiable citizen information beyond what management roles require. | Low | High | Medium | Aggregate or anonymise citizen-level detail in management-facing reports where individual identity not required. | Davidzo | Open |

### Accessibility & Usability

| Risk ID | Description | Prob. | Impact | Priority | Mitigation Plan | Owner | Status |
|---|---|---|---|---|---|---|---|
| RR116 | Achieving WCAG 2.1 Level AA compliance (NFR-07) may be underestimated in effort, given team's limited prior accessibility experience. | Medium | Medium | Medium | Review WCAG 2.1 AA checklists early; select UI component libraries with built-in accessibility support where possible. | Davidzo | Open |
| RR117 | Colour contrast and text-alternative requirements (NFR-07) may be overlooked during initial visual design, requiring costly rework later. | Medium | Medium | Medium | Apply accessible colour palette and alt-text conventions from first UI mockups rather than retrofitting. | Naledi | Open |
| RR118 | Keyboard-only navigation (NFR-07) may not be fully supported if UI components built without focus-management in mind. | Medium | Medium | Medium | Test full keyboard-only navigation paths for each major screen as it is built, not only at end of milestone. | Davidzo | Open |
| RR119 | Estimated resolution times (FR-15) and dashboard summaries (FR-11) presented without clear, plain-language explanations could confuse non-technical citizens or managers. | Low | Low | Low | User-test key screens with small number of non-technical reviewers; simplify wording based on feedback. | Naledi | Open |
| RR120 | Assistive-technology compatibility (NFR-07) may not be verified for mobile-responsive interface specifically, only desktop view. | Medium | Medium | Medium | Explicitly include mobile-responsive views in accessibility testing, not only desktop layout. | Davidzo | Open |
| RR121 | Search and filter controls for staff (FR-09) may be usable but not intuitive, increasing staff training time and reducing adoption. | Medium | Low | Low | Base filter/sort UI on familiar, conventional patterns; gather informal staff feedback during M3. | Naledi | Open |

### Data Integrity & Analytics Reporting

| Risk ID | Description | Prob. | Impact | Priority | Mitigation Plan | Owner | Status |
|---|---|---|---|---|---|---|---|
| RR122 | Aggregated performance metrics on management dashboard (FR-11) could be inaccurate if underlying request-status data inconsistent across features. | Medium | Medium | Medium | Define single authoritative status field/enumeration used consistently by FR-04, FR-05, FR-10, and FR-11. | Davidzo | Open |
| RR123 | Estimated resolution time logic (FR-15) based on limited early historical data could produce inaccurate or misleading estimates during initial rollout. | Medium | Medium | Medium | Clearly label early estimates as provisional; refine model once sufficient historical data accumulates. | Naledi | Open |
| RR124 | Duplicate or near-duplicate citizen accounts (FR-12) could fragment citizen's request history (FR-08) across multiple accounts. | Low | Medium | Low | Add basic duplicate-detection checks (e.g., matching contact details) during registration. | Davidzo | Open |
| RR125 | Assignment/acceptance actions (FR-10) not correctly reflected in audit logs (NFR-06) could create gaps in accountability records. | Medium | Medium | Medium | Include FR-10 assignment/acceptance events explicitly in audit-logging test cases. | Kamo | Open |
| RR126 | Search, filter, and sort results (FR-09) could silently omit records due to incorrect query logic, giving staff inaccurate view of outstanding work. | Medium | High | High | Validate FR-09 query results against known, manually verified data set before relying on it operationally. | Naledi | Open |
| RR127 | Timezone inconsistencies (NFR-11) could cause reported timestamps in dashboard (FR-11) to misrepresent actual resolution times. | Medium | Medium | Medium | Store all timestamps in standard reference time; convert only for display; verify across dashboard and history views. | Kamo | Open |
| RR128 | Acknowledgment receipts (FR-14) generated with incorrect request summaries could mislead citizens about what they submitted. | Low | Medium | Low | Generate receipt directly from same validated submission data used to create report, rather than separate re-entry step. | Kamo | Open |
| RR129 | Data used to calculate staff activity summaries (FR-11) could be skewed if field workers not consistently attributed to actions performed on their behalf. | Low | Medium | Low | Ensure every ticket action records acting user identifier consistently across all relevant features. | Davidzo | Open |

### Authentication & Session Management

| Risk ID | Description | Prob. | Impact | Priority | Mitigation Plan | Owner | Status |
|---|---|---|---|---|---|---|---|
| RR130 | Role assignment during registration (FR-12) may be misconfigured, allowing citizen account to unintentionally receive staff-level permissions. | Low | High | Medium | Default all new registrations to lowest-privilege role; staff roles only granted through separate controlled process. | Davidzo | Open |
| RR131 | Thirty-minute inactivity timeout (NFR-08) may be implemented inconsistently between web and mobile-responsive views. | Medium | Medium | Medium | Implement session timeout centrally in authentication layer rather than per-view, so behaviour consistent everywhere. | Davidzo | Open |
| RR132 | Forced re-authentication after timeout (NFR-08) could interrupt field workers mid-update in low-connectivity conditions, risking data loss. | Medium | Medium | Medium | Preserve unsaved form data locally across forced re-authentication event where technically feasible. | Naledi | Open |
| RR133 | Password-reset functionality, if added to support FR-12, could introduce new attack surface if not carefully secured. | Medium | High | High | Use time-limited, single-use reset tokens sent only to verified account contact method. | Davidzo | Deferred to M2 |
| RR134 | Concurrent logins from multiple devices (not explicitly addressed by FR-12) could create ambiguity in session and audit tracking. | Low | Low | Low | Decide and document team's intended behaviour for concurrent sessions during M2 authentication design. | Davidzo | Deferred to M2 |
| RR135 | Authentication failures may not be logged with enough detail to detect patterns of attempted unauthorised access. | Medium | Medium | Medium | Log failed login attempts (without sensitive data) as part of audit-logging design under NFR-06. | Davidzo | Open |

### Compliance & Audit

| Risk ID | Description | Prob. | Impact | Priority | Mitigation Plan | Owner | Status |
|---|---|---|---|---|---|---|---|
| RR136 | Ninety-day audit-log retention requirement (NFR-06) may not be met if team does not implement explicit retention/archival mechanism. | Medium | Medium | Medium | Implement and test explicit retention policy rather than relying on default database behaviour. | Kamo | Open |
| RR137 | Audit logs may not capture all required fields (timestamp, user identifier, action type, affected record) consistently across every feature. | Medium | Medium | Medium | Define single audit-log schema; require every feature that changes ticket state to use it. | Kamo | Open |
| RR138 | WCAG 2.1 AA compliance claims (NFR-07) could be based on incomplete testing, creating compliance gap discovered only during formal review. | Medium | Medium | Medium | Use established accessibility audit tool to generate documented compliance checklist result before milestone sign-off. | Davidzo | Open |
| RR139 | POPIA-related obligations may extend further than previously scoped now that registration (FR-12) and audit logging (NFR-06) store additional personal data. | Medium | High | High | Re-review POPIA principles specifically against newly added registration and audit-log data fields. | Davidzo | Open |
| RR140 | Browser-compatibility claims (NFR-10) may not be formally verified across all four named browsers before milestone submission. | Medium | Low | Low | Maintain simple compatibility test log recording pass/fail per browser for each milestone. | Naledi | Open |
| RR141 | Traceability between expanded FR/NFR set (FR-08–FR-15, NFR-06–NFR-11) and RTM may lag behind actual implementation, weakening milestone defensibility. | Medium | Medium | Medium | Update RTM immediately whenever new FR/NFR implemented, rather than batching updates near deadline. | Team | Open |

### Team Skill Development

| Risk ID | Description | Prob. | Impact | Priority | Mitigation Plan | Owner | Status |
|---|---|---|---|---|---|---|---|
| RR142 | Expanded requirement set (15 FRs, 11 NFRs) may exceed what team can realistically learn and implement to professional standard within fixed schedule. | Medium | High | High | Re-apply must/should/could prioritisation explicitly to new FRs/NFRs; confirm must-have status before committing team learning time. | Team | Open |
| RR143 | Implementing WCAG 2.1 AA accessibility (NFR-07) requires specialist knowledge team may not yet have, risking steep, time-consuming learning curve. | High | Medium | High | Timebox short accessibility learning spike using publicly available WCAG quick-reference guides before implementation begins. | Davidzo | Open |
| RR144 | Secure authentication implementation (FR-12, NFR-08) involves security concepts (hashing, tokens, session management) that may be new to some team members. | Medium | High | High | Use well-documented, widely adopted authentication libraries rather than building custom security logic from scratch. | Davidzo | Deferred to M2 |
| RR145 | Geospatial/proximity search (FR-13) introduces unfamiliar concepts (distance calculation, spatial indexing) that could slow development if not learned in advance. | Medium | Medium | Medium | Research basic geospatial query patterns for likely database choice during M2 stack evaluation. | Naledi | Deferred to M2 |
| RR146 | Building analytics/reporting dashboards (FR-11) may require data-visualisation skills not yet demonstrated by team. | Medium | Medium | Medium | Use well-documented charting/reporting library with examples closely matching required metrics, rather than custom visualisation code. | Davidzo | Open |
| RR147 | Team may underestimate learning time required to correctly implement audit logging (NFR-06) that is both complete and tamper-resistant. | Medium | Medium | Medium | Reference established audit-logging patterns/tutorials for chosen stack rather than designing approach from first principles. | Kamo | Open |
| RR148 | As requirements grow, team's existing lightweight sprint process (RR-050) may need to evolve, requiring team to learn slightly more structured project-tracking practices. | Medium | Low | Low | Incrementally adopt one or two additional lightweight practices only if current process proves insufficient. | Team | Open |
| RR149 | Continued reliance on multiple different AI tools across expanded feature set could produce inconsistent implementation styles if not verified carefully by each student. | Medium | Medium | Medium | Extend AI Usage Register to cover all new FR/NFR work; maintain existing human-verification-before-adoption rule. | Team | Open, ongoing control |

### Health & Wellbeing

| Risk ID | Description | Prob. | Impact | Priority | Mitigation Plan | Owner | Status |
|---|---|---|---|---|---|---|---|
| RR150 | Significant expansion of scope (from 7 FRs/5 NFRs to 15 FRs/11 NFRs) within same fixed schedule could increase pressure and risk burnout across all three team members. | High | High | Critical | Revisit must/should/could prioritisation immediately; explicitly defer lower-priority new requirements if current workload unsustainable. | Team | Open |
| RR151 | Security- and compliance-heavy new requirements (authentication, audit logging, POPIA) could create disproportionate stress for whichever team member is responsible for them. | Medium | High | High | Share security/compliance responsibilities across more than one team member rather than concentrating on single person. | Team | Open |
| RR152 | Accessibility work (NFR-07), being unfamiliar and detail-heavy, could become source of frustration and reduced motivation if not scoped realistically. | Medium | Medium | Medium | Set achievable, incremental accessibility goals per sprint rather than treating full WCAG AA compliance as single large task. | Davidzo | Open |
| RR153 | Larger number of individually assigned features (FR-08–FR-15) could lead one team member to work in isolation for extended periods, reducing peer support and increasing stress. | Medium | Medium | Medium | Maintain regular short check-ins even on individually owned features so no one works in isolation for long stretches. | Team | Open |
| RR154 | Perceived pressure to match depth of newly added enterprise-style features (dashboards, analytics, audit trails) to industry expectations could cause unrealistic self-imposed standards and stress. | Medium | Medium | Medium | Recalibrate expectations against academic milestone rubric rather than idealised production-grade benchmark. | Team | Open |
| RR155 | Increased total scope could compress time available for rest between milestones, risking cumulative fatigue across remaining project timeline. | Medium | Medium | Medium | Explicitly schedule short recovery periods after each milestone submission before starting next sprint at full intensity. | Team | Open |
| RR156 | With more interdependent features (e.g., FR-10 feeding FR-11), delay or difficulty experienced by one team member could create anxiety for other two who depend on that work. | Medium | Medium | Medium | Identify feature dependencies early; sequence work so downstream tasks have buffer time rather than being tightly coupled to upstream completion. | Team | Open |
| RR157 | Combined weight of new security, compliance, and accessibility obligations could make project feel overwhelming relative to team's stage of study, affecting confidence and wellbeing. | Medium | Medium | Medium | Treat unfamiliar obligations as incremental learning goals rather than immediate mastery requirements; seek lecturer guidance when uncertain. | Team | Open |
