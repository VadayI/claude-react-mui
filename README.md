# Claude Code configuration for React + MUI frontends

A ready-made Claude Code configuration for **React + Material UI** frontend projects with **Test-Driven Development** discipline (double-loop, outside-in at the UI boundary), a **contract-first** process (the UI consumes a separate backend's OpenAPI schema, with types generated and locked by a CI drift gate), **mandatory accessibility**, and work done **exclusively through Pull Requests**. This config turns Claude Code into a frontend development team: an orchestrator delegates tasks to specialized agents through a clear pipeline.

This is the **frontend counterpart** to a separate **backend repository** (for example a Django/DRF service): that repo owns the REST API and emits the OpenAPI contract; this repo consumes it. Point this at your own backend repo. They are independent repositories with independent CI and release cycles.

**Stack:** TypeScript 5 · React 18 · Vite 8 · MUI 6 · React Router 6 (data router) · TanStack Query 5 · Zustand 5 · Vitest + React Testing Library + MSW · Playwright · `openapi-typescript` · ESLint + Prettier · GitHub Actions
**Environment:** Node 20.19+ on WSL2 (Windows) / Linux / macOS · Staging — Debian VPS serving the static build behind nginx · GitHub as the source of truth

---

## Where this runs (supported runtime)

This config is designed for **Claude Code CLI** (the terminal `claude` command) running inside one of:

- **WSL2 Ubuntu** on Windows (mandatory on Windows — see `docs/decisions/0005-drop-windows-native-shell.md`),
- **Linux** native,
- **macOS** native (bash or zsh).

**Not supported:** Windows native shells (PowerShell, cmd, Git Bash) — the SessionStart hook and gate scripts are bash; on Windows use WSL2. The hook writes `.claude/memory/env-detect.json`; if it reports `platform_supported: false`, `/doctor` hard-stops with `UNSUPPORTED_PLATFORM`.

---

## The core idea — frontend TDD, double-loop

The whole framework is built around one discipline, adapted from *Obey the Testing Goat* to a React SPA:

- **Outer loop** = a failing **Playwright** test that drives the real app in a browser like a user (navigate, type, click, assert what's on screen). The network is stubbed at the boundary so it's deterministic.
- **Inner loop** = fast **Vitest + React Testing Library** tests, mocking the network with **MSW** so components and TanStack Query hooks run their real code paths — only the HTTP response is faked.

`Outer RED → inner RED→GREEN→REFACTOR until outer GREEN → refactor.` Tests assert **behavior, not implementation** (query by role/label, never by class or internal state). The four UI states — **loading, success, empty, error** — are mandatory for any data component, and **accessibility** (keyboard + ARIA + axe) is gated, not optional. Full rule: `.claude/rules/tdd.md`.

---

## Quick start

> Run everything in **WSL2 / Linux / macOS bash**, not PowerShell.

```bash
# 1. Toolchain (idempotent helper): node (nvm) + claude CLI + gh
bash scripts/setup-wsl.sh

# 2. Create the GitHub repo by hand (ADR 0008), then point this clone at it.
#    Set tokens (never commit them):
export GITHUB_PERSONAL_ACCESS_TOKEN=...   # fine-grained PAT, repo RW + workflows + admin
export CONTEXT7_API_KEY=...

# 3. Launch Claude Code in the project and let it drive setup:
claude
#   /doctor      → audits the machine vs .claude/rules/environment.md, proposes fixes
#   /bootstrap   → Mode A scaffolds the Vite+MUI app from templates/, or Mode B PRs missing pieces
#   /preflight   → verifies build inputs (brief, stack, backend OpenAPI contract, GitHub access)
#   then build the first feature through the pipeline
```

Once the app is scaffolded:

```bash
npm ci
cp .env.example .env        # fill VITE_API_BASE_URL and VITE_OPENAPI_URL
npm run api:pull            # pull the backend openapi.yml
npm run api:types           # generate src/lib/api/schema.d.ts
npm run dev                 # http://localhost:5173
npm run test                # vitest watch (inner loop)
npm run e2e:ui              # playwright UI (outer loop)
```

---

## The agent pipeline

```
ba → ui-architect → tester (RED) → react-developer (GREEN) → tester (REFACTOR-checks)
        → [Quality Gate: reviewer | security-scanner | state-architect] → docs-writer
```

| Phase | Agent(s) | Output |
|------|----------|--------|
| 1. Requirements | `ba` | user stories, UX scope, the four UI states |
| 2. UI contract | `ui-architect` | routes, component tree + props, consumed endpoints, query keys, a11y reqs; `routes.json` |
| 3. RED | `tester` | failing Playwright journey + failing Vitest/RTL tests with MSW |
| 4. GREEN | `react-developer` | code that greens the tests + lint/typecheck |
| 5. Quality Gate (parallel) | `reviewer`, `security-scanner`, `state-architect` | independent reports |
| 6. Docs | `docs-writer`, `guide-writer` | feature README, `docs/verify/<feature>.md`, guides, WORKLOG, PR |

Full routing and the optional agents (`a11y-auditor`, `qa`, `integration-architect`, `react-refactoring-expert`, `code-structure-auditor`, `template-sync`, …) are in `.claude/rules/workflow.md` and `CLAUDE.md`.

---

## Slash commands

Environment & project: `/doctor`, `/bootstrap`, `/preflight`, `/synthesize-brief`, `/config`, `/plugins`, `/set-language`, `/handoff`, `/wrap-up`, `/audit`, `/update-from-template`.
Feature & quality: `/verify`, `/guides`, `/review-pr`, `/security-check`, `/structure-audit`, `/simplify`, `/update-docs`, `/create-pr`, `/fix-ci`.

Defined in `.claude/commands/`.

---

## File layout

```
.claude/
├── agents/        # specialized subagents (ba, ui-architect, react-developer, tester, ...)
├── commands/      # slash commands (/doctor, /bootstrap, /verify, ...)
├── rules/         # auto-loaded conventions (tdd, api-client, accessibility, workflow, ...)
├── skills/        # reusable knowledge modules (react, mui, vitest-rtl-tdd, ...)
├── memory/        # session-local state (env-detect.json, routes.json, command-log) — gitignored where noted
└── settings.json  # permissions, plugins, hooks
scripts/           # detect-env.mjs, session-start.sh, log-cmd.mjs, setup-wsl.sh
templates/         # scaffold inputs for /bootstrap (app config, CI, docs, gate scripts, example feature)
docs/
├── decisions/     # ADRs
├── api/           # consumed-endpoints index (INDEX.md) + openapi snapshot pointer
├── guides/        # user.md + developer.md
├── verify/        # per-feature manual verification guides
├── plans/         # implementation plans
└── WORKLOG.md     # cross-machine work history
src/               # the application (feature-sliced) — see .claude/rules/architecture.md
e2e/               # Playwright specs
```

---

## Rules and gates

Hard CI gates (`.github/workflows/frontend-ci.yml`, mirrored locally via `make gates`):

- **typecheck** — `tsc --noEmit`, `strict`, no `any`.
- **lint** — ESLint incl. `jsx-a11y` (accessibility) and no leftover `TODO/FIXME`.
- **types drift** — `scripts/check_types_drift.sh`: generated `schema.d.ts` must match the committed `openapi.yml` (the contract can't silently drift).
- **stub ledger** — `scripts/check_stubs.sh`: every `// STUB:` is logged in `docs/STUBS.md`.
- **file size** — `scripts/check_file_size.sh`: no `src/` file over 400 lines.
- **feature READMEs** — `scripts/check_feature_readmes.sh`: every `src/features/<f>/` has a README.
- **tests** — `vitest --coverage` (unit/component, incl. `jest-axe`) and `playwright` (E2E, incl. axe).

Disciplines: TDD double-loop, contract-first (consume, never invent the API), accessibility mandatory, server-state vs client-state never blurred, PR-only (never push to `main`), context committed to git.

---

## Derived projects & template sync

Start a new frontend by using this repo as a GitHub template (or `/bootstrap` into a fresh repo). Later, pull improvements from the template with `/update-from-template <url>` (the `template-sync` agent classifies template-owned vs project-owned files and opens a PR — never a direct push).

---

## Architecture decisions

See `docs/decisions/` (ADRs 0001–00xx): the frontend double-loop TDD boundary, bash-only shell, frontend-as-separate-repo, `/mnt` support, Node-based env detection, config baseline, file-siz