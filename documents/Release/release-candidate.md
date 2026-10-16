# Release Candidate


## Included Scope

Verified requirements:

- FR-01 (submit request)
- FR-03 (map by department)
- FR-04 (RBAC status transitions)
- FR-05 (status notifications)
- FR-06 (track by number)
- FR-10 (search/filter/sort)
- FR-11 (assign/accept)
- FR-12 (authentication)
- FR-14 (acknowledgment receipt)
- NFR-03 (HTTPS/TLS)
- NFR-05 (uptime — health endpoint)
- NFR-08 (session timeout)
- NFR-11 (timezone consistency)
- NFR-12 (error handling)

Test artefacts:

- 60+ tests across unit / integration / E2E / negative
- CI pipeline (`build-and-test` blocking gate)
- Security pipeline (CodeQL + gitleaks)

## Excluded from M3

In development (partial implementation):

- FR-02, FR-07, NFR-01 (offline sync endpoint exists; timing not tested)
- NFR-02 (performance script placeholder only)

Deferred to M4 or post-M3:

- FR-08, FR-09, FR-13, FR-15
- NFR-04, NFR-06, NFR-07, NFR-10

## Freezing Process

1. Confirm all critical PRs merged into `Documentation`
2. Confirm CI is green on latest commit
3. Run full test suite locally
4. Tag the commit: `git tag -a m3-release-v1.0 -m "M3 release candidate"`
5. Push the tag: `git push origin m3-release-v1.0`
6. Update this document with the commit hash

## Identifying the Assessed Version

The assessor marks **the exact commit identified above**. Any changes made after the freeze are not part of the submitted milestone unless explicitly authorised.

## Post-Freeze Changes

If a critical defect requires a fix after freeze:

1. Open a new PR targeting `Documentation`
2. Reference the defect ID from the defect register
3. Get 2 approvals
4. Merge
5. Tag a new release candidate: `m3-release-v1.1`
6. Update this document