# HANDOFF — claude-react-mui

> Read this first when joining the project. Updated by `/wrap-up` at end of each session.
> Last updated: 2026-06-17 (session — stack-upgrade-pr-d)

## Current state

**Active branch:** `chore/stack-upgrade-pr-d`
**Last merged to main:** PR #39 — MUI 6 → 9 (stack upgrade PR C, ADR 0025)

The app is a fully working React + MUI frontend with:

- JWT auth (login/logout with QueryCache flush, RequireAuth guard)
- Articles CRUD (list + protected routes)
- Full test suite: 84 Vitest tests (15 files) + Playwright E2E (6 tests)
- All CI gates passing on main after PR C

**Stack upgrade progress** (plan `docs/plans/0004-stack-upgrade-latest-versions.md`):

| PR | Scope | State |
|----|-------|-------|
| A  | Tooling (TS 6 / Node 24 / ESLint 10) | done — merged |
| B  | React 18.3 → 19 (ADR 0024) | done — merged |
| C  | MUI 6 → 9 (ADR 0025) | done — merged |
| D  | React Router 6 → 7 + route-lazy (ADR 0026) | **ready for review** — branch `chore/stack-upgrade-pr-d` |
| E  | TanStack Query / Zustand + final sweep + .npmrc cleanup | pending |

## What was done this session (PR D)

1. **React Router bump** — `react-router-dom ^6.28.0` removed; `react-router ^7.18.0` added (single consolidated package). 8 import sites rewritten: `src/main.tsx` uses `react-router/dom`; remaining 7 files (including tests) use `react-router`.
2. **Future-flag de-risk** — all v7 flags enabled on v6 (tests green), then bumped and flags removed (v7 defaults). Discovery: `v7_startTransition` is component-level; data-router flags go on `createBrowserRouter`/`createMemoryRouter`.
3. **Route-level code-splitting** — new `src/components/RouteFallback.tsx` (accessible, `role="status"`, MUI `CircularProgress`, TSDoc + test); `ArticlesPage` + `LoginPage` → module-scope `React.lazy`; `<Suspense>` wraps `<Outlet>` in `App.tsx`; shell/index/RequireAuth stay synchronous.
4. **Bundle** — 198.46 KB gz (pre-lazy) → **137.29 KB gz** (−31%); separate lazy chunks: ArticlesPage ~11 KB, LoginPage ~25.8 KB, TextField ~27.5 KB.
5. **Performance budget ratcheted down** — `initialJsGzipKb` 190 → **145** (`.performance-budget.json` updated).
6. **ADR 0026** — `docs/decisions/0026-upgrade-react-router-7.md` created; `docs/decisions/README.md` updated (0015 row annotated "Router pin superseded by 0026").
7. **Doc version strings** — React Router 6→7 updated across CLAUDE.md, README.md, templates/PROJECT_README.md, .claude/commands/{preflight,bootstrap}.md, .claude/agents/react-developer.md, .claude/rules/routing-and-data-loading.md (+ package consolidation note).
8. **routes.json** — `/login` states include `loading`; both entries note RouteFallback in `notes`.
9. **docs/verify** — articles.md + auth.md: prerequisites section notes route-lazy loading on first visit.
10. **docs/guides** — developer.md: Node 24+ prereq corrected, Architecture section notes RR7 + lazy; user.md: Tips notes brief loading spinner on first route visit.
11. **Living plan** — `docs/plans/0004` PR D row `pending`→`done`; Execution log entry appended.
12. **WORKLOG** — PR D session entry appended.
13. **84 tests green** (+2 RouteFallback); zero future-flag warnings.

## Next steps

1. Open PR D (`chore/stack-upgrade-pr-d`) for review → quality gate → merge.
2. Start PR E: TanStack Query / Zustand minor sweep + remove `.npmrc legacy-peer-deps` (once `eslint-plugin-jsx-a11y` + `openapi-typescript` publish updated peers).
3. After PR E: final `.npmrc` cleanup (remove `legacy-peer-deps=true`).

## Open questions

- Pigment CSS (MUI 9 opt-in zero-runtime) — adopt in a future PR or stay with Emotion?
- `renovate.json` router group still lists `react-router-dom` (now ghost entry) — clean up in PR E.
- `legacy-peer-deps=true` removal — confirm peer gaps resolved before PR E.

## Gate status (PR D, local)

| Gate              | Status |
| ----------------- | ------ |
| typecheck         | ✅ |
| lint              | ✅ |
| tests             | ✅ 84 passed |
| build             | ✅ 137.29 KB gz initial |
| bundle_size       | ✅ (within 145 KB budget) |
| types-drift       | ✅ |
| stubs             | ✅ |
| file-size         | ✅ |
| feature-readmes   | ✅ |
| audit (high)      | ✅ (2 moderate only) |
| contract-sync     | deferred to CI (sandbox proxy 403) |
| plan/routes/guides | validated by CI (git-dependent) |

## Key files

- `src/lib/api/` — typed client, openapi.yml (pinned v0.2.0), schema.d.ts
- `src/features/auth/` — login, logout, RequireAuth guard, authStore
- `src/features/articles/` — articles list, API hooks
- `src/components/RouteFallback.tsx` — accessible route-level loading fallback (new in PR D)
- `src/app/App.tsx` — `<Suspense>` + `<Outlet>` (updated in PR D)
- `e2e/` — Playwright specs (auth + articles)
- `docs/decisions/0026-upgrade-react-router-7.md` — React Router 6→7 + route-lazy ADR
- `docs/plans/0004-stack-upgrade-latest-versions.md` — living plan for the full upgrade sequence
- `.performance-budget.json` — `initialJsGzipKb` now 145
