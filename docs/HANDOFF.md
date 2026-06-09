# HANDOFF — claude-react-mui

> Rolling snapshot — read this FIRST when joining or resuming the project.
> Regenerated: 2026-06-09 by /wrap-up.

## Branch

`main` — PR #23 merged (fix/articles-spinner-aria-label). Clean working tree.

## Last work done

**Session 2026-06-09c — audit + merges + a11y fix**

Three tasks completed:

1. **/audit + merges**: виявлено 2 відкритих PR і незакомічені зміни. PR #22 (wrap-up docs + schema drift fix) та PR #18 (docs Variant A alignment, rebase + conflict resolution) успішно змерджено.

2. **fix(a11y) PR #23**: виправлено pre-existing E2E a11y failure.
   - `MuiCircularProgress` в `ArticlesPage` мав `role="progressbar"` без `aria-label` — порушення WCAG 2.1 AA rule `aria-progressbar-name`.
   - Додано `aria-label="Loading articles"` безпосередньо на `<CircularProgress>`.
   - TDD RED→GREEN: 2 нових тести в `ArticlesPage.test.tsx`.
   - E2E-тест `page has no accessibility violations` — вперше зелений в CI.

3. **schema.d.ts drift**: recurring issue — `npm run api:types` (local) генерує 2-пробільний формат, `check_types_drift.sh` (через `npx`) генерує 4-пробільний. Обидва інструменти версії 7.13.0. Потрібне дослідження кореня проблеми; поки що `npm run api:types` перед wrap-up фіксує стан.

## Next steps

1. **Fix `npm run typecheck`**: змінити скрипт на `tsc -b` в `package.json` — root tsconfig має `files:[]`, не перевіряє `src/`. Однорядкова зміна, окремий PR.
2. **Route guard для `/articles`**: `routes.json` каже `auth: authenticated`, але `router.tsx` не захищає маршрут. Через пайплайн: ba → ui-architect → tester → react-developer.
3. **Дослідити schema.d.ts drift**: з'ясувати чому `openapi-typescript` v7.13.0 генерує різний формат залежно від виклику (`npm run` vs `npx`). Можливо різна конфігурація prettier/tsconfig.
4. **Наступна фіча** — через стандартний пайплайн.

## Open questions

- [ ] Чому `openapi-typescript` v7.13.0 генерує різний формат через `npm run` vs `npx`? (recurring drift issue)
- [ ] Коли `claude-django` мігрує на contract v0.2.0? (блокує спільний деплой)
- [ ] Чи встановлено `CONTRACT_VERSION=v0.2.0` у живому `.env`? (gitignored — неможливо перевірити)
- [ ] Чи повинен `logout()` викликати `queryClient.clear()`? (shared-device cache leak; низький пріоритет)
- [ ] Чи потрібно розширити `scripts/api-pull.mjs` для підтримки довільного `VITE_OPENAPI_URL` (bootstrap Variants B/C)?

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
