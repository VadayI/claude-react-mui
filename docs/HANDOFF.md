## 2026-09-25 — P08 integrated: core pinned to contract main `8a7b080`

Branch `feat/p08-git-lifecycle` (PR #78). Contract PR #67 was merged by `git_lifecycle.py merge` as `8a7b080` and cleaned by `git_lifecycle.py cleanup`; PR #78 merges on the user's command of 2026-09-25 (D01).

- `docs/ai/core-source.json`: `pin_status: integrated`, `source_commit` = `observed_upstream_main` = `8a7b08021bc0370582a62b0940f36a8b5b206c32`. `scripts/ai/test_family_delivery.py` asserts the integrated pin again.
- This session: `docs/sessions/20260925T211629Z-claude-2ff279.md` (task, checks, limitations, next step).
- Next: P10 (onboarding) / P11 (readiness agent). The P07/P08 runtime acceptance run (docs/ai/session-continuity.md) is still NOT_VERIFIED.

## 2026-09-25 — P08 Git lifecycle (development core)

Branch `feat/p08-git-lifecycle` from `main`; draft PR pending (the user publishes). Nothing is merged (D01).

- Finalize with `python scripts/ai/git_lifecycle.py`: `inspect --fetch` → `commit --path …` → `verify` → `share --title … --body-file …` → on the user's command `merge --pr N --expect-head SHA` → `cleanup` (docs/ai/git-lifecycle.md). Exit 3 means incomplete/not verified; read the reported state.
- This session: `docs/sessions/20260925T100943Z-claude-a6ecb7.md` (task, checks, limitations, next step).
- Next: publish and review; merge the contract P08 PR first, then repin Django/React to the integrated core. Windows and real-GitHub runs of the CLI are NOT_VERIFIED.

## 2026-09-25 — P07 integrated: core pinned to contract main `db342b7`

Branch `feat/p07-shared-memory` (PR #77): `main` merged in after fix PR #76 (`aa9f399`), then the integrated repin. Contract PR #66 is merged as `db342b7`; PR #77 merges on the user's command of 2026-09-25 (D01).

- `docs/ai/core-source.json`: `pin_status: integrated`, `source_commit` = `observed_upstream_main` = `db342b78ee8d085b6f5b854cabd217d69176d99c`; the payload is unchanged from the development pin `f8e3162` (same manifest digest). `scripts/ai/test_family_delivery.py` asserts the integrated pin again.
- This session: `docs/sessions/20260925T090423Z-claude-f1336f.md` (task, checks, limitations, next step).
- Next: P08 (Git lifecycle G0–G9). The P07 runtime acceptance run (docs/ai/session-continuity.md) is still NOT_VERIFIED.

## 2026-09-25 — P07 shared output-language preference (development core)

Branch `feat/p07-shared-memory` (draft PR #77); commit `f197a31` on top of `4799db0`, development pin `f8e3162`. Nothing is merged (D01).

- Output language: `python scripts/ai/project_state.py --root . --language` reports it; `--apply` moves a legacy `.claude/rules/output-language.md` to `docs/ai/overrides/output-language.md` (pointer left behind). Runtime acceptance run: docs/ai/session-continuity.md.
- This session: `docs/sessions/20260925T081415Z-claude-d28b5b.md` (task, checks, limitations, next step).
- Next: After contract #66 is merged on the user's command: repin to the integrated core and restore «Tymczasowy pin deweloperski»; then #76 → #77. The runtime acceptance run follows docs/ai/session-continuity.md.

## 2026-09-25 — P07 session continuity (development core)

Branch `feat/p07-shared-memory` (draft PR #77); commit `a8c769a` on top of `f7a41e7`, development pin `6fb703a`. Nothing is merged (D01).

- Start every session with `python scripts/ai/session_context.py --root .` (branch/HEAD, settings, documentation map, latest record, snapshot diff; no `.ai-runtime` needed). End with `--new-record --agent <runtime>` and, after the commit, `--check` (docs/ai/session-continuity.md).
- This session: `docs/sessions/20260925T075805Z-claude-debba1.md` (task, checks, limitations, next step).
- Next: After contract #66 is merged on the user's command: repin to the integrated core, restore the assertions marked «Tymczasowy pin deweloperski» in `scripts/ai/test_family_delivery.py`, then merge #76 → #77. After that, P08.

## 2026-09-24 — P07 consumers adopted (draft PR #77, development core)

Branch `feat/p07-shared-memory` on top of `fix/p06-react-delivery-drift` (PR #76).
The vendored core is the contract `feat/p07-shared-memory` head recorded in
`docs/ai/core-source.json` (`pin_status: development`); repin to integrated after
the contract P07 PR merges and restore the assertions marked «Tymczasowy pin
deweloperski» in `scripts/ai/test_family_delivery.py`.

- The template's own registry migrated with the tool on real data:
  `.claude/memory/routes.json → docs/project-state/routes.json` (preview, apply,
  repeat apply = no changes).
- `check_routes_registry.sh` (both copies) and `react_gate.py` resolve the
  registry through `project_state` (`docs/project-state/` first, legacy until
  migrated, differing copies fail closed) and accept either spelling in the
  changed-file list; `generate.py` refuses `docs/project-state/` and
  `.ai-runtime/` as seed inputs.
- SessionStart hook → `node scripts/session-start.mjs` (shared detector
  `--write` + `detect-env.mjs`); `session-start.sh` delegates to it;
  `detect-env.mjs`/`log-cmd.mjs` write to `.ai-runtime/` via
  `scripts/runtime-state.mjs`. New files enrolled in `templates/ai/seed-inputs.json`.
- Rules/workflows/agents/commands/README/templates use the new paths; adapters
  and delivery manifest regenerated.
- Verified on Linux Python 3.13.7 / Node 22: `core_sync --check`,
  `generate --check`, `generate_adapters --check` PASS; `scripts/ai` tests 34/34;
  fresh install into an empty target delivers the new files and no registry.
- Next: merge fix PR #76, contract P07, then repin here; P08. Merge only on the
  user's command.

## 2026-09-24 — P07 core delivered with a development pin

Branch `feat/p07-shared-memory` on top of `fix/p06-react-delivery-drift`. The
rebased P07 core (contract `feat/p07-shared-memory` head
`1235a23f8f77d7dff4e91e039cf60877ae794ce9`, manifest digest `512798fc…`) is
vendored with `pin_status: development`: `scripts/ai/project_state.py`,
`docs/ai/project-state-migration.md`, updated `docs/ai/{schemas,launchers}.md`;
both new files are enrolled in `templates/ai/seed-inputs.json` so derived
projects receive them. Do not call this integrated. After the contract P07 PR
merges, repin with `core_sync.py --integrated-pin`, regenerate and restore the
integrated assertions in `scripts/ai/test_family_delivery.py`. Consumer adoption
(routes registry resolver, env/log writers, seed/update ownership, docs) is the
remaining P07 work; no legacy migration has been run against project data.

## 2026-09-24 — delivery hotfix, integrated core 9db26a0

Branch `fix/p06-react-delivery-drift` on top of `main` `c1a1353` (P06 merged via
PR #75). Integrated so far: P02 rules/adapters, P04 vendored family core, P05
exact-candidate runner, P06 explicit CI mode + owned hooks. Not delivered: P07
shared project state, P08 Git lifecycle, P10/P11 roles, P13 acceptance.

- `docs/ai/delivery-manifest.json` regenerated: PR #73 changed seven
  `.claude/agents/*.md` and `scripts/turbo.sh` without regeneration, so
  `generate.py --check` failed and `install.py` refused every target with
  `Source digest mismatch`. Hosted `Frontend CI` now runs the Python delivery
  drift checks and `scripts/ai` tests inside `Quality Gates`.
- Vendored core repinned to integrated contract main
  `9db26a0c65b970c223ab034750f3019ac59c5e2e` (manifest digest `131f17e9…`,
  includes the runner directory-digest fix from contract PR #62).
- Verified on Linux Python 3.13.15: `core_sync --check`, `generate --check`,
  `generate_adapters --check` PASS; `scripts/ai` tests 33/33. Hosted run for
  this branch is pending the user's push; merge only on the user's command.
- Next: P07 delivery of the rebased shared-state core (development pin until
  the contract P07 PR is merged), then P08.

The sections below are historical checkpoints, not current Git state.

## P02 pilot in progress — 2026-09-20

App snapshot: `9581f9c`, verified Windows/Linux Node 24 with 99 tests;
Windows E2E 8/8. Initial JS budget 200 KiB explicitly approved; measured 153.4.
Branch: `chore/shared-react-pilot`, dependent on the unmerged P01 commits.
Neutral catalog/adapters and non-destructive pilot installer are prepared.
Generation/drift checks and five delivery regression tests pass; Unicode/spaced
fresh and repeated delivery pass. Next: P03 behavioral runtime comparisons.
Runtime support, production shared-core delivery and full implementation-plan
completion are NOT claimed. No push/PR/merge yet. See docs/ai/README.md.

# Current implementation handoff — 2026-09-20

Working branch: `fix/windows-react-baseline` in the isolated P01 clone.
Known committed baseline: `1ee8d60` (Windows dependency fix); i18n candidate follows.
This is preparatory P01 work, not completion of the family plan or runtime pilot.

- Windows Node 24: typecheck/lint, 99 tests, 8 E2E, build/bundle passed.
- Linux Node 24: original prepared Rollup baseline passed clean install, 84 tests,
  typecheck/lint/build. Final i18n Linux run still pending.
- User explicitly set initial JS gzip budget to 200 KiB; other budgets unchanged.
- Seed delivery: four fresh/repeat/conflict/drift/path fixtures passed.
- npm audit remediation: zero high/critical; two moderate Vitest/mocker findings
  remain documented for separate maintenance. Full candidate checks continue.
- See `docs/plans/0005-agent-neutral-implementation.md` and ADR 0029.
- No push, PR or merge yet. Preserve original checkout refs/stash/untracked files.

---

The following snapshot is historical and must not be interpreted as current Git state.

# HANDOFF — claude-react-mui

> Read this first when joining the project. Updated by `/wrap-up` at end of each session.
> Last updated: 2026-06-19 (session — native-windows-git-bash)

## Latest session (2026-06-19) — native Windows via Git Bash

**Main @ `bb2ce1a`.** Merged this session: **PR #49** (undici 7.27.0 → 7.28.0, high advisory GHSA-vmh5-mc38-953g) and **PR #48 — native Windows + Git Bash as a first-class runner (ADR 0028, amends 0005)**.

- `scripts/detect-env.mjs`: `platform_supported: true` for `win32` when Git Bash is present (`MSYSTEM`); new fields `is_git_bash` / `sandbox_supported`; `schema_version` 1→2; `wrong_runner_suspected` narrowed to "a Windows runner launched from inside WSL2" and is now a **warning**, not a hard stop.
- `/doctor` + `/bootstrap` hard-stop **only** on `platform_supported: false`; `wrong_runner_suspected` → MIXED_RUNNER warning.
- Docs/scripts aligned (`environment.md`, `node-commands.md`, `CLAUDE.md`, `README.md`, `install.sh` accepts `MINGW*`, `session-start.sh`, `developer.md`). The heredoc/9p edit caveat is now scoped to **WSL2 `/mnt` only** — native Windows NTFS is unaffected.

**Follow-up (NOT a blocker):** `npm ci` fails on native Windows with `EBADPLATFORM` — the committed lockfile carries only the Linux Rollup binary, plus a pre-existing `eslint@10` / `eslint-plugin-jsx-a11y` peer mismatch. Workaround documented in `docs/guides/developer.md` (`npm install --legacy-peer-deps`); a fully cross-platform lockfile + peer cleanup is a tracked follow-up PR.

> The sections below are from the prior session (stack-upgrade PR E, 2026-06-17) and are historical context. Since then, the stack upgrade (A–E), design-fidelity work (#43–47), the undici fix (#49), and native Windows (#48) have all merged to `main`.

## Current state

**Active branch:** `chore/stack-upgrade-pr-e`
**Last merged to main:** PR #39 — MUI 6 → 9 (stack upgrade PR C, ADR 0025) *(PR D + PR E land once reviewed)*

The app is a fully working React + MUI frontend with:

- JWT auth (login/logout with QueryCache flush, RequireAuth guard)
- Articles CRUD (list + protected routes)
- Full test suite: 84 Vitest tests (15 files) + Playwright E2E (6 tests)
- All CI gates passing on main after PR C

**Stack upgrade COMPLETE** (plan `docs/plans/0004-stack-upgrade-latest-versions.md`):

| PR | Scope | State |
|----|-------|-------|
| A  | Tooling (TS 6 / Node 24 / ESLint 10) | done — merged |
| B  | React 18.3 → 19 (ADR 0024) | done — merged |
| C  | MUI 6 → 9 (ADR 0025) | done — merged |
| D  | React Router 6 → 7 + route-lazy (ADR 0026) | done — awaiting merge |
| E  | TanStack Query 5.101 / Zustand 5 + final sweep | **done — awaiting merge** |

**Current stack (as of PR E):**
React 19 · Vite 8 · TypeScript 6 · MUI 9 · React Router 7 · TanStack Query 5.101 · Zustand 5 · MSW 2.14 · Playwright 1.61 · Vitest 4

**Bundle:** 137.3 KB gz initial / budget 145 KB

## What was done this session (PR E)

1. **Dependency bumps (devDependencies, zero `src/` changes required):**
   - `@playwright/test` ^1.48.2 → ^1.61.0
   - `jest-axe` ^9.0.0 → ^10.0.0 (drop-in; `@types/jest-axe` kept — jest-axe 10 has no own types)
   - `openapi-fetch` ^0.12.2 → ^0.17.0 (verified compatible with `client.ts` and tests)
   - `@tanstack/react-query` ^5.59.19 → ^5.101.0
   - `openapi-typescript` ^7.4.1 → `7.13.0` (exact pin, no caret)
   - Floor hygiene: `zustand` ^5.0.14, `msw` ^2.14.6
2. **`@rollup/rollup-linux-x64-gnu ^4.61.1`** moved `dependencies` → `devDependencies`.
3. **GitHub Actions:** `actions/checkout` v4→v5, `actions/setup-node` v4→v6, `actions/upload-artifact` v4→v7 (in `frontend-ci.yml`).
4. **`renovate.json` + `templates/renovate.json`:** removed ghost `react-router-dom` from the react-router group.
5. **`.npmrc`:** `legacy-peer-deps=true` KEPT (re-verified still required); plan-reference comment corrected `0005`→`0004`.
6. **84 tests green** (unchanged from PR D); bundle 137.3 KB gz ≤ 145 KB budget; no new advisories.
7. **Living plan** `docs/plans/0004` — PR E row `pending`→`done`; Execution log entry appended; upgrade marked A–E COMPLETE.
8. **WORKLOG** — PR E session entry appended.

## Next steps

1. Open PR E (`chore/stack-upgrade-pr-e`) for review → quality gate → merge.
2. After merge: staged stack upgrade is fully shipped — no further upgrade PRs pending.
3. **Deferred non-blockers** (track as follow-up tasks, not open blockers):
   - Remove `.npmrc legacy-peer-deps=true` once `eslint-plugin-jsx-a11y` publishes an ESLint-10 peer AND `openapi-typescript` publishes a TypeScript-6 peer.
   - Drop `@types/jest-axe` once jest-axe 10 ships its own TypeScript types.
4. Pigment CSS (MUI 9 opt-in zero-runtime) — evaluate in a future PR or stay with Emotion.
5. Route code-splitting performance task — initial JS already 137.3 KB; consider further splitting if new features grow the bundle.

## Open questions

- Pigment CSS adoption (MUI 9 opt-in) — future PR decision.
- `eslint-plugin-jsx-a11y` and `openapi-typescript` upstream peer-range releases — watch for both; remove `.npmrc` flag when both land.

## Gate status (PR E, local)

| Gate               | Status |
| ------------------ | ------ |
| typecheck          | ✅ |
| lint               | ✅ |
| tests              | ✅ 84 passed |
| build              | ✅ 137.3 KB gz initial |
| bundle_size        | ✅ (within 145 KB budget) |
| types-drift        | ✅ NO DRIFT |
| stubs              | ✅ |
| file-size          | ✅ |
| feature-readmes    | ✅ |
| audit (high)       | ✅ (2 pre-existing moderate only) |
| contract-sync      | deferred to CI (sandbox proxy 403) |
| plan/routes/guides | validated by CI (git-dependent) |

## Key files

- `src/lib/api/` — typed client, openapi.yml (pinned v0.2.0), schema.d.ts
- `src/features/auth/` — login, logout, RequireAuth guard, authStore
- `src/features/articles/` — articles list, API hooks
- `src/components/RouteFallback.tsx` — accessible route-level loading fallback (added in PR D)
- `src/app/App.tsx` — `<Suspense>` + `<Outlet>` (updated in PR D)
- `e2e/` — Playwright specs (auth + articles)
- `docs/decisions/0026-upgrade-react-router-7.md` — React Router 6→7 + route-lazy ADR
- `docs/decisions/0025-upgrade-mui-9.md` — MUI 6→9 ADR
- `docs/decisions/0024-upgrade-react-19.md` — React 18→19 ADR
- `docs/decisions/0023-node-24-eslint-10-ts-6.md` — PR A tooling ADR
- `docs/plans/0004-stack-upgrade-latest-versions.md` — living plan for the full upgrade sequence (COMPLETE)
- `.performance-budget.json` — `initialJsGzipKb` 145
- `.npmrc` — `legacy-peer-deps=true` (peer stopgap; removal deferred — see Next steps)

## 2026-09-20 — safe legacy launcher checkpoint

Shared compatibility source: integrated contract commit 485bb7ae64e5c09ce046ea5cae6e92fd641a7ffe.
Contract core tests: Windows 43 PASS + 1 symlink SKIP; Linux all 44 PASS.
Django/React pins reference merged contract PR #57 at integrated commit 485bb7ae64e5c09ce046ea5cae6e92fd641a7ffe.
Legacy .env is parsed as selected literal data, never executed; credentials affect
only the child, preserving blank fallback and PAT precedence. Known legacy wrappers
migrate by exact hash; custom wrappers conflict before writes. Windows PowerShell
and Git Bash version probes passed. These are not model-session acceptance.
React actual main-to-candidate upgrade/generator check passed; Django old-seed
component upgrade/repeat passed. Full bootstrap, CI-choice and P05+ remain pending.
All PRs remain unmerged; a new explicit user command is required for merge.


## 2026-09-20 — production bootstrap delivery checkpoint

Branch `feat/production-bootstrap-integration` starts from integrated React main
`afb35e8868412581a94af57f658bbb4b01264597`. The contract core stays pinned to
integrated `485bb7ae64e5c09ce046ea5cae6e92fd641a7ffe`.
The Bash installer now calls the complete Python ownership preflight, with an
explicit per-file seed inventory and linked-root rejection. Canonical bootstrap
and update procedures generate Claude/Codex entry points and retain the installed
runtime; custom instructions, project notes/language/overrides and live workflows
are preserved. Legacy template-sync delegates to the same update contract.
Windows: 13 delivery tests PASS, 1 host symlink SKIP; generation/core checks PASS.
Actual previous-main plus legacy-scaffold update passed install/generator/core
and empty-repeat checks. Final committed Git Bash and Linux evidence follows in
this task's publication report. P05 runner, P06 CI activation, remaining P12 roles
and P13 runnable-family/rollback acceptance are not claimed. No merge/deploy.
