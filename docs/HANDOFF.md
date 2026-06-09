# Project Handoff — 2026-06-09

## Current branch

`main` — PR #27 злито; нова feature-гілка ще не відкрита.

## Last work done

- **PR #27 злито** — `fix(auth): flush Query cache on logout + add docs/verify/auth.md`: `queryClient.clear()` на logout, тест spy, `docs/verify/auth.md`.
- **Fix E2E root cause** — `VITE_API_BASE_URL` не передавався у `playwright.config.ts` `webServer.env`; MSW реєстрував обробник як `'undefined/api/v1/auth/login'` → E2E завжди падали на CI. Виправлено.
- **Fix a11y** — `LoginPage` не мав `<h1>` заголовка; додано "Sign In" heading; axe violations на `/login` усунено.
- **E2E articles** — `beforeEach` з login перед кожним тестом захищеного `/articles`.
- **schema.d.ts drift розслідувано** — кореневу причину встановлено (файл у working tree був від іншого інструменту); `npm run api:types` виправляє; PR не потрібен.
- **PR #26 злито** (попередня сесія) — RequireAuth guard + LoginPage.

## Open PRs

Немає відкритих PR.

## Project state

- Tests: ✅ зелені (82 passed, 13 test files)
- E2E: ✅ зелені (Quality Gates + E2E Tests на CI)
- Types: ✅ в синхронізації (`check_types_drift.sh` чистий)
- Lint: ✅ чистий
- Stubs: ✅ немає
- File size: ✅ всі файли < 400 рядків
- Feature READMEs: ✅ (`articles/`, `auth/`)
- Typecheck: ✅ (tsc -b)

## In-progress work

Немає активних планів.

## Next steps

1. **Наступна фіча** — через стандартний пайплайн (`ba → ui-architect → tester → react-developer → reviewer → docs-writer`).
2. **`check_contract_sync.sh` та `.env.example`** — перевірити чи `CONTRACT_VERSION=v0.2.0` задокументований у `.env.example`; якщо ні — оновити в окремому PR.
3. **Спростити E2E `beforeEach` у `articles.spec.ts`** — `page.route()` для login став dead code після `VITE_API_BASE_URL` фіксу (MSW обробляє першим); можна видалити в окремому PR.

## Open questions

- [ ] Чи задокументовано `CONTRACT_VERSION=v0.2.0` у `.env.example`? Якщо ні — `check_contract_sync.sh` не пройде локально для нових розробників.
- [ ] `articles.spec.ts` `page.route()` для login — залишати як "defense in depth" чи прибрати як dead code?
- [ ] Яка наступна фіча після поточного auth/articles набору?

## Key file locations

- Router: `src/app/router.tsx`
- API client: `src/lib/api/client.ts`
- API types (generated): `src/lib/api/schema.d.ts`
- Auth store: `src/lib/auth/authStore.ts`
- Route guards: `src/app/guards/`
- Feature list: `src/features/` (`articles/`, `auth/`)
- Routes registry: `.claude/memory/routes.json`
- Verification docs: `docs/verify/` (`articles.md` ✅, `auth.md` ✅)
- Guides: `docs/guides/` (`user.md`, `developer.md`)
- API INDEX: `docs/api/INDEX.md`
- Contract: `src/lib/api/openapi.yml` (vendored від `VadayI/claude-api-contract@v0.2.0`)
- E2E: `e2e/` (`articles.spec.ts`, `auth.spec.ts`)
