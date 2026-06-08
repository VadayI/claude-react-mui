# HANDOFF — claude-react-mui

> Rolling snapshot — read this FIRST when joining or resuming the project.
> Regenerated: 2026-06-07 by /wrap-up.

## Branch

`main` — all three session PRs merged (#14 doc-drift, #15 contract-v0.2.0, #16 prettier).

## Last work done

**Session 2026-06-07 — Contract v0.2.0 migration**

Analysed readiness against `VadayI/claude-api-contract`, found two gaps (doc drift + version lag), and fixed both in the same session:

1. **PR #14** — reconciled `routes.json` + `docs/api/INDEX.md`: replaced stale `todos` references with real `articles` + `auth` (API-layer only).
2. **PR #15** — migrated to `claude-api-contract@v0.2.0` (breaking: `/auth/*` → `/api/v1/auth/*`):
   - ADR 0022 written; contract pulled; `schema.d.ts` regenerated; `contract.lock.json` updated.
   - TDD: RED (updated MSW handlers + new `authApi.test.ts`) → GREEN (5 surgical string changes in 2 files).
   - Docs: `auth.md`, `auth/README.md`, ADR 0021, `docs/api/INDEX.md` updated.
   - Quality Gate: reviewer ✅ security-scanner ✅ state-architect ✅. 47/47 tests green.
3. **PR #16** — prettier reformat (105 files); `schema.d.ts` regenerated after drift.

## Next steps

1. **Update `.env`**: set `CONTRACT_VERSION=v0.2.0` (file is gitignored — must be done manually: `sed -i 's/CONTRACT_VERSION=v0.1.0/CONTRACT_VERSION=v0.2.0/' .env`).
2. **Coordinate with `claude-django`**: both consumers must migrate to `/api/v1/auth/*` before deploying to a shared environment.
3. **Route guard for `/articles`**: `routes.json` marks it `auth: authenticated` but `router.tsx` has no guard yet — implement via pipeline (ba → ui-architect → tester → react-developer).
4. **Next feature**: run through the standard pipeline (ba → ui-architect → tester → react-developer → quality gate → docs-writer).

## Open questions

- [ ] When will `claude-django` migrate to contract v0.2.0? (blocks shared deployment)
- [ ] Should `logout()` call `queryClient.clear()`? (pre-existing gap — shared-device cache leak; low priority until multi-user scenario)
- [ ] Is `CONTRACT_VERSION=v0.2.0` now set in live `.env`? (agents cannot verify — gitignored)

## Stack snapshot

TypeScript 5 · React 18.3 · Vite 8 · MUI 6 · React Router 6 (data router) · TanStack Query 5 · Zustand 5 · Vitest 4 + RTL + MSW · Playwright · openapi-typescript · ESLint + Prettier · GitHub Actions CI · Node 20.19+ / WSL2.

**Contract pin:** `VadayI/claude-api-contract@v0.2.0` (locked in `contract.lock.json`, sha256: `d9ad3779f189c74a2800582b138a6fac8fd1e333662129209c8d9a88cf5bb1b7`).

**Auth:** Bearer/JWT (ADR 0021 + 0022). Tokens in memory only (`useAuthStore`). One injection point in `client.ts`. One 401-refresh flow (`POST /api/v1/auth/refresh`).

## Key files

| Purpose | Path |
|---|---|
| Contract | `src/lib/api/openapi.yml` (vendored from `VadayI/claude-api-contract@v0.2.0`) |
| Generated types | `src/lib/api/schema.d.ts` |
| API client | `src/lib/api/client.ts` |
| Auth store | `src/lib/auth/authStore.ts` |
| Auth API | `src/features/auth/authApi.ts` |
| Route registry | `.claude/memory/routes.json` |
| Contract lock | `contract.lock.json` |
| ADR: contract | `docs/decisions/0020-external-openapi-contract-variant-a.md` |
| ADR: auth | `docs/decisions/0021-auth-bearer-jwt-default.md` |
| ADR: v0.2.0 bump | `docs/decisions/0022-bump-contract-v0.2.0-auth-path-rename.md` |
| CI | `.github/workflows/frontend-ci.yml` |
