---
model: sonnet
---

Generate or refresh `docs/verify/<feature>.md` from `.claude/memory/routes.json` and the live router — a human-facing click-through + keyboard + Playwright checklist per `@.claude/rules/verification.md`. With `--run`, execute Playwright steps against a running app.

## Log

```bash
node scripts/log-cmd.mjs /verify "$ARGUMENTS"
```

## Steps

### 1. Identify feature scope

If `$ARGUMENTS` contains a feature name or slug (e.g., `billing` or `--feature billing`), scope to that feature. Otherwise use the feature from the most recent PR or `git branch --show-current` to infer the slug.

Detect `--run` flag in `$ARGUMENTS` to determine if Playwright execution is requested.

### 2. Gather sources

Delegate to `docs-writer` with:

- `.claude/memory/routes.json` — the route registry (updated by `ui-architect` at contract phase).
- `src/routes/index.tsx` — live router definition (source of truth).
- `src/features/<feature>/` — component surface.
- `docs/api/openapi.yml` — backend contract (for any API calls the feature makes).
- Existing `docs/verify/<feature>.md` if present (refresh case).

### 3. Three-way reconciliation

Before generating, `docs-writer` MUST reconcile:

```
.claude/memory/routes.json  <->  src/routes/index.tsx  <->  docs/api/INDEX.md
```

`src/routes/index.tsx` is the source of truth. If `routes.json` or `INDEX.md` disagree (renamed path, removed route), correct them to match. Remove stale entries.

### 4. Generate docs/verify/<feature>.md

Required sections:

1. **Scope** — which routes and UI flows this feature covers.
2. **Prerequisites** — dev server running (`npm run dev`, `http://localhost:5173`), auth credentials if required.
3. **Per route / flow** — for each route:
   - **Manual click-through**: what to navigate to, what to interact with, expected visual result.
   - **Four states**: loading, success, empty, error — how each manifests and what to verify.
   - **Keyboard pass**: tab order, Enter/Space activation, Escape dismissal, focus management.
   - **Playwright step reference**: which `e2e/*.spec.ts` file covers this flow.
4. **Accessibility spot-check**: headings hierarchy, alt text, form labels, color-not-only cues.
5. **Done when** — checklist the user ticks: all states render correctly, keyboard navigable, no console errors, Playwright green.

### 5. If --run: execute Playwright

```bash
npm run e2e -- --grep "<feature>"
```

Capture output. Append a `## Playwright run results` section to the verify doc with timestamp and pass/fail count.

### 6. Commit

```bash
git add docs/verify/<feature>.md .claude/memory/routes.json docs/api/INDEX.md
git commit -m "docs: generate verification guide for <feature>"
```

Report path to the generated file and any reconciliation corrections made.

<!-- last reviewed: 2026-06-02 -->
