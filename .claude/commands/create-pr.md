---
model: sonnet
argument-hint: "[title] [--draft]"
---

Open a Pull Request for the current branch via `gh pr create` using the PR template from `@.claude/rules/git-operations.md`. Refuses to run on `main`.

## Log

```bash
node scripts/log-cmd.mjs /create-pr "$ARGUMENTS"
```

## Steps

### 1. Branch guard

```bash
git branch --show-current
```

If current branch is `main` → STOP:

> Refusing to open a PR from `main`. Create a feature branch first: `git checkout -b feat/<slug>`.

### 2. Pre-PR checks

Run these and report results before opening the PR. Block on failures:

- `npm run typecheck` — must be clean.
- `npm run lint` — must be clean.
- `npm run test:run` — must pass.
- `bash scripts/check_types_drift.sh` — no drift.
- `bash scripts/check_contract_sync.sh` — vendored contract matches the pin.
- `bash scripts/check_stubs.sh` — no unlogged stubs.
- `bash scripts/check_file_size.sh` — no file over 400 lines.
- `bash scripts/check_feature_readmes.sh` — every feature has a README.
- `bash scripts/check_plan_sync.sh` — non-trivial PR has an updated plan.
- `bash scripts/check_routes_registry.sh` — router change reconciled with routes.json + docs/verify.
- `bash scripts/check_guides_sync.sh` — route/auth change updates docs/guides.
- `npm run build && bash scripts/check_bundle_size.sh` — bundle within budget.

### 3. Gather PR metadata

- Read the branch name to infer the type and slug.
- Summarize commits since the branch diverged from `main`: `git log main..HEAD --oneline`.
- Detect which files changed: `git diff --name-only main..HEAD`.

### 4. Compose PR description using the template

```
## What
<summarize the change in 2-3 sentences>

## Why
<context / user story / ticket reference if known>

## How verified
- [ ] npm run test:run — green
- [ ] npm run typecheck — clean
- [ ] npm run lint — clean
- [ ] bash scripts/check_types_drift.sh — no drift
- [ ] CI passed

## Notes
<edge cases, risks, follow-up work>
```

### 5. Open the PR

```bash
gh pr create --title "<conventional-commit-style title>" --body "<description above>" --base main
```

If `$ARGUMENTS` contains a draft flag or title override, use it.

Report the PR URL on success.

<!-- last reviewed: 2026-06-02 -->
