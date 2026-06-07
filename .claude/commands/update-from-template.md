---
model: sonnet
---

Sync this derived project's `.claude/` configuration to a newer `claude-react-mui` template version via `template-sync`. PR-only — never pushes to `main`. Takes an optional template repo URL as `$ARGUMENTS`.

## Log

```bash
node scripts/log-cmd.mjs /update-from-template "$ARGUMENTS"
```

## Steps

### 1. Branch guard

Must not be on `main`. If on `main`:

```bash
git checkout -b chore/update-from-template
```

### 2. Identify template source

If `$ARGUMENTS` contains a GitHub URL or path, use it as the template source. Otherwise use the default: `https://github.com/anthropics/claude-react-mui` (or the value in `.claude/memory/template-origin.json` if present).

Fetch the latest template:

```bash
git remote add template <template-url> 2>/dev/null || true
git fetch template main
```

### 3. Classify changed template files

Delegate to `template-sync` to diff the fetched template against this project and classify every changed file into one of three buckets:

**Template-owned (safe to overwrite from template):**

- `.claude/agents/*.md` — agent definitions.
- `.claude/commands/*.md` — command definitions (this file's siblings).
- `.claude/rules/*.md` — shared rules (except `output-language.md` and any project-customized rules).
- `scripts/check_*.sh`, `scripts/detect-env.mjs`, `scripts/log-cmd.mjs` — gate and utility scripts.

**Merge-by-hand (review changes, do NOT auto-overwrite):**

- `CLAUDE.md` — project customizations may exist; review and cherry-pick rule additions.
- `.claude/settings.json` — project-specific `enabledPlugins` and MCP config.
- `.github/workflows/frontend-ci.yml` — CI may have project-specific steps.

**Project-owned (never overwrite from template):**

- `src/` — all application source code.
- `docs/` — project documentation, briefs, worklog.
- `.env`, `.env.example` — project-specific env vars.
- `package.json` — dependencies may have been customized; review version bumps separately.
- Any file in `docs/decisions/` — project ADRs.

### 4. Apply template-owned changes

For each template-owned file with a diff, apply the update:

```bash
git checkout template/main -- .claude/agents/<file>
git checkout template/main -- .claude/commands/<file>
# etc.
```

### 5. Present merge-by-hand diffs

For each merge-by-hand file, show the diff and ask the user which hunks to apply. Do NOT auto-apply.

### 6. Open a PR

```bash
git add .claude/ scripts/
git commit -m "chore: sync .claude config from template $(date +%Y-%m-%d)"
gh pr create --title "chore: update from claude-react-mui template" \
  --body "Syncs .claude/agents, .claude/commands, .claude/rules, and gate scripts from the upstream template. See diff for details. Merge-by-hand files (CLAUDE.md, settings.json, CI) reviewed separately." \
  --base main
```

Report the PR URL. Summarize what was updated and what requires manual review.

<!-- last reviewed: 2026-06-02 -->
