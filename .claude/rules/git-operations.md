# Git operations

## Iron rule

**NEVER commit or push directly to `main`.**
Only: branch → commits → `push` → Pull Request → review → merge.

### Documented exception (one-shot)

`/bootstrap` in **Mode A (fresh project)** performs the very first commit and `git push -u origin main` because there is no branch protection yet and no reviewers — this is the bootstrap commit that lays down the initial scaffold (the Vite+MUI app + `.claude/` config). After that commit, `/bootstrap` immediately enables branch protection on `main`, and from that moment the iron rule applies again.

All other `/bootstrap` work (Mode B resume) and every other command (feature pipelines, `/fix-ci`, etc.) goes through a PR.

## Branches

- Naming: `feat/<slug>`, `fix/<slug>`, `chore/<slug>`, `docs/<slug>`, `test/<slug>`.
- One branch = one logical change.
- The base is always fresh: `git checkout main && git pull` before creating a branch.

## Commits (Conventional Commits)

```
feat: add todo list screen with empty/error states
fix: announce validation error to screen readers
test: add Playwright journey for creating a todo
refactor: extract useTodos hook from TodoList
docs: document the todos feature in its README
chore: bump @mui/material
```

## Workflow

```bash
git checkout main && git pull
git checkout -b feat/<slug>
# ... TDD cycle, small commits ...
git push -u origin feat/<slug>
gh pr create --fill
# review → merge (Squash) on GitHub
git checkout main && git pull   # on BOTH machines before the next task
```

## PR description (template)

```
## What
Short description of the change.

## Why
Context / user story.

## How verified
- [ ] vitest green (unit/component)
- [ ] playwright green (E2E)
- [ ] typecheck + eslint clean
- [ ] jest-axe / axe clean
- [ ] CI passed

## Notes
Edge cases, risks, next steps.
```

## Context sync between machines

At the end of a session, update and commit: `docs/WORKLOG.md`, and if needed `.claude/memory/*` and ADRs `docs/decisions/NNNN-*.md`. This is how the work history travels between computers via a plain `git pull`.

## Prohibitions

- `git push origin main` — forbidden EXCEPT the documented `/bootstrap` Mode A exception above.
- `git push --force` to shared branches — forbidden.
- Committing secrets/`.env` — forbidden (see `.gitignore`).
