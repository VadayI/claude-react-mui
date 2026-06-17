# Plan 0004 — Stack upgrade to latest (React 19 / MUI 9 / React Router 7 / TS 6 / Node 24 / ESLint 10)

> Status: 🟡 IN PROGRESS · seeded 2026-06-16 · Driver: staged stack-upgrade initiative — bring the template to current stable across runtime + tooling.
> Type: infra / config-template change (dependency + tooling bumps, CI, env scripts). PR A involves no production-logic changes beyond minimal TS6/ESLint10 fallout fixes.
>
> **Living plan** — discipline in `.claude/rules/living-plan.md`. The orchestrator seeds this file at the start of a non-trivial task and keeps the **Status table** + **Execution log** current as the pipeline runs. Body decisions are never rewritten in place — a changed decision goes to **Amendments** with an inline pointer next to the original.

## Status

| Step                                                              | State       | Owner        |
| ----------------------------------------------------------------- | ----------- | ------------ |
| PR A — Tooling (TypeScript 6 · Node 24 floor · ESLint 10 + bumps) | done        | orchestrator |
| PR B — React 18.3 → 19 (+ react-dom, @types/react\*)              | done        | orchestrator |
| PR C — MUI 6 → 9 (@mui/material, @mui/icons-material, emotion)    | done        | orchestrator |
| PR D — React Router 6 → 7 (data router migration)                 | done        | orchestrator |
| PR E — TanStack Query / Zustand + final sweep                     | pending     | orchestrator |

> States: `pending` · `in_progress` · `done` · `blocked`. This table is the cursor — update it as steps move.

## Goal

Move `claude-react-mui` from its current pins to the latest stable stack, in five independent, individually-reviewable PRs so that each major migration carries its own tests, changelog read, and (where needed) ADR. PR A lands the **tooling foundation** first — TypeScript 6, the Node 24 engine floor, ESLint 10 and the supporting lint/test toolchain — so the later framework PRs build on a current compiler and linter.

## Approach

Sequence the upgrade by blast radius, tooling first:

- **PR A (this PR) — tooling only.** Bump TypeScript → 6, ESLint → 10 and its plugin ecosystem (typescript-eslint, react-hooks, jsx-a11y, prettier), Vitest/coverage/jsdom/plugin-react, and Vite. Raise `engines.node` to `>=24` and update CI (`frontend-ci.yml` ×2) + env scripts (`detect-env.mjs`, `setup-wsl.sh`) to the Node 24 floor. React, react-dom, @mui/\*, react-router-dom, @tanstack/\*, and zustand are LEFT UNTOUCHED. ESLint 10 has a transient peer-dep gap with some plugins → resolve via a committed npm mechanism that also satisfies CI `npm ci`.
- **PR B–E** then migrate the runtime frameworks one ecosystem at a time, each on the green PR-A tooling baseline, each with its own changelog read and ADR where the major bump warrants one (React 18→19, MUI 6→9, Router 6→7).

Edits on this 9p/`/mnt` mount go through `/dev/shm` scratch + `cp` + re-read verification (never the Edit/Write tools, which truncate here). Git is owned by the user in a separate shell — this plan body is the only durable record the orchestrator writes.

## Steps

1. Bump tooling devDependencies + `engines.node` in `package.json`.
2. Resolve the ESLint 10 peer conflict so both `npm install` and `npm ci` succeed.
3. `npm install`; confirm `package-lock.json` regenerated.
4. tsconfig migration for TS 6 (moduleResolution already `bundler`; add stopgaps only if deprecations error).
5. ESLint flat-config migration to the react-hooks 7.x API.
6. Run the full local gate suite to GREEN; fix TS6/ESLint10 fallout in `src/` minimally.
7. CI + scripts Node 22 → 24 (`frontend-ci.yml` ×2 identical; `detect-env.mjs`; `setup-wsl.sh`).
8. Final grep verification of stale tooling tokens.

## Verification

`npm run typecheck`, `npm run lint`, `npm run test:run`, `npm run build`, and the CI gate scripts (`check_stubs`, `check_file_size`, `check_feature_readmes`, `check_contract_sync`, `check_types_drift`, `check_bundle_size`), plus `npm audit --audit-level=high`. PR-aware / git-dependent gates (`check_plan_sync`, `check_routes_registry`, `check_guides_sync`, and `check_types_drift`'s git-diff path) are validated authoritatively by CI, not the stale sandbox git. File integrity confirmed by re-reading each edited file (NUL=0, JSON parses).

## Open questions

- [x] ESLint 10 peer-dep mechanism (legacy-peer-deps vs overrides) — finalize and record the supply-chain tradeoff in the upgrade ADR. (Resolved: `.npmrc legacy-peer-deps=true` committed; ADR 0023 records the tradeoff.)
- [x] Whether any TS 6 deprecation needs `ignoreDeprecations: "6.0"` as a documented stopgap. (Resolved: not needed — `moduleResolution: "bundler"` was already set; no TS-6 deprecation errors encountered.)

## Execution log

- 2026-06-16 — plan seeded; PR A started — tooling (TS6 / Node24 / ESLint10).

- 2026-06-16 — PR A engineering green: package.json tooling bumped (TS6 / ESLint10 / vitest4.1.9 / jsdom29.1.1); .npmrc legacy-peer-deps added (eslint-plugin-jsx-a11y / openapi-typescript peer gaps); @testing-library/dom@^10.4.1 declared (peer no longer auto-installed); eslint.config.js → reactHooks.configs['recommended-latest'].
- 2026-06-16 — gates: typecheck PASS · lint PASS (17 react-hooks rules) · tests PASS (13 files / 82 tests, run in batches — full-suite wall-clock blocked only by slow 9p jsdom startup) · build PASS (tsc -b + vite build to alt out-dir; in-place dist blocked by 9p EPERM on stale dist) · check_stubs/file_size/feature_readmes/types_drift/bundle_size PASS · npm audit (high) PASS (2 moderate only) · check_contract_sync SKIPPED (sandbox proxy 403 on GitHub raw) · plan/routes/guides git-gates trivially OK (stale sandbox git). tsconfig needed NO migration (already moduleResolution: bundler). No src/ logic changes required; schema.d.ts regenerated from openapi.yml (was a truncated 9p artifact).
- 2026-06-16 — PR A docs + ADR 0023 written; doc version strings (TS/Node/ESLint) updated across CLAUDE.md, README.md, .claude/rules, .claude/commands, .claude/agents, .claude/skills, docs/decisions/README.md, docs/WORKLOG.md; docs/plans/0004 Execution log current.
- 2026-06-16 — PR A gates green locally: typecheck/lint/test 82/build/bundle 169.8 KB/audit; contract-sync + PR-aware gates (plan-sync, routes-registry, guides-sync) deferred to CI (git-dependent, stale sandbox git).
- 2026-06-16 — Quality gate: 2×🟡 fixed (detect-env ADR ref 0019 → 0023; openapi-ts/TS6 + jsx-a11y/eslint10 peer risks logged in docs/lessons.md). Gate PASS.

- 2026-06-16 — PR B: react 19.2.7 / react-dom 19.2.7 / @types/react 19 / @types/react-dom 19 installed; @testing-library/react 16.3.2; codebase was already React-19-clean (0 src changes required); RequireAuth.test.tsx act() fix applied.
- 2026-06-16 — PR B: 82/82 tests green; bundle 183.53 KB gz; budget raised 180→188 KB (ADR 0024; React 19 runtime ~3.5 KB gz); docs + ADR 0024 written.

- 2026-06-16 — PR B quality gate: PASS with nits — fixed 6 stale 'React 18' doc strings + upgrade-policy React line + ADR 0024 version text; probe*.test.tsx and dist2/ to be removed by user in WSL (9p EPERM).

- 2026-06-17 — PR C: @mui/material + @mui/icons-material ^6.1.6 → ^9.1.1; emotion unchanged (peer satisfied by ^11.13.3/^11.13.0). Codemod-driven changes: AddArticleForm.tsx inputProps→slotProps.htmlInput; ArticleList.tsx system color→sx + secondaryTypographyProps→slotProps.secondary (3 real changes, rest no-op).
- 2026-06-17 — PR C: vitest.config.ts server.deps.inline added (/@mui\// + react-transition-group) for MUI 9 ESM extensionless resolution; no test assertion changes required.
- 2026-06-17 — PR C: 82/82 tests green; bundle 188.38 KB gz; budget raised 188→190 KB (ADR 0025; MUI 9 single-bundle initial JS = 188.38 KB; code-splitting deferred as structural perf task). Typecheck/lint/build/audit (0 high)/stubs/file-size/feature-readmes/types-drift all green.
- 2026-06-17 — PR C: ADR 0025 written (docs/decisions/0025-upgrade-mui-9.md); decisions/README.md updated; doc version strings updated (MUI 6→9) across CLAUDE.md, README.md, templates/PROJECT_README.md, templates/PROJECT.md, .claude/commands/{preflight,bootstrap,synthesize-brief}.md, .claude/agents/{react-developer,brief-synthesizer}.md, .claude/rules/upgrade-policy.md, .claude/skills/mui-theming/SKILL.md, renovate.json, templates/renovate.json; .performance-budget.json initialJsGzipKb 188→190.

- 2026-06-17 — PR D: react-router-dom 6.30.4 removed; react-router ^7.18.0 added (single consolidated package). 8 import sites rewritten: src/main.tsx → react-router/dom (DOM renderer); remaining 7 (including test files) → react-router. Future-flag de-risk applied on v6 then removed post-bump (v7 defaults). No json()/defer()/useLoaderData usage; routes unchanged (/,/login,/articles). Route-lazy added: RouteFallback.tsx (role="status", accessible, TSDoc + test); ArticlesPage + LoginPage now React.lazy at module scope; <Suspense> wraps <Outlet> in App.tsx. Bundle: 198.46 KB gz (pre-lazy) → 137.29 KB gz (−31%); budget ratcheted 190→145. 84 tests green (+2 RouteFallback); zero future-flag warnings. ADR 0026 written.

## Amendments

_(none yet)_
