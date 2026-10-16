# Forward Engineering Considerations Register

| ID | Category | Legacy State | Target State | Risk | Action Item | Owner |
|---|---|---|---|---|---|---|
| FE-001 | Data Sync & Consistency | No persistence approach decided; offline data model undefined. | A defined conflict-resolution strategy validated against NFR-01. | Risking rework close to deadline. | Timebox a technical spike comparing service worker sync patterns before M2 stack commitment. | Naledi |
| FE-002 | Automated Build & Testing | No CI build pipeline exists; testing currently manual. | Automated build, unit tests, and quality gates operating from M3. | Increases integration risk. | Confirm CI compatible tooling in M2 technology decision matrix. | Kamo |
| FE-003 | Deployment Environment & Hosting | No environment path selected. | Documented dev, staging, production path with free-tier limits understood. | Tool chosen without checking compatibility causes late rework. | Validate hosting availability and free-tier ceilings for M2 technology decision. | Kamo |
| FE-004 | Observability & Monitoring | No logging, monitoring tracking mechanism defined. | Basic checks in place to support NFR-05 and verification post-deployment. | Without monitoring, NFRs cannot be evidenced at M4. | Identify a free-tier-compatible monitoring option during M2 architecture planning. | Davidzo |
| FE-005 | Data Backup & Recovery | No backup, recovery approach defined for worker data. | Documented recovery and rollback plan in place before any production deployment. | Failed deployment with no recovery path damages trust. | Record recovery as explicit evaluation criterion for M2 technology decision. | Davidzo |
| FE-006 | Scalability of Reporting | FR-03 defined only functionally; growth in fault-report volume not yet considered. | Reporting approach that stays performant as fault data grows. | Naive reporting in M2/M3 may force rework before M4. | Note indexing/aggregation strategy as evaluation criterion when M2 data/persistence design chosen. | Naledi |

---

## M2 Status Update

| FE ID | M2 Status | Notes |
|---|---|---|
| FE-001 | In progress | M2 spike on service worker sync patterns; conflict strategy to be recorded in M2 ADR (ID TBD). |
| FE-002 | In progress | CI tooling confirmation pending stack selection (PERN + TypeScript now selected; GitHub Actions identified). |
| FE-003 | In progress | Free-tier hosting validation in progress (Vercel/Netlify, Railway/Render, Supabase/Neon under evaluation). |
| FE-004 | In progress | Free-tier monitoring option under evaluation. |
| FE-005 | In progress | Recovery as evaluation criterion for M2 stack decision. |
| FE-006 | In progress | Indexing/aggregation strategy noted for M2 data design. |
