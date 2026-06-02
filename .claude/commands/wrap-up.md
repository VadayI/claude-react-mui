---
model: sonnet
---
End-of-session wrap-up: summarize work done, update `docs/WORKLOG.md` and memory files, run all quality gates, report residual STUBs, and prepare a commit. PR-only per `@.claude/rules/git-operations.md`.

## Log
```bash
node scripts/log-cmd.mjs /wrap-up "$ARGUMENTS"
```

## Steps

### 1. Branch guard
```bash
git branch --show-current
```
If on `main` → STOP: wrap-up commits must be on a feature branch. Create one if needed.

### 2. Summarize session work
Read:
- `git log main..HEAD --oneline` — commits this session.
- `.claude/memory/command-log.jsonl` — last 20 entries.
- `git diff --stat main..HEAD` — files changed.

Produce a 5-10 bullet summary of what was accomplished.

### 3. Run quality gates
Run all checks and report results:
```bash
npm run typecheck
npm run lint
npm run test:run
bash scripts/check_types_drift.sh
bash scripts/check_stubs.sh
bash scripts/check_file_size.sh
bash scripts/check_feature_readmes.sh
```
Report ✅ / ❌ per gate. If any gate fails → the user must fix before the PR is ready (report what needs fixing, do not auto-fix risky things).

### 4. Report residual STUBs
```bash
grep -rn "# STUB:" src/ || echo "No stubs found"
```
Cross-reference against `docs/STUBS.md`. Any stub in `src/` not in `docs/STUBS.md` → 🔴 unlogged stub. Report all stubs with their ledger status.

### 5. Update docs/WORKLOG.md
Append a dated session entry:
```markdown
## <date> — <branch name>
### Done
- <bullet from step 2>
### Gate status
- typecheck: ✅/❌
- lint: ✅/❌
- tests: ✅/❌ (<N> passed)
- types-drift: ✅/❌
- stubs: ✅/❌
### Open items
- <anything deferred>
### Next steps
- <recommended next action>
```

### 6. Update memory files (if needed)
If new routes were added → update `.claude/memory/routes.json`.
If lessons were learned → append to `docs/lessons.md`.
If architectural decisions were made → create ADR in `docs/decisions/`.

### 7. Prepare commit
Stage and commit all documentation and memory updates:
```bash
git add docs/WORKLOG.md docs/lessons.md docs/decisions/ .claude/memory/
git commit -m "docs: wrap-up session $(date +%Y-%m-%d) on $(git branch --show-current)"
```

Do NOT commit source code changes in the wrap-up commit — those belong in their own commits during the feature work. Do NOT push to `main`.

### 8. Final report
Print:
- Summary of work done.
- Gate status table.
- Any blocking issues before PR is ready.
- Recommended next command (e.g., `/create-pr` if all gates pass, or the specific fix needed).

<!-- last reviewed: 2026-06-02 -->
