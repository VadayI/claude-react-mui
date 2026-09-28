---
model: sonnet
argument-hint: "[git | project | workflow]"
---

Workflow audit via `auditor`: reads `.ai-runtime/command-log.jsonl` plus live git and project state, reports what has been done, and suggests the next command. Takes an optional scope as `$ARGUMENTS` (git | project | workflow).

## First: sync preflight

Before anything else, check that previous changes are committed and synchronized with GitHub:

```bash
python scripts/ai/git_lifecycle.py --json inspect --fetch
```

Synchronized means: no staged, unstaged or untracked paths in `working_tree`;
`head` equals the branch's remote-tracking tip (`remote_tracking`, or
`base_refs.remote_tracking` on the base branch); no blockers; PR evidence
`VERIFIED`. Anything else (for example `LOCAL_CHANGES`, `COMMITTED_UNPUSHED`,
`BEHIND_REMOTE`, `DIVERGED`, `LOCAL_COMMITS_ON_BASE`, `PR_HEAD_MISMATCH`,
`NOT_VERIFIED`, a pending cleanup) is reported as the first finding with the
exact paths, commits and next step. Then ask the user whether to finalize first
(`/wrap-up`: commit, push, PR) or audit the current state anyway. The audit
itself never commits, pushes, pulls or cleans; the fetch only updates
remote-tracking refs. Unavailable gh or network is `NOT_VERIFIED`, never
synchronized.

## Log

```bash
node scripts/log-cmd.mjs /audit "$ARGUMENTS"
```

## Steps

### 1. Determine scope

If `$ARGUMENTS` is one of `git`, `project`, or `workflow`, narrow the audit to that scope. Otherwise run all three.

### 2. Read command log

Read `.ai-runtime/command-log.jsonl` (all entries, or last 50 if large). Each entry has: timestamp, command, arguments.

### 3. Read live state

```bash
git log --oneline -15
git branch --show-current
git status -sb
gh pr list --state open
```

Also read: `python scripts/ai/session_context.py --root .` output (latest `docs/sessions/` record), `docs/plans/` (active plans).

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
- Does the latest `docs/sessions/` record cover today's work (`session_context.py --check` PASS)?
- Is `docs/verify/` populated for shipped features?
- **Design reference**: does `docs/PROJECT.md` § Design reference declare a source + fidelity level (L1–L4)? If a running design URL is declared, is it reachable and is the `playwright` plugin enabled so agents can open it? (@.claude/rules/design-reference.md)

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

<!-- last reviewed: 2026-09-28 (sync preflight via git_lifecycle.py inspect --fetch) -->
