# Technology Stack



> **Linked ADR:** [ADR-TECH-01](../Architecture_Decision_Record/ADR-TECH-01-pern-stack.md)

## Selected Stack

**PERN + TypeScript** - PostgreSQL, Express, React, Node.js.

## Scoring Rubric

Every technology in this document was scored on a 1-5 scale against each weighted criterion.

| Score | Meaning | Evidence Basis |
|---|---|---|
| 5 | Excellent | Meets the criterion with no significant trade-off verified |
| 4 | Strong | Meets the criterion with minor trade-offs  verified |
| 3 | Moderate | Partially meets the criterion and some concern remains |
| 2 | Weak | Significant gap would require mitigation |
| 1 | Poor | Does not meet the criterion, its disqualifying without workaround |

Scores are derived from verifiable, project-specific evidence:

- **Team capability:** Team's prior coursework and comfort with each stack (self-assessed across 3 members)
- **Free-tier hosting:** Verified against provider documentation 
- **ACID / relational integrity:** Verified against database documentation and A2 Task 2
- **Offline / PWA support:** Verified against Workbox and ecosystem documentation
- **Learning curve:** Based on team skill self-assessment and ecosystem maturity
- **Ecosystem / dependency risk:** Verified via npm and community activity
- **Deployment compatibility:** Verified against free-tier PaaS compatibility documentation

## References:

- [Node.js release schedule](https://nodejs.org/en/about/previous-releases)
- [PostgreSQL 16 release notes](https://www.postgresql.org/docs/16/release-16.html)
- [MongoDB transactions documentation](https://www.mongodb.com/docs/manual/core/transactions/)
- [pg (node-postgres) documentation](https://node-postgres.com/)
- [Workbox documentation](https://developer.chrome.com/docs/workbox)
- [Supabase free tier](https://supabase.com/pricing)


## Stack Decision Matrix

| Criterion | Weight | MERN | **PERN** | Django + React | Spring Boot + React |
|---|---|---|---|---|---|
| Team capability | 0.25 | 4 | **4** | 3 | 2 |
| Free-tier hosting | 0.20 | 5 | **5** | 4 | 2 |
| ACID / relational integrity | 0.20 | 2 | **5** | 5 | 5 |
| Offline / PWA support | 0.10 | 4 | **4** | 3 | 3 |
| Learning curve | 0.10 | 4 | **4** | 3 | 2 |
| Ecosystem / dependency risk | 0.10 | 3 | **3** | 4 | 4 |
| Deployment compatibility | 0.05 | 5 | **5** | 4 | 2 |
| **Weighted score** | **1.00** | **3.75** | **4.35** | **3.75** | **2.90** |

### Calculation - PERN (Selected)

| Criterion | Weight | Rating | Weighted |
|---|---|---|---|
| Team capability | 0.25 | 4 | 1.00 |
| Free-tier hosting | 0.20 | 5 | 1.00 |
| ACID / relational integrity | 0.20 | 5 | 1.00 |
| Offline / PWA support | 0.10 | 4 | 0.40 |
| Learning curve | 0.10 | 4 | 0.40 |
| Ecosystem / dependency risk | 0.10 | 3 | 0.30 |
| Deployment compatibility | 0.05 | 5 | 0.25 |
| **Total** | - | - | **4.35** |

### Calculation - MERN (Rejected)

| Criterion | Weight | Rating | Weighted |
|---|---|---|---|
| Team capability | 0.25 | 4 | 1.00 |
| Free-tier hosting | 0.20 | 5 | 1.00 |
| ACID / relational integrity | 0.20 | 2 | 0.40 |
| Offline / PWA support | 0.10 | 4 | 0.40 |
| Learning curve | 0.10 | 4 | 0.40 |
| Ecosystem / dependency risk | 0.10 | 3 | 0.30 |
| Deployment compatibility | 0.05 | 5 | 0.25 |
| **Total** | - | - | **3.75** |

### Calculation - Django + React (Rejected)

| Criterion | Weight | Rating | Weighted |
|---|---|---|---|
| Team capability | 0.25 | 3 | 0.75 |
| Free-tier hosting | 0.20 | 4 | 0.80 |
| ACID / relational integrity | 0.20 | 5 | 1.00 |
| Offline / PWA support | 0.10 | 3 | 0.30 |
| Learning curve | 0.10 | 3 | 0.30 |
| Ecosystem / dependency risk | 0.10 | 4 | 0.40 |
| Deployment compatibility | 0.05 | 4 | 0.20 |
| **Total** | - | - | **3.75** |

### Calculation - Spring Boot + React (Rejected)

| Criterion | Weight | Rating | Weighted |
|---|---|---|---|
| Team capability | 0.25 | 2 | 0.50 |
| Free-tier hosting | 0.20 | 2 | 0.40 |
| ACID / relational integrity | 0.20 | 5 | 1.00 |
| Offline / PWA support | 0.10 | 3 | 0.30 |
| Learning curve | 0.10 | 2 | 0.20 |
| Ecosystem / dependency risk | 0.10 | 4 | 0.40 |
| Deployment compatibility | 0.05 | 2 | 0.10 |
| **Total** | - | - | **2.90** |

### Interpretation

PERN wins by **0.60** over both MERN and Django, and by **1.45** over Spring Boot.

- **MERN loses 0.60 on ACID alone** (PERN = 5, MERN = 2, weighted 0.20). MongoDB's multi-document transaction support is weaker than PostgreSQL's, and A2 Task 2 requires atomic status transitions across three tables (status + audit + assignment).
- **Django loses 0.60 on team capability** (weighted 0.25). The team is JavaScript-fluent; introducing Python would require a learning curve that competes with delivery time.
- **Spring Boot loses 1.45**, primarily on team capability (weighted 0.25) and deployment compatibility (0.05, memory footprint exceeds free-tier limits).

## Database Decision Matrix

The persistence engine is scored separately because it drives ACID guarantees, reporting performance, and long-term scalability. Every rejected database loses on **at least two independent criteria** not one.

| Criterion | Weight | **PostgreSQL** | MySQL | MongoDB | SQLite |
|---|---|---|---|---|---|
| ACID / multi-table transactions | 0.25 | **5** | 5 | 3 | 4 |
| Relational integrity (FK, constraints) | 0.20 | **5** | 5 | 2 | 4 |
| Free-tier hosting availability | 0.15 | **5** | 5 | 5 | 3 |
| JSON / flexible schema support | 0.10 | **4** | 3 | 5 | 2 |
| Reporting / aggregation (FR-03, FR-14) | 0.10 | **5** | 4 | 4 | 3 |
| Team capability | 0.10 | **3** | 3 | 4 | 4 |
| Ecosystem / tooling maturity | 0.05 | **5** | 5 | 4 | 3 |
| Migration path / scalability | 0.05 | **5** | 4 | 4 | 1 |
| **Weighted score** | **1.00** | **4.70** | **4.45** | **3.35** | **3.35** |

### Calculations

**PostgreSQL (Selected) - 4.70**

| Criterion | Weight | Rating | Product |
|---|---|---|---|
| ACID / multi-table transactions | 0.25 | 5 | 1.25 |
| Relational integrity | 0.20 | 5 | 1.00 |
| Free-tier hosting | 0.15 | 5 | 0.75 |
| JSON / flexible schema | 0.10 | 4 | 0.40 |
| Reporting / aggregation | 0.10 | 5 | 0.50 |
| Team capability | 0.10 | 3 | 0.30 |
| Ecosystem / tooling maturity | 0.05 | 5 | 0.25 |
| Migration path / scalability | 0.05 | 5 | 0.25 |
| **Total** | **1.00** | - | **4.70** |

**MySQL (Rejected) - 4.45**

| Criterion | Weight | Rating | Product |
|---|---|---|---|
| ACID / multi-table transactions | 0.25 | 5 | 1.25 |
| Relational integrity | 0.20 | 5 | 1.00 |
| Free-tier hosting | 0.15 | 5 | 0.75 |
| JSON / flexible schema | 0.10 | 3 | 0.30 |
| Reporting / aggregation | 0.10 | 4 | 0.40 |
| Team capability | 0.10 | 3 | 0.30 |
| Ecosystem / tooling maturity | 0.05 | 5 | 0.25 |
| Migration path / scalability | 0.05 | 4 | 0.20 |
| **Total** | **1.00** | - | **4.45** |

**MongoDB (Rejected) - 3.60**

| Criterion | Weight | Rating | Product |
|---|---|---|---|
| ACID / multi-table transactions | 0.25 | 2 | 0.50 |
| Relational integrity | 0.20 | 2 | 0.40 |
| Free-tier hosting | 0.15 | 5 | 0.75 |
| JSON / flexible schema | 0.10 | 5 | 0.50 |
| Reporting / aggregation | 0.10 | 4 | 0.40 |
| Team capability | 0.10 | 4 | 0.40 |
| Ecosystem / tooling maturity | 0.05 | 4 | 0.20 |
| Migration path / scalability | 0.05 | 4 | 0.20 |
| **Total** | **1.00** | - | **3.35** |

**SQLite (Rejected) - 3.35**

| Criterion | Weight | Rating | Product |
|---|---|---|---|
| ACID / multi-table transactions | 0.25 | 4 | 1.00 |
| Relational integrity | 0.20 | 4 | 0.80 |
| Free-tier hosting | 0.15 | 3 | 0.45 |
| JSON / flexible schema | 0.10 | 2 | 0.20 |
| Reporting / aggregation | 0.10 | 3 | 0.30 |
| Team capability | 0.10 | 4 | 0.40 |
| Ecosystem / tooling maturity | 0.05 | 3 | 0.15 |
| Migration path / scalability | 0.05 | 1 | 0.05 |
| **Total** | **1.00** | - | **3.35** |

### Database Rejection Reasons (Detailed)

Each rejected database is documented below with **why it was rejected**, **what it would have offered**, and **which criteria cost it the decision**. Every rejection is based on at least two independent criteria, not a single weakness.

---

#### MySQL - Rejected (Score 4.45)

**What MySQL would have offered:**
- Mature, widely-used relational database with strong ACID support
- Excellent free-tier availability (PlanetScale, Railway, Aiven)
- Broad ecosystem and tooling compatibility
- Familiar SQL syntax

**Why it was rejected:**

| Criterion | Score | Why it lost |
|---|---|---|
| **JSON / flexible schema support** | 3 vs PostgreSQL's 4 | PostgreSQL's `JSONB` type is more powerful than MySQL's `JSON`: it supports indexing, operators, and querying directly in SQL. Our `ServiceRequest` entity needs to store category-specific fields (e.g., pothole depth, water leak severity) that vary by request type. PostgreSQL's JSONB handles this cleanly; MySQL's JSON support is weaker. |
| **Reporting / aggregation (FR-03, FR-14)** | 4 vs PostgreSQL's 5 | PostgreSQL's window functions, CTEs (Common Table Expressions), and aggregation performance are more mature for reporting queries. FR-03 (map of unresolved faults by department) and FR-14 (service activity dashboard) both rely on complex aggregations. PostgreSQL handles these more efficiently. |
| **Migration path / scalability** | 4 vs PostgreSQL's 5 | PostgreSQL is the industry standard for applications that plan to scale. Managed services (Supabase, Neon, AWS RDS) offer more robust replication, partitioning, and read-replica options. MySQL's ecosystem is strong but narrower for our growth path. |

**Verdict:** MySQL is a strong database and would satisfy most of our requirements. It lost on three secondary criteria, JSON flexibility, aggregation performance, and long-term scalability, where PostgreSQL is measurably stronger. **Not rejected on one weakness.**

---

#### MongoDB - Rejected (Score 3.60)

**What MongoDB would have offered:**
- Flexible, schema-less document storage
- Strong JSON-native query language
- Excellent free-tier availability (MongoDB Atlas)
- Team familiarity (3 out of 3 members have used MongoDB in coursework)

**Why it was rejected:**

| Criterion | Score | Why it lost |
|---|---|---|
| **ACID / multi-table transactions** | 3 vs PostgreSQL's 5 | MongoDB added multi-document transaction support in v4.0, but it's operationally heavier than PostgreSQL's native transactions. Our ADR-PERSIST-01 requires atomic commits across three tables `ServiceRequest`, `StatusHistory`, and `Assignment`. MongoDB supports this but with performance overhead and less predictable behaviour under concurrent load. A2 Task 2 explicitly recommends PostgreSQL's transactional model for status transitions. |
| **Relational integrity (FK, constraints)** | 2 vs PostgreSQL's 5 | MongoDB has no native foreign key constraints. The `StatusHistory` table must reference a valid `ServiceRequest`, and the `Assignment` table must reference valid departments and officers. In PostgreSQL these are enforced by the database. In MongoDB they must be enforced by application code which is both fragile and untestable without the database. If a bug writes an orphan history row, PostgreSQL prevents it; MongoDB doesn't. |
| **Reporting / aggregation (FR-03, FR-14)** | 4 vs PostgreSQL's 5 | MongoDB's aggregation framework is powerful but designed for different query patterns than relational aggregation. FR-03 (map by department) and FR-14 (service activity dashboard) require multi-table joins and grouped aggregations that are natural in SQL and awkward in MongoDB. We'd need to either denormalise data (losing integrity) or write complex aggregation pipelines. |

**Verdict:** MongoDB is rejected on **three independent criteria** ACID, relational integrity, and reporting aggregation. Its strengths (JSON-native storage, team familiarity) don't outweigh the three losses. **Not rejected on one weakness.**

---

#### SQLite - Rejected (Score 3.35)

**What SQLite would have offered:**
- Zero configuration embedded database, no server
- Extremely fast for single-user reads
- Perfect for local development and testing
- File-based, no separate deployment
- Team familiarity (used in coursework)

**Why it was rejected:**

| Criterion | Score | Why it lost |
|---|---|---|
| **Free-tier hosting availability** | 3 vs PostgreSQL's 5 | SQLite is embedded it runs inside your application, not on a shared server. CivicConnect needs to serve multiple concurrent users (citizens, field workers, admins) from a central database. SQLite cannot be deployed on free-tier PaaS hosts as a shared database. The app would need to run on a single server with a persistent file system, which free-tier hosts like Render and Railway don't provide. |
| **Migration path / scalability** | 1 vs PostgreSQL's 5 | SQLite's single-writer architecture means it cannot scale to multiple concurrent writers. For 100 concurrent users (NFR-02), SQLite would either lock constantly or fail. Migrating from SQLite to a production database later requires rewriting the persistence layer the schema, queries, and transaction handling all differ. This is a hidden cost the team wants to avoid. |
| **JSON / flexible schema support** | 2 vs PostgreSQL's 4 | SQLite has only recently added JSON support (v3.38+), and it's less performant than PostgreSQL's JSONB. Category-specific fields (pothole depth, water leak severity) would be awkward to store and query. |

**Verdict:** SQLite is rejected on **three independent criteria**  deployment suitability, scalability, and JSON support. Its speed and simplicity advantages don't offset the fact that it cannot serve CivicConnect's multi-user production deployment. **Not rejected on one weakness.**

---

### Summary - Multi-Criteria Rejection

| Database | Score | Rejected On |
|---|---|---|
| MySQL | 4.45 | (1) Weaker JSON support; (2) Weaker aggregation; (3) Narrower scalability path  **three losses** |
| MongoDB | 3.60 | (1) Weaker ACID; (2) No foreign key constraints; (3) Weaker relational reporting  **three losses** |
| SQLite | 3.35 | (1) Not deployable on free-tier PaaS; (2) Single-writer, not concurrent; (3) Weak JSON support  **three losses** |

**PostgreSQL selected** — highest on ACID, foreign key integrity, and reporting aggregation, with the strongest migration path for growth. Supports ADR-PERSIST-01's transactional requirement with zero configuration overhead.

### Stack Rejection Reasons (Detailed)

#### MERN - Rejected (Score 3.75)

**What MERN would have offered:**
- Single-language stack (JS everywhere)
- Strong team familiarity with MongoDB and React
- Excellent free-tier hosting (MongoDB Atlas, Vercel)
- Fast development velocity for CRUD-heavy apps

**Why it was rejected:**

| Criterion | Score | Why it lost |
|---|---|---|
| **ACID / relational integrity** | 2 vs PERN's 5 | MongoDB's transaction support is weaker than PostgreSQL's. ADR-PERSIST-01 requires atomic commits across status + audit + assignment. This is achievable in MongoDB but with measurable performance overhead and less predictable behaviour. A2 Task 2 explicitly recommends PostgreSQL's transactional model. |
| **Reporting / aggregation** | 3 vs PERN's 5 (implicit) | FR-03 (map by department) and FR-14 (service activity dashboard) require multi-table joins and grouped aggregations. MongoDB's aggregation framework handles these but with more complex code than SQL. |

**Verdict:** MERN loses 0.60 on ACID alone (weighted 0.20), plus additional losses on reporting. Its strengths (team familiarity, free-tier availability) don't overcome the transactional gap.

---

#### Django + React - Rejected (Score 3.75)

**What Django would have offered:**
- Python-based, mature ORM
- Strong relational database support (PostgreSQL, MySQL, SQLite)
- Built-in admin panel
- Excellent security track record

**Why it was rejected:**

| Criterion | Score | Why it lost |
|---|---|---|
| **Team capability** | 3 vs PERN's 4 | The team is JavaScript-fluent across all 3 members. Introducing Python would require learning a new language, framework, and ecosystem during a 12–14 week delivery window. This learning curve competes directly with feature delivery. |
| **Offline / PWA support** | 3 vs PERN's 4 | The JavaScript ecosystem has more mature PWA tooling — Workbox is the industry standard. Django supports PWA but with fewer integrated tools. |
| **Learning curve** | 3 vs PERN's 4 | Django's ORM and template system are powerful but unfamiliar to the team. The initial ramp-up time would slow early delivery. |

**Verdict:** Django is technically strong but loses on team capability, PWA tooling, and learning curve all weighted criteria where the JavaScript ecosystem has an advantage for this specific team.

---

#### Spring Boot + React - Rejected (Score 2.90)

**What Spring Boot would have offered:**
- Enterprise-grade Java framework
- Excellent ACID support with PostgreSQL
- Mature dependency injection and testing
- Industry-standard for large-scale systems

**Why it was rejected:**

| Criterion | Score | Why it lost |
|---|---|---|
| **Team capability** | 2 vs PERN's 4 | None of the team has Java experience. Spring Boot would require learning Java, Spring, and Maven/Gradle a substantial ramp-up. |
| **Free-tier hosting** | 2 vs PERN's 5 | Spring Boot applications have a larger memory footprint (typically 300MB+) that exceeds free-tier PaaS limits (Render, Railway cap at 512MB on free tier). Deployment on free hosts is impractical. |
| **Deployment compatibility** | 2 vs PERN's 5 | Same memory issue. Additionally, Spring Boot's default JVM startup time (5-15 seconds) creates cold-start delays that threaten NFR-02 (< 3s response time). |
| **Learning curve** | 2 vs PERN's 4 | Java's type system, Spring's annotations, and Maven/Gradle build tooling add significant complexity compared to Node/Express. |

**Verdict:** Spring Boot is the industry standard for enterprise Java applications, but for a 3-person student team with zero Java experience, zero budget, and a 12–14 week timeline, it loses on four independent criteria.

---

### Summary - Stack Rejection

| Stack | Score | Rejected On |
|---|---|---|
| MERN | 3.75 | (1) Weak ACID; (2) Weak relational reporting  **two losses** |
| Django + React | 3.75 | (1) Team capability gap; (2) Weaker PWA tooling; (3) Learning curve **three losses** |
| Spring Boot + React | 2.90 | (1) Team capability gap; (2) Free-tier memory limits; (3) Cold-start latency; (4) Learning curve  **four losses** |

## Selected Versions

| Layer | Technology | Version | Rationale |
|---|---|---|---|
| Frontend | React | 18.x | Stable; component model supports 3 role-based views |
| Frontend build | Vite | 5.x | Fast dev loop; free |
| Language | TypeScript | 5.x | Type safety across stack |
| PWA | Workbox | 7.x | Service worker + offline caching (FR-02) |
| Client storage | IndexedDB (via idb) | 8.x | FR-02 offline caching |
| Backend runtime | Node.js | 20 LTS | Long-term support; free-tier compatible |
| Backend framework | Express | 4.x | Mature; minimal; team familiar |
| Database client | `pg` (node-postgres) | 8.x | Explicit parameterised SQL; supports transactions required by ADR-PERSIST-01 (A2 Task 2) |
| Database | PostgreSQL | 16.x | ACID; relational; free-tier available |
| Auth | JWT + bcrypt | - | RBAC (FR-04); session timeout (NFR-11) |
| Validation | Zod | 3.x | Shared schema validation |
| Testing | Vitest + Supertest | - | Unit + integration (A2 Task 4) |
| CI | GitHub Actions | - | A2 Task 4 recommendation |
| Hosting | Supabase | - | Free-tier PaaS with managed Postgres |
| Monitoring | UptimeRobot / Logtail | - | FE-004; NFR-05 verification |
| Accessibility | axe-core | - | NFR-10 WCAG 2.1 AA |

## Compatibility Assumptions

- Node 20 LTS runs on all target free-tier hosts
- PostgreSQL 16 available on Render/Railway/Supabase free tiers
- `pg` 8.x supports native PostgreSQL transactions (`BEGIN`/`COMMIT`/`ROLLBACK`) required by ADR-PERSIST-01 and A2 Task 2
- Workbox 7 supports offline sync required by NFR-01
- All dependencies pinned via lockfile (A2 Task 4)

## Licensing Summary

All selected technologies are open-source with permissive licences (MIT, Apache 2.0, or PostgreSQL Licence). No paid licences required and satisfies the zero-budget constraint.

## Risks Introduced

| Risk ID | Description | Mitigation |
|---|---|---|
| RR-005 | Free-tier DB size / connection limits under load | Connection pooling; query optimisation; usage monitoring |
| RR-006 | Browser API inconsistency (Geolocation, Media Capture, IndexedDB) | Progressive enhancement; target browser matrix |
| RR-007 | npm dependency churn / supply chain | Lockfile; Dependabot alerts; pinned versions |
| RR-008 | PostgreSQL connection exhaustion under concurrent load | Pooling; short transactions; health checks |

## Evidence

- A2 Task 2 (persistence and transactional integrity)
- A2 Task 4 (SCM/CI)
- Decision matrices above
- FE-001 to FE-007 forward engineering considerations


## Links

- ADR: [ADR-TECH-01](../Architecture_Decision_Record/ADR-TECH-01-pern-stack.md)
- Architecture: [07-architecture.md](07-architecture.md)
- Risk Register: [12-risk-register.md](12-risk-register.md)
