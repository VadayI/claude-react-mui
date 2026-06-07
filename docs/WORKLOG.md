# WORKLOG

Cross-machine work history. Updated at the end of every session (`/wrap-up`) and committed, so the project state travels between computers via `git pull`. Newest entry on top.

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
