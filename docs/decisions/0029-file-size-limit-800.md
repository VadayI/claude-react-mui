# 0029. File-size limit: 800 lines for src/ (supersedes 0013)

Status: accepted · 2026-06-25 · supersedes [0013](0013-file-size-limit-400.md)

## Context

ADR 0013 set the `src/` file-size limit to 400 lines — deliberately tighter than the backend's 800-line cap — to pressure components toward the container/presentational split. In practice the 400-line ceiling forced premature splits on legitimately cohesive units (data-router tables, theme definitions, complex-but-single-responsibility forms), adding indirection without improving readability.

## Decision

No file under `src/` may exceed **800 lines** (`wc -l`), matching the backend cap. Generated files (`src/lib/api/schema.d.ts`, `*.d.ts`) remain exempt. Enforced by `scripts/check_file_size.sh` in CI and locally (`MAX_LINES` default raised 400 → 800). The split guidance is unchanged: when a file grows past the limit, extract child components, extract a hook, or split a barrel into focused modules and re-export from `index.ts` so import paths stay stable. `code-structure-auditor` proposes the split (`/structure-audit`); its ⚠️ "approaching" band moves to 700–800.

## Consequences

- Fewer forced, artificial splits; cohesive units may stay in one file up to 800 lines.
- Frontend and backend now share the same 800-line ceiling (the "tighter than backend" rationale of 0013 is retired).
- Splitting stays driven by responsibility, not line count — 800 is a hard ceiling, not a target.

## Supersedes

- 0013 (400-line limit).
