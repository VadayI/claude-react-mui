# 0003. `/bootstrap` command with Mode A (fresh) and Mode B (resume)

Status: accepted · 2026-06-02

## Context

Standing up a new frontend (Vite app, configs, test infra, CI, docs, first feature) is a distinct, one-time operation that does not fit the feature pipeline.

## Decision

`/bootstrap` is a binary command, not a pipeline stage. **Mode A** (fresh repo) scaffolds the Vite+MUI app from `templates/`, initializes `docs/`, copies the gate scripts, adds CI, performs the single allowed `git push -u origin main`, then enables branch protection. **Mode B** (existing-incomplete) PRs each missing piece. `/doctor` detects which scenario applies and recommends the next step.

## Consequences

- The one documented exception to PR-only (the very first commit) is contained in Mode A; everything after goes through PRs.
- Derived projects can also be created by using this repo as a GitHub template.
