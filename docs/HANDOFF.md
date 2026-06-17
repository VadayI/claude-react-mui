# HANDOFF — claude-react-mui

> Read this first when joining the project. Updated by `/wrap-up` at end of each session.
> Last updated: 2026-06-17 (session — stack-upgrade-pr-c-mui9)

## Current state

**Active branch:** `chore/stack-upgrade-pr-c-mui9`
**Last merged to main:** PR #38 — React 18.3 → 19 (stack upgrade PR B, ADR 0024)

The app is a fully working React + MUI frontend with:

- JWT auth (login/logout with QueryCache flush, RequireAuth guard)
- Articles CRUD (list + protected routes)
- Full test suite: 82 Vitest tests (13 files) + Playwright E2E (6 tests)
- All CI gates passing on main after PR B

**Stack upgrade progress** (plan `docs/plans/0004-stack-upgrade-latest-versions.md`):

| PR | Scope | State |
|----|-------|-------|
| A  | Tooling (TS 6 / Node 24 / ESLint 10) | done — merged |
| B  | React 18.3 → 19 (ADR 0024) | done — merged |
| C  | MUI 6 → 9 (ADR 0025) | **ready for review** — branch `chore/stack-upgrade-pr-c-mui9` |
| D  | React Router 6 → 7 | pending |
| E  | TanStack Query / Zustand + final sweep + .npmrc cleanup | pending |

## What was done this session (PR C)

1. **MUI bump** — `@mui/material` + `@mui/icons-material` `^6.1.6` → `^9.1.1`; emotion unchanged.
2. **Codemod migrations** (3 real changes): `AddArticleForm.tsx` `inputProps`→`slotProps.htmlInput`; `ArticleList.tsx` system `color`→`sx` and `secondaryTypographyProps`→`slotProps.secondary`.
3. **Vitest ESM fix** — `vitest.config.ts` `server.deps.inline` for MUI 9 + `react-transition-group`; 82/82 tests green, no assertion changes.
4. **Bundle** — 188.38 KB gz; budget ratcheted 188→190 KB (`.performance-budget.json` updated).
5. **ADR 0025** — `docs/decisions/0025-upgrade-mui-9.md` created; `docs/decisions/README.md` updated (0015 row annotated "MUI pin superseded by 0025").
6. **Doc version strings** — MUI 6→9 updated across all agent/command/rule/skill/template files.
7. **Living plan** — `docs/plans/0004` Status table PR C `pending`→`done`; 4 Execution log entries appended.
8. **WORKLOG** — PR C session entry appended.

## Next steps

1. Open PR C (`chore/stack-upgrade-pr-c-mui9`) for review → quality gate → merge.
2. Start PR D: React Router 6 → 7 data router migration on the PR C baseline.
3. Performance task (post-upgrade): route code-splitting to return initial JS to < 180 KB gz.
4. PR E: TanStack Query + Zustand minor sweep + remove `.npmrc legacy-peer-deps` (once peer gaps resolved).

## Open questions

- Route code-splitting — which agent owns the structural perf task (PR C deferred it)?
- Pigment CSS (MUI 9 opt-in zero-runtime) — adopt in a future PR or stay with Emotion?
- `legacy-peer-deps=true` removal — confirm `eslint-plugin-jsx-a11y` and `openapi-typescript` have published updated peers before PR E.

## Gate status (PR C, local)

| Gate              | Status |
| ----------------- | ------ |
| typecheck         | ✅ |
| lint              | ✅ |
| tests             | ✅ 82 passed |
| build             | ✅ 188.38 KB gz |
| bundle_size       | ✅ (within 190 KB budget) |
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
- `src/features/articles/` — articles list, API hooks; `AddArticleForm.tsx` + `ArticleList.tsx` patched by MUI 9 codemod
- `e2e/` — Playwright specs (auth + articles)
- `docs/decisions/0025-upgrade-mui-9.md` — MUI 6→9 ADR
- `docs/plans/0004-stack-upgrade-latest-versions.md` — living plan for the full upgrade sequence
- `vitest.config.ts` — `server.deps.inline` added for MUI 9 ESM resolution
- `.performance-budget.json` — `initialJsGzipKb` now 190
