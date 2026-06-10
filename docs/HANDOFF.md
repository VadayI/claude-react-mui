# HANDOFF — claude-react-mui

> Read this first when joining the project. Updated by `/wrap-up` at end of each session.
> Last updated: 2026-06-10 (session — template-v1-complete)

## Current state

**Branch:** `main`
**Last PR merged:** #33 — `docs: minor WORKLOG cleanup`

The app is a fully working React + MUI frontend with:

- JWT auth (login/logout with QueryCache flush, RequireAuth guard)
- Articles CRUD (list + protected routes)
- Full test suite: 82 Vitest tests (13 files) + Playwright E2E (6 tests)
- All CI gates passing
- Claude Code config: design-reference rule wired into /synthesize-brief and UI agents

**Template status: v1 COMPLETE** — шаблон вважається стабільним і завершеним у поточній версії. Подальша робота — або новий проєкт на базі шаблону, або нова версія шаблону.

## What was done this session

1. **`/audit`** — виявлено phantom diff `schema.d.ts` (9p inode cache). Після регенерації `npm run api:types` файл збігся з HEAD — реальних змін не було.
2. **PR #33 змержено** — мінорна косметика WORKLOG.
3. **`/preflight`** — всі критичні пункти ✅: brief, stack, contract (`v0.2.0`), GitHub, Context7. DX-нотатка: `api:pull` потребує env vars у shell.
4. **Оголошено завершення роботи над версією шаблону.**

## Next steps

- Використати шаблон для нового проєкту: `bash <(curl -fsSL .../install.sh)` → `/bootstrap` Mode A
- Або відкрити нову версію шаблону (React 19 / MUI 7 bump тощо)

## Open questions

- Чи варто додати `api:pull` auto-load `.env` у скрипт (або нотатку у `docs/guides/developer.md`)?
- Чи варто додати нотатку в `api-client.md` про теги контракту без `openapi.yml` (v0.3+/v0.4+)?
- Коли `claude-api-contract` опублікує тег з реальними змінами в `openapi.yml` (тригер для pin bump)?

## Gate status (last run)

| Gate            | Status       |
| --------------- | ------------ |
| typecheck       | ✅           |
| lint            | ✅           |
| tests           | ✅ 82 passed |
| types-drift     | ✅           |
| contract-sync   | ✅           |
| stubs           | ✅           |
| file-size       | ✅           |
| feature-readmes | ✅           |

## Key files

- `src/lib/api/` — typed client, openapi.yml (pinned v0.2.0), schema.d.ts
- `src/features/auth/` — login, logout, RequireAuth guard, authStore
- `src/features/articles/` — articles list, API hooks
- `e2e/` — Playwright specs (auth + articles)
- `.claude/rules/design-reference.md` — Claude-design prototype as UI source of truth
- `.claude/commands/synthesize-brief.md` — scans docs/design/, Step 1.5, design_folder dispatch
- `docs/verify/auth.md` + `docs/verify/articles.md` — manual verification checklists
