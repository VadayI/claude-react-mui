# Feature verification handoff (mandatory, automatic block)

Every feature that adds or changes a screen/route MUST ship a **human-facing verification guide** so the user (or a reviewer) can confirm the slice works by driving the real UI — in the **dev server** and via ready-to-run **Playwright** steps. The automated suites prove correctness for CI; this guide is the manual, click-through smoke test a person runs against a running app. Generated automatically at the end of the feature pipeline and on demand via `/verify`.

> Why this exists: tests are green in the runner, but the user still wants a concrete "open this route / do this / expect to see this" checklist to trust the feature by hand. The guide is derived from the route/component contract, never hand-invented, so it cannot drift from the real screens.

## The deliverable — `docs/verify/<feature>.md`

One markdown file per feature (slug matches the branch/feature name), written by `docs-writer` in the **Documentation** phase (phase 6), BEFORE the PR opens. Required sections, in order:

1. **Scope** — one line: which routes/screens this feature covers.
2. **Prerequisites** — base URL (`http://localhost:5173` in dev), how to start (`npm run dev`), how to seed/auth (which MSW scenario or how to log in if hitting a real backend).
3. **Per screen** — for each `route → screen`:
   - **Manual step**: navigate to the route, what to do, what you should see (the success state).
   - **The four states**: how to trigger and what to expect for loading, empty, and error (e.g. which MSW handler/scenario forces the error).
   - **Keyboard pass**: operate the primary action using only the keyboard; focus is visible and logical.
   - **Playwright**: the spec file + the `npm run e2e -- <file>` invocation that automates this journey.
4. **Done when** — a short checklist the user ticks: success renders, all four states verified, keyboard-only works, axe clean, Playwright green.

Keep it copy-paste runnable. Routes come from `.claude/memory/routes.json`; do not invent screens the contract does not have.

## Source of truth — `.claude/memory/routes.json`

Generated from a machine-readable route registry so it always matches the real app. `ui-architect` writes/updates an entry the moment it fixes a contract (phase 2). Schema per entry:

```json
{
  "path": "/todos",
  "feature": "todos",
  "screen": "TodosPage",
  "auth": "authenticated",
  "states": ["loading", "success", "empty", "error"],
  "consumes": ["GET /api/v1/todos/", "POST /api/v1/todos/"],
  "notes": "list + create"
}
```

`auth` is one of `anonymous` | `authenticated` | `role:<name>`. `consumes` entries trace to the OpenAPI schema (@.claude/rules/api-client.md).

### Reconciliation (enforced)

After GREEN, before the PR opens, `docs-writer` reconciles routes across: `.claude/memory/routes.json` ↔ the live router (`src/app/router.tsx`) ↔ `docs/api/INDEX.md` (consumed endpoints) ↔ the OpenAPI schema. The live router + schema are the source of truth; stale registry entries are corrected/removed.

## Lifecycle (per feature)

1. **Phase 2 — contract.** `ui-architect` appends/updates the feature's routes in `.claude/memory/routes.json`.
2. **Phases 3–4 — RED/GREEN.** No verification work; the registry entry already exists.
3. **Phase 6 — docs.** `docs-writer` reconciles, generates/refreshes `docs/verify/<feature>.md`, includes it in the PR.
4. **On demand.** `/verify` regenerates it; with `--run` it executes the Playwright steps against a running app and reports pass/fail.

## Binds these agents (rule is auto-loaded)

- `ui-architect` — the contract is incomplete until the feature's routes are recorded in `.claude/memory/routes.json`.
- `docs-writer` — owns `docs/verify/<feature>.md`; runs the reconciliation and generates the guide before declaring the PR ready.
- `reviewer` — flags a PR that adds/changes a screen without a matching `docs/verify/<feature>.md` or whose `routes.json` disagrees with the router.
- `tester` — the states and keyboard/error paths listed in the guide must each correspond to a real test; the guide is the manual mirror of those tests.

> Goal: the moment a feature is green, the user has a concrete, contract-derived "open these routes, do this, expect this" guide — generated, never guessed.
