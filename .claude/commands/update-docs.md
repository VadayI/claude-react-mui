---
model: sonnet
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
- `src/routes/` — `docs/api/INDEX.md` route list and guides may need updating.
- `src/lib/api/types.ts` — API surface changed; `docs/api/INDEX.md` needs reconciliation.
- Any auth-related file — `docs/guides/developer.md` Authentication section.

### 2. Dispatch docs-writer
Delegate to `docs-writer` with the change list:

**Feature READMEs** (`src/features/<name>/README.md`):
- Run `bash scripts/check_feature_readmes.sh` to find missing READMEs.
- For changed features: update Purpose, Component surface, Routes, State management, API dependencies, Decisions sections.
- Reconcile the feature's exposed routes against `src/routes/index.tsx`.

**`docs/api/INDEX.md`**:
- Update the route index to match `src/routes/index.tsx`.
- Each route entry: method-equivalent (GET navigation), path, feature, auth requirement, notes.
- Remove entries for deleted routes; add entries for new ones.

### 3. Dispatch guide-writer (conditional)
Only if any of these changed: routes, auth flow, first-start steps, npm scripts.

Instruct `guide-writer` to run the reconciliation from `@.claude/rules/user-guides.md`:
- Every route in `docs/guides/user.md` must exist in `src/routes/`.
- Every command in `docs/guides/developer.md` must exist in `package.json` scripts.

### 4. Commit
```bash
git add docs/ src/features/
git commit -m "docs: update feature READMEs and docs/api/INDEX.md"
```

Report what was updated and any remaining {TODO} markers that need human input.

<!-- last reviewed: 2026-06-02 -->
