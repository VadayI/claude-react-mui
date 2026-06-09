# HANDOFF — claude-react-mui

> Rolling snapshot — read this FIRST when joining or resuming the project.
> Regenerated: 2026-06-09 by /wrap-up.

## Branch

`main` — PR #19 merged (runtime-api-target-switch). README fix + schema.d.ts regen pending commit on `docs/wrap-up-2026-06-09`.

## Last work done

**Session 2026-06-09 — runtime API target switch + README fix**

Resumed interrupted session: branch `feat/runtime-api-target-switch` was in RED phase with two untracked test files and no implementation.

1. **PR #19** — runtime API target switch (merged):
   - New `src/mocks/enableMocking.ts` — `enableMocking()` starts MSW ONLY when `VITE_MSW_ENABLED === 'true'`; removed DEV-coupled logic from `main.tsx`.
   - `src/mocks/handlers.ts` — base URL from `import.meta.env.VITE_API_BASE_URL` (was hardcoded `:8000`).
   - `vitest.config.ts` — test `VITE_API_BASE_URL` → `http://test.local` (makes handlers.test.ts a genuine regression guard).
   - `.env.example` — `VITE_MSW_ENABLED` documented.
   - Fixed 4 pre-existing tests that hardcoded `:8000`; fixed pre-existing TS bug in `authApi.test.ts` (`username` → `email`).
   - 54/54 tests green; Quality Gate ✅ reviewer+refactor pass.
2. **Discovered gap**: `npm run typecheck` = `tsc --noEmit` on root `tsconfig.json` (`"files": []`) is a no-op — doesn't check the app project. CI `tsc -b` catches errors; local script does not. Needs a fix.
3. **README audit**: fixed stale `VITE_OPENAPI_URL` reference; added `/a11y-audit` to slash commands list.
4. **schema.d.ts** regenerated; drift gate green.

## Next steps

1. **Fix `npm run typecheck`**: change script to `tsc -b` (or `tsc -p tsconfig.app.json --noEmit`) so local typecheck matches CI. Simple 1-line change in `package.json` + docs update. Separate PR.
2. **E2E a11y**: `MuiCircularProgress` in `ArticlesPage` loading state has no `aria-label` → `aria-progressbar-name` violation (WCAG 2.1 AA). Add accessible label to the spinner. Separate PR.
3. **Route guard for `/articles`**: `routes.json` marks it `auth: authenticated` but `router.tsx` has no guard — implement via pipeline (ba → ui-architect → tester → react-developer).
4. **Next feature**: standard pipeline (ba → ui-architect → tester → react-developer → quality gate → docs-writer).

## Open questions

- [ ] When will `claude-django` migrate to contract v0.2.0? (blocks shared deployment)
- [ ] Should `logout()` call `queryClient.clear()`? (shared-device cache leak; low priority)
- [ ] Is `CONTRACT_VERSION=v0.2.0` now set in live `.env`? (gitignored — cannot verify)

## Stack snapshot

TypeScript 5 · React 18.3 · Vite 8 · MUI 6 · React Router 6 (data router) · TanStack Query 5 · Zustand 5 · Vitest 4 + RTL + MSW · Playwright · openapi-typescript · ESLint + Prettier · GitHub Actions CI · Node 20.19+ / WSL2.

**Contract pin:** `VadayI/claude-api-contract@v0.2.0` (locked in `contract.lock.json`, sha256: `d9ad3779f189c74a2800582b138a6fac8fd1e333662129209c8d9a88cf5bb1b7`).

**Auth:** Bearer/JWT (ADR 0021 + 0022). Tokens in memory only (`useAuthStore`). One injection point in `client.ts`. One 401-refresh flow (`POST /api/v1/auth/refresh`).

**MSW:** env-gated — `VITE_MSW_ENABLED=true` starts the browser worker. Dev server does NOT auto-start MSW. Playwright sets `VITE_MSW_ENABLED=true` via `webServer.env`. Handlers base URL from `VITE_API_BASE_URL`.

## Key files

| Purpose | Path |
|---|---|
| Contract | `src/lib/api/openapi.yml` (vendored from `VadayI/claude-api-contract@v0.2.0`) |
| Generated types | `src/lib/api/schema.d.ts` |
| API client | `src/lib/api/client.ts` |
| MSW startup | `src/mocks/enableMocking.ts` |
| MSW handlers | `src/mocks/handlers.ts` |
| Auth store | `src/lib/auth/authStore.ts` |
| Auth API | `src/features/auth/authApi.ts` |
| Route registry | `.claude/memory/routes.json` |
| Contract lock | `contract.lock.json` |
| ADR: contract | `docs/decisions/0020-external-openapi-contract-variant-a.md` |
| ADR: auth | `docs/decisions/0021-auth-bearer-jwt-default.md` |
| ADR: v0.2.0 bump | `docs/decisions/0022-bump-contract-v0.2.0-auth-path-rename.md` |
| CI | `.github/workflows/frontend-ci.yml` |
