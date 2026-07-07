---
model: sonnet
argument-hint: "<template-url> [--ref <tag>]"
---

Sync this derived project's `.claude/` configuration to a newer `claude-react-mui` template version via `template-sync`. PR-only — never pushes to `main`. Takes an optional template repo URL as `$ARGUMENTS`.

The file-ownership classification (template-owned / merge-by-hand / project-owned) lives in ONE place — the `template-sync` agent definition. This command only prepares the upstream clone, dispatches the agent, and turns its result into a PR.

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

### 2. Fetch the upstream template into `$UPSTREAM`

Resolve the template source, in order: a GitHub URL/path in `$ARGUMENTS` → `.claude/memory/template-origin.json` (if present) → the default `https://github.com/VadayI/claude-react-mui`.

Clone it where `template-sync` expects it (`$UPSTREAM`, default `/tmp/claude-react-mui`); a `--ref <tag>` argument maps to `--branch <tag>`:

```bash
UPSTREAM=/tmp/claude-react-mui
rm -rf "$UPSTREAM"
git clone --depth 1 [--branch <tag>] <template-url> "$UPSTREAM"
```

### 3. Delegate to `template-sync`

Dispatch the `template-sync` agent with `$UPSTREAM`. The agent owns the rest: it classifies every file by the ownership rules in its own definition, overwrites template-owned files, proposes merge-by-hand diffs additively (never wholesale), wires new gate scripts into `scripts/` + CI, runs the stale-scan, records `.claude/memory/template-sync.json`, and produces the sync report. Honor `--dry-run` if requested.

### 4. Review the report and open a PR

Present the agent's report to the user. For each merge-by-hand conflict the agent surfaced, ask which hunks to apply — do NOT auto-apply conflicting hunks.

Then commit what the sync changed (the paths listed in the agent's report) and open the PR:

```bash
git add .claude/ scripts/ .github/workflows/
git commit -m "chore: sync config from claude-react-mui template $(date +%Y-%m-%d)"
gh pr create --title "chore: update from claude-react-mui template" \
  --body "Syncs template-owned config from the upstream template (see the template-sync report in this PR). Merge-by-hand files reviewed hunk-by-hunk. Stale files listed for manual cleanup — not auto-deleted." \
  --base main
```

Report the PR URL, then clean up:

```bash
rm -rf "$UPSTREAM"
```

<!-- last reviewed: 2026-07-07 -->
