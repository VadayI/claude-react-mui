# HANDOFF — claude-react-mui

> Read this first when joining the project. Updated by `/wrap-up` at end of each session.
> Last updated: 2026-06-17 (session — stack-upgrade-pr-e)

## Current state

**Active branch:** `chore/stack-upgrade-pr-e`
**Last merged to main:** PR #39 — MUI 6 → 9 (stack upgrade PR C, ADR 0025) *(PR D + PR E land once reviewed)*

The app is a fully working React + MUI frontend with:

- JWT auth (login/logout with QueryCache flush, RequireAuth guard)
- Articles CRUD (list + protected routes)
- Full test suite: 84 Vitest tests (15 files) + Playwright E2E (6 tests)
- All CI gates passing on main after PR C

**Stack upgrade COMPLETE** (plan `docs/plans/0004-stack-upgrade-latest-versions.md`):

| PR | Scope | State |
|----|-------|-------|
| A  | Tooling (TS 6 / Node 24 / ESLint 10) | done — merged |
| B  | React 18.3 → 19 (ADR 0024) | done — merged |
| C  | MUI 6 → 9 (ADR 0025) | done — merged |
| D  | React Router 6 → 7 + route-lazy (ADR 0026) | done — awaiting merge |
| E  | TanStack Query 5.101 / Zustand 5 + final sweep | **done — awaiting merge** |

**Current stack (as of PR E):**
React 19 · Vite 8 · TypeScript 6 · MUI 9 · React Router 7 · TanStack Query 5.101 · Zustand 5 · MSW 2.14 · Playwright 1.61 · Vitest 4

**Bundle:** 137.3 KB gz initial / budget 145 KB

## What was done this session (PR E)

1. **Dependency bumps (devDependencies, zero `src/` changes required):**
   - `@playwright/test` ^1.48.2 → ^1.61.0
   - `jest-axe` ^9.0.0 → ^10.0.0 (drop-in; `@types/jest-axe` kept — jest-axe 10 has no own types)
   - `openapi-fetch` ^0.12.2 → ^0.17.0 (verified compatible with `client.ts` and tests)
   - `@tanstack/react-query` ^5.59.19 → ^5.101.0
   - `openapi-typescript` ^7.4.1 → `7.13.0` (exact pin, no caret)
   - Floor hygiene: `zustand` ^5.0.14, `msw` ^2.14.6
2. **`@rollup/rollup-linux-x64-gnu ^4.61.1`** moved `dependencies` → `devDependencies`.
3. **GitHub Actions:** `actions/checkout` v4→v5, `actions/setup-node` v4→v6, `actions/upload-artifact` v4→v7 (in `frontend-ci.yml`).
4. **`renovate.json` + `templates/renovate.json`:** removed ghost `react-router-dom` from the react-router group.
5. **`.npmrc`:** `legacy-peer-deps=true` KEPT (re-verified still required); plan-reference comment corrected `0005`→`0004`.
6. **84 tests green** (unchanged from PR D); bundle 137.3 KB gz ≤ 145 KB budget; no new advisories.
7. **Living plan** `docs/plans/0004` — PR E row `pending`→`done`; Execution log entry appended; upgrade marked A–E COMPLETE.
8. **WORKLOG** — PR E session entry appended.

## Next steps

1. Open PR E (`chore/stack-upgrade-pr-e`) for review → quality gate → merge.
2. After merge: staged stack upgrade is fully shipped — no further upgrade PRs pending.
3. **Deferred non-blockers** (track as follow-up tasks, not open blockers):
   - Remove `.npmrc legacy-peer-deps=true` once `eslint-plugin-jsx-a11y` publishes an ESLint-10 peer AND `openapi-typescript` publishes a TypeScript-6 peer.
   - Drop `@types/jest-axe` once jest-axe 10 ships its own TypeScript types.
4. Pigment CSS (MUI 9 opt-in zero-runtime) — evaluate in a future PR or stay with Emotion.
5. Route code-splitting performance task — initial JS already 137.3 KB; consider further splitting if new features grow the bundle.

## Open questions

- Pigment CSS adoption (MUI 9 opt-in) — future PR decision.
- `eslint-plugin-jsx-a11y` and `openapi-typescript` upstream peer-range releases — watch for both; remove `.npmrc` flag when both land.

## Gate status (PR E, local)

| Gate               | Status |
| ------------------ | ------ |
| typecheck          | ✅ |
| lint               | ✅ |
| tests              | ✅ 84 passed |
| build              | ✅ 137.3 KB gz initial |
| bundle_size        | ✅ (within 145 KB budget) |
| types-drift        | ✅ NO DRIFT |
| stubs              | ✅ |
| file-size          | ✅ |
| feature-readmes    | ✅ |
| audit (high)       | ✅ (2 pre-existing moderate only) |
| contract-sync      | deferred to CI (sandbox proxy 403) |
| plan/routes/guides | validated by CI (git-dependent) |

## Key files

- `src/lib/api/` — typed client, openapi.yml (pinned v0.2.0), schema.d.ts
- `src/features/auth/` — login, logout, RequireAuth guard, authStore
- `src/features/articles/` — articles list, API hooks
- `src/components/RouteFallback.tsx` — accessible route-level loading fallback (added in PR D)
- `src/app/App.tsx` — `<Suspense>` + `<Outlet>` (updated in PR D)
- `e2e/` — Playwright specs (auth + articles)
- `docs/decisions/0026-upgrade-react-router-7.md` — React Router 6→7 + route-lazy ADR
- `docs/decisions/0025-upgrade-mui-9.md` — MUI 6→9 ADR
- `docs/decisions/0024-upgrade-react-19.md` — React 18→19 ADR
- `docs/decisions/0023-node-24-eslint-10-ts-6.md` — PR A tooling ADR
- `docs/plans/0004-stack-upgrade-latest-versions.md` — living plan for the full upgrade sequence (COMPLETE)
- `.performance-budget.json` — `initialJsGzipKb` 145
- `.npmrc` — `legacy-peer-deps=true` (peer stopgap; removal deferred — see Next steps)
