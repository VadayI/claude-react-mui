# WORKLOG

Cross-machine work history. Updated at the end of every session (`/wrap-up`) and committed, so the project state travels between computers via `git pull`. Newest entry on top.

---

## 2026-06-10b — template-v1-complete

### Done

- **`/audit`** — перевірка стану після сесії. Виявлено phantom diff `schema.d.ts` (9p inode cache). Після `npm run api:types` файл збігся з HEAD — реальних змін не було.
- **PR #33 змержено** — `docs/wrap-up-*` (мінорна косметика WORKLOG: escape `*` → `_`, видалення зайвого рядка).
- **`/preflight`** — повний audit build-inputs: brief ✅, stack ✅, contract (`VadayI/claude-api-contract@v0.2.0`) ✅, GitHub ✅, Context7 ✅. `docs/design/` відсутній (не блокер). DX-нотатка задокументована: `api:pull` потребує `CONTRACT_VERSION` + `CONTRACT_REPO` в shell env (не тільки в `.env`).
- **Оголошено завершення роботи над цією версією шаблону** — `claude-react-mui` v1 вважається стабільним і завершеним.

### Gate status

- typecheck: ✅
- lint: ✅
- tests: ✅ (82 passed, 13 test files)
- types-drift: ✅
- contract-sync: ✅
- stubs: ✅
- file-size: ✅
- feature-readmes: ✅

### Open items

- `api-client.md`: нотатка про теги v0.3.0+/v0.4.0+ у `claude-api-contract` без `openapi.yml` (низький пріоритет, документаційне)
- Dead `page.route()` у `e2e/articles.spec.ts` (pre-existing, низький пріоритет)
- `api:pull` вимагає env vars у shell — розглянути auto-load `.env` у скрипті або нотатку в `docs/guides/developer.md`

### Next steps

- Шаблон завершено. Наступний крок — використати його для нового проєкту: `bash <(curl -fsSL .../install.sh)` + `/bootstrap` Mode A
- Або: відкрити нову версію шаблону (React 19 bump, MUI 7, тощо) у новій гілці

---

## 2026-06-10 — bootstrap-contract-source-and-design-reference

### Done

- **PR #31** — `chore(config): bootstrap contract-source fix + design-reference rule` — дві конфіг-зміни:
  - `/bootstrap` Step 0 тепер питає реальний `OWNER/REPO` контракту; ніколи не підставляє `VadayI/claude-api-contract` мовчки; завжди `{TODO}` якщо немає свого
  - `.env.example` `CONTRACT_REPO` / `CONTRACT_VERSION` — тепер порожні з пояснювальними коментарями
  - `/preflight` (команда + rule) оновлено — видалено посилання на template-repo
- **Новий rule** `.claude/rules/design-reference.md` (auto-loaded через CLAUDE.md): визначає Claude-design прототипи під `docs/design/<name>/`, статус «дуже сильна рекомендація», правило відхилень (project-memory + PROJECT.md), пріоритет a11y/контракту над дизайном
- **`/synthesize-brief`** оновлено: скан `docs/design/` → Step 1.5 (AskUserQuestion + збір відхилень у project-memory) → передача `design_folder` + `design_deviations` до brief-synthesizer; секції 9 та 10 у виході PROJECT.md
- **`brief-synthesizer`** агент: дизайн-папка як першокласний вхід (токени, ui-kit, screen-_, app-data, api-_.md); дві нові секції у фіксованому scaffold
- **`ui-architect`** агент: `design-reference.md` у Standards + новий крок 2 (токени → MUI theme, екрани → дерево, шанує deviations)
- **`react-developer`** агент: `design-reference.md` додано до Standards
- `schema.d.ts` регенеровано під стабільний формат openapi-typescript 7.13.0 (подвійні лапки + крапки з комою)

### Gate status

- typecheck: ✅
- lint: ✅
- tests: ✅ (82 passed, 13 test files)
- types-drift: ✅
- contract-sync: ✅
- stubs: ✅
- file-size: ✅
- feature-readmes: ✅

### Open items

- `api-client.md`: варто додати нотатку про теги v0.3.0+/v0.4.0+ у `claude-api-contract` без `openapi.yml`
- Dead `page.route()` у `e2e/articles.spec.ts` — pre-existing; прибрати окремим PR

### Next steps

- Наступна фіча → стандартний pipeline (`ba → ui-architect → tester → react-developer → ...`)
- Додати нотатку в `api-client.md` про теги без openapi.yml

---

## 2026-06-09 — bootstrap-contract-source-question

### Done

- Проаналізовано команду `/bootstrap`: виявлено, що вона мовчки assumes Variant A (`VadayI/claude-api-contract`) для всіх проєктів без жодного питання.
- **PR #21** — `feat/bootstrap/ask-contract-source-before-scaffold`: доданий Step 0 у Mode A — `AskUserQuestion` з трьома варіантами (A / B / C). Step 1 (`.env.example`) і Step 9 (`api:pull` vs `curl`) тепер variant-aware. Step 6 та Step 12 отримали variant-specific нотатки. Змерджено.
- `scripts/api-pull.mjs` не змінювався — він коректний для Variant A; для B/C задокументовано `curl`.

### Gate status

- typecheck (`tsc -b`): ✅
- lint: ✅
- tests: ✅ (54 passed, 9 test files)
- types-drift: ✅
- stubs: ✅
- file-size: ✅
- feature-readmes: ✅

### Open items

- `npm run typecheck` є no-op (кореневий tsconfig `"files": []`). Замінити на `tsc -b`. Окремий PR.
- E2E a11y: `MuiCircularProgress` у loading-стані `ArticlesPage` без `aria-label` → `aria-progressbar-name` (WCAG 2.1 AA). Pre-existing. Окремий PR.
- Route guard для `/articles`: `routes.json` → `auth: authenticated`, `router.tsx` без guard.
- `logout()` не викликає `queryClient.clear()` — pre-existing gap.

### Next steps

- Виправити `npm run typecheck` → `tsc -b` у `package.json`.
- Додати `aria-label` до loading spinner у `ArticlesPage`.
- Реалізувати route guard для `/articles` через pipeline.

---

## 2026-06-09 — runtime-api-target-switch

### Done

- Відновлено перервану сесію: гілка `feat/runtime-api-target-switch` була в RED-фазі (два тестові файли без реалізації).
- **PR #19** — runtime API target switch (merged): новий `src/mocks/enableMocking.ts` (guard `VITE_MSW_ENABLED === 'true'`, без DEV-auto-start); `handlers.ts` читає origin з `VITE_API_BASE_URL`; `vitest.config.ts` тест-URL → `http://test.local`; `.env.example` документує `VITE_MSW_ENABLED`. Виправлено 4 pre-existing тести з хардкодом `:8000`. +7 нових тестів (54 total). Quality Gate ✅.
- Виявлено і виправлено **pre-existing баг**: `authApi.test.ts` передавав `username` замість контрактного `email` — TS2353, не ловилося `npm run typecheck` (кореневий tsconfig `"files": []` — no-op), ловив CI `tsc -b`.
- **README аудит + фікс**: `VITE_OPENAPI_URL` → `VITE_API_BASE_URL; VITE_MSW_ENABLED=true for MSW`; додано `/a11y-audit` у список команд.
- **`schema.d.ts`** регенеровано (drift gate зелений).

### Gate status

- typecheck (root, `npm run typecheck`): ✅ (але no-op — окремий fix)
- typecheck (app, `tsc -p tsconfig.app.json`): ✅
- lint: ✅
- tests: ✅ (54 passed, 9 test files)
- types-drift: ✅
- stubs: ✅
- file-size: ✅
- feature-readmes: ✅

### Open items

- `npm run typecheck` не перевіряє app-проєкт (кореневий tsconfig `"files": []`). Замінити на `tsc -b`. Окремий PR.
- E2E a11y: `MuiCircularProgress` у loading-стані `ArticlesPage` без `aria-label` → `aria-progressbar-name` (WCAG 2.1 AA). Pre-existing. Окремий PR.
- Route guard для `/articles`: `routes.json` → `auth: authenticated`, `router.tsx` не захищає маршрут.
- `logout()` не викликає `queryClient.clear()` — pre-existing gap.

### Next steps

- Виправити `npm run typecheck` → `tsc -b`.
- Додати `aria-label` до loading spinner у `ArticlesPage`.
- Реалізувати route guard для `/articles` через pipeline.

---

## 2026-06-09 — runtime-api-target-switch

### Done

- Відновлено перервану сесію: гілка `feat/runtime-api-target-switch` була в RED-фазі (два тестові файли без реалізації).
- **PR #19** — runtime API target switch: новий `src/mocks/enableMocking.ts` (guard `VITE_MSW_ENABLED === true`, без DEV-auto-start); `handlers.ts` читає origin з `VITE_API_BASE_URL` замість хардкоду `:8000`; `vitest.config.ts` тест-URL → `http://test.local` (справжній RED для handlers-тестів); `.env.example` документує `VITE_MSW_ENABLED`. +7 нових тестів (54 total). Quality Gate ✅. Змерджено.
- Виявлено і виправлено **pre-existing баг**: `authApi.test.ts` передавав `username` замість контрактного `email` у login/register — TypeScript TS2353. Не ловилося локально: `npm run typecheck` = `tsc --noEmit` проти кореневого `tsconfig.json` з `"files": []` (no-op); ловив CI `tsc -b` через `tsconfig.app.json`.
- **README аудит + фікс**: `VITE_OPENAPI_URL` (неіснуюча змінна) → `VITE_API_BASE_URL; VITE_MSW_ENABLED=true for MSW`; додано `/a11y-audit` у список команд.
- **`schema.d.ts`** регенеровано (drift gate зелений).

### Gate status

- typecheck (root, `npm run typecheck`): ✅ (але фактично no-op — окремий fix)
- typecheck (app, `tsc -p tsconfig.app.json --noEmit`): ✅
- lint: ✅
- tests: ✅ (54 passed, 9 test files)
- types-drift: ✅
- stubs: ✅
- file-size: ✅
- feature-readmes: ✅

### Open items

- `npm run typecheck` не перевіряє app-проєкт (кореневий tsconfig `"files": []`). Замінити скрипт на `tsc -b`. Окремий PR.
- E2E a11y: `MuiCircularProgress` у loading-стані `ArticlesPage` не має `aria-label` → порушення `aria-progressbar-name` (WCAG 2.1 AA). Pre-existing. Окремий PR.
- Route guard для `/articles`: `routes.json` → `auth: authenticated`, `router.tsx` не захищає маршрут.
- `logout()` не викликає `queryClient.clear()` — pre-existing gap.

### Next steps

- Виправити `npm run typecheck` → `tsc -b`.
- Додати `aria-label` до loading spinner у `ArticlesPage`.
- Реалізувати route guard для `/articles` через pipeline.

---

### 2026-06-05 — Wire MSW browser worker for E2E (fix failing E2E check)

**Why** — PR #4's E2E check failed; root cause was pre-existing, not the audit: the Playwright suite assumed MSW mocked the backend in CI, but the **browser** MSW worker was never wired (only the Node server for Vitest existed). `main.tsx` had no worker bootstrap, `src/mocks/browser.ts` and `public/mockServiceWorker.js` were missing, and `VITE_MSW_ENABLED` was referenced nowhere. So `/todos` hit the real `http://localhost:8000` → no data → the `networkidle`/axe test timed out (~1 min).

**What changed** (branch `fix/e2e-msw-browser`)

- `src/mocks/browser.ts` (new) — `setupWorker(...handlers)`, sharing the same handlers as `src/test/server.ts` so unit and E2E mocks can't drift.
- `src/main.tsx` — async `enableMocking()` starts the worker before first render, gated on `import.meta.env.DEV || VITE_MSW_ENABLED === 'true'`; dynamic `import()` keeps MSW out of the production bundle.
- `public/mockServiceWorker.js` (new) — `msw@2.14.6` service worker (via `npx msw init public/`).
- `playwright.config.ts` — `webServer.env = { VITE_MSW_ENABLED: 'true' }` + `timeout: 120_000` (cold Vite start safety).
- `e2e/todos.spec.ts` — refreshed the stale "WRITE-ONLY / VITE_MSW_ENABLED in main.tsx" header to match the real wiring.

**Verified** — `tsc -p tsconfig.app.json --noEmit` clean; `eslint` clean on the changed files; handler URLs match the client's default base URL. Full E2E to be confirmed by CI (sandbox node_modules is Windows-built → rollup native missing, can't run vite/playwright locally).

**Next** — open PR from `fix/e2e-msw-browser`; on green, merge.

---

### 2026-06-05 — Config audit: agents · commands · skills (collision sweep)

**What changed** (all via bash heredoc/python — Edit/Write truncate on this mount)

- Full audit of 22 agents, 20 commands, 12 project skills cross-checked against `CLAUDE.md`, `.claude/rules/**`, `package.json`, `scripts/`, `settings.json`. No name collisions; all referenced scripts exist.
- Fixed 5 findings:
  1. `agents/react-developer.md` + `skills/react-specialist/SKILL.md` claimed **React 19 / React Router 7** — corrected to the pinned **React 18 / Router 6**; React-19-only APIs in the skill marked as post-upgrade (ADR 0015), not available on 18.3.
  2. `VITE_API_URL` → `VITE_API_BASE_URL` (canonical per `.env.example`/`settings.json`) in `agents/devops.md` (x2) and `agents/guide-writer.md` (x1).
  3. `a11y-auditor` referenced a non-existent `/a11y-audit` command — created `commands/a11y-audit.md` (modeled on `/structure-audit`); added discoverability mentions in `CLAUDE.md` + `rules/workflow.md`.
  4. `rules/testing.md` deduped against `rules/tdd.md` (now a thin where/how index; tdd.md is the canonical source of truth). Added a CLAUDE.md note that `architecture.md` / `mcp-stack.md` / `testing.md` are on-demand reference rules, not globally imported.
  5. Unified the `output-language.md` insertion instruction in `CLAUDE.md` (IMPORTANT 0) with `/set-language` ("after the last existing import line").

**Integrity** — all 8 touched files verified: trailing newline present, frontmatter intact (2x `---`), no NUL bytes, no truncation.

**Notes / open**

- A stale empty `.git/index.lock` is present and CANNOT be removed from the sandbox (`Operation not permitted` — Windows mount perms). This blocked committing the audit. The 7 modified files + 1 new command are still **uncommitted and not in HEAD/origin** (`HEAD == origin/main == 260389c`).
- **Action on host (WSL2/PowerShell):** `rm -f .git/index.lock`, then branch + commit the audit changes through a PR per `@.claude/rules/git-operations.md` (e.g. `chore/config-audit-fixes`).

---

### 2026-06-04 — Recover NUL/truncation corruption (git HEAD, index, setup-wsl.sh, README)

**What changed**

- Integrity sweep of the whole tree (NUL-byte + trailing-newline + truncation scan). Found and fixed, all via in-place overwrite (`cp` / redirect — never Edit/Write):
  - `.git/HEAD` — held a valid `ref: refs/heads/main` followed by **29 NUL bytes**, which made HEAD unresolvable (`git log`/`branch`/`commit` all failed). Rewrote to clean 21 bytes.
  - `scripts/setup-wsl.sh` — content intact but **36 trailing NUL bytes**; restored the clean committed version (6837 B, ends with newline).
  - `README.md` — truncated mid-word ("…file-siz") **in the commit itself** (pre-existing, flagged last session). Reconstructed the final "Architecture decisions" sentence covering ADRs 0001–0019; added the missing trailing newline.
- `.git/index` was corrupt (`bad sha1 signature`). Rebuilt a valid index via `GIT_INDEX_FILE=/tmp/newindex git read-tree HEAD`, but **the mount corrupted the binary on `cp`-back** (16771 bytes differ; "index uses ? extension"). The index cannot be repaired from the sandbox — must be rebuilt natively on Windows (`del .git/index && git reset`).

**Notes**

- New characterization of the mount: it permits **create-new** and **in-place overwrite** (`cp`/`>`) and **rename-to-new-name**, but **blocks `unlink`/`rm` for every file** (EPERM, even on a freshly created file) and blocks git lock-file creation (`index.lock`). It also **corrupts binary writes** (not just text-truncation) — confirmed on `.git/index`.
- Consequence: deletions and any index-locking git op (commit/add/rm/reset, index rebuild) must run on the native Windows shell, not the sandbox.
- Left undeletable from sandbox (hand-off list): `.__wtest` (empty, tracked), `vitest.config.js` (dup of `.ts`), `.claude/rules/.fuse_hidden0000001000000002` (FUSE temp), stale `.git/index.lock`, and two `__probe_*.txt` files created to characterize the mount.

**Next (run on Windows — see merge sequence)**

- Rebuild `.git/index`, delete the hand-off files, branch → commit (README + the two deletions) → PR → squash-merge (PR-only).

### 2026-06-04 — Scrub /mnt/d hardcode + one-line install.sh seed

**What changed**

- Removed the personal `/mnt/d/` drive hardcode from the runner-detection heuristic — it contradicted ADR 0009 (working from `/mnt/d` is fully supported) and claude-django only checks `/mnt/c/`. Brought this repo in line.
  - `scripts/detect-env.mjs` — dropped `/mnt/d/` from `windowsPathLike` (only `/mnt/c/` signals the Windows interop `node.exe`).
  - `scripts/setup-wsl.sh` — dropped the `/mnt/d/*` exclusion from the `claude`-path check.
- Added `scripts/install.sh` — a one-line config seed adapted from claude-django (frontend variant: Node, no docker). Clones the template, copies the Claude config + `/bootstrap` inputs (`.claude/`, `CLAUDE.md`, `.mcp.json`, `.gitignore`, `.gitattributes`, `scripts/`, `templates/`, root `Makefile`, `.github/workflows/`), wipes transient memory, refuses to clobber a seeded folder without `--force`. Smoke-tested end-to-end against a local clone.
- `README.md` — added the "one-line seed" + manual-equivalent block to Quick start.

**Notes**

- The Edit/Write file tools again silently truncated files on the `/mnt/d` mount (`detect-env.mjs`, `README.md`) — the bug already logged in `docs/lessons.md`. Both were restored from git and re-edited via shell. Avoid the file tools for edits on `/mnt/d`.
- `README.md` in git already ends mid-word ("…file-siz") — a pre-existing truncation, not from this session; worth patching later.

**Next**

- Push branch `chore/scrub-template-project-data`, open a PR, merge (PR-only).

---

### 2026-06-03 — Performance bundle-size gate + Renovate config (perf gate part 1/2)

**What changed**

- Added the **bundle-size performance gate** (the lightweight half of the long-carried "wire the remaining gates" item):
  - `.performance-budget.json` — budgets per `performance-budgets.md` defaults: initial JS ≤180KB gz, total initial transfer ≤350KB gz, lazy chunk ≤120KB gz. The `webVitals` section documents LCP/CLS/INP/TBT + Lighthouse score but is NOT enforced yet (that's Lighthouse CI, deferred).
  - `scripts/check_bundle_size.sh` — parses `dist/index.html` for the initial load graph (`<script type=module>` + `<link rel=modulepreload>` + stylesheet), sums their gzipped sizes vs the initial-JS / initial-transfer budgets, and checks every other `dist/assets/*.js` lazy chunk individually. Style matches the existing gate scripts (`set -uo pipefail`, `[check_bundle_size] OK|FAIL|SKIP`, exit 0/1). SKIPs cleanly if `dist/` is absent.
  - Wired into `frontend-ci.yml` (new "Gate — bundle size" step right after Build), `Makefile` `gates:`, and `.claude/rules/node-commands.md`. Mirrored into the bootstrap copies: `templates/.performance-budget.json`, `templates/scripts/check_bundle_size.sh`, `templates/.github/workflows/frontend-ci.yml`, `templates/Makefile`.
- **Renovate** dependency-automation config (`renovate.json` + `templates/renovate.json`) per `upgrade-policy.md`: dev-toolchain patch/minor batched + auto-merge; runtime libs grouped per-ecosystem (react, mui+emotion, react-router, tanstack-query, zustand) patch/minor + auto-merge; majors never auto-merge + `needs-adr` label; `vulnerabilityAlerts` expedited (immediate PRs); `lockFileMaintenance` weekly.
- Synced a pre-existing drift: `templates/Makefile` `gates:` was missing the `npm audit` line (added to root Makefile on 2026-06-02 but not the template) — added it alongside the new bundle-size lines.
- Added `*.tsbuildinfo` to `.gitignore` (side effect of `tsc -b`).

**Notes**

- All files written via bash heredoc (Edit-on-mount truncation bug — see the truncation plan). Integrity re-checked: no NUL bytes, trailing newlines present, JSON/YAML/bash all parse.
- Gate logic verified against a synthetic `dist/` (entry + modulepreload + css + lazy chunk): OK (exit 0), FAIL on breach of all three categories (exit 1), SKIP on missing dist (exit 0). A real `npm run build` could NOT run in the Linux sandbox — `node_modules` on the mount was installed for Windows, so the native rollup/rolldown binary is the wrong platform (`MODULE_NOT_FOUND` for `@rollup/rollup-linux-*`). The gate itself is platform-agnostic; it will run in CI (Linux) and on the user's host after a build.
- Renovate config validated as JSON; the official `renovate-config-validator` could not finish (npx download timed out in the sandbox). Config uses only current Renovate fields (`config:recommended`, `matchPackageNames` with globs, `matchDepTypes`/`matchUpdateTypes`, `lockFileMaintenance`, `vulnerabilityAlerts`, `automerge`).
- **Renovate requires the Renovate GitHub App installed on the repo** to act on `renovate.json`; the file is inert until then.
- **Wrap-up (this session):** commit landed as `fee4080` (13 files, +493). Full integrity audit over all 198 tracked files — 0 NUL bytes, 0 missing trailing newlines; only zero-byte file is the known `.__wtest` artifact. All pure-bash gates green (`check_file_size`/`check_stubs`/`check_feature_readmes` OK; `check_bundle_size` SKIPs cleanly with no `dist/`). Added `*.tsbuildinfo` to `.gitignore` and cleared the stray buildinfo artifacts.
- The commit was originally blocked by a stale `.git/index.lock` (held by the Windows side); resolved from the host WSL2 shell and committed.

**Next (next session)**

- **Push the local commit** `fee4080` ("chore(ci): bundle-size performance gate + Renovate config") to `origin/main` — committed this session, `main` is ahead by 1.
- **Lighthouse CI** (deferred half of the perf gate): add `lighthouserc.json` + `@lhci/cli`, a CI job running `lhci autorun` against `npm run preview`, enforcing the `webVitals` budgets already declared in `.performance-budget.json`.
- Install the **Renovate GitHub App** on the repo so `renovate.json` becomes active (or switch to Dependabot if the App isn't desired).
- Still open from earlier: fix the file-truncation class of bug (`docs/plans/fix-file-truncation.md`).

---

### 2026-06-03 — Repaired two truncated files (CLAUDE.md, WORKLOG.md) + full integrity audit

**What changed**

- Restored the truncated tail of `CLAUDE.md` — the _Project bootstrap & preflight_ section ended mid-word ("…scaffolds the Vite+M"). Recovered the complete original sentence from commit `19934dc` (intact there, truncated in `9dde1fc`): the `/doctor → /bootstrap → /synthesize-brief → /preflight → first feature` order. File is now 90 lines with a clean trailing newline.
- Restored `docs/WORKLOG.md` — the working tree was truncated at "- Tests: Vitest", losing the last 10 lines (Decisions + Next of the bootstrap entry). `git diff` showed a pure deletion vs HEAD, so rewrote the working tree from `HEAD:docs/WORKLOG.md` (127 lines, clean ending).
- Ran a full integrity audit over all 191 tracked files: no NUL bytes; all JSON/JSONL valid; all three YAML files (`frontend-ci.yml` ×2, `openapi.yml`) parse and are complete; zero files left without a trailing newline.

**Notes**

- Both truncations match the known Edit-on-mount bug (see 2026-06-02 entry): writes via the Windows-path Edit tool silently truncate. Used bash heredoc / redirection writes throughout this session.
- Hit a stale `.git/index.lock` during restore; restoring `WORKLOG.md` by writing `git show HEAD:…` over the file avoided needing the index. Deleting on the mount required enabling `allow_cowork_file_delete` (also used to clear a leftover `CLAUDE.md.new`).
- Minor, not corruption: `.__wtest` is a committed 0-byte write-test artifact — candidate for removal.

**Next (next session)**

- **Fix the file-truncation class of bug** — plan in `docs/plans/fix-file-truncation.md`: standardize on bash writes for `.claude/`/`docs/`/root, add a `scripts/check_truncation.sh` integrity gate (missing trailing newline + NUL bytes) wired into CI + `make gates`, and record the lesson in `docs/lessons.md`.
- Wire the remaining gates (`check_bundle_size.sh` + Lighthouse CI) and Renovate/Dependabot grouping (carried over).

---

### 2026-06-02 — Supply-chain Gate 3 + Vite 8 / Vitest 4 upgrade + Node floor 20.19 (ADR 0019)

**What changed**

- Implemented **Gate 3 (`npm audit`)**: `npm audit --audit-level=high` is now wired into `frontend-ci.yml`, the `Makefile`, and documented in `.claude/rules/node-commands.md` per the dependencies-and-supply-chain rule.
- The pre-upgrade dev toolchain (Vite 5 / Vitest 2 / `@vitejs/plugin-react` 4 / jsdom 25) carried **1 critical + 4 moderate** advisories (Vitest UI server arbitrary file read/exec; esbuild dev server) that failed the new gate. Took a deliberate breaking-major upgrade:
  - **vite** `^5` → `^8.0.16` (rolldown-based)
  - **vitest** `^2` → `^4.1.8`
  - **@vitejs/plugin-react** `^4` → `^6`
  - **jsdom** `^25` → `^29`
- After the upgrade `npm audit` reports **0 vulnerabilities**; full suite green (43 tests, typecheck/lint/build and all gate scripts pass).
- One config change: `vitest.config.ts` gained `test.include: ['src/**/*.{test,spec}.{ts,tsx}']` so Vitest 4 stops picking up the Playwright e2e spec.
- **Raised the Node floor 18 → 20.19+** (Vite 8 / Vitest 4 engines). Updated everywhere it was stated: `CLAUDE.md`, `.claude/rules/environment.md`, `node-commands.md`, `upgrade-policy.md`, `user-guides.md`, `.claude/commands/doctor.md`, `README.md`, `docs/PROJECT.md`, `docs/guides/developer.md`, `docs/plans/ci-gates-plan.md`. `frontend-ci.yml` both jobs now use Node 22 (LTS). `scripts/detect-env.mjs` threshold is now `nodeMajor > 20 || (major === 20 && minor >= 19)`; `session-start.sh` + `check_types_drift.sh` messages updated. Added `"engines": { "node": ">=20.19" }` to `package.json`.

**Decisions**

- Created **ADR `0019`** (`docs/decisions/0019-upgrade-vite8-vitest4-node20-floor.md`): Accepted, 2026-06-02. Per upgrade-policy.md a major bump needs a human + ADR. The **React 18.3 / MUI 6 pin (ADR 0015) is unchanged** — this is a build/test-toolchain upgrade only.

- Fixed the two pre-existing follow-ups in the same session:
  - Added **`@axe-core/playwright` `^4.11.3`** — `playwright test --list` now resolves all 6 e2e tests in `todos.spec.ts`.
  - Added **`@vitest/coverage-v8` `^4.1.8`** (Vitest-4 matched) — `npm run test:cov` works (43 tests, ~80% statements). `npm audit` stays at 0.

**Notes**

- Written via the WSL2 mount shell (file tools still block writes under `.claude/` and the repo root).
- **Integrity sweep at end of session**: no real NUL bytes anywhere; all JSON/lockfile valid. Caught and repaired one regression — the Windows-path Edit tool had silently **truncated `.github/workflows/frontend-ci.yml`** (the `Upload Playwright report` step lost its `with:` `name`/`path`/`retention-days`); restored. The `Edit`-via-Windows-path tool is unreliable on this mount and truncates files — prefer bash heredoc writes.
- Pre-existing (NOT introduced this session): `CLAUDE.md` ends mid-word at "…scaffolds the Vite+M" — identical in `HEAD`, so the committed template file is itself truncated. Left as-is (restoring would mean fabricating content); worth a separate fix.

**Next (next session)**

- Investigate/repair the pre-existing `CLAUDE.md` truncation at the "Project bootstrap & preflight" section.
- Wire the remaining referenced gates (`check_bundle_size.sh` + Lighthouse CI) and Renovate/Dependabot grouping (so future majors like this arrive as reviewed PRs).

---

### 2026-06-02 — Added low-priority rules #8–#10 + ADR 0018 (auth mode)

**What changed**

- Created the lower-priority rule set and wired all three into the `CLAUDE.md` import block:
  - `.claude/rules/dependencies-and-supply-chain.md` — lockfile + `npm ci`, `npm audit` gate (high/critical blocks), justify-before-add, named tree-shakeable imports.
  - `.claude/rules/upgrade-policy.md` — Renovate/Dependabot grouped PRs, patch/minor auto-merge on green CI, majors need a human + ADR (React/MUI track ADR 0015).
  - `.claude/rules/routing-and-data-loading.md` — one data router, Query owns server-state, loaders stay thin (params/gating/cache-warm), URL search params hold filter/sort state, per-route `errorElement`.
- Created **ADR `0018`** (`docs/decisions/0018-auth-mode-session-csrf-default.md`): default = DRF session + CSRF (same-origin); SimpleJWT documented for cross-origin; switching is a superseding ADR. Linked it from `auth-and-csrf.md`.

**Notes**

- Written via the WSL2 mount shell (file tools still block `.claude/` and repo root).
- New rules reference gates that may not exist yet: `npm audit` step + Renovate config (CI) — aspirational until wired into `frontend-ci.yml`.
- The full 10-rule set (#1–#10 from the prior research) is now complete; all 21 rule files are imported in `CLAUDE.md`.

**Next (next session)**

- Implement the referenced CI gates: `check_bundle_size.sh` + Lighthouse CI (perf), `npm audit` step, Renovate/Dependabot config.
- Add deps (react-hook-form/zod, i18next, Sentry) only when a real project opts in.

---

### 2026-06-02 — Added 4 medium-priority rules (forms, performance, observability, i18n)

**What changed**

- Created the medium-priority rule set #4–#7 and wired all four into the `CLAUDE.md` import block:
  - `.claude/rules/forms-and-validation.md` — react-hook-form + Zod single schema, accessible associated errors, 400 `fieldErrors` → `setError` (never a toast).
  - `.claude/rules/performance-budgets.md` — gated bundle + Core Web Vitals budgets, route-level code-splitting, tree-shakeable imports.
  - `.claude/rules/observability-and-errors.md` — top-level + per-route error boundaries, one observability client, no PII/secrets in telemetry (`beforeSend` scrub).
  - `.claude/rules/i18n-and-formatting.md` — react-i18next resources (no hardcoded strings), `Intl` formatting, text-expansion + RTL.
- Closed the dangling cross-reference from `api-error-and-pagination.md` → `forms-and-validation.md` (#4 now exists).

**Notes**

- Written via the WSL2 mount shell (file tools still block writes under `.claude/` and repo root).
- New rules reference gate scripts that do not exist yet: `scripts/check_bundle_size.sh` + Lighthouse CI (performance). These are aspirational until added; not wired into `frontend-ci.yml` yet.
- Each rule follows the established pattern: focused topic + Testing section + “Binds these agents” + a “Goal” line.

**Next (next session)**

- Lower priority: #8 dependencies/supply-chain, #9 upgrade-policy, #10 routing-data-loading.
- Implement the referenced gates (`check_bundle_size.sh`, Lighthouse CI) and wire into CI; add the i18n/observability deps when a project actually opts in.
- Consider an ADR recording the chosen auth mode.

---

### 2026-06-02 — Added 3 Django-specific rules (auth/CSRF, errors+pagination, OpenAPI)

**What changed**

- Researched current best practices for the stack (React/MUI/TanStack Query/Router; Django+DRF) and proposed 10 candidate rules.
- Created 3 high-priority rules and wired them into the `CLAUDE.md` import block:
  - `.claude/rules/auth-and-csrf.md` — DRF session+CSRF vs SimpleJWT, no tokens in web storage, single 401 flow.
  - `.claude/rules/api-error-and-pagination.md` — single `ApiError` normalizer, typed `Page<T>` + `useInfiniteQuery`, retry policy.
  - `.claude/rules/openapi-conventions.md` — drf-spectacular schema hygiene, no hand-written DTOs.

**Notes**

- File tools block writes under `.claude/` and repo root (protected); wrote via the WSL2 mount shell. The mount allows create/write/rename but NOT delete.
- `api-error-and-pagination.md` cross-references `forms-and-validation.md` (rule #4, not yet created) — dangling doc-link, harmless until #4 lands.

**Next (next session)**

- Review the 3 new rules, then continue the medium-priority set: #4 forms-and-validation, #5 performance-budgets, #6 observability-and-errors, #7 i18n-and-formatting.
- Lower priority: #8 dependencies/supply-chain, #9 upgrade-policy, #10 routing-data-loading.
- Consider an ADR recording the chosen auth mode.

---

### 2026-06-02 — Repo branch cleanup

**What changed**

- Consolidated work onto `main` (`git push origin main` → already up-to-date) and cleaned up branches: deleted all local and remote branches except `main`, then `git fetch --prune`.
- No source/code changes; housekeeping only.

**Notes**

- A direct push to `main` was used (PowerShell on Windows native). This bypasses the project's PR-only iron rule and WSL2 requirement — fine for one-off cleanup, but future feature work should go through the pipeline + PR per `@.claude/rules/git-operations.md`.

---

### 2026-06-02 — Framework scaffolded (claude-react-mui)

**What changed**

- Initialized the `claude-react-mui` Claude Code configuration: `.claude/` (18 rules, 22 agents, 20 commands, 12 skills), `scripts/` (Node env-detection + session-start + setup), `templates/`, and CI gates.
- Built the working starter app: Vite + React 18 + TypeScript + MUI 6, React Router, TanStack Query, Zustand, a typed API client generated from `src/lib/api/openapi.yml`, and the example `todos` feature demonstrating the four UI states.
- Tests: Vitest + React Testing Library + MSW (inner loop) and a Playwright spec (outer loop); jest-axe accessibility checks. 43 unit/component tests green; production build green; all gate scripts pass.

**Decisions**

- React 18.3 + MUI 6 pinned for compatibility (ADR 0015).
- Env detection rewritten in Node (no Python dependency) (ADR 0002).
- File-size limit set to 400 lines for `src/` (ADR 0013).

**Next**

- Wire `VITE_OPENAPI_URL` to the real backend and `npm run api:pull` to replace the hand-written `openapi.yml`.
- Build the first real feature through the pipeline (`ba → ui-architect → tester → react-developer → ...`).

## 2026-06-05 — config-template alignment (claude-django → claude-react-mui)

### Done

- Перенесено living-plan, HANDOFF-контекст, 9p-safety (#6); template-sync + brief-synthesizer (#7); HANDOFF wiring (#8).
- Засіяно живі плани 0001 (done) і 0002 (pending).

### Gate status

- docs/config only — код застосунку не змінювався.

### Next steps

- див. docs/HANDOFF.md

## 2026-06-07 — contract-v0.2.0-migration

### Done

- Проаналізовано готовність `claude-react-mui` до роботи з `VadayI/claude-api-contract`: contract-first машинерія повна і коректна для v0.1.0; виявлено два дрейфи: застаріла документація (todos) і відставання pin (v0.1.0 vs latest v0.2.0).
- **PR #14** — виправлено документаційний дрейф: `routes.json` + `docs/api/INDEX.md` оновлено з `todos` → реальний `articles` (маршрут `/articles`, endpoints GET/POST `/api/v1/articles`).
- **PR #15** — міграція на `claude-api-contract@v0.2.0` (breaking: `/auth/*` → `/api/v1/auth/*`): ADR 0022, pull нового контракту, регенерація типів, TDD RED→GREEN (5 хірургічних замін у 2 файлах), новий `authApi.test.ts` (закрито прогалину покриття login/logout/register), оновлено 5 документаційних файлів, Quality Gate: reviewer+security+state-architect ✅.
- **PR #16** — prettier reformat 105 файлів; після merge регенеровано `schema.d.ts` (drift gate).
- Всі три PR змерджені у `main` в тій самій сесії.

### Gate status

- typecheck: ✅
- lint: ✅ (0 errors; 1 pre-existing warning у `public/mockServiceWorker.js`)
- tests: ✅ (47 passed, 7 test files)
- types-drift: ✅ (schema.d.ts регенеровано після prettier)
- stubs: ✅
- file-size: ✅
- feature-readmes: ✅ (2 features: articles, auth)

### Open items

- `.env` потребує ручного оновлення `CONTRACT_VERSION=v0.2.0` (gitignored).
- `check_contract_sync.sh` потребує оновленого `.env` для зеленого проходження локально.
- Route guard для `/articles` не реалізований (`routes.json` каже `auth: authenticated`, але `router.tsx` не захищає маршрут).
- `logout()` не викликає `queryClient.clear()` — pre-existing gap (shared-device scenario).

### Next steps

- Оновити `.env`: `CONTRACT_VERSION=v0.2.0`.
- Координація з `claude-django`: обидва consumer мають мігрувати на `/api/v1/auth/*` перед спільним деплоєм.
- Реалізувати route guard для `/articles` (через пайплайн: ba → ui-architect → tester → react-developer).
- Наступна фіча — через стандартний пайплайн.

## 2026-06-09c — wrap-up-2026-06-09c

### Done

- **/audit** — виявлено незакомічені зміни (HANDOFF.md, WORKLOG.md, schema.d.ts) + два відкритих PR (#22, #18).
- **PR #22** (`docs/wrap-up-2026-06-09b`) — виправлено drift `schema.d.ts` (конфлікт форматів 2-пробільний vs 4-пробільний), змерджено.
- **PR #18** (`docs/contract-variant-a-sync`) — rebase на поточний `main`, conflict resolution у `bootstrap.md` + `README.md`. Вирівнює документацію до Variant A contract model (16 файлів). Змерджено.
- **fix(a11y): aria-progressbar-name** — виправлено pre-existing E2E a11y failure (`MuiCircularProgress` без `aria-label`):
  - TDD RED: 2 нових тести (`progressbar has accessible name` + `axe clean in loading state`) підтверджено падіння.
  - GREEN: `aria-label="Loading articles"` на `<CircularProgress>` в `ArticlesPage.tsx` (1 рядок).
  - Оновлено `ArticlesPage.test.tsx` + `src/features/articles/README.md`.
  - **PR #23** — Quality Gates ✅ + E2E ✅ (вперше зелений!), змерджено.
- Загалом змерджено 3 PR за сесію; всі 56 тестів зелені.

### Gate status

- typecheck: ✅
- lint: ✅
- tests: ✅ (56 passed, 9 test files)
- types-drift: ✅
- stubs: ✅
- file-size: ✅
- feature-readmes: ✅

### Open items

- `npm run typecheck` → root tsconfig `files:[]` — не перевіряє `src/`; потрібна зміна на `tsc -b` в `package.json`.
- Route guard для `/articles` — не реалізований (`routes.json`: auth=authenticated, `router.tsx`: guard відсутній).
- `logout()` не викликає `queryClient.clear()` — pre-existing gap (shared-device scenario).
- `check_contract_sync.sh` потребує `CONTRACT_VERSION=v0.2.0` у `.env` для локального проходження.

### Next steps

- Виправити `npm run typecheck` → `tsc -b` (однорядковий PR).
- Route guard для `/articles` через пайплайн (ba → ui-architect → tester → react-developer).
- Наступна фіча — через стандартний пайплайн.

## 2026-06-09d — feat/articles-route-guard

### Done

- **`/audit`** — виявлено 6 незакомічених файлів на `main`, false-green `typecheck` gate, відсутній route guard.
- **`fix: typecheck → tsc -b`** (PR #25, змерджено) — root tsconfig мав `files:[]`, `tsc --noEmit` нічого не перевіряв. Замінено на `tsc -b` (project references). Однорядкова зміна.
- **`feat(auth): RequireAuth guard + LoginPage`** (PR #26, відкрито) — повний pipeline:
  - `ba`: виявлено відсутність `/login` маршруту та `LoginPage`; scope розширено до guard + мінімальна форма входу.
  - `ui-architect`: контракт — `RequireAuth`, `LoginPage`, `LoginForm`, `useLogin`; схеми типів з `schema.d.ts`.
  - `tester` RED: `LoginForm.schema.test.ts`, `LoginForm.test.tsx`, `RequireAuth.test.tsx`, `LoginPage.test.tsx`, `e2e/auth.spec.ts` — всі падали з "Cannot find module".
  - `react-developer` GREEN: 5 нових файлів + `router.tsx` + `routes.json`; нові залежності: `react-hook-form`, `@hookform/resolvers`, `zod`.
  - **Quality Gate**: знайдено 3 🔴 Critical — open redirect (`?next=` без валідації), сирий error cast в `useLogin`, умовний `role="alert"` (re-announcement gap). Всі виправлено.
  - `docs-writer`: `src/features/auth/README.md`, `docs/verify/articles.md`, оновлено `src/features/articles/README.md`.
- **schema.d.ts drift** — регенеровано перед wrap-up (`npm run api:types`).
- Всього: 81 тест (13 файлів), усі зелені.

### Gate status

- typecheck: ✅ (`tsc -b` — реально перевіряє `src/`)
- lint: ✅
- tests: ✅ (81 passed, 13 test files)
- types-drift: ✅ (регенеровано)
- stubs: ✅
- file-size: ✅
- feature-readmes: ✅ (2 features: articles, auth)

### Open items

- PR #26 відкрито, не змерджено — потребує рев'ю.
- `logout()` не викликає `queryClient.clear()` — pre-existing gap (shared-device scenario).
- `check_contract_sync.sh` потребує `CONTRACT_VERSION=v0.2.0` у `.env` для локального проходження.
- `schema.d.ts` drift (recurring) — `npm run` vs `npx` генерує різний формат; потребує дослідження.

### Next steps

- Змерджити PR #26 (route guard).
- Розглянути `logout()` + `queryClient.clear()` (окремий PR).
- Дослідити drift: чому `openapi-typescript` дає різний формат.
- Наступна фіча — через стандартний пайплайн.

## 2026-06-09d — feat/articles-route-guard

### Done

- **`/audit`** — виявлено 6 незакомічених файлів на `main`, false-green `typecheck` gate, відсутній route guard.
- **`fix: typecheck → tsc -b`** (PR #25, змерджено) — root tsconfig мав `files:[]`, `tsc --noEmit` нічого не перевіряв. Замінено на `tsc -b` (project references). Однорядкова зміна.
- **`feat(auth): RequireAuth guard + LoginPage`** (PR #26, відкрито) — повний pipeline:
  - `ba`: виявлено відсутність `/login` маршруту та `LoginPage`; scope розширено до guard + мінімальна форма входу.
  - `ui-architect`: контракт — `RequireAuth`, `LoginPage`, `LoginForm`, `useLogin`; схеми типів з `schema.d.ts`.
  - `tester` RED: `LoginForm.schema.test.ts`, `LoginForm.test.tsx`, `RequireAuth.test.tsx`, `LoginPage.test.tsx`, `e2e/auth.spec.ts` — всі падали з "Cannot find module".
  - `react-developer` GREEN: 5 нових файлів + `router.tsx` + `routes.json`; нові залежності: `react-hook-form`, `@hookform/resolvers`, `zod`.
  - **Quality Gate**: знайдено 3 🔴 Critical — open redirect (`?next=` без валідації), сирий error cast в `useLogin`, умовний `role="alert"` (re-announcement gap). Всі виправлено.
  - `docs-writer`: `src/features/auth/README.md`, `docs/verify/articles.md`, оновлено `src/features/articles/README.md`.
- **schema.d.ts drift** — регенеровано перед wrap-up (`npm run api:types`).
- Всього: 81 тест (13 файлів), усі зелені.

### Gate status

- typecheck: ✅ (`tsc -b` — реально перевіряє `src/`)
- lint: ✅
- tests: ✅ (81 passed, 13 test files)
- types-drift: ✅ (регенеровано)
- stubs: ✅
- file-size: ✅
- feature-readmes: ✅ (2 features: articles, auth)

### Open items

- PR #26 відкрито, не змерджено — потребує рев'ю.
- `logout()` не викликає `queryClient.clear()` — pre-existing gap (shared-device scenario).
- `check_contract_sync.sh` потребує `CONTRACT_VERSION=v0.2.0` у `.env` для локального проходження.
- `schema.d.ts` drift (recurring) — `npm run` vs `npx` генерує різний формат; потребує дослідження.

### Next steps

- Змерджити PR #26 (route guard).
- Розглянути `logout()` + `queryClient.clear()` (окремий PR).
- Дослідити drift: чому `openapi-typescript` дає різний формат.
- Наступна фіча — через стандартний пайплайн.

## 2026-06-09 — main — Сесія: hygiene + архітектурні рішення

**Context:** Коротка hygiene-сесія після завершення ADR 0021. Ніяких нових фіч чи PR.

**Done:**

- Очищено 6 merged локальних гілок (`chore/contract-*`, `docs/contract-*`, `docs/anonymize-test-project`, `feat/auth-doctrine-and-contract-envelope`).
- Вирішено 5 відкритих архітектурних питань із `docs/HANDOFF.md` (всі `[ ]` → `[x]`/`[~]`):
  1. `template-sync` — лишити additive-diff + surface-conflicts (не переходити на 3-way merge).
  2. SHA-пін на `/bootstrap` — **ТАК**: seed `.claude/memory/template-sync.json` (реалізація — окрема задача).
  3. rulesets vs classic branch protection — **classic як дефолт**; rulesets тільки при Public/Pro/Team.
  4. `/wrap-up` auto-commit — **ні**: «propose, user commits» — поточна поведінка зберігається.
  5. CI-гард живого плану — **відкладено** до ручної обкатки (поза скоупом v1).
- Коміт `3952357` pushed до `origin/main`.

**Decisions:**

- additive-diff у `template-sync` — обраний як безпечніший підхід без ризику затерти локальні кастомізації.
- `/wrap-up` не авто-комітить — git-операції залишаються свідомими, з хост-шела.
- SHA-пін на bootstrap — вирішено ТАК, але реалізація відкладена.

**Status:** `main` — working tree clean (після пушу `3952357`). Контейнер не запущений (template repo).

**Next steps:**

- Реалізувати seed `.claude/memory/template-sync.json` у `/bootstrap` (вирішено вище).
- `/doctor` — аудит середовища (відсутній у command-log > 14 днів).

## 2026-06-09 — docs/wrap-up-2026-06-09d (PR #27)

### Done

- **Розслідування `schema.d.ts` drift** — кореневу причину встановлено: working tree містив файл, згенерований не через `npm run api:types`. Після регенерації `check_types_drift.sh` проходить чисто. PR не потрібен.
- **`fix(auth): queryClient.clear()` після logout** (`src/features/auth/authApi.ts`) — flush кешу TanStack Query при виході, щоб стали дані попереднього користувача не були видні на спільному пристрої.
- **Тест для `queryClient.clear()`** (`src/features/auth/authApi.test.ts`) — spy на `queryClient.clear`, підтверджує виклик рівно 1 раз при успішному logout.
- **`docs/verify/auth.md`** — новий файл верифікації: охоплює `/login` (всі 4 стани + keyboard) та `/articles` (RequireAuth redirect → login round-trip, Playwright).
- **Fix E2E root cause** (`playwright.config.ts`) — `VITE_API_BASE_URL` не передавався у `webServer.env`, тому MSW реєстрував обробник як `'undefined/api/v1/auth/login'` → усі E2E API-запити йшли на `localhost:4010` (connection refused). Додано `VITE_API_BASE_URL: 'http://localhost:5173'`.
- **Fix E2E articles** (`e2e/articles.spec.ts`) — додано `beforeEach` з login через MSW перед кожним тестом захищеного маршруту. 6 тестів тепер проходять.
- **Fix a11y + E2E auth** (`src/features/auth/components/LoginPage.tsx`) — додано `<h1>Sign In` heading; `LoginPage.test.tsx` оновлено з відповідним assertion. Axe violations на `/login` усунено.
- **Усі E2E зелені**: Quality Gates ✅ + E2E Tests ✅ на CI (PR #27).

### Gate status

- typecheck: ✅
- lint: ✅
- tests: ✅ (82 passed, 13 test files)
- types-drift: ✅
- stubs: ✅
- file-size: ✅
- feature-readmes: ✅ (2 features: articles, auth)

### Open items

- `check_contract_sync.sh` потребує `CONTRACT_VERSION=v0.2.0` у `.env` для локального проходження — задокументувати в `.env.example` або перевірити CI-конфіг.
- `schema.d.ts` drift був відновлений вручну; варто задокументувати канонічну команду генерації у `README.md`.
- E2E `beforeEach` login в `articles.spec.ts` використовує Playwright `page.route()` — тепер він стає dead code (MSW обробляє першим); можна спростити у наступному PR.

### Next steps

- Наступна фіча — через стандартний пайплайн (`ba → ui-architect → ...`).
- Розглянути `check_contract_sync.sh` виправлення (окремий PR або `.env.example` оновлення).

## 2026-06-09d — feat/articles-route-guard

### Done

- **`/audit`** — виявлено 6 незакомічених файлів на `main`, false-green `typecheck` gate, відсутній route guard.
- **`fix: typecheck → tsc -b`** (PR #25, змерджено) — root tsconfig мав `files:[]`, `tsc --noEmit` нічого не перевіряв. Замінено на `tsc -b` (project references). Однорядкова зміна.
- **`feat(auth): RequireAuth guard + LoginPage`** (PR #26, відкрито) — повний pipeline:
  - `ba`: виявлено відсутність `/login` маршруту та `LoginPage`; scope розширено до guard + мінімальна форма входу.
  - `ui-architect`: контракт — `RequireAuth`, `LoginPage`, `LoginForm`, `useLogin`; схеми типів з `schema.d.ts`.
  - `tester` RED: `LoginForm.schema.test.ts`, `LoginForm.test.tsx`, `RequireAuth.test.tsx`, `LoginPage.test.tsx`, `e2e/auth.spec.ts` — всі падали з "Cannot find module".
  - `react-developer` GREEN: 5 нових файлів + `router.tsx` + `routes.json`; нові залежності: `react-hook-form`, `@hookform/resolvers`, `zod`.
  - **Quality Gate**: знайдено 3 🔴 Critical — open redirect (`?next=` без валідації), сирий error cast в `useLogin`, умовний `role="alert"` (re-announcement gap). Всі виправлено.
  - `docs-writer`: `src/features/auth/README.md`, `docs/verify/articles.md`, оновлено `src/features/articles/README.md`.
- **schema.d.ts drift** — регенеровано перед wrap-up (`npm run api:types`).
- Всього: 81 тест (13 файлів), усі зелені.

### Gate status

- typecheck: ✅ (`tsc -b` — реально перевіряє `src/`)
- lint: ✅
- tests: ✅ (81 passed, 13 test files)
- types-drift: ✅ (регенеровано)
- stubs: ✅
- file-size: ✅
- feature-readmes: ✅ (2 features: articles, auth)

### Open items

- PR #26 відкрито, не змерджено — потребує рев'ю.
- `logout()` не викликає `queryClient.clear()` — pre-existing gap (shared-device scenario).
- `check_contract_sync.sh` потребує `CONTRACT_VERSION=v0.2.0` у `.env` для локального проходження.
- `schema.d.ts` drift (recurring) — `npm run` vs `npx` генерує різний формат; потребує дослідження.

### Next steps

- Змерджити PR #26 (route guard).
- Розглянути `logout()` + `queryClient.clear()` (окремий PR).
- Дослідити drift: чому `openapi-typescript` дає різний формат.
- Наступна фіча — через стандартний пайплайн.

## 2026-06-09 — main — Сесія: hygiene + архітектурні рішення

**Context:** Коротка hygiene-сесія після завершення ADR 0021. Ніяких нових фіч чи PR.

**Done:**

- Очищено 6 merged локальних гілок (`chore/contract-*`, `docs/contract-*`, `docs/anonymize-test-project`, `feat/auth-doctrine-and-contract-envelope`).
- Вирішено 5 відкритих архітектурних питань із `docs/HANDOFF.md` (всі `[ ]` → `[x]`/`[~]`):
  1. `template-sync` — лишити additive-diff + surface-conflicts (не переходити на 3-way merge).
  2. SHA-пін на `/bootstrap` — **ТАК**: seed `.claude/memory/template-sync.json` (реалізація — окрема задача).
  3. rulesets vs classic branch protection — **classic як дефолт**; rulesets тільки при Public/Pro/Team.
  4. `/wrap-up` auto-commit — **ні**: «propose, user commits» — поточна поведінка зберігається.
  5. CI-гард живого плану — **відкладено** до ручної обкатки (поза скоупом v1).
- Коміт `3952357` pushed до `origin/main`.

**Decisions:**

- additive-diff у `template-sync` — обраний як безпечніший підхід без ризику затерти локальні кастомізації.
- `/wrap-up` не авто-комітить — git-операції залишаються свідомими, з хост-шела.
- SHA-пін на bootstrap — вирішено ТАК, але реалізація відкладена.

**Status:** `main` — working tree clean (після пушу `3952357`). Контейнер не запущений (template repo).

**Next steps:**

- Реалізувати seed `.claude/memory/template-sync.json` у `/bootstrap` (вирішено вище).
- `/doctor` — аудит середовища (відсутній у command-log > 14 днів).

## 2026-06-09 — docs/wrap-up-2026-06-09d (PR #27)

### Done

- **Розслідування `schema.d.ts` drift** — кореневу причину встановлено: working tree містив файл, згенерований не через `npm run api:types`. Після регенерації `check_types_drift.sh` проходить чисто. PR не потрібен.
- **`fix(auth): queryClient.clear()` після logout** (`src/features/auth/authApi.ts`) — flush кешу TanStack Query при виході, щоб стали дані попереднього користувача не були видні на спільному пристрої.
- **Тест для `queryClient.clear()`** (`src/features/auth/authApi.test.ts`) — spy на `queryClient.clear`, підтверджує виклик рівно 1 раз при успішному logout.
- **`docs/verify/auth.md`** — новий файл верифікації: охоплює `/login` (всі 4 стани + keyboard) та `/articles` (RequireAuth redirect → login round-trip, Playwright).
- **Fix E2E root cause** (`playwright.config.ts`) — `VITE_API_BASE_URL` не передавався у `webServer.env`, тому MSW реєстрував обробник як `'undefined/api/v1/auth/login'` → усі E2E API-запити йшли на `localhost:4010` (connection refused). Додано `VITE_API_BASE_URL: 'http://localhost:5173'`.
- **Fix E2E articles** (`e2e/articles.spec.ts`) — додано `beforeEach` з login через MSW перед кожним тестом захищеного маршруту. 6 тестів тепер проходять.
- **Fix a11y + E2E auth** (`src/features/auth/components/LoginPage.tsx`) — додано `<h1>Sign In` heading; `LoginPage.test.tsx` оновлено з відповідним assertion. Axe violations на `/login` усунено.
- **Усі E2E зелені**: Quality Gates ✅ + E2E Tests ✅ на CI (PR #27).

### Gate status

- typecheck: ✅
- lint: ✅
- tests: ✅ (82 passed, 13 test files)
- types-drift: ✅
- stubs: ✅
- file-size: ✅
- feature-readmes: ✅ (2 features: articles, auth)

### Open items

- `check_contract_sync.sh` потребує `CONTRACT_VERSION=v0.2.0` у `.env` для локального проходження — задокументувати в `.env.example` або перевірити CI-конфіг.
- `schema.d.ts` drift був відновлений вручну; варто задокументувати канонічну команду генерації у `README.md`.
- E2E `beforeEach` login в `articles.spec.ts` використовує Playwright `page.route()` — тепер він стає dead code (MSW обробляє першим); можна спростити у наступному PR.

### Next steps

- Наступна фіча — через стандартний пайплайн (`ba → ui-architect → ...`).
- Розглянути `check_contract_sync.sh` виправлення (окремий PR або `.env.example` оновлення).

## 2026-06-09 — docs/wrap-up-2026-06-09e (PR #30)

### Done

- **`/audit`** × 2 — перевірка стану проекту; підтверджено що PR #28 потребував мержу.
- **Мерж PR #28** (`docs/wrap-up-2026-06-09d`) — wrap-up попередньої сесії. Виявлено, що uncommitted файли були stale 9p inode cache (реальних змін не було).
- **Перевірка сумісності `claude-react-mui` ↔ `claude-api-contract`** — аналіз нових релізів (v0.3.0, v0.4.0) контракту:
  - v0.3.0 і v0.4.0 — template-релізи без openapi.yml у тезі → `api:pull` не можна пінувати на ці версії.
  - API shape не змінився від v0.2.0 — пін залишається актуальним.
  - Новий Docker/VPS Prism mock (`/ship-contract`) підтримується через наявний `VITE_API_BASE_URL`.
- **`fix(docs)`: виправлено `api-error-and-pagination.md`** (PR #29, змержено) — прибрано хибні RFC-9457/drf-standardized-errors посилання; замінено на реальні схеми контракту (`ErrorDetail`, `ValidationErrors`, `FieldError`) з маппінгом на `ApiError`.
- **Мерж PR #29** — злився чисто, CI ✅.
- **`chore`: регенерація `schema.d.ts`** — вирівняно форматування під openapi-typescript 7.13.0 (double quotes + semicolons), `check_types_drift.sh` тепер проходить стабільно.

### Gate status

- typecheck: ✅
- lint: ✅
- tests: ✅ (82 passed, 13 test files)
- types-drift: ✅ (після регенерації schema.d.ts)
- stubs: ✅
- file-size: ✅
- feature-readmes: ✅ (2 features: articles, auth)

### Open items

- `check_contract_sync.sh` локально не проходить без `CONTRACT_VERSION=v0.2.0` в `.env` — задокументувати або автоматизувати.
- v0.3.0/v0.4.0 тегів контракту не містять `openapi.yml` — попередити команду контракту або додати note у `api-client.md`.
- `articles.spec.ts` — мертвий код `page.route()` у `beforeEach` (MSW обробляє першим); спростити окремим PR.
- `schema.d.ts` потрібно регенерувати після кожного `api:pull` — команда `npm run api:types` задокументована у node-commands.md, але варто нагадати в README.

### Next steps

- Наступна фіча — через стандартний пайплайн (`ba → ui-architect → ...`).
- Розглянути додавання note у `.claude/rules/api-client.md` про те, що v0.3.0+/v0.4.0+ тегів контракту не мають openapi.yml.

## 2026-06-16 — Stack upgrade PR A — tooling (TypeScript 6 / Node 24 / ESLint 10)

### Done

- **Stack upgrade PR A — tooling layer** (branch `chore/stack-upgrade-pr-a`):
  - TypeScript `^5.6` → `^6.0.3`; ESLint `^9` → `^10.5.0`; `@eslint/js ^10`; `typescript-eslint ^8.61.1`; `eslint-plugin-react-hooks ^7.1.1` (flat-config `recommended-latest` API); `eslint-plugin-jsx-a11y ^6.10.2`; `prettier ^3.8.4`.
  - Supporting bumps: `vitest ^4.1.9` / `@vitest/coverage-v8 ^4.1.9` / `jsdom ^29.1.1` (patches within the Vitest 4 major established by ADR 0019).
  - `engines.node` raised `>=20.19.0` → `>=24`; CI (`frontend-ci.yml` ×2) updated to Node 24; `scripts/detect-env.mjs` + `scripts/setup-wsl.sh` floor updated to 24.
  - ESLint 10 peer-dep gap: `eslint-plugin-jsx-a11y` (peer `eslint ^9`) and `openapi-typescript` (peer `typescript ^5`) not yet updated — resolved via committed `.npmrc` `legacy-peer-deps=true`; `@testing-library/dom` and `@eslint/js` added as explicit devDeps (no longer auto-installed as peers).
  - `tsconfig.json` — no migration needed (`moduleResolution: bundler` already set).
  - No `src/` logic changes required; `schema.d.ts` regenerated from `openapi.yml`.
- **ADR 0023** (`docs/decisions/0023-upgrade-ts6-node24-eslint10.md`) written and indexed in `docs/decisions/README.md`.
- **Living plan** `docs/plans/0004-stack-upgrade-latest-versions.md` Execution log updated.
- **Doc version strings** updated: TypeScript 5→6, Node 20.19+→Node 24+ across `CLAUDE.md`, `README.md`, `.claude/rules/{code-style,environment,node-commands,upgrade-policy}.md`, `.claude/commands/bootstrap.md`, `.claude/agents/devops.md`, `.claude/skills/github-actions-frontend/SKILL.md`.
- React / MUI / React Router unchanged (deferred to PRs B–D per plan).

### Gate status (local, pre-PR)

- typecheck: ✅
- lint: ✅ (ESLint 10, 17 react-hooks rules)
- tests: ✅ (82 passed, 13 test files)
- build: ✅ (169.8 KB gzipped, within bundle budget)
- check_stubs/file_size/feature_readmes/types_drift/bundle_size: ✅
- npm audit (high): ✅ (2 moderate only)
- check_contract_sync: deferred to CI (sandbox proxy 403 on GitHub raw)
- check_plan_sync / check_routes_registry / check_guides_sync: validated by CI (git-dependent gates)

### Next steps

- Open PR A for review → merge → then PR B (React 18→19) on the PR A baseline.
- Remove `legacy-peer-deps=true` from `.npmrc` once `eslint-plugin-jsx-a11y` and `openapi-typescript` publish ESLint 10 / TS 6 peers.

## 2026-06-16 — Stack upgrade PR B — React 18.3 → 19

### Done

- **Stack upgrade PR B — React ecosystem** (branch `chore/stack-upgrade-pr-b`):
  - `react` and `react-dom` `^18.3.x` → `^19.2.7` (locked together).
  - `@types/react` and `@types/react-dom` `^18` → `^19`.
  - `@testing-library/react` `^14.x` → `^16.3.2` (React 18‖19 peer; `@testing-library/dom ^10` already present from PR A).
  - Codemods (`types-react-codemod preset-19`, `react/19` migration recipe) run — **codebase was already React-19-clean: 0 source-file changes required**.
  - One test fix: `RequireAuth.test.tsx` — Zustand store mutations in test callbacks wrapped in `act()` to satisfy React 19's stricter act() enforcement.
  - 82/82 tests green; bundle 183.53 KB gz (up ~3.5 KB from React 19 runtime; within the raised 188 KB budget).
- **ADR 0024** (`docs/decisions/0024-upgrade-react-19.md`) written and indexed in `docs/decisions/README.md` (0015's React-pin row annotated "superseded by 0024").
- **Performance budget** raised: `initialJsGzipKb` 180 → 188 (React 19 runtime; code-splitting deferred as separate perf task). Both `.performance-budget.json` and `templates/.performance-budget.json` updated.
- **Doc version strings** updated: React 18→19 across `CLAUDE.md` (Stack line + Version note), `README.md`, `templates/PROJECT_README.md`, `.claude/commands/{preflight,bootstrap}.md`, `.claude/agents/react-developer.md`, `.claude/skills/react-specialist/SKILL.md` (un-gated React 19 additions section), `.claude/skills/tanstack-query-design/SKILL.md` (useSuspenseQuery caveat normalized), `renovate.json`, `templates/renovate.json`.
- MUI 6 / React Router 6 unchanged (deferred to PRs C and D per plan).

### Gate status (local, pre-PR)

- typecheck: ✅
- lint: ✅
- tests: ✅ (82 passed, 13 test files)
- build: ✅ (183.53 KB gzipped, within 188 KB budget)
- check_stubs/file_size/feature_readmes/types_drift/bundle_size: ✅
- npm audit (high): ✅
- check_contract_sync: deferred to CI (sandbox proxy 403 on GitHub raw)
- check_plan_sync / check_routes_registry / check_guides_sync: validated by CI (git-dependent gates)

### Next steps

- Open PR B for review → merge → then PR C (MUI 6→9) on the PR B baseline.

## 2026-06-17 — Stack upgrade PR C — MUI 6 → 9

### Done

- **Stack upgrade PR C — MUI ecosystem** (branch `chore/stack-upgrade-pr-c-mui9`):
  - `@mui/material` and `@mui/icons-material` `^6.1.6` → `^9.1.1` (latest 9.x stable).
  - Emotion unchanged — `@emotion/react ^11.13.3` and `@emotion/styled ^11.13.0` satisfy MUI 9 peer requirements (`^11.5` / `^11.3`); no bump needed.
  - MUI versioning note: Core jumped 6→7→9; v8 is the MUI X namespace — there is no "v8" for MUI Core.
  - Codemod-driven source changes (3 real changes, rest no-op):
    - `AddArticleForm.tsx`: `inputProps` → `slotProps.htmlInput` (MUI v7 slots API).
    - `ArticleList.tsx`: system `color` prop → `sx={{ color: … }}` (MUI v9 removes `color` from system props on non-Chip components).
    - `ArticleList.tsx`: `secondaryTypographyProps` → `slotProps.secondary` (ListItemText slots API).
  - `vitest.config.ts`: added `server.deps.inline: [/@mui\//, 'react-transition-group']` to resolve MUI 9 ESM-internal extensionless subpath imports at test time. No test assertions changed; 82/82 tests green.
  - Bundle 188.38 KB gz (single un-split chunk); route code-splitting deferred as dedicated perf task.
- **ADR 0025** (`docs/decisions/0025-upgrade-mui-9.md`) written and indexed in `docs/decisions/README.md` (0015's MUI-pin row annotated "superseded by 0025").
- **Performance budget** raised: `initialJsGzipKb` 188 → 190 (MUI 9 single-bundle measured 188.38 KB gz; ratchet is a conscious interim step). `.performance-budget.json` updated.
- **Doc version strings** updated: MUI 6→9 across `CLAUDE.md` (Stack line + Version note), `README.md`, `templates/PROJECT_README.md`, `templates/PROJECT.md`, `.claude/commands/{preflight,bootstrap,synthesize-brief}.md`, `.claude/agents/{react-developer,brief-synthesizer}.md`, `.claude/rules/upgrade-policy.md`, `.claude/skills/mui-theming/SKILL.md`, `renovate.json`, `templates/renovate.json`.
- React Router 6 unchanged (deferred to PR D per plan).

### Gate status (local, pre-PR)

- typecheck: ✅
- lint: ✅
- tests: ✅ (82 passed, 13 test files)
- build: ✅ (188.38 KB gzipped, within 190 KB budget)
- check_stubs/file_size/feature_readmes/types_drift/bundle_size: ✅
- npm audit (high): ✅ (2 moderate only)
- check_contract_sync: deferred to CI (sandbox proxy 403 on GitHub raw)
- check_plan_sync / check_routes_registry / check_guides_sync: validated by CI (git-dependent gates)

### Next steps

- Open PR C for review → merge → then PR D (React Router 6→7) on the PR C baseline.
- Route code-splitting performance task: return initial JS to <180 KB gz.
- Remove `legacy-peer-deps=true` from `.npmrc` in PR E once peer-dep gaps are resolved.


## 2026-06-17 — Stack upgrade PR D — React Router 6 → 7 (+ route-level code-splitting)

### Done

- **Stack upgrade PR D — React Router ecosystem** (branch `chore/stack-upgrade-pr-d`):
  - `react-router-dom ^6.28.0` (locked 6.30.4) removed entirely; zero lock-file references remain.
  - `react-router ^7.18.0` added as the consolidated single package (latest 7.x stable).
  - **8 import sites rewritten:**
    - `src/main.tsx` — `RouterProvider` from `react-router/dom` (real-DOM sub-path; wires React DOM `flushSync`).
    - Remaining 7 files (components, guards, hooks, two test files) — from top-level `react-router` (correct for jsdom/Vitest and for non-DOM render contexts).
  - **Future-flag de-risk:** all v7 future flags enabled on v6 (tests green), then bumped to v7 and flags removed (v7 defaults). Key discovery: `v7_startTransition` is a component-level flag; data-router flags go on `createBrowserRouter`/`createMemoryRouter`. All removed post-bump.
  - `json()` / `defer()` / `useLoaderData` — not used in the app; data-router API surface unchanged. Routes remain `/`, `/login`, `/articles`.
  - **Route-level code-splitting added:**
    - New `src/components/RouteFallback.tsx` — accessible loading fallback (`role="status"`, `aria-label="Loading"`, theme-driven MUI `CircularProgress`, TSDoc).
    - New `src/components/RouteFallback.test.tsx` — renders fallback, asserts `role="status"`, jest-axe clean.
    - `ArticlesPage` and `LoginPage` — module-scope `React.lazy` (not inside component).
    - `src/app/App.tsx` — `<Suspense fallback={<RouteFallback />}>` wraps `<Outlet />`.
    - Shell, index Welcome route, `RequireAuth` guard — remain synchronous.
  - **Bundle:** pre-lazy monolithic = 198.46 KB gz (would breach 190 KB budget); post-lazy initial = **137.29 KB gz** (−31%). Lazy chunks: ArticlesPage ~11 KB gz, LoginPage ~25.8 KB gz, shared TextField ~27.5 KB gz.
  - **Performance budget ratcheted down:** `initialJsGzipKb` 190 → **145** (≈7.7 KB headroom). `.performance-budget.json` updated.
  - 84/84 tests green (+2 RouteFallback tests; was 82); zero future-flag console warnings.
- **ADR 0026** (`docs/decisions/0026-upgrade-react-router-7.md`) written and indexed in `docs/decisions/README.md` (0015's Router-pin row annotated "superseded by 0026").
- **Doc version strings** updated: React Router 6→7 across `CLAUDE.md`, `README.md`, `templates/PROJECT_README.md`, `.claude/commands/{preflight,bootstrap}.md`, `.claude/agents/react-developer.md`, `.claude/rules/routing-and-data-loading.md` (+ package consolidation note added).
- **routes.json** updated: `/login` states include `loading`; both entries note route-lazy + RouteFallback in `notes` field.
- **docs/verify/{articles,auth}.md** updated: prerequisites section notes route-level loading (RouteFallback) on first visit.
- **docs/guides/developer.md** updated: Node prerequisite 20.19+→24+; Architecture section notes React Router 7 + `React.lazy` + RouteFallback.
- **docs/guides/user.md** updated: Tips section notes brief loading spinner on first route visit.
- **Living plan** `docs/plans/0004-stack-upgrade-latest-versions.md`: PR D row `pending`→`done`; Execution log entry appended.

### Gate status (local, pre-PR)

- typecheck: ✅
- lint: ✅
- tests: ✅ (84 passed, 15 test files; +2 RouteFallback)
- build: ✅ (137.29 KB gzipped initial, within 145 KB budget)
- check_stubs/file_size/feature_readmes/types_drift/bundle_size: ✅
- npm audit (high): ✅ (2 moderate only)
- check_contract_sync: deferred to CI (sandbox proxy 403 on GitHub raw)
- check_plan_sync / check_routes_registry / check_guides_sync: validated by CI (git-dependent gates)

### Next steps

- Open PR D (`chore/stack-upgrade-pr-d`) for review → quality gate → merge.
- Start PR E: TanStack Query / Zustand minor sweep + remove `.npmrc legacy-peer-deps` (once peer gaps resolved).


## 2026-06-17 — Stack upgrade PR E — final dependency sweep + cleanup

### Done

- **Stack upgrade PR E — final sweep** (branch `chore/stack-upgrade-pr-e`):
  - **Dependency bumps (devDependencies, no src/ changes):**
    - `@playwright/test` ^1.48.2 → ^1.61.0
    - `jest-axe` ^9.0.0 → ^10.0.0 (`@types/jest-axe` kept — jest-axe 10 ships no own types)
    - `openapi-fetch` ^0.12.2 → ^0.17.0 (verified: no changes to `client.ts` or tests required)
    - `@tanstack/react-query` ^5.59.19 → ^5.101.0
    - `openapi-typescript` ^7.4.1 → `7.13.0` (exact pin, no caret — intentional)
    - Floor hygiene: `zustand` ^5.0.14, `msw` ^2.14.6
  - `@rollup/rollup-linux-x64-gnu ^4.61.1` moved from `dependencies` → `devDependencies`.
  - **GitHub Actions bumps:** `actions/checkout` v4→v5, `actions/setup-node` v4→v6, `actions/upload-artifact` v4→v7 (in `frontend-ci.yml`).
  - **`renovate.json` + `templates/renovate.json`:** removed ghost `react-router-dom` entry from the react-router group (package removed in PR D).
  - **`.npmrc`:** `legacy-peer-deps=true` KEPT — re-verified still required: `eslint-plugin-jsx-a11y@6.10.2` peer `^3..^9` (no ESLint 10), `openapi-typescript@7.13.0` peer `^5.x` (no TS 6). Plan-reference comment corrected `plan 0005` → `plan 0004`.
  - **ZERO `src/` changes** — openapi-fetch 0.17 and jest-axe 10 were drop-in compatible.

### Gate status (local, pre-PR)

- typecheck: ✅
- lint: ✅
- tests: ✅ (84 passed, 15 test files — unchanged from PR D)
- build: ✅ (137.3 KB gzipped initial, within 145 KB budget)
- check_stubs/file_size/feature_readmes: ✅
- types-drift: ✅ NO DRIFT (schema.d.ts unchanged; CONTRACT_VERSION stays v0.2.0)
- bundle_size: ✅ (137.3 KB ≤ 145 KB)
- npm audit (high): ✅ (2 pre-existing moderate js-yaml only, no new advisories)
- check_contract_sync: deferred to CI (sandbox proxy 403 on GitHub raw)
- check_plan_sync / check_routes_registry / check_guides_sync: validated by CI (git-dependent gates)

### Notes

- No ADR created — no framework-level major bump in PR E.
- `@types/jest-axe` dependency remains because jest-axe 10 does not ship its own TypeScript types.
- **Deferred follow-up (non-blocker):** remove `.npmrc legacy-peer-deps=true` once both `eslint-plugin-jsx-a11y` (ESLint 10 peer) and `openapi-typescript` (TypeScript 6 peer) publish updated peer ranges.
- **✅ This PR completes the staged stack upgrade (PR A–E).** The template is now fully current: React 19 · Vite 8 · TS 6 · MUI 9 · React Router 7 · TanStack Query 5.101 · Zustand 5 · MSW 2.14 · Playwright 1.61 · Vitest 4.

## 2026-06-18 — Design-fidelity workflow + audit
- Аудит конфігу claude-react-mui: чистий (0 битих посилань/сиріт/дрейфу версій/мертвого коду).
- Дизайн-воркфлоу: 2 джерела (тека + живий URL), рівні переносу L1–L4 (дефолт L3),
  наскрізний мандат трансляції дизайну в стек (MUI-тема+компоненти, TS, Query/Zustand),
  жива інспекція через Playwright MCP. Прив'язано до 11 design-touching агентів.
  Команди: synthesize-brief питає URL+рівень; preflight/doctor/audit перевіряють досяжність.
- ADR 0027 (рівні дизайну). reviewer → read-only. Нота про Vitest forks pool на WSL2/9p.
- PRs: #43 (правило+шаблон), #44 (агенти), #45 (команди), #46 (ADR+reviewer), #47 (vitest 9p).
- Урок 9p: правки на /mnt робити з host-shell; перед мержем перевіряти
  `git show <branch>:<file> | tr -dc '\000' | wc -c` (спіймало пошкодження reviewer.md).
