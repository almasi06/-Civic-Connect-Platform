# Contributing to CivicConnect

This document defines how the team collaborates on the CivicConnect repository.

## Branching Model

We use **GitHub Flow**:
- `main` - protected, production-ready
- `Documentation` - protected, current integration branch
- Feature branches - short-lived, one per task, deleted after merge

### Branch naming

| Prefix | Use for |
|---|---|
| `feat/` | New feature |
| `fix/` | Bug fix |
| `docs/` | Documentation |
| `refactor/` | Code refactoring |
| `test/` | Test additions or fixes |
| `ci/` | CI/CD changes |
| `m3/member1-*` | M3 work by Member 1 |
| `m3/member2-*` | M3 work by Member 2 |
| `m3/member3-*` | M3 work by Member 3 |

Examples:
- `feat/citizen-submit-request`
- `fix/status-transition-rollback`
- `m3/member3-ci-workflow`

## Commits

Follow Conventional Commits:

```
<type>(<scope>): <short description>

[optional longer body]

[optional footer with issue reference]
```

| Type | Use for |
|---|---|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `test` | Test additions/changes |
| `chore` | Build, CI, tooling |
| `refactor` | Code changes that neither add features nor fix bugs |

Examples:
- `feat(workflow): add status transition state machine`
- `fix(auth): reject expired JWT tokens`
- `docs(ped): add M3 overview section`
- `test(api): add negative tests for status transition`
- `ci(workflows): add security scan workflow`

Rules:
- Reference the issue in the body: `Closes #12`
- Don't commit secrets or credentials
- Don't commit `node_modules/`, `dist/`, `.env`

## Pull Requests

Every substantive change goes through a Pull Request. No direct pushes to `main` or `Documentation`.

### PR requirements

- **Title:** `<type>(<scope>): <description>` (same style as commits)
- **Description:** Fill out the pull request template — no blank PRs
- **Link to issue:** Use `Closes #N` in the description
- **Reviewers:** Request at least **2 reviewers** (team rule)
- **CI:** Must pass the `build-and-test` job before merge
- **No secrets:** Never commit `.env`, API keys, or credentials

### Review requirements

- **2 approvals required** before merge
- **Meaningful review** — comment on at least one technical point
- **No rubber-stamping** — "LGTM" alone is not a valid review
- **Address feedback** — reply to comments before re-requesting review

## Merge strategy

- **Squash and merge** — one commit per PR to keep history clean
- Delete the branch after merge
- Do not force-push to shared branches

## Secrets and configuration

- Never commit `.env` or credentials
- Use `.env.example` as a template
- Real secrets go in the environment (host env vars, CI secrets)
- `.gitignore` excludes `.env` and other sensitive files

## AI usage

All AI-assisted contributions must be:
1. Understood by the contributor
2. Verified against authoritative sources or tests
3. Recorded in `documents/Project_Engineering_Document/16-ai-usage-register.md`

The statement "AI generated it" is not an acceptable explanation.

## Testing expectations

- Every PR that changes behaviour must include tests
- Tests must have a traceable basis (requirement, risk, defect)
- Tests must have a meaningful assertion (not trivial)
- CI must pass before merge

## Getting help

- Check the PED, ADRs, and RTM in `documents/`
- Ask in the team channel
- Open an issue with the `question` label if you're blocked