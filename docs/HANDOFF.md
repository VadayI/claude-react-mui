# HANDOFF — claude-react-mui

> Rolling snapshot — read this FIRST when joining or resuming the project.
> Regenerated: 2026-06-09 by /wrap-up.

## Branch

`main` — PR #21 merged (bootstrap-contract-source-question). Clean working tree.

## Last work done

**Session 2026-06-09b — bootstrap contract source question**

Short session focused on `/bootstrap` UX improvement:

1. Reviewed `/bootstrap` command — found it silently assumed `VadayI/claude-api-contract` (Variant A) for all projects, no user question asked.
2. **PR #21** — added `Step 0` to Mode A: `AskUserQuestion` asks which OpenAPI contract model to use:
   - **A) `VadayI/claude-api-contract`** (Recommended) — external contract repo, version-pinned; full drift + contract-sync gates.
   - **B) `VadayI/claude-django`** — Django/DRF backend generates schema at `/api/schema/`; `curl`-based pull; `check_contract_sync.sh` advisory-only.
   - **C) Custom OpenAPI URL** — arbitrary endpoint; same `curl` approach.
     Steps 1, 6, 9, 12 now variant-aware. `api-pull.mjs` unchanged.

## Next steps

1. **Fix `npm run typecheck`**: change script to `tsc -b` in `package.json` so local typecheck matches CI. Simple 1-line change + docs update. Separate PR.
2. **E2E a11y**: `MuiCircularProgress` in `ArticlesPage` loading state has no `aria-label` → `aria-progressbar-name` violation (WCAG 2.1 AA). Add accessible label to the spinner. Separate PR.
3. **Route guard for `/articles`**: `routes.json` marks it `auth: authenticated` but `router.tsx` has no guard — implement via pipeline (ba → ui-architect → tester → react-developer).
4. **Next feature**: standard pipeline (ba → ui-architect → tester → react-developer → quality gate → docs-writer).

## Open questions

- [ ] When will `claude-django` migrate to contract v0.2.0? (blocks shared deployment)
- [ ] Should `logout()` call `queryClient.clear()`? (shared-device cache leak; low priority)
- [ ] Is `CONTRACT_VERSION=v0.2.0` now set in live `.env`? (gitignored — cannot verify)
- [ ] Should `scripts/api-pull.mjs` be extended to support arbitrary `VITE_OPENAPI_URL` (for bootstrap Variants B/C)? Currently requires GitHub raw format.

## Stack snapshot

TypeScript 5 · React 18.3 · Vite 8 · MUI 6 · React Router 6 (data router) · TanStack Query 5 · Zustand 5 · Vitest 4 + RTL + MSW · Playwright · openapi-typescript · ESLint + Prettier · GitHub Actions CI · Node 20.19+ / WSL2.

**Contract pin:** `VadayI/claude-api-contract@v0.2.0` (locked in `contract.lock.json`, sha256: `d9ad3779f189c74a2800582b138a6fac8fd1e333662129209c8d9a88cf5bb1b7`).

**Auth:** Bearer/JWT (ADR 0021 + 0022). Tokens in memory only (`useAuthStore`). One injection point in `client.ts`. One 401-refresh flow (`POST /api/v1/auth/refresh`).

**MSW:** env-gated — `VITE_MSW_ENABLED=true` starts the browser worker. Dev server does NOT auto-start MSW. Playwright sets `VITE_MSW_ENABLED=true` via `webServer.env`. Handlers base URL from `VITE_API_BASE_URL`.

## Key files

| Purpose           | Path                                                                          |
| ----------------- | ----------------------------------------------------------------------------- |
| Contract          | `src/lib/api/openapi.yml` (vendored from `VadayI/claude-api-contract@v0.2.0`) |
| Generated types   | `src/lib/api/schema.d.ts`                                                     |
| API client        | `src/lib/api/client.ts`                                                       |
| MSW startup       | `src/mocks/enableMocking.ts`                                                  |
| MSW handlers      | `src/mocks/handlers.ts`                                                       |
| Auth store        | `src/lib/auth/authStore.ts`                                                   |
| Auth API          | `src/features/auth/authApi.ts`                                                |
| Route registry    | `.claude/memory/routes.json`                                                  |
| Contract lock     | `contract.lock.json`                                                          |
| Bootstrap command | `.claude/commands/bootstrap.md`                                               |
| ADR: contract     | `docs/decisions/0020-external-openapi-contract-variant-a.md`                  |
| ADR: auth         | `docs/decisions/0021-auth-bearer-jwt-default.md`                              |
| ADR: v0.2.0 bump  | `docs/decisions/0022-bump-contract-v0.2.0-auth-path-rename.md`                |
| CI                | `.github/workflows/frontend-ci.yml`                                           |
