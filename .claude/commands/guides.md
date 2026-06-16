---
model: sonnet
---

Regenerate or refresh `docs/guides/user.md` and `docs/guides/developer.md` via `guide-writer`, reconciling content against live routes, npm scripts, and the backend OpenAPI schema per `@.claude/rules/user-guides.md`.

## Log

```bash
node scripts/log-cmd.mjs /guides "$ARGUMENTS"
```

## Steps

### 1. Gather sources

Collect the authoritative inputs that the guides must reflect:

- **Live routes**: `src/app/router.tsx` (or wherever React Router routes are defined).
- **npm scripts**: `package.json` `scripts` section.
- **API schema**: `src/lib/api/openapi.yml` (committed) and `src/lib/api/schema.d.ts` (generated).
- **Existing guides**: `docs/guides/user.md`, `docs/guides/developer.md`.
- **Feature READMEs**: `src/features/*/README.md`.
- **Verification docs**: `docs/verify/*.md`.

### 2. Dispatch guide-writer

Delegate to `guide-writer` with all gathered sources. Instructions:

**`docs/guides/user.md`** must contain:

1. Overview — what the app does, who it's for.
2. First use — URL, login/auth flow with copy-paste steps, first action end to end.
3. Key features — one paragraph per top-level route/feature.
4. Where to get help — links to API consumer guide, Swagger UI.

**`docs/guides/developer.md`** must contain:

1. Overview — stack, repo structure.
2. First start — prerequisites, `cp .env.example .env` + which vars to fill, `npm install`, `npm run dev`. Copy-paste runnable, dev URL `http://localhost:5173`.
3. Running tests — `npm run test`, `npm run e2e`, coverage.
4. Generating API types — `npm run api:pull && npm run api:types`, when to re-run.
5. Gate scripts — list all four scripts and when they run.
6. Adding a feature — brief pointer to the pipeline in `CLAUDE.md`.
7. Where to go next — links to `docs/guides/user.md`, `docs/api/INDEX.md`, Swagger UI.

### 3. Reconciliation (anti-drift)

Before declaring guides ready, `guide-writer` MUST verify:

- Every route mentioned in `user.md` exists in `src/app/router.tsx`.
- Every npm script mentioned in `developer.md` exists in `package.json`.
- Every API endpoint mentioned traces to `src/lib/api/openapi.yml`.
- No invented commands or routes.

### 4. Commit

If any changes were made, stage and commit on the current branch (must not be `main`):

```bash
git add docs/guides/
git commit -m "docs: refresh user and developer guides"
```

<!-- last reviewed: 2026-06-02 -->
