# Project Handoff — 2026-06-09

## Current branch

`main` — усі заплановані фічі сесії злиті; нова feature-гілка ще не відкрита.

## Last work done

- **PR #26 злито** — `RequireAuth` route guard + `LoginPage` з повноцінним login-flow (Bearer/JWT, react-hook-form + Zod, RTL + Playwright).
- **PR #25** — виправлено `npm run typecheck`: тепер реально перевіряє `src/` через `tsc -b` project references (раніше був no-op).
- **PR #23** — виправлено a11y: додано `aria-label` до спінера на `ArticlesPage` (aria-progressbar-name).
- **PR #21** — `/bootstrap` запитує джерело контракту (A/B/C) перед скаффолдом.
- **PR #19** — runtime API target switch: env-gated MSW startup + env-aware handlers.

## Open PRs

Немає відкритих PR.

## Project state

- Tests: ✅ зелені (81 passed, 13 test files)
- Types: ⚠️ `schema.d.ts` має незакомічені зміни (recurring drift між `npm run api:types` та `npx openapi-typescript`)
- Lint: ✅ чистий
- Stubs: ✅ немає
- File size: ✅ всі файли < 400 рядків
- Feature READMEs: ✅ (`articles/`, `auth/`)
- Typecheck: ✅ (tsc -b)

## In-progress work

Немає активних планів у `docs/plans/` — усі попередні закриті або є legacy-нотатками.

Архівні плани (не активні):

- `0001-handoff-wiring.md`, `0002-bootstrap-stack-drift.md`, `0003-api-contract-inversion.md`
- `ci-gates-plan.md`, `fix-file-truncation.md`

## Next steps

1. **Розслідувати `schema.d.ts` drift** — чому `npm run api:types` і `npx openapi-typescript` дають різний формат; закомітити стабільний варіант або нормалізувати команду генерації (`npm run` повинен бути канонічним).
2. **Створити `docs/verify/auth.md`** — auth-фіча (RequireAuth + LoginPage) злита без документа верифікації; порушення `verification.md`.
3. **Виправити `logout()` → `queryClient.clear()`** — серверний стан залишається в кеші TanStack Query після виходу (shared-device security gap); окремий PR.
4. **Налагодити `check_contract_sync.sh`** — потребує `CONTRACT_VERSION=v0.2.0` у `.env` для локального проходження; перевірити `.env.example`.
5. **Наступна фіча** — через стандартний пайплайн (`ba → ui-architect → ...`).

## Open questions

- [ ] Чому `npm run api:types` і `npx openapi-typescript` генерують різний формат `schema.d.ts`? Яка команда є канонічною і чи потрібно оновити `package.json` scripts?
- [ ] `logout()` + `queryClient.clear()`: чи достатньо лише `clear()`, чи потрібен також `invalidate()`? Чи потрібен редирект до `/login` в самому store?
- [ ] `check_contract_sync.sh`: чи повинен `CONTRACT_VERSION` бути захардкоджений у `.env.example` як `v0.2.0` чи залишатись placeholder?
- [ ] `docs/verify/auth.md` — генерувати через `docs-writer` agent в окремому PR чи додати вручну?

## Key file locations

- Router: `src/app/router.tsx`
- API client: `src/lib/api/client.ts`
- API types (generated): `src/lib/api/schema.d.ts`
- Auth store: `src/lib/auth/authStore.ts`
- Route guards: `src/app/guards/`
- Feature list: `src/features/` (`articles/`, `auth/`)
- Routes registry: `.claude/memory/routes.json`
- Verification docs: `docs/verify/` (`articles.md` — є; `auth.md` — **відсутній**)
- Guides: `docs/guides/` (`user.md`, `developer.md`)
- API INDEX: `docs/api/INDEX.md`
- Contract: `src/lib/api/openapi.yml` (vendored від `VadayI/claude-api-contract@v0.2.0`)
