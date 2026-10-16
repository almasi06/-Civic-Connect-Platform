# Rollback Plan

## Purpose

If the release candidate fails in staging or production, this plan describes how to restore a known good state.

## Rollback triggers

Rollback is triggered by any of:

- A critical defect that cannot be fixed quickly
- CI fails on the release candidate after deployment
- Staging E2E tests fail in a way that indicates deployment problems
- Data corruption or loss
- A security incident

## Version to roll back to

| Scenario | Rollback target |
|---|---|
| Staging rollback | Previous deployment on the same host |
| Production rollback (future) | Last known-good release tag |

## Rollback procedure (staging)

1. **Identify the last known-good commit or deployment**
2. On the PaaS dashboard (Render/Railway/Fly), click "Rollback" to the previous deployment
3. **OR** manually deploy the previous tag:
4. Verify the app is reachable at the staging URL
5. Run the critical E2E journey to confirm the rollback works
6. Document the incident in the defect register

## Data considerations

**Application rollback does not roll back database state.**

If the release candidate made schema changes:

- Do **not** auto-rollback the database
- Determine whether the schema change is additive (safe) or destructive
- If additive: leave the schema in place; the older app version may still work
- If destructive: restore from the most recent backup (see backups below)

## Backups

| Backup type | Frequency | Retention | Location |
|---|---|---|---|
| Managed Postgres backup | Daily (auto) | 7 days (free tier) | Host-managed |
| Manual pre-deploy snapshot | Before each deploy | Manual | *(fill in)* |

## Post-rollback actions

1. Log the incident in the defect register
2. Update the risk register if a new risk emerged
3. Root-cause the failure before re-attempting deployment
4. Update this plan if the rollback procedure needed adjustment

## Testing the rollback plan

The rollback procedure should be tested at least once before the M3 presentation:

- [ ] Deploy to staging
- [ ] Confirm rollback to previous deployment works
- [ ] Verify data integrity after rollback
- [ ] Record the tested procedure here