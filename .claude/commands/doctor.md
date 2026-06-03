---
model: sonnet
---
Audit the live machine against `@.claude/rules/environment.md` across four scopes, report a checklist, and propose fixes — applying them only after you confirm. Never auto-fix risky things, never push, never print secrets.

## Log
```bash
node scripts/log-cmd.mjs /doctor "$ARGUMENTS"
```

## Steps

### Pre-check: read env-detect.json
Read `.claude/memory/env-detect.json` (written by the SessionStart hook via `node scripts/detect-env.mjs`). If the file is missing, the hook failed — instruct the user to run `node scripts/detect-env.mjs` manually and verify it writes the file honestly. Never hand-write or patch this file.

**HARD STOP — UNSUPPORTED_PLATFORM**: if `platform_supported: false` OR `wrong_runner_suspected: true`, stop immediately with:
> ERROR: UNSUPPORTED_PLATFORM — the Claude CLI appears to be running as the Windows-native binary (backslashes in paths, `platform: "windows"`). Install the WSL2-native CLI: inside a WSL2 Ubuntu shell run `npm install -g @anthropic-ai/claude-code` and relaunch. See `.claude/rules/environment.md` for the full fix.

**HARD STOP — NO_NODE**: if `node_supported: false` or Node < 20.19, stop with:
> ERROR: NO_NODE — Node 20.19+ is required. Install via nvm: `nvm install --lts`.

### Scope 1 — System tools

Check and report each item (✅ / ❌ / ⚠️):

1. **Node.js ≥ 20.19** — `node --version`. Source: `env-detect.json` field `node_version`. Must be 20.19+.
2. **npm** — `npm --version`. Must be present.
3. **git** — `git --version`. Must be present.
4. **GitHub CLI (gh)** — `gh --version`. On Windows, a Windows-native `gh.exe` is NOT visible in WSL2; install via `apt` or the GitHub CLI Linux instructions.
5. **Claude Code CLI (WSL2-native)** — `which claude` must resolve to `/home/...` or `/usr/...`, NEVER `/mnt/c/...`. If it resolves to `/mnt/c/...`, the Windows binary shadows it — prepend npm-global bin to PATH or install via nvm.
6. **Playwright browsers** — check `env-detect.json` for `playwright_browsers` flag, or run `npx playwright install --dry-run`. Required for e2e tests.
7. **Docker** (optional) — `docker info`. Not required for the React app itself, but note if absent for teams using containerized mock backends.

### Scope 2 — Claude config & access

8. **Required plugins** — check `.claude/settings.json` `enabledPlugins` against the baseline: `superpowers@superpowers-marketplace`, `engineering@knowledge-work-plugins`, `playwright@claude-plugins-official`, `github@claude-plugins-official`, `context7@claude-plugins-official`. Report missing plugins and paste-ready `/plugin install` commands.
9. **GITHUB_PERSONAL_ACCESS_TOKEN** — `[ -n "$GITHUB_PERSONAL_ACCESS_TOKEN" ]`. Must be set. Never print the value. If missing, instruct the user to set it in their shell profile.
10. **CONTEXT7_API_KEY** — `[ -n "$CONTEXT7_API_KEY" ]`. Must be set. Never print the value.
11. **VITE_OPENAPI_URL** — `[ -n "$VITE_OPENAPI_URL" ]` (check `.env`). If absent, `npm run api:pull` cannot fetch the backend schema; note as ⚠️ (not a hard stop — offline work is allowed).
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

<!-- last reviewed: 2026-06-02 -->
