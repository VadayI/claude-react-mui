---
model: sonnet
argument-hint: "[feature | file]"
---

Update project documentation (feature READMEs, `docs/api/INDEX.md`, and guides) to match the latest code changes. Delegates to `docs-writer` and `guide-writer`.

## Log

```bash
node scripts/log-cmd.mjs /update-docs "$ARGUMENTS"
```

## Steps

### 1. Detect what changed

```bash
git diff --name-only main..HEAD
```

If `$ARGUMENTS` specifies a feature or file scope, narrow to that. Classify changed files:

- `src/features/<name>/` — feature README may need updating.
- `src/app/router.tsx` — `.claude/memory/routes.json`, `docs/verify/`, and guides may need updating.
- `src/lib/api/schema.d.ts` — API surface changed; `docs/api/INDEX.md` needs reconciliation.
- Any auth-related file — `docs/guides/developer.md` Authentication section.

### 2. Dispatch docs-writer

Delegate to `docs-writer` with the change list:

**Feature READMEs** (`src/features/<name>/README.md`):

- Run `bash scripts/check_feature_readmes.sh` to find missing READMEs.
- For changed features: update Purpose, Component surface, Routes, State management, API dependencies, Decisions sections.
- Reconcile the feature's exposed routes against `src/app/router.tsx`.

**`docs/api/INDEX.md`**:

- Update the **consumed-endpoints** index to match `src/lib/api/schema.d.ts` / `src/lib/api/openapi.yml` (@.claude/rules/api-contract.md) — the list of API endpoints the UI calls, NOT a UI route list (routes live in `.claude/memory/routes.json` + `docs/verify/`).
- Each entry: HTTP method + path, the feature that consumes it, auth requirement, notes.
- Add entries for newly consumed endpoints; remove entries no longer called.

### 3. Dispatch guide-writer (conditional)

Only if any of these changed: routes, auth flow, first-start steps, npm scripts.

Instruct `guide-writer` to run the reconciliation from `@.claude/rules/user-guides.md`:

- Every route in `docs/guides/user.md` must exist in `src/app/router.tsx`.
- Every command in `docs/guides/developer.md` must exist in `package.json` scripts.

### 4. Commit

```bash
if [ "$(git branch --show-current)" = "main" ]; then echo "Refusing to commit on main — create a feature branch first."; exit 1; fi
git add docs/ src/features/
git commit -m "docs: update feature READMEs and docs/api/INDEX.md"
```

Report what was updated and any remaining {TODO} markers that need human input.

<!-- last reviewed: 2026-06-02 -->
