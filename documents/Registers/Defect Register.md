# Defect Register

**Owner:** Davidzo Malapile, Naledi Moeng, Kamohelo Mabena
**Version:** v1.0 (M3)
**Last Updated:** 2026-10-15

---

## Purpose

This register records defects, failures and quality findings discovered during
Milestone 3 construction and verification. Each defect is tracked from
discovery through fix, with regression evidence linking back to the test suite.

A "defect" is any observed behavior that deviates from the expected behaviour
defined by a requirement, acceptance criterion, or architectural decision.

---

## Defect States

| State | Meaning |
|-------|---------|
| **Open** | Identified, not yet fixed |
| **In Progress** | Fix under development |
| **Fixed** | Code/decision updated, awaiting verification |
| **Verified** | Fix confirmed by test/evidence |
| **Closed** | Fully resolved; no further action |
| **Won't Fix** | Accepted as known limitation (must be justified) |

---

## Defects

| Defect ID | Description | Severity | Status | Fix | Regression Test | State |
|-----------|-------------|----------|--------|-----|-----------------|-------|
| DEF-001 | Status transitions differ between frontend `workflow.ts`, `routes/requests.ts`, and `routes/sync.ts` — three inconsistent state machine tables | High | Fixed | Created single source of truth in `backend/server/domain/workflow.ts` (ALLOWED + ROLE_CAN); imported by all routes | TC-BE-WF-01 to TC-BE-WF-20 (20 unit tests) | Closed |
| DEF-002 | RBAC only allowed `field_worker` in `routes/requests.ts`; admins could not assign or reject reports | High | Fixed | Added `requireRole("admin", "field_worker")` middleware; created role-based transition matrix in `workflow.ts` | TC-BE-RBAC-01 to TC-BE-RBAC-06 | Closed |
| DEF-003 | Seed `MOCK_STAFF` used plaintext passwords instead of bcrypt hashes | Critical | Fixed | Replaced with bcrypt-hashed password verification; seed SQL updated with real hashes | TC-BE-AUTH-01 (valid login succeeds) | Closed |
| DEF-004 | Fake JWT tokens (`dev-token-${id}`) instead of real signed tokens | Critical | Fixed | Implemented `jsonwebtoken` signing with `JWT_SECRET`; verification in `auth.middleware.ts` | TC-BE-AUTH-01, TC-BE-AUTH-08 | Closed |
| DEF-005 | `GET /api/auth/me` always returned 401 | Medium | Fixed | Implemented JWT verification and user lookup by `req.user.id` | TC-BE-AUTH-06 | Closed |
| DEF-006 | No body size limit on `express.json()` | Medium | Fixed | Set `limit: "4mb"` for base64 photo payloads | Manual: large photo upload works | Closed |
| DEF-007 | Unknown keys not stripped from incoming payloads | Low | Fixed | Zod schema validation strips unknown keys via `.strict()` or `.parse()` | TC-BE-VAL-01 to TC-BE-VAL-06 | Closed |
| DEF-008 | No `PATCH /api/requests/:id/assign` endpoint | High | Fixed | Assignment handled via `PATCH /:id/status` with `assignedTo` and `assignedName` fields | TC-BE-TRANS-01 | Closed |
| DEF-009 | No filtering support on `GET /api/requests` | Medium | Fixed | Added `q`, `status`, `category`, `department`, `sort` query params to `requestRepository.list()` | TC-BE-REQ-05 to TC-BE-REQ-09 | Closed |
| DEF-010 | In-memory store lost data on server restart | Critical | Fixed | Replaced with PostgreSQL persistence via `requestRepository`, `userRepository`, `teamRepository`; deleted `store.ts` | Manual: server restart preserves reports | Closed |
| DEF-011 | `sync.ts` had no transaction; batch could partially apply | High | Fixed | Wrapped sync batch in `BEGIN`/`COMMIT`/`ROLLBACK` | Manual: sync insert + idempotency verified | Closed |
| DEF-012 | No idempotency on sync — retried batches applied twice | High | Fixed | Added `idempotency_keys` table; sync checks before processing | Manual: same sync twice returns `{"accepted":[]}` | Closed |
| DEF-013 | `sync.ts` returned 403 on first failure, aborting batch | High | Fixed | Errors are collected and reported per-request; batch continues where safe | TC-BE-SYNC-04 | Closed |
| DEF-014 | Team validation imported `MOCK_STAFF` directly instead of DB | High | Fixed | Replaced with `userRepository.isActiveFieldWorker()` DB check | TC-BE-VAL-05 | Closed |
| DEF-015 | `isAdmin()` duplicated in every route file | Medium | Fixed | Centralized as `requireRole("admin")` middleware | TC-BE-RBAC-01 to TC-BE-RBAC-06 | Closed |
| DEF-016 | No `is_active` flag; workers could not be deactivated | Medium | Fixed | Added `is_active` column to `users` table; `listActiveFieldWorkers()` filters by it | Manual: deactivated workers excluded from assignment list | Closed |
| DEF-017 | `authenticatedUser()` used O(n) in-memory lookup for token validation | High | Fixed | Replaced with stateless JWT verification (O(1)) | TC-BE-AUTH-01 to TC-BE-AUTH-10 | Closed |
| DEF-018 | Seed SQL inserted placeholder text (`PASTE_WORKER_HASH_HERE`) in `users.password_hash` | High | Fixed | Updated users table with real bcrypt hashes generated via `bcryptjs` | TC-BE-AUTH-01 | Closed |
| DEF-019 | `requests.ts` route handler duplicated the `POST /` block twice in the file | Low | Fixed | Removed duplicate block; single handler now used | `npm run typecheck` passes | Closed |
| DEF-020 | Login rate limiter (10 attempts per 15 min) blocked automated test suites; false 429 responses masked real failures | Low | Fixed | Rate limiter bypassed when `DISABLE_RATE_LIMIT=1`; threshold raised to 1000 in non-production | TC-BE-AUTH-01 to TC-BE-AUTH-10 | Closed |
| DEF-021 | Frontend `add()` wrote only to localStorage; reports never reached the backend API | High | Fixed | Updated `src/persistence/requestRepository.ts` `add()` to `POST /api/requests`; caller in `report.tsx` awaits the call | Manual E2E: submit via UI → report appears in Supabase | Closed |
| DEF-022 | Vite import path `./public/styles.css` from `src/main.tsx` resolved incorrectly; frontend failed to load | Medium | Fixed | Changed import to `../public/styles.css` | Frontend loads at http://localhost:5173 | Closed |
| DEF-023 | Root `package.json` scripts referenced obsolete path `src/server/index.ts` after backend migration | Medium | Fixed | Updated root scripts to `cd backend && npm run dev`; added `dev:all` via `concurrently` | `npm run dev:all` starts both services | Closed |
| DEF-024 | Supabase Direct Connection uses IPv6; failed on team's network | High | Fixed | Switched to Session Pooler connection string (IPv4-compatible) | `/health` returns `{"ok":true,"db":"connected"}` | Closed |
| DEF-025 | Seed SQL inserted placeholder hashes instead of real bcrypt values; login failed with 500 | High | Fixed | Updated `users.password_hash` with real bcrypt hashes | Login succeeds with valid credentials | Closed |
| DEF-026 | `transitions.test.ts` created empty (no `describe()` block); Vitest reported "No test suite found" | Low | Fixed | Populated with 6 test cases (TC-BE-TRANS-01 to TC-BE-TRANS-06) | All 6 tests pass | Closed |
| DEF-027 | Password hash verification type cast failed TypeScript strict mode | Low | Fixed | Changed to `jwt.JwtPayload & { sub: string; role: Role }` intersection type | `npm run typecheck` passes | Closed |
| DEF-028 | `requestRepository.create()` call from `requests.ts` failed TypeScript structural check | Low | Fixed | Added `as ServiceRequest` cast with imported type | `npm run typecheck` passes | Closed |

---

## Defect Severity Scale

| Severity | Definition |
|----------|------------|
| **Critical** | Blocks core functionality or exposes security vulnerability; must be fixed before release |
| **High** | Significant functional break or data correctness issue; fix required for M3 |
| **Medium** | Functional gap or quality issue; fix preferred, may be deferred with justification |
| **Low** | Cosmetic or minor issue; may be accepted as technical debt |

---

## Summary

| Metric | Count |
|--------|-------|
| Total defects recorded | 28 |
| Closed (fixed and verified) | 28 |
| Open | 0 |
| Won't Fix | 0 |

---

## Notes

- Defects DEF-001 to DEF-019 were identified during M3 backend rewrite.
- Defects DEF-020 to DEF-028 were identified during M3 test suite construction and frontend integration.
- All defects are closed with regression evidence linking to test cases or manual verification.
- See Technical Debt Register for accepted residual compromises.
