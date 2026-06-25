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

> Run everything in **bash** — Linux / macOS / WSL2, or **Git Bash** on native Windows. Not PowerShell/cmd.

### Attach the config to a project — one-line seed

From the root of your project folder (in WSL2, Linux, macOS, or **Git Bash** on native Windows), this clones the template and copies the config in one go (idempotent; refuses to clobber an already-seeded folder unless `--force`):

```bash
bash <(curl -fsSL https://raw.githubusercontent.com/VadayI/claude-react-mui/main/scripts/install.sh)
# optional args:  install.sh [TARGET_DIR] [--ref GIT_REF] [--url FORK_URL] [--force]
```

**On Windows (Git Bash), if `curl`/`git` fails with `CRYPT_E_NO_REVOCATION_CHECK`** (`curl: (35) … The revocation function was unable to check revocation for the certificate`): your network can't reach the certificate-revocation servers — common on corporate networks with SSL inspection or blocked OCSP/CRL. The certificate isn't bad; the revocation _check_ just can't complete. Tell **git** (used by the clone inside `install.sh`) and **curl** (used to fetch the script) to skip that check, then re-run the one-liner:

```bash
git config --global http.schannelCheckRevoke false
bash <(curl -fsSL --ssl-no-revoke https://raw.githubusercontent.com/VadayI/claude-react-mui/main/scripts/install.sh)
```

This is the standard corporate-network workaround; it relaxes revocation checking slightly (revoked certs won't be flagged) — fine for GitHub. The stricter alternative is git's OpenSSL backend with your IT's proxy CA bundle (`git config --global http.sslBackend openssl`).

It seeds **only** the Claude config + the `/bootstrap` inputs (`.claude/`, `CLAUDE.md`, `.mcp.json`, `.gitignore`, `.gitattributes`, `scripts/`, `templates/`, the root `Makefile`, and `.github/workflows/`); the actual Vite+MUI app is scaffolded later by `/bootstrap` Mode A. To upgrade an _already-seeded_ project use `/update-from-template` instead (it preserves your edits).

**Manual equivalent** (what `install.sh` does, if you prefer to run it by hand):

```bash
# in WSL2/Linux/macOS or Git Bash on native Windows, from the root of your project (under WSL2 a /mnt/d/... path is fine — ADR 0009)
rm -rf /tmp/claude-react-mui && git clone https://github.com/VadayI/claude-react-mui.git /tmp/claude-react-mui
cp -r /tmp/claude-react-mui/.claude ./
cp /tmp/claude-react-mui/CLAUDE.md ./
cp /tmp/claude-react-mui/.mcp.json ./
cp /tmp/claude-react-mui/.gitignore ./
cp /tmp/claude-react-mui/.gitattributes ./
cp -r /tmp/claude-react-mui/scripts ./          # detect-env.mjs (SessionStart hook) + helpers — REQUIRED; the hook fails SILENTLY without it
cp -r /tmp/claude-react-mui/templates ./        # FULL templates/ — /bootstrap Mode A needs all of it
cp /tmp/claude-react-mui/templates/Makefile ./  # dev-loop command shortcuts (make help/setup/test/gates/...)
mkdir -p .github/workflows && cp /tmp/claude-react-mui/templates/.github/workflows/* .github/workflows/

# Wipe transient state from the template clone (regenerated by the SessionStart hook):
rm -f .claude/memory/env-detect.json .claude/memory/command-log.jsonl

# Before launching `claude`: on WSL2 confirm it is the WSL2-native CLI (not Windows `claude.exe` via interop); on native Windows a C:\... path is correct.
which claude    # WSL2/Linux/macOS: expect /home/... or /usr/...  (if /mnt/c/..., run bash scripts/setup-wsl.sh). Native Windows: a C:\... path is fine.
```

### Then drive setup from inside Claude Code

```bash
# 1. Toolchain (skip whatever you already have; Node 24+ is REQUIRED — check: node -v):
#    WSL2 / Linux:    bash scripts/setup-wsl.sh        # node (nvm) + claude CLI + gh
#    macOS:           brew install node gh && npm i -g @anthropic-ai/claude-code
#    native Windows:  do NOT run setup-wsl.sh (it is WSL2/Linux-only). In Git Bash:
#                       winget install OpenJS.NodeJS Anthropic.ClaudeCode GitHub.cli

# 2. Create the GitHub repo by hand (ADR 0008), then point this clone at it.
#    Copy the template and fill it in:  cp .env.example .env   (.env is gitignored —
#    never commit it). It holds config (VITE_API_BASE_URL, VITE_OPENAPI_URL,
#    CONTRACT_REPO, CONTRACT_VERSION, VITE_MSW_ENABLED) plus two secret keys:
#      GITHUB_PERSONAL_ACCESS_TOKEN=...   # fine-grained PAT: Contents RW, Metadata RO,
#                                         #   Pull requests RW, Workflows RW, Administration RW (github MCP + gh)
#      CONTEXT7_API_KEY=...               # context7 docs MCP key
#    Claude Code does NOT auto-load .env — the step-3 wrapper sources EVERY var
#    into the claude process and mirrors the PAT to GH_TOKEN for gh.

# 3. Launch Claude Code in the project (sources .env) and let it drive setup:
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
├── rules/         # auto-loaded conventions (tdd, api-client, accessibility, workflow, ...)
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
