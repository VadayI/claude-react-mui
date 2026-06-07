# Plan 0003 — Інверсія API-контракту: claude-react-mui як споживач `claude-api-contract`

> Status: 🟡 IN PROGRESS · seeded 2026-06-06 · Driver: користувацький запит — підготувати frontend-шаблон до нового шаблону `claude-api-contract` (REQUIREMENTS-claude-api-contract.md, §9 «claude-react-mui — вимоги»).
> Type: config-template change (зміни в `.claude/rules`, ADR, стартовому коді `src/lib/api`, scripts, .env.example, командах). Production-feature-pipeline не задіяний; зміни ревʼюються як звичайні PR-и шаблону.
>
> **Living plan** — дисципліна в `.claude/rules/living-plan.md`.

## Status

| Step                                                  | State   | Owner                                      |
| ----------------------------------------------------- | ------- | ------------------------------------------ |
| PR1. Джерело контракту: backend → claude-api-contract | ✅ done | orchestrator → react-developer/docs-writer |
| PR2. Auth: інверсія на Bearer/JWT (дефолт)            | ✅ done | orchestrator → react-developer             |
| PR3. Обробка 429 + Retry-After                        | pending | orchestrator → react-developer/tester      |
| PR4. Prism mock на ранній стадії                      | pending | orchestrator → react-developer/docs-writer |

> States: `pending` · `in_progress` · `done` · `blocked`. Таблиця — це курсор; оновлюється по мірі руху.

## Goal

Перевести `claude-react-mui` з моделі «контракт належить backend, frontend його споживає» на **Варіант A**: канонічний `openapi.yml` живе в окремому репо `claude-api-contract`, а frontend — **лише споживач** зовнішнього контракту, пінованого тегом (`CONTRACT_VERSION`). Разом із цим узгодити auth із рішенням №4 контракту (**Bearer/JWT** замість session/CSRF), додати обробку `429`/`Retry-After` (важливо для S2S-профілю, D5) і дати ранній dev-цикл проти **Prism mock** ще до появи backend.

Це закриває розбіжності, перелічені у §9 вимог:

- ADR auth-mode суперечить рішенню №4 (session/CSRF vs Bearer/JWT);
- `api:pull` тягне з backend-репо, а не з контракту;
- немає `CONTRACT_VERSION`-піна;
- немає обробки `429` + `Retry-After`;
- немає Prism-mock воркфлоу (є лише MSW).

## Прийняті рішення (цей раунд)

1. **Обсяг сеансу:** лише фіналізувати план (цей файл). Реалізація PR-ів — окремими наступними сеансами.
2. **Перейменування правила:** `.claude/rules/auth-and-csrf.md` → `.claude/rules/auth.md` (CSRF більше не дефолт). Потрібна правка import-блоку в `CLAUDE.md`.
3. **Стартовий `openapi.yml` у шаблоні:** підняти до **OpenAPI 3.1** і додати auth-ендпоінти (`register`/`login`/`refresh`/`logout`) + `bearerAuth`, поряд із прикладовим `todos` — щоб плейсхолдер дзеркалив форму майбутнього `claude-api-contract`.

## Поточний стан (факти обстеження, 2026-06-06)

- `scripts/api-pull.mjs` качає з `VITE_OPENAPI_URL` (дефолт `http://localhost:8000/api/schema/` — backend). Піна `CONTRACT_VERSION` немає ніде.
- `.env.example`: `VITE_API_BASE_URL=http://localhost:8000`, `VITE_OPENAPI_URL=http://localhost:8000/api/schema/`.
- `src/lib/api/openapi.yml` — OpenAPI **3.0.3**, лише `GET/POST /api/v1/todos/`, `securitySchemes: tokenAuth` (apiKey).
- `src/lib/api/client.ts` інʼєктує `Authorization: Token ${token}` (навіть не Bearer); `normaliseError()` без обробки `429`; refresh-flow у стартовому коді не реалізований.
- `src/lib/query/queryClient.ts`: `staleTime 30s`, `retry: 1` на 5xx, без retry на 4xx; мутації `retry: 0`.
- Auth-дефолт — session/CSRF (ADR `0018`); Bearer/JWT задокументований як альтернатива.
- Prism ніде не згадано; MSW налаштований як inner-loop (`src/mocks/`, `VITE_MSW_ENABLED`).
- Релевантні ADR: `0007` (frontend — окреме репо, споживає backend-контракт), `0015` (стек), `0018` (auth session/CSRF), `0019` (Node 20.19+).

## Approach

Чотири ізольовані PR-и (як радить §9/§12 — кожна інверсія ревʼюється окремо). Drift-gate (`scripts/check_types_drift.sh`) концептуально лишається — змінюється лише джерело `openapi.yml`, не механізм. Зміни до `.claude/rules`, `CLAUDE.md`, ADR і файлів на `/mnt` робити **через bash heredoc → scratch у /dev/shm → cp → verify** (Edit/Write обрізають файли на 9p).

## Steps

### PR1 — Джерело контракту: backend → `claude-api-contract` ✅

1. `scripts/api-pull.mjs`: качати з `https://raw.githubusercontent.com/VadayI/claude-api-contract/<CONTRACT_VERSION>/openapi.yml` замість backend `/api/schema/`. URL збирати з `CONTRACT_VERSION` (+ опц. `CONTRACT_REPO`/`CONTRACT_RAW_BASE` для приватних форків).
2. `.env.example`: додати `CONTRACT_VERSION=v0.1.0` (+ опц. `CONTRACT_REPO`); `VITE_OPENAPI_URL` прибрати або перенаправити на raw-URL контракту; залишити `VITE_API_BASE_URL` (на ранній стадії = Prism, див. PR4).
3. `.claude/rules/api-client.md`: контракт належить `claude-api-contract`, не backend; `api:pull` тягне пінований тег; додати «пін `CONTRACT_VERSION`, підняття = свідомий PR, ніколи не авто-drift». Зберегти drift-gate.
4. `.claude/rules/openapi-conventions.md`: дефект схеми фікситься в `claude-api-contract` (TypeSpec/Spectral), не в backend через drf-spectacular; вимоги до схеми = те, що контракт гарантує.
5. `.claude/rules/preflight.md`: критерій «backend OpenAPI доступний» → «контракт доступний» (пінований тег тягнеться `api:pull`, або Prism mock піднятий); більше не backend `/api/schema/`.
6. `.claude/rules/environment.md`: Scope 3 — додати перевірку піна `CONTRACT_VERSION` у `.env`; узгодити перелік `.env`-змінних.
7. `CLAUDE.md` (корінь): у блоці «Iron principles» / «Core principles» — контракт належить **окремому `claude-api-contract`**, а backend (`claude-django`) стає теж лише споживачем; «separate backend repository» більше не власник контракту.
8. Команди: `.claude/commands/doctor.md` (перевірка `VITE_OPENAPI_URL` → `CONTRACT_VERSION` + джерело контракту), `bootstrap.md`/`preflight.md` (`api:pull` з контракту).
9. **Новий ADR** «OpenAPI contract is external (claude-api-contract), consumed via pinned tag» — ADR 0020.
10. **sync-gate** `scripts/check_contract_sync.sh` + `contract.lock.json` + CI step «Gate — contract sync».
11. Feature migration: `todos` → `articles` (відповідно до контракту v0.1.0).

### PR2 — Auth: інверсія на Bearer/JWT (дефолт)

1. **Новий ADR**, що замінює `0018`: дефолт = Bearer/JWT user-flow (`register`/`login`/`refresh`/`logout`), refresh **у тілі відповіді** (D2) з обовʼязковою приміткою про XSS-вартість і опцію перемкнутись на httpOnly-cookie; session/CSRF лишається задокументованою альтернативою. Зафіксувати: service-flow (client credentials, scopes, D5) frontend **не стосується** — це backend + сервіси-споживачі.
2. Перейменувати `.claude/rules/auth-and-csrf.md` → `.claude/rules/auth.md`; переписати: Bearer дефолт; in-memory access token; refresh у тілі (зберігання на клієнті з приміткою про trade-off); один 401-flow (refresh → retry → редірект з `?next=`); CSRF-секція стає альтернативним same-origin режимом.
3. Оновити import-блок у `CLAUDE.md` (`@.claude/rules/auth-and-csrf.md` → `@.claude/rules/auth.md`). Перевірити інші посилання на стару назву (grep по `.claude/`).
4. `src/lib/api/client.ts`: `Authorization: Token ${token}` → `Bearer ${token}`; реалізувати refresh-flow (один refresh при 401 → retry оригінального запиту → інакше очистити auth-store + редірект).
5. Auth-store (Zustand) для in-memory access + керування refresh; узгодити зі `state-management.md` (нічого секретного не персистити).
6. `src/lib/api/openapi.yml`: підняти до 3.1, додати auth-ендпоінти + `bearerAuth` (рішення №3 цього плану); регенерувати `schema.d.ts` (`api:types`), щоб drift-gate був зелений.
7. `docs/guides/developer.md` + `docs/guides/user.md` (якщо змінюється sign-in flow): оновити секції auth.

### PR3 — Обробка `429` + `Retry-After`

1. `.claude/rules/api-error-and-pagination.md`: `429` — явний виняток із правила «never retry 4xx»; транспортний retry/backoff із повагою до `Retry-After`; `ApiError` отримує поле `retryAfter`.
2. `.claude/rules/state-management.md`: дефолти QueryClient — спец-кейс `429` (retry з backoff, на відміну від решти 4xx).
3. `src/lib/api/client.ts` / `src/lib/query/queryClient.ts`: парсинг `Retry-After` (секунди або HTTP-date) + обмежений експоненційний backoff; `normaliseError()` мапить `429`.
4. Тести (Vitest + MSW): 429 → один retry після `Retry-After` → успіх; вичерпання спроб → error-state. Триангуляція (429/інші 4xx/5xx).

### PR4 — Prism mock на ранній стадії

1. `.claude/rules/api-client.md` (або новий короткий розділ) + `.claude/rules/tdd.md`: MSW = inner-loop (Vitest), **Prism = outer-loop/dev проти контракту**; на ранній стадії `VITE_API_BASE_URL` → Prism (`http://localhost:4010`), далі staging backend.
2. `package.json`: скрипт `mock` (Prism проти стягнутого `src/lib/api/openapi.yml`, напр. `prism mock`); згадати, що канонічний Prism живе в `claude-api-contract`, а тут — локальна копія для зручності.
3. `.claude/commands/bootstrap.md` + `docs/guides/developer.md`: задокументувати ранній цикл «api:pull → mock → dev проти Prism».

## Verification

- **PR1:** `api:pull` із валідним `CONTRACT_VERSION` тягне `openapi.yml`; `api:types` + `check_types_drift.sh` зелені; `check_contract_sync.sh` зелений (вендорена копія = `openapi.yml@CONTRACT_VERSION` на GitHub), і червоніє після ручної правки вендореної копії; `grep -r "api/schema\|drf-spectacular\|backend.*openapi" .claude CLAUDE.md docs` не лишає старих згадок як джерела істини; `/doctor` перевіряє `CONTRACT_VERSION`.
- **PR2:** `grep -ri "auth-and-csrf" .claude CLAUDE.md` порожній (крім ADR-історії); `client.ts` шле `Bearer`; refresh-flow покритий тестом; drift-gate зелений після регенерації типів; jest-axe на login-екрані чистий.
- **PR3:** Vitest-тести 429/Retry-After зелені; `npm run typecheck && npm run lint` чисті.
- **PR4:** `npm run mock` піднімає Prism і віддає валідну відповідь для articles; `dev` проти Prism працює.
- **Загальне:** для кожного PR — `npm run test:run`, `typecheck`, `lint`, `check_types_drift.sh`, `check_feature_readmes.sh`, `check_file_size.sh`; файли на `/mnt` писати через heredoc + `cmp`/`wc -c`/no-NUL перевірку; commit/push із host-shell.

## Open questions

- [ ] **PR2:** Чи перейменовувати `auth-and-csrf.md` → `auth.md` в PR1 чи PR2? Поки залишено в PR2.
- [ ] **Залежність Prism.** Тягнути `@stoplight/prism-cli` як devDependency шаблону чи запускати через `npx` (вплив на lockfile/supply-chain rule)?
- [ ] **register у user-flow.** Контракт лишає `register` (D1=B). Чи стартовий frontend дзеркалить усі 4 auth-ендпоінти, чи лише login/refresh/logout (register прибирається легше)?

## Execution log

> Append-only. Короткі підтвердження фактів виконання. Відрізняється від `docs/WORKLOG.md`.

- 2026-06-06 — план засіяно (обстеження rules/коду/ADR завершено; 3 рішення зафіксовано через AskUserQuestion: лише план / rename auth.md / стартовий openapi 3.1+auth+todos).
- 2026-06-07 — PR1 done: api-pull.mjs переписано, .env.example оновлено, openapi.yml вендорено з VadayI/claude-api-contract@v0.1.0, contract.lock.json створено, schema.d.ts регенеровано, todos→articles міграція (всі файли, тести, MSW handlers, router, e2e), check_contract_sync.sh, ADR 0020, CI step «Gate — contract sync», CLAUDE.md/api-client.md/preflight.md оновлено.

- 2026-06-07 — PR2 done: authStore.ts (Zustand, in-memory Bearer/JWT), client.ts rewritten (Bearer injection + 401 refresh middleware + extended normaliseError), authApi.ts (login/logout/register), auth.md rule (supersedes auth-and-csrf.md), ADR 0021, CLAUDE.md updated, tests (authStore.test.ts + client.test.ts with MSW).

## Amendments

> Append-only. Змінене рішення не видаляється — додається запис тут + inline-вказівник біля оригіналу.

- PR1 scope розширено: включено feature migration todos→articles та sync-gate на основі обстеження контракту v0.1.0.
