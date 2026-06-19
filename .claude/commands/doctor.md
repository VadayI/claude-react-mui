---
model: sonnet
---

Audit the live machine against `@.claude/rules/environment.md` across four scopes, report a checklist, and propose fixes — applying them only after you confirm. Never auto-fix risky things, never push, never print secrets.

## Log

```bash
node scripts/log-cmd.mjs /doctor "$ARGUMENTS"
```

## Steps

### Step 0 — Output language (run before anything else)

If `.claude/rules/output-language.md` does NOT exist and `templates/output-language.md` DOES, run the `/set-language` selection flow first: ask via `AskUserQuestion` (header `Language`, options `English` (Recommended) / `Українська` / `Polski`); on a non-English choice, `cp templates/output-language.md .claude/rules/output-language.md`, replace both `{LANGUAGE_NATIVE}` tokens with the chosen native name, and append `@.claude/rules/output-language.md` to the import block at the top of `CLAUDE.md`. Then continue the audit. If the rule already exists, skip. This makes the language choice deterministic even when the user's first action is a slash command — CLAUDE.md "IMPORTANT 0" is only the fallback for a free-form first turn.

### Pre-check: read env-detect.json

Read `.claude/memory/env-detect.json` (written by the SessionStart hook via `node scripts/detect-env.mjs`). If the file is missing, the hook failed — instruct the user to run `node scripts/detect-env.mjs` manually and verify it writes the file honestly. Never hand-write or patch this file.

**HARD STOP — UNSUPPORTED_PLATFORM**: if `platform_supported: false`, stop immediately with:

> ERROR: UNSUPPORTED_PLATFORM — `platform: "windows"` with no Git Bash detected (`is_git_bash: false`). Native Windows needs **Git for Windows** so the bash hooks/gates can run: install it (`winget install Git.Git`) and relaunch, or use WSL2. See `.claude/rules/environment.md` for the full fix.

**WARNING — MIXED_RUNNER**: if `wrong_runner_suspected: true` (a Windows runner launched from inside WSL2), do NOT hard-stop — warn the user to pick one environment: either the WSL2-native `claude` (`npm install -g @anthropic-ai/claude-code` inside WSL2) **or** native Windows from a Git Bash shell. Mixing the two means Windows node operating on `/mnt` files (slow, 9p hazards).

**HARD STOP — NO_NODE**: if `node_supported: false` or Node < 24, stop with:

> ERROR: NO_NODE — Node 24+ is required. Install via nvm: `nvm install --lts`.

### Scope 1 — System tools

Check and report each item (✅ / ❌ / ⚠️):

1. **Node.js ≥ 24** — `node --version`. Source: `env-detect.json` field `node_version`. Must be 24+.
2. **npm** — `npm --version`. Must be present.
3. **git** — `git --version`. Must be present.
4. **GitHub CLI (gh)** — `gh --version`. On **WSL2**, a Windows-native `gh.exe` is NOT visible inside WSL2 — install via `apt` or the GitHub CLI Linux instructions. On **native Windows**, `winget install GitHub.cli`.
5. **Claude Code CLI** — resolve `which claude` against the platform. On **WSL2/Linux/macOS** it must be a Linux/macOS path (`/home/...`, `/usr/...`), NEVER `/mnt/c/...` (a `/mnt/c/...` hit means the Windows binary shadows the WSL2-native one — prepend npm-global bin to PATH or install via nvm). On **native Windows + Git Bash** a `C:\...` / `/c/...` path is correct.
6. **Playwright browsers** — check `env-detect.json` for `playwright_browsers` flag, or run `npx playwright install --dry-run`. Required for e2e tests.
7. **Docker** (optional) — `docker info`. Not required for the React app itself, but note if absent for teams using containerized mock backends.

### Scope 2 — Claude config & access

8. **Required plugins** — check `.claude/settings.json` `enabledPlugins` against the baseline: `superpowers@superpowers-marketplace`, `engineering@knowledge-work-plugins`, `playwright@claude-plugins-official`, `github@claude-plugins-official`, `context7@claude-plugins-official`. Report missing plugins and paste-ready `/plugin install` commands.
9. **GITHUB_PERSONAL_ACCESS_TOKEN** — check it is visible to the session (`[ -n "$GITHUB_PERSONAL_ACCESS_TOKEN" ]`). Never print the value.
    - Present in the session → ✅.
    - Empty in the session but a non-empty `GITHUB_PERSONAL_ACCESS_TOKEN=` line exists in `.env` → the user launched `claude` directly; have them relaunch via `make cc` / `bash scripts/claude.sh` (which sources `.env`).
    - Absent from both → OFFER to add it: ask the user to paste a fine-grained PAT and, on their confirmation, append `GITHUB_PERSONAL_ACCESS_TOKEN=<value>` to `.env` (gitignored — safe; never echo the value back), then have them relaunch via `make cc`. (Setting it in the shell rc still works too.)
10. **CONTEXT7_API_KEY** — `[ -n "$CONTEXT7_API_KEY" ]`. Must be set. Never print the value.
11. **CONTRACT_VERSION** — check `.env` for `CONTRACT_VERSION` (the pinned tag for `VadayI/claude-api-contract`). If absent, `npm run api:pull` cannot fetch the contract schema; note as ⚠️ (not a hard stop — offline work is allowed). Also verify `contract.lock.json` matches the set version.
12. **gh auth** — `gh auth status`. Must be authenticated. If `GITHUB_TOKEN`/`GITHUB_PERSONAL_ACCESS_TOKEN` is set, `gh auth login` will refuse to store separate creds — that is EXPECTED.
13. **gh repo reachable** — `gh repo view` (infer owner/repo from `git remote get-url origin`). If 404/403, report credentials or repo-visibility issue.

### Scope 3 — Project state

Detect scenario and report as one of: `fresh` (no package.json/src) / `existing-incomplete` (scaffold partial) / `active` (full project running) / `no-config` (no .claude/).

14. **Skeleton** — `src/`, `docs/`, `.claude/memory/` exist.
15. **Config files** — `package.json`, `vite.config.ts`, `tsconfig.json`, `.env.example`, `CLAUDE.md` present.
16. **.env** — `.env` present (gitignored, copied from `.env.example`). If missing: `cp .env.example .env` then edit. Never print contents.
17. **node_modules** — `node_modules/` exists. If missing: `npm install`.
18. **Generated types in sync** — `bash scripts/check_types_drift.sh`. If drift detected, regenerate with `npm run api:types`.
19. **Tests green** — `npm run test:run -- --reporter=verbose 2>&1 | tail -5`. Report pass/fail count.
20. **Lint + typecheck clean** — `npm run lint && npm run typecheck`. Report errors.
20a. **Design reference (if declared)** — if `docs/PROJECT.md` § Design reference names a **running design URL**, probe it (a `node` fetch, or the `playwright` MCP `browser_navigate`) and confirm the `playwright` plugin is enabled so agents can open it. Reachable → ✅; declared-but-down → ⚠️ (agents fall back to the prototype folder/brief); none declared → n/a. (@.claude/rules/design-reference.md)

### Scope 4 — Git hygiene

21. **Current branch** — `git branch --show-current`. Should NOT be `main` for active work. If on `main`, warn.
22. **Branch protection** — `gh api repos/{owner}/{repo}/branches/main/protection`. 404 = not protected; on free+private repos this is EXPECTED, not a failure.
23. **Working tree** — `git status -sb`. Report uncommitted changes.
24. **Sync with origin** — `git fetch --dry-run && git status -sb`. Report if behind.
25. **No secrets tracked** — `git ls-files | grep -E '(^|/)\.env$'`. Empty = good. If `.env` is tracked, it's a security issue — instruct removal with `git rm --cached .env`.

### Report format

Print a checklist table: Scope → Item → Status (✅/❌/⚠️) → Note.
Then print a **Scenario** line and a **Recommended next command** (e.g., `/bootstrap` for fresh/incomplete, `/preflight` for active-before-first-feature).

### Fixes

List proposed fixes. Apply only those the user explicitly confirms. Never:

- commit or push
- print secret values
- edit application source code (`src/`)
- force-push or modify `main`

Delegate deep infrastructure checks to `devops` if the environment is unusual.

<!-- last reviewed: 2026-06-09 -->
