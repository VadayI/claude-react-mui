---
model: sonnet
---
Regenerate `docs/HANDOFF.md` as a snapshot of the current project state — branch, last work done, open PRs, and recommended next steps. Useful at end-of-session or when switching between machines.

## Log
```bash
node scripts/log-cmd.mjs /handoff "$ARGUMENTS"
```

## Steps

### 1. Collect live state
Gather the following (read-only):
```bash
git branch --show-current
git log --oneline -10
git status -sb
gh pr list --state open
```
Also read:
- `docs/WORKLOG.md` (last 20 lines).
- `.claude/memory/command-log.jsonl` (last 10 entries).
- `docs/plans/` (any in-progress plans).

### 2. Generate HANDOFF.md
Write `docs/HANDOFF.md` with this structure:

```markdown
# Project Handoff — <date>

## Current branch
<branch name and what it's for>

## Last work done
<3-5 bullet points summarizing recent commits/changes>

## Open PRs
<list with title, number, URL, status>

## Project state
- Tests: <green/failing>
- Types: <in-sync/drifted>
- Lint: <clean/errors>
- Stubs: <none/count>

## In-progress work
<any plans in docs/plans/ that are incomplete>

## Next steps
1. <most urgent action>
2. <second action>
3. <third action>

## Open questions
<unresolved decisions the next session must address; use `- [ ]` checkboxes — the auditor surfaces unchecked items>

## Key file locations
- Routes: src/routes/index.tsx
- API types: src/lib/api/types.ts
- Feature list: src/features/
- Verification docs: docs/verify/
- Guides: docs/guides/
```

### 3. Commit the handoff doc
```bash
git add docs/HANDOFF.md
git commit -m "docs: update handoff snapshot $(date +%Y-%m-%d)"
```
If on `main`, commit directly (this is a docs-only snapshot, not code). Otherwise commit on the current branch.

Report the path to `docs/HANDOFF.md`.

<!-- last reviewed: 2026-06-02 -->
