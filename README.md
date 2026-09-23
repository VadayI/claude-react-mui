# Claude Code configuration for React + MUI frontends

A ready-made Claude Code configuration for **React + Material UI** frontend projects with **Test-Driven Development** discipline (double-loop, outside-in at the UI boundary), a **contract-first** process (the UI consumes the external **`VadayI/claude-api-contract`** OpenAPI 3.1 schema, with types generated and locked by two CI gates), **mandatory accessibility**, and work done **exclusively through Pull Requests**. This config turns Claude Code into a frontend development team: an orchestrator delegates tasks to specialized agents through a clear pipeline.

The `VadayI/claude-api-contract` repo is the single source of truth for the REST API contract; both this frontend and the `claude-django` backend consume it — neither generates the canon. They are independent repositories with independent CI and release cycles.

**Stack:** TypeScript 6 · React 19 · Vite 8 · MUI 9 · React Router 7 (data router) · TanStack Query 5 · Zustand 5 · Vitest + React Testing Library + MSW · Playwright · `openapi-typescript` · ESLint + Prettier · GitHub Actions
**Environment:** Node 24+ on Linux / macOS / WSL2 / native Windows (via Git Bash) · Staging — Debian VPS serving the static build behind nginx · GitHub as the source of truth

---

## Where this runs (supported runtime)

This config is designed for **Claude Code CLI** (the terminal `claude` command) running inside one of:

- **Linux** native,
- **macOS** native (bash or zsh),
- **WSL2 Ubuntu** on Windows,
- **native Windows** via **Git Bash** (Git for Windows — see `docs/decisions/0028-support-native-windows-git-bash.md`, amending `0005`).

The single shell dialect is **bash** — on native Windows that bash is Git Bash, which the Claude Code CLI also uses for its Bash tool. **Not supported:** Windows PowerShell/cmd *alone* (the SessionStart hook and gate scripts are bash). The hook writes `.claude/memory/env-detect.json`; if it reports `platform_supported: false` (e.g. Windows with no Git Bash), `/doctor` hard-stops with `UNSUPPORTED_PLATFORM`. The **sandboxed** Bash tool is available on Linux/macOS/WSL2 only, not native Windows.

---

## The core idea — frontend TDD, double-loop

The whole framework is built around one discipline, adapted from _Obey the Testing Goat_ to a React SPA:

- **Outer loop** = a failing **Playwright** test that drives the real app in a browser like a user (navigate, type, click, assert what's on screen). The network is stubbed at the boundary so it's deterministic.
- **Inner loop** = fast **Vitest + React Testing Library** tests, mocking the network with **MSW** so components and TanStack Query hooks run their real code paths — only the HTTP response is faked.

`Outer RED → inner RED→GREEN→REFACTOR until outer GREEN → refactor.` Tests assert **behavior, not implementation** (query by role/label, never by class or internal state). The four UI states — **loading, success, empty, error** — are mandatory for any data component, and **accessibility** (keyboard + ARIA + axe) is gated, not optional. Full rule: `.claude/rules/tdd.md`.

---

## Quick start

The shared Claude/Codex runtime is documented in
[core integration](docs/ai/core-integration.md). Python 3.13+ is required for
stdlib template tooling; Node 24 is the application target. Both adapters, full
role packs, schemas, launchers and legacy scaffolding inputs are delivered by
one ownership manifest. No application code, secrets or active workflows are
seeded. Bootstrap prepares local files; CI activation and the first push await
P05/P06. See the [migration path](docs/ai/migration.md) for the precise scope.

### Install or update the configuration

From Git Bash on native Windows, or native Bash on Linux/macOS:

```bash
bash scripts/install.sh "../my project" --url https://github.com/VadayI/claude-react-mui.git
# --ref <branch-or-tag> selects a revision; --dry-run previews without project writes.
```

The launcher clones a temporary verified source and invokes its Python installer.
Existing unchanged template files update; local customizations and differing
mixed settings produce conflicts before any writes. Deprecated `--force` does
not bypass ownership checks. Project notes, memory, language, overrides and
unknown files remain untouched. It does not seed `.env`, remove memory, activate
CI or run npm. Configure credentials through your existing authorized mechanism.

With an already checked-out template, PowerShell and Bash can run the same CLI:

```text
python scripts/ai/generate.py --check
python scripts/ai/install.py --target "../my project"
python scripts/ai/install.py --target "../my project" --apply
```

Use `make ai-claude` or `make codex`, or the portable launchers under `scripts/ai/`.
Claude `/bootstrap` and the Codex `bootstrap` skill load the same complete
[canonical procedure](docs/ai/workflows/bootstrap.md). The legacy `make cc`
launcher also remains available. Update through the
[shared update procedure](docs/ai/workflows/update-from-template.md); recursive
copying over a project is not an equivalent installation method.

### Then drive setup from inside Claude Code

```bash
# 1. Toolchain (skip whatever you already have; Node 24+ is REQUIRED — check: node -v):
#    WSL2 / Linux:    bash scripts/setup-wsl.sh        # node (nvm) + claude CLI + gh
#    macOS:           brew install node gh && npm i -g @anthropic-ai/claude-code
#    native Windows:  do NOT run setup-wsl.sh (it is WSL2/Linux-only). In Git Bash:
#                       winget install OpenJS.NodeJS Anthropic.ClaudeCode GitHub.cli

# 2. Prepare locally; CI choice/materialization (P06) is required before a remote push.
#    Copy the template and fill it in:  cp .env.example .env   (.env is gitignored —
#    never commit it). It holds config (VITE_API_BASE_URL, VITE_OPENAPI_URL,
#    CONTRACT_REPO, CONTRACT_VERSION, VITE_MSW_ENABLED) plus two secret keys:
#      GITHUB_PERSONAL_ACCESS_TOKEN=...   # fine-grained PAT: Contents RW, Metadata RO,
#                                         #   Pull requests RW, Workflows RW, Administration RW (github MCP + gh)
#      CONTEXT7_API_KEY=...               # context7 docs MCP key
#    Claude Code does NOT auto-load .env — the step-3 wrapper reads selected keys as literal data
#    into the claude process and mirrors the PAT to GH_TOKEN for gh.

# 3. Launch Claude Code in the project (reads selected .env data) and let it drive setup:
make cc      # = bash scripts/claude.sh; plain `claude` will not see .env secrets
#    native Windows (no make): launch the wrapper directly in Git Bash —
#      bash scripts/claude.sh
#   /doctor      → audits the machine vs .claude/rules/environment.md, proposes fixes
#   /bootstrap   → Mode A scaffolds the Vite+MUI app from templates/, or Mode B PRs missing pieces
#   /preflight   → verifies build inputs (brief, stack, OpenAPI contract, GitHub access)
#   then build the first feature through the pipeline
```

Once the app is scaffolded:

```bash
npm ci
cp .env.example .env        # fill VITE_API_BASE_URL and CONTRACT_VERSION
npm run api:pull            # pull the contract openapi.yml from VadayI/claude-api-contract
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

| Phase                      | Agent(s)                                          | Output                                                                                   |
| -------------------------- | ------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| 1. Requirements            | `ba`                                              | user stories, UX scope, the four UI states                                               |
| 2. UI contract             | `ui-architect`                                    | routes, component tree + props, consumed endpoints, query keys, a11y reqs; `routes.json` |
| 3. RED                     | `tester`                                          | failing Playwright journey + failing Vitest/RTL tests with MSW                           |
| 4. GREEN                   | `react-developer`                                 | code that greens the tests + lint/typecheck                                              |
| 5. Quality Gate (parallel) | `reviewer`, `security-scanner`, `state-architect` | independent reports                                                                      |
| 6. Docs                    | `docs-writer`, `guide-writer`                     | feature README, `docs/verify/<feature>.md`, guides, WORKLOG, PR                          |

Full routing and the optional agents (`a11y-auditor`, `qa`, `integration-architect`, `react-refactoring-expert`, `code-structure-auditor`, `template-sync`, …) are in `.claude/rules/workflow.md` and `CLAUDE.md`.

---

## Model turbo mode (all-Opus)

Each subagent pins its own model in frontmatter (13 Opus / 9 Sonnet); the main session runs `opusplan`. To put **every** subagent on Opus temporarily and revert later:

```bash
bash scripts/turbo.sh on       # main session + all subagents → Opus
bash scripts/turbo.sh status   # show current state
bash scripts/turbo.sh off      # revert to opusplan + per-agent models
```

It writes `model: opus` + `CLAUDE_CODE_SUBAGENT_MODEL` (the global override that wins over every agent's frontmatter) into `.claude/settings.local.json` — gitignored and personal, so it never reaches derived projects. **Restart Claude Code after `on`/`off`** (env applies at session start).

---

## Slash commands

Environment & project: `/doctor`, `/bootstrap`, `/preflight`, `/synthesize-brief`, `/config-check`, `/plugins`, `/set-language`, `/handoff`, `/wrap-up`, `/audit`, `/update-from-template`.
Feature & quality: `/verify`, `/guides`, `/review-pr`, `/security-check`, `/a11y-audit`, `/structure-audit`, `/simplify`, `/update-docs`, `/create-pr`, `/fix-ci`.

Defined in `.claude/commands/`.

---

## File layout

```
.claude/
├── agents/        # specialized subagents (ba, ui-architect, react-developer, tester, ...)
├── commands/      # slash commands (/doctor, /bootstrap, /verify, ...)
├── rules/         # auto-loaded conventions (tdd, api-contract, accessibility, workflow, ...)
├── skills/        # reusable knowledge modules (react, mui, vitest-rtl-tdd, ...)
├── memory/        # session-local state (env-detect.json, routes.json, command-log) — gitignored where noted
└── settings.json  # permissions, plugins, hooks
scripts/           # detect-env.mjs, session-start.sh, log-cmd.mjs, setup-wsl.sh, turbo.sh
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
- **file size** — `scripts/check_file_size.sh`: no `src/` file over 800 lines.
- **feature READMEs** — `scripts/check_feature_readmes.sh`: every `src/features/<f>/` has a README.
- **tests** — `vitest --coverage` (unit/component, incl. `jest-axe`) and `playwright` (E2E, incl. axe).

Disciplines: TDD double-loop, contract-first (consume, never invent the API), accessibility mandatory, server-state vs client-state never blurred, PR-only (never push to `main`), context committed to git.

---

## Derived projects & template sync

Start a new frontend by using this repo as a GitHub template (or `/bootstrap` into a fresh repo). Later, pull improvements from the template with `/update-from-template <url>` (the `template-sync` agent classifies template-owned vs project-owned files and opens a PR — never a direct push).

---

## Architecture decisions

See `docs/decisions/` (ADRs 0001–0029): the frontend double-loop TDD boundary, Node-based env detection, the bootstrap/resume command, bash-only shell (native Windows via Git Bash — ADR 0028), frontend-as-separate-repo, manual repo + fine-grained PAT, `/mnt` working-dir support, the config baseline, the 800-line file-size limit, template sync, the React + MUI + TanStack Query + Zustand stack, mandatory accessibility, the server-vs-client state split, the default Bearer/JWT auth mode, the dependency upgrade policy, the external contract repo model (Variant A), and the v0.2.0 contract pin with the auth-path rename.

## Portable seed and translations

Clean `npm ci` now works on native Windows as well as Linux. Use Node 24 (verified
24.21.0); Node 26 is an additional baseline check. Do not add a platform-specific
Rollup binary to package.json. Existing `.npmrc` peer policy remains unchanged.

The seed includes i18next/react-i18next with English/Ukrainian resources. See
[ADR 0029](docs/decisions/0029-portable-i18n-baseline.md) for dependency rationale
and the user-approved 200 KiB initial-JS budget. Other bundle budgets remain.
New bootstrap projects receive the same resources from `templates/i18n` via
`python scripts/seed-i18n.py --target .` (Python 3.13+ tooling prerequisite).
`--check` verifies mirrors; existing project translations are never overwritten.

### Safe legacy launcher migration

`make cc`, `scripts/claude.sh` and `scripts/claude.ps1` now use a shared Python
compatibility launcher. Selected dotenv values are literal data: shell statements,
substitutions and unknown application environment keys are not executed or passed.
The PAT/GH_TOKEN precedence and blank-placeholder fallback are preserved only in
the child process; PowerShell caller variables remain unchanged. CLI arguments and
exit status are forwarded. Applications load their own runtime environment.

This candidate uses integrated core commit 485bb7ae64e5c09ce046ea5cae6e92fd641a7ffe from merged contract PR #57. Delivery was regenerated and checked. Exact known template wrappers migrate by hash;
custom wrappers conflict and remain unchanged. Full bootstrap/CI migration pending.
