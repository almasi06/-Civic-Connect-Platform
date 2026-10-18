# Contributing to CivicConnect

This document defines how the team collaborates on the CivicConnect repository.

## Branching Model

We use a modified **GitHub Flow** tailored for this project's delivery:
- `main` / `SRC` - protected, stable codebases
- `Documentation` - protected, documentation integration
- `SRC-UPDATE` - **Active M3/M4 integration branch for final product delivery**
- `CI_Workflow` - dedicated branch for CI/CD pipeline setup
- `docs/architecture-updates` - specific architectural documentation tasks
- `*-patch-*` - short-lived branches for direct web-based fixes


## Commits

Rules:
- Reference the issue in the body where applicable: `Closes #12`
- Don't commit secrets or credentials
- Don't commit `node_modules/`, `dist/`, `.env`

## Pull Requests & Finalisation Exceptions

For standard feature development, every substantive change goes through a Pull Request. No direct pushes to `main` or `SRC`.

**M4 Finalisation Exception:**
During the M4 Finalisation and Consolidation period, the team identified a critical "integration wall" between the frontend and backend. To resolve critical end-to-end integration blockers (such as the CI pipeline failing on missing DB connections, TypeScript compilation errors, and broken worker assignment transactions) before the final release freeze, **direct pushes to the `SRC-UPDATE` integration branch were explicitly permitted by the team.** 

### Standard PR requirements (for feature branches)
- **Title:** `<type>(<scope>): <description>` (same style as commits)
- **Description:** Fill out the pull request template — no blank PRs
- **Link to issue:** Use `Closes #N` in the description
- **Reviewers:** Request at least **2 reviewers** (team rule)
- **CI:** Must pass the `build-and-test` job before merge
- **No secrets:** Never commit `.env`, API keys, or credentials

### Review requirements
- **2 approvals required** before merge
- **Meaningful review** - comment on at least one technical point
- **No rubber-stamping** - "LGTM" alone is not a valid review
- **Address feedback** - reply to comments before re-requesting review

## Merge strategy
- **Squash and merge** — one commit per PR to keep history clean
- Delete the branch after merge
- Do not force-push to shared branches

## Secrets and configuration
- Never commit `.env` or credentials
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
