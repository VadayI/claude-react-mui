# План 0005 — Оптимізація шаблону: дедуплікація процесів і скорочення автоконтексту

> Створено: 2026-07-07. Джерело: повний аудит мета-шару (4 паралельні агенти: інвентаризація · rules · agents/commands/skills · плагіни) + ручна верифікація ключових тверджень.
> Рішення користувача (2026-07-07): engineering-плагін — прибрати; guide-writer — злити в docs-writer; автоконтекст — максимальне скорочення (−25%); консолідації команд — усі чотири (/plugins+/config-check→/doctor, /handoff→/wrap-up --quick, a11y-auditor поза дефолтним /review-pr, README §Routes → покажчик).
> Виконання: PR-only, кожен блок = окремий PR. Це мета-зміни конфігурації (не React-код) — TDD-пайплайн не застосовується, але кожен PR проходить reviewer-перевірку і наскрізну верифікацію (див. кінець).

## Таблиця статусів

| # | Крок (PR) | Стан | Виконавець |
|-----|--------------------------------------------------------------|---------|------------|
| PR1 | Блок A — протиріччя, stale-фікси, плагіни | in_progress | orchestrator + агенти |
| PR2 | Блок B1 — злиття rules (testing→tdd, API-родина) | pending | — |
| PR3 | Блок B2 — binds→агенти, environment→on-demand, дедуп пасажів | pending | — |
| PR4 | Блок C — агенти й команди | pending | — |
| PR5 | Блок D — документаційний податок | pending | — |

## Виконавчий журнал (append-only)

- 2026-07-07 — аудит завершено, план створено, рішення користувача зафіксовано (див. шапку).
- 2026-07-07 — PR1: правки Блоку A застосовано в робочому дереві (18 файлів, 44+/64−; settings.json → JSON OK, NUL=0, grep-звірки чисті). A1 виконано лише в команді — `agents/template-sync.md` уже був канонічним. Понад план (та сама категорія A2): 3 згадки «backend OpenAPI» (bootstrap.md, guides.md, templates/api_INDEX.md) та amended-маркер у рядку 0005 ADR-індексу; ADR 0011 отримав Amendment-секцію. Урок: git у sandbox лишає невидаляний `.git/index.lock` — прибрати з host перед комітом. Очікує host-shell: branch → commit → push → PR.

## Поправки (append-only)

—

## Вихідні цифри

- Мета-шар: 135 файлів / ~9 496 рядків (rules 32/1743 · agents 22/1365 · commands 21/1780 · skills 12/1359 · templates 31/1776 · scripts 17/1473).
- Автоконтекст сесії: CLAUDE.md (96) + 27 авто-імпортованих rules (1 476) = **1 572 рядки** (~25–30k токенів).
- Ціль: ≤ ~1 200 рядків автоконтексту (−25%), −1 агент, −3 команди, −1 плагін, кожна специфікація в 1 копії.
- Плагіни: прямих дублікатів локальних агентів/скілів НЕМА (playwright/github/context7 — лише MCP; superpowers — стек-агностична методологія). Локальні скіли не чіпаємо.

## PR1 — Блок A: виправлення протиріч (нічого не видаляє)

**A1. Узгодити `/update-from-template` ↔ `template-sync` (живий баг).**
Команда стає тонким диспетчером: лог, branch-guard, `git clone --depth 1` upstream у `$UPSTREAM` (тимчасова тека) — далі все робить агент. Ownership-таблиця лишається ТІЛЬКИ в `agents/template-sync.md`; з команди прибрати списки буккетів. Узгодити: `package.json` = merge-by-hand (позиція агента); template-owned включає `.claude/skills/**`, `api-pull.mjs`, `session-start.sh`, `setup-wsl.sh`, `install.sh`, `templates/**`.
Файли: `.claude/commands/update-from-template.md`, `.claude/agents/template-sync.md`.

**A2. Stale-фікси (7 позицій).**
1. `upgrade-policy.md:20` — Router 7 вже прийнято (ADR 0026); прибрати з "next major migrations".
2. "backend OpenAPI" → "contract repo": `tdd.md:26`, `user-guides.md:6,24` (і "backend's Swagger/Redoc" → contract repo / Prism).
3. `CLAUDE.md:82` — stack-рядок середовища: додати native Windows + Git Bash (ADR 0028).
4. `workflow.md` таблиця фази 6 — guide-writer позначити optional (після PR4 — замінити на docs-writer).
5. `agents/reviewer.md:25` — прибрати цитату testing.md про "success/400/401/403/404" (бекенд-залишок); замінити посиланням на tdd.md (чотири UI-стани).
6. `docs/decisions/README.md` — додати 0027, 0028 в індекс.
7. `performance-budgets.md` — CWV одразу позначити advisory до появи Lighthouse CI (зараз "The budgets" зверху суперечить "not yet wired" знизу).

**A3. Прибрати `engineering@knowledge-work-plugins`** з `enabledPlugins` (`.claude/settings.json`) і з baseline-списків: `rules/environment.md` Scope 2, `commands/doctor.md` (config-check.md/plugins.md зникнуть у PR4 — якщо PR4 відкладається, оновити і їх).

**A4. Нота пріоритету superpowers у CLAUDE.md** (2–3 рядки): пайплайн workflow.md і PR-only iron rule мають пріоритет над process-скілами superpowers (writing-plans / executing-plans / subagent-driven-development; merge-опції finishing-a-development-branch не застосовуються).

Ризик: низький.

## PR2 — Блок B1: злиття rules

**B1a. `testing.md` → `tdd.md`.** Перенести "Stack & locations" + "Test structure" (AAA, іменування) підрозділом у tdd.md; видалити testing.md; переадресувати всі вхідні посилання (grep `@.claude/rules/testing.md`: CLAUDE.md, agents/reviewer.md, ін.). Зникає і клауза "tdd wins" — конфлікту більше нема.

**B1b. API-родина → один `api-contract.md`.** Злити `api-client.md` (75) + `openapi-conventions.md` (24) + `api-error-and-pagination.md` (40) + `contract-deviations.md` (46) = 185 рядків → ~110–120. Секції: Джерело правди й два CI-гейти · Типи/клієнт/маппери · Помилки (ApiError) й пагінація (Page<T>) · Схемна гігієна · Ledger відхилень (CONTRACT_ISSUES). Переадресувати ~28 вхідних `@`-посилань (api-client — 17×). CLAUDE.md import-блок: 4 рядки → 1.

Ризик: середній (посилання). Верифікація PR: grep на старі імена = 0 збігів.

## PR3 — Блок B2: binds → агенти, environment → on-demand, дедуп

**B2a. Видалити 21 секцію "Binds these agents" з rules (~170 рядків).** Перед видаленням звірити кожен пункт зі Standards-списком відповідного агента; відсутні обовʼязки ДОДАТИ агенту (переносимо, не губимо). Routing лишається у workflow.md.

**B2b. `environment.md` (96 р.) → on-demand.** Прибрати з import-блоку CLAUDE.md; переконатися, що `/doctor` і `/bootstrap` самі `@`-посилаються на нього (додати, якщо ні). CLAUDE.md вже містить сесійно-критичний мінімум (env-detect.json, 9p-правило).

**B2c. Дедуп пасажів (канон → покажчики):** guards — канон component-contract.md (routing-and-data-loading.md:25 → 1 рядок); lazy-split "the shell + first route is the only synchronous JS" — канон performance-budgets.md (routing:5,10 → покажчик); "mock cannot drift" — канон tdd.md. Пʼять секцій "## Testing (mandatory)" (component-contract, forms-and-validation, i18n, observability, routing) → одна таблиця доменних перевірок у tdd.md + покажчики.

**B2d. Footers:** 8 рядків "> Skill: activate…" → одна таблиця "правило → скіл" у CLAUDE.md; 21 рядок "> Goal:" — видалити.

Ризик: середній — нормативний зміст переноситься, side-by-side чек-лист перенесених пунктів додається в PR-опис.

## PR4 — Блок C: агенти й команди

**C1. `guide-writer` → злити в `docs-writer`.** Обовʼязки (ownership обох guides + reconciliation) переходять у docs-writer; видалити `agents/guide-writer.md`; `/guides` і `/update-docs` диспатчать docs-writer; оновити CLAUDE.md "Available agents", workflow.md фазу 6, rules/user-guides.md.

**C2. Єдине джерело специфікацій (3 дрейфи, що вже розійшлися):**
- Секції guides — ТІЛЬКИ в `rules/user-guides.md`; docs-writer і `commands/guides.md` посилаються, не перелічують.
- PROJECT.md-скаффолд — ТІЛЬКИ в `templates/PROJECT.md`; `/synthesize-brief` і `brief-synthesizer` посилаються на шаблон.
- Verify-секції — ТІЛЬКИ в `rules/verification.md`; 5-ту секцію "Accessibility spot-check" з `/verify` додати в rule (корисна), команда посилається.

**C3. Видалити `/config-check` і `/plugins`; функціонал у `/doctor`** (scope 2 вже покриває; додати швидкий режим `--config` у doctor.md). Baseline плагінів лишається в environment.md — 1 копія.

**C4. Видалити `/handoff`; у `/wrap-up` додати режим `--quick`** (лише регенерація HANDOFF.md). Оновити CLAUDE.md п.6 "Context in Git" і згадки в rules.

**C5. `/review-pr` — прибрати a11y-auditor з дефолтного диспатчу**; примітка: "для interaction-heavy фіч — окремо /a11y-audit".

**C6. Дрібне:** `state-architect.md` description → review-only (дизайн ключів робить ui-architect); `reviewer.md` чекліст → "звіряй output гейтів у CI/PR" замість "запускай" (нема Bash); `commands/guides.md` — прибрати hardcoded "nine gate scripts".

Ризик: низький-середній. Верифікація PR: grep згадок guide-writer / config-check / plugins.md / handoff у `.claude/**`, `CLAUDE.md`, `templates/**` = 0 (WORKLOG-історію не чіпати).

## PR5 — Блок D: документаційний податок

**D1. README фічі: §Routes та §Consumed endpoints → покажчики** на `.claude/memory/routes.json` і `docs/api/INDEX.md` (мапа route+endpoint зараз у 4–5 копіях). Оновити `templates/FEATURE_README.md`, `rules/feature-readme.md` (секції 2 і 5), існуючі `src/features/{articles,auth}/README.md`. Реконсиляція docs-writer спрощується до 2 пар: routes.json ↔ router.tsx, INDEX.md ↔ schema.

**D2. Gates-маніфест.** Канонічний перелік = `ls scripts/check_*.sh` + людський індекс у node-commands.md. У `create-pr.md`, `wrap-up.md`, `bootstrap.md`, `fix-ci.md` перелічені списки → "запусти всі `scripts/check_*.sh`" або посилання. Новий гейт = 2 файли (скрипт + CI) замість ~7.

Ризик: середній (README втрачає самодостатність — рішення користувача прийнято свідомо).

## Наскрізна верифікація (кожен PR)

1. `grep -RIn "@.claude/rules/"` по `.claude/`, `CLAUDE.md`, `docs/`, `templates/` — нуль посилань на видалені/перейменовані файли.
2. Підрахунок автоконтексту (CLAUDE.md + файли import-блоку): ціль ≤ ~1 200 рядків після PR3.
3. Повний локальний прогін гейтів + зелений CI.
4. Сумісність `template-sync`: видалені файли зʼявляться у "Stale"-звіті похідних проєктів — очікувано; у PR-описи додати міграційну примітку для похідних проєктів.

## Поза скоупом (занотовано)

- `LOCAL/` у корені (27 файлів стороннього проєкту) — перевірити, чи в `.gitignore`.
- Рефактор `bootstrap.md` (259 р.) — не зараз.
- Злиття code-structure-auditor ↔ react-refactoring-expert — відхилено (лишаємо дешевий sonnet-аудит).
- Lighthouse CI wiring — окремий план (`ci-gates-plan.md`).
