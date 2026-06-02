# 0013. File-size limit: 400 lines for src/

Status: accepted · 2026-06-02

## Context

The backend caps files at 800 lines. React files should be smaller: a large component is almost always several components or a missing hook.

## Decision

No file under `src/` may exceed **400 lines** (`wc -l`). Generated files (`src/lib/api/schema.d.ts`, `*.d.ts`) are exempt. Enforced by `scripts/check_file_size.sh` in CI and locally. When a file grows: extract child components, extract a hook, or split a barrel into focused modules and re-export from `index.ts` so import paths stay stable. `code-structure-auditor` proposes the split (`/structure-audit`).

## Consequences

- Pressure toward small, single-responsibility components and the container/presentational split.
- Tighter limit than the backend, matching frontend idiom.
