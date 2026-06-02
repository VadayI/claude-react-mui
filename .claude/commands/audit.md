---
model: sonnet
---
Workflow audit via `auditor`: reads `.claude/memory/command-log.jsonl` plus live git and project state, reports what has been done, and suggests the next command. Takes an optional scope as `$ARGUMENTS` (git | project | workflow).

## Log
```bash
node scripts/log-cmd.mjs /audit "$ARGUMENTS"
```

## Steps

### 1. Determine scope
If `$ARGUMENTS` is one of `git`, `project`, or `workflow`, narrow the audit to that scope. Otherwise run all three.

### 2. Read command log
Read `.claude/memory/command-log.jsonl` (all entries, or last 50 if large). Each entry has: timestamp, command, arguments.

### 3. Read live state
```bash
git log --oneline -15
git branch --show-current
git status -sb
gh pr list --state open
```
Also read: `docs/WORKLOG.md` (last 30 lines), `docs/plans/` (active plans).

### 4. Dispatch auditor
Delegate to `auditor` with all gathered data and these audit dimensions per scope:

**git scope:**
- Are there uncommitted changes that should be committed?
- Is the branch up to date with `main`?
- Are there open PRs awaiting review or merge?
- Any stale branches (no commits in >7 days)?

**project scope:**
- Are gate scripts passing? (Infer from recent `wrap-up` or `fix-ci` log entries.)
- Are there unlogged stubs (`docs/STUBS.md` entries without resolution)?
- Are feature READMEs up to date? (`check_feature_readmes.sh`)
- Is `docs/WORKLOG.md` up to date with today's work?
- Is `docs/verify/` populated for shipped features?

**workflow scope:**
- What was the last command run? Is the pipeline mid-flight?
- Were any pipeline phases skipped (e.g., `tester` RED phase skipped)?
- Is there an in-progress plan in `docs/plans/` with no recent progress?
- What is the logical next step based on command history?

### 5. Report
Print a structured audit report:
```
## Audit Report — <date>
### Git
<findings>
### Project
<findings>
### Workflow
<findings>
### Recommended next command
/<command> — <reason>
```

Suggested next commands are chosen from: `/doctor`, `/bootstrap`, `/preflight`, `/create-pr`, `/fix-ci`, `/wrap-up`, `/verify`, `/guides`, `/update-docs`, or the standard feature pipeline start (`ba` dispatch).

<!-- last reviewed: 2026-06-02 -->
