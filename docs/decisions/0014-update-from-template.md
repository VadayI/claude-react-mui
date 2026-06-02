# 0014. Update a derived project from the template

Status: accepted · 2026-06-02

## Context

Derived frontends should be able to pull framework improvements (agents, commands, skills, rules, gates, CI) without losing their own code.

## Decision

`/update-from-template [url]` runs the `template-sync` agent, which classifies files by ownership: **template-owned** (`.claude/agents`, `.claude/commands`, `.claude/skills`, `.claude/rules`, `scripts/`, gate scripts) are updated; **merge-by-hand** (`CLAUDE.md`, `.claude/settings.json`, CI workflow) are diffed for manual reconciliation; **project-owned** (`src/`, `docs/`, `.env`) are left untouched. It operates via a PR, never a direct push to `main`.

## Consequences

- Framework upgrades are reviewable and reversible.
- Clear ownership boundaries prevent clobbering project code.
