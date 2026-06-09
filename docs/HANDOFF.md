# HANDOFF — claude-react-mui

> Rolling snapshot — read this FIRST when joining or resuming the project.
> Regenerated: 2026-06-09 by /wrap-up.

## Branch

`feat/articles-route-guard` — PR #26 відкрито (route guard + LoginPage).

## Last work done

**Session 2026-06-09d — typecheck fix + route guard**

Two things completed:

1. **fix: typecheck → tsc -b (PR #25, merged)**: root `tsconfig.json` мав `files:[]` — `tsc --noEmit` нічого не перевіряв у `src/`. Замінено на `tsc -b` (project references). Тепер `npm run typecheck` є реальним CI gate.

2. **feat(auth): RequireAuth + LoginPage (PR #26, open)**: повний pipeline через `ba → ui-architect → tester → react-developer → Quality Gate → docs-writer`.
   - `RequireAuth` layout route — анонімний → `/login?next=<encoded-path>` (replace: true).
   - `sanitizeNext()` — відхиляє `https://evil.com`, `//evil.com` (open redirect mitigation).
   - `LoginForm` — Zod-валідація, `role="alert"` завжди рендериться (screen reader re-announcement).
   - `useLogin` — типізований через `normaliseError` з `client.ts`.
   - 81 Vitest тест + Playwright E2E outer loop (`e2e/auth.spec.ts`).
   - Нові залежності: `react-hook-form`, `@hookform/resolvers`, `zod`.

## Next steps

1. **Merge PR #26** — route guard + LoginPage (81 тест зелений, всі gates ✅).
2. **`logout()` + `queryClient.clear()`** — shared-device cache gap; окремий PR через пайплайн.
3. **Дослідити schema.d.ts drift** — `npm run api:types` (npm) vs `npx` дають різний формат для однієї версії `openapi-typescript@7.13.0`.
4. **Наступна фіча** — через стандартний пайплайн.

## Open questions

- [ ] Чому `openapi-typescript` v7.13.0 генерує різний формат через `npm run` vs `npx`? (recurring drift issue)
- [ ] Коли `claude-django` мігрує на contract v0.2.0? (блокує спільний деплой)
- [ ] Чи встановлено `CONTRACT_VERSION=v0.2.0` у живому `.env`? (gitignored — неможливо перевірити)
- [ ] Чи повинен `logout()` викликати `queryClient.clear()`? (shared-device cache leak; низький пріоритет)

## Stack snapshot

TypeScript 5 · React 18.3 · Vite 8 · MUI 6 · React Router 6 (data router) · TanStack Query 5 · Zustand 5 · Vitest 4 + RTL + MSW · Playwright · openapi-typescript · ESLint + Prettier · react-hook-form + @hookform/resolvers + zod · GitHub Actions CI · Node 20.19+ / WSL2.

**Contract pin:** `VadayI/claude-api-contract@v0.2.0` (locked in `contract.lock.json`, sha256: `d9ad3779f189c74a2800582b138a6fac8fd1e333662129209c8d9a88cf5bb1b7`).

**Auth:** Bearer/JWT (ADR 0021 + 0022). Tokens in memory only (`useAuthStore`). One injection point in `client.ts`. One 401-refresh flow (`POST /api/v1/auth/refresh`).

**MSW:** env-gated — `VITE_MSW_ENABLED=true` starts the browser worker. Dev server does NOT auto-start MSW. Playwright sets `VITE_MSW_ENABLED=true` via `webServer.env`. Handlers base URL from `VITE_API_BASE_URL`.

## Key files

| Purpose           | Path                                                                          |
| ----------------- | ----------------------------------------------------------------------------- |
| Contract          | `src/lib/api/openapi.yml` (vendored from `VadayI/claude-api-contract@v0.2.0`) |
| Generated types   | `src/lib/api/schema.d.ts`                                                     |
| API client        | `src/lib/api/client.ts`                                                       |
| Route guard       | `src/app/guards/RequireAuth.tsx`                                               |
| Auth store        | `src/lib/auth/authStore.ts`                                                   |
| Auth feature      | `src/features/auth/` (LoginPage, LoginForm, useLogin, authApi)                |
| MSW handlers      | `src/mocks/handlers.ts`                                                       |
| Route registry    | `.claude/memory/routes.json`                                                  |
| Contract lock     | `contract.lock.json`                                                          |
| Verify guide      | `docs/verify/articles.md`                                                     |
| ADR: contract     | `docs/decisions/0020-external-openapi-contract-variant-a.md`                  |
| ADR: auth         | `docs/decisions/0021-auth-bearer-jwt-default.md`                              |
| ADR: v0.2.0 bump  | `docs/decisions/0022-bump-contract-v0.2.0-auth-path-rename.md`                |
| CI                | `.github/workflows/frontend-ci.yml`                                           |
