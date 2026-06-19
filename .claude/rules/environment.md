# Environment specification (the source of truth)

This file defines the **expected local environment** for a `claude-react-mui` project. The `/doctor` command checks the live machine against this spec and proposes fixes. Keep this file authoritative: if the required setup changes, change it here first.

> Philosophy: detect → report → propose → **fix only after the user confirms**. `/doctor` reads `.claude/memory/env-detect.json` (written by the `SessionStart` hook) to pick shell-appropriate checks, never auto-fixes risky/irreversible things, never pushes to `main`, and never prints secret values.

## Scope 1 — System tools

The Check column gives bash commands — Linux / macOS / WSL2 Ubuntu, or **native Windows via Git Bash** (Git for Windows). The single shell dialect is bash; on native Windows it is Git Bash (ADR `docs/decisions/0028-support-native-windows-git-bash.md`, amending `0005`). Windows PowerShell/cmd *alone* are NOT supported — the hooks and gate scripts are bash. The shell is auto-detected by `scripts/detect-env.mjs` on every session start and stored in `.claude/memory/env-detect.json`.

| Requirement                       | Expected                                                                                                                                                                                       | Check (bash)                                                                                                                                          |
| --------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Node.js (HARD REQUIREMENT)**    | 24+ on PATH as `node` (ADR 0023)                                                                                                                                                               | `node --version`. Runs the SessionStart hook (`scripts/detect-env.mjs`), the CI gate helpers, Vite, Vitest, Playwright. Install via `nvm` if missing. |
| **npm (HARD REQUIREMENT)**        | bundled with Node, on PATH                                                                                                                                                                     | `npm --version`. On WSL2 must resolve to a Linux path, NOT `/mnt/c/...` (the Windows npm); on native Windows a `C:\...` path is correct.                                                                    |
| OS shell                          | A bash shell — Linux / macOS (bash/zsh), WSL2 Ubuntu, or **native Windows + Git Bash** (Git for Windows). PowerShell/cmd alone not supported.                                                                                  | `node scripts/detect-env.mjs` writes `platform_supported`; `false` (e.g. Windows without Git Bash) — STOP: install Git for Windows, or use WSL2.                   |
| Working dir                       | Any path, **including `/mnt/c`/`/mnt/d` — fully supported (ADR `0009`); `/doctor` must NOT suggest moving**. Caveat: slightly slower file-watching/HMR; run git from the host shell on `/mnt`. | `pwd`                                                                                                                                                 |
| git                               | present                                                                                                                                                                                        | `git --version`                                                                                                                                       |
| GitHub CLI                        | WSL2: a Windows `gh.exe` is NOT visible inside WSL2 — install via `apt`/official Linux instructions. Native Windows: `winget install GitHub.cli`                                                                                 | `gh --version`                                                                                                                                        |
| **Claude Code CLI** | `claude` on PATH for the platform                                                                                                                                          | WSL2/Linux/macOS: `which claude` → `/home/...` or `/usr/...`, NEVER `/mnt/c/...`. Native Windows: a `C:\...` / `/c/...` path is correct. Install: `npm install -g @anthropic-ai/claude-code` (Node 24+), or `winget install Anthropic.ClaudeCode`.              |
| Playwright browsers               | installed when E2E runs                                                                                                                                                                        | `npx playwright install --with-deps` (first run / CI)                                                                                                 |
| Docker (OPTIONAL)                 | only for building/serving the static image or staging parity — NOT required for local dev (Vite runs on the host)                                                                              | `docker info` (optional)                                                                                                                              |

### Windows: pick ONE environment — native Windows **or** WSL2, don't mix them

Windows has two supported setups (ADR `0028`): **native Windows** (Git for Windows provides Git Bash; Node 24+ via the installer or winget) and **WSL2 Ubuntu** (a full Linux runtime). Both are first-class. The failure mode is *mixing* them — most often typing `claude` inside a WSL2 shell while only the **Windows** CLI is installed, so PATH interop resolves `claude` to `claude.exe` and a Windows Node operates on your `/mnt` files. `env-detect.json` then records `platform: windows` with **`wrong_runner_suspected: true`**. `/doctor` issues a **MIXED_RUNNER warning** (no longer a hard stop) — pick one of the two paths below.

**Spot it from the startup banner:** a WSL2-native launch prints a Linux-style path and `(from .claude/settings.json)`; the Windows binary prints backslash paths (`D:\Dev\...`) and `(from .claude\settings.json)`. Backslashes = you launched `claude.exe`; fix the runner first.

**Option 1 — native Windows:** install Git for Windows (`winget install Git.Git`), Node 24+ (`winget install OpenJS.NodeJS`, or nvm-windows), and the CLI (`winget install Anthropic.ClaudeCode`, or `npm install -g @anthropic-ai/claude-code`); then launch `claude` from a **Git Bash** shell. **Option 2 — WSL2:** install and launch the **Linux-native** CLI from inside WSL2:

```bash
# inside a real WSL2 Ubuntu shell
node --version                              # need Node 24+ (install via nvm if missing)
npm install -g @anthropic-ai/claude-code
hash -r
which claude                                # must be /home/... or /usr/..., NOT /mnt/c/...
```

If `which claude` (or `which node npm`) still resolves to `/mnt/c/...`, the Windows interop path precedes your npm-global bin. Let `nvm` own a node+npm pair inside WSL2:

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
export NVM_DIR="$HOME/.nvm"; [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
nvm install --lts
hash -r && which node npm                   # both /home/... — NOT /mnt/c/...
npm install -g @anthropic-ai/claude-code
hash -r && which claude                     # /home/... — NOT /mnt/c/...
```

`scripts/setup-wsl.sh` automates exactly this (nvm + node + the CLI + the gh install), idempotently.

Working from `/mnt/...` is fully supported (ADR `0009`) — a WSL2-native `claude` launched from `/mnt/d` reports `platform: linux, is_wsl2: true, platform_supported: true` and passes the gate.

### env-detect.json integrity (hard rule)

`.claude/memory/env-detect.json` is the source of truth for `platform_supported`, `node_supported`, `gh.*`, and tool availability. It is rewritten by `scripts/detect-env.mjs` via the `SessionStart` hook on every session. **Never hand-write or "patch" this file** to skip a blocker — its fields drive `/bootstrap` and `/doctor` hard gates. If it is missing: run `node scripts/detect-env.mjs` manually; if that fails, fix the underlying problem (install Node 24+ / fix PATH), do NOT fabricate JSON.

## Scope 2 — Claude config & access

| Requirement                     | Expected                                                                                                                                                                                                                                                                                         | Check                                                        |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------ |
| Plugins (committed baseline)    | `superpowers@superpowers-marketplace`, `engineering@knowledge-work-plugins`, `playwright@claude-plugins-official`, `github@claude-plugins-official`, `context7@claude-plugins-official` (auto-enabled via `.claude/settings.json`). `claude-hud` recommended but personal/global, not committed. | `/plugin` list vs `.claude/settings.json` `enabledPlugins`   |
| MCP servers (github + context7) | from the official plugins (ADR `0011`). `.mcp.json` + `enabledMcpjsonServers` is the optional fallback — do NOT enable both.                                                                                                                                                                     | `/plugin` shows both installed                               |
| `GITHUB_PERSONAL_ACCESS_TOKEN`  | set — required for `gh` push/PR/branch-protection                                                                                                                                                                                                                                                | `[ -n "$GITHUB_PERSONAL_ACCESS_TOKEN" ]` (never print value) |
| `CONTEXT7_API_KEY`              | set — for doc lookups                                                                                                                                                                                                                                                                            | `[ -n "$CONTEXT7_API_KEY" ]` (never print value)             |
| GitHub auth                     | `gh` authenticated                                                                                                                                                                                                                                                                               | `gh auth status`                                             |
| Repo access                     | repo reachable, fine-grained PAT (ADR `0008`): Contents RW, Metadata RO, Pull requests RW, Workflows RW, Administration RW                                                                                                                                                                       | `gh repo view <owner>/<repo>`                                |

## Scope 3 — Project state

| Requirement    | Expected                                                                                           | Check                                                          |
| -------------- | -------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| Skeleton       | `src/`, `e2e/`, `docs/decisions/`, `.claude/memory/` exist                                         | `test -d <dir>`                                                |
| Config files   | `CLAUDE.md`, `.claude/`, `package.json`, `vite.config.ts`, `tsconfig.json`, `.env.example` present | `test -f <file>`                                               |
| `.env`         | local-only (gitignored), copied from `.env.example`                                                | `test -f .env` (never print). Missing → `cp .env.example .env` |
| Deps installed | `node_modules/` present and lockfile honored                                                       | `test -d node_modules` / `npm ci`                              |
| Types in sync  | `schema.d.ts` matches `openapi.yml`                                                                | `bash scripts/check_types_drift.sh`                            |
| Tests          | vitest green                                                                                       | `npm run test:run`                                             |
| Lint/types     | eslint + tsc clean                                                                                 | `npm run lint && npm run typecheck`                            |

> Skeleton/`.env`/deps may legitimately be absent in a brand-new repo before `/bootstrap`. `/doctor` reports these as "not set up yet" (info), not failures, when no app exists yet.

## Scope 4 — Git hygiene

| Requirement        | Expected                                                                                  | Check                                                   |
| ------------------ | ----------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| Current branch     | a feature branch, not `main` (for active work)                                            | `git branch --show-current`                             |
| Branch protection  | `main` protected on GitHub (PR + status checks). Requires public repo or GitHub Pro/Team. | `gh api repos/{owner}/{repo}/branches/main/protection`  |
| Working tree       | clean or only intended changes                                                            | `git status -sb`                                        |
| No secrets tracked | `.env` ignored, not committed                                                             | `git ls-files \| grep -E '(^\|/)\.env$'` (empty = good) |

## Remediation policy

- **Safe to propose-then-apply (after confirmation):** `npm ci`, `cp .env.example .env`, create missing skeleton dirs, `/plugin install ...`, `nvm install`, `npx playwright install`, create a feature branch off fresh `main`.
- **Ask explicitly, never silently:** writing secrets, force operations, deleting files, enabling branch protection, pushing.
- **Forbidden in `/doctor`:** committing, `git push`, pushing to `main`, printing secret values, editing application source code.
