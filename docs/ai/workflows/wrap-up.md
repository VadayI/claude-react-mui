# Wrap-up — shared finalize procedure

Read AGENTS.md, git-operations and living-plan rules. One completed logical session
is the unit, not each intermediate answer. Use a separate executor role for Git
mutations when acting as coordinator. Preserve the initial inventory of foreign work.

1. Run `python scripts/ai/git_lifecycle.py inspect --fetch` (docs/ai/git-lifecycle.md):
   repository/root/gitdir, branch, HEAD, index, worktrees, stash, locks, remote and
   related PR with the next step. Reconcile current refs; never blindly pull/rebase
   over dirty work. A `MERGED / CLEANUP_PENDING` branch is cleaned in step 7.
2. Summarize actual changes/checks: create this session's record with
   `python scripts/ai/session_context.py --root . --new-record --agent <runtime>`
   and fill every section (docs/ai/session-continuity.md); update HANDOFF by
   content (never `merge=union`) and the relevant plan/backlog, lessons, ADRs and
   registries. `docs/WORKLOG.md` is history, not a concurrent append target. Move
   durable facts from runtime-private memory into these documents. Preserve unknown
   legacy memory. The record's revision is the known prior commit; do not create
   self-referential SHA churn.
3. Review exact task-owned diff. Commit with `git_lifecycle.py commit --path <path> ...
   --message ...`: other staged entries stay staged and foreign files are compared
   before/after. For exact hunks stage them and add `--staged` (the index may hold
   only task paths). A refused commit changes nothing; do not fall back to blanket
   add, automatic stash or reset. Exit 3 `COMMITTED_WITH_UNEXPECTED_CHANGES` means
   a hook touched other paths: review that commit before sharing.
4. Commits go to a task branch, never main. Validate the actual candidate and base in
   a separate checkout with the selected full checks (runner, bound to pre-push);
   `git_lifecycle.py verify` reports the exact candidate's evidence. Dirty-tree
   tests alone are not push evidence.
5. `git_lifecycle.py share --title ... --body-file ...`: push without force, create or
   update the single PR and confirm remote and PR head. A network error is reported
   as incomplete; inspect before retrying. In local mode do not dispatch Actions; in
   GitHub mode wait for exact-head required checks. No CI choice is inferred for a
   fresh project; bootstrap must obtain it before hosted activation.
6. After the commit, `python scripts/ai/session_context.py --root . --check` must
   PASS so another agent or machine finds the record.
   Return BRANCH_SYNCED / MERGE_PENDING only after verified push/PR; otherwise report
   the exact unfinished step. Do not merge until the user explicitly commands it.
7. On that command run `git_lifecycle.py merge --pr N --expect-head <approved SHA>`;
   it rechecks head/base/checks and merges only that revision. `git_lifecycle.py
   cleanup` then needs merged-PR evidence (including squash content), no extra
   commits and no dirty or ignored-file worktree; it removes only this task's branch
   and resources and preserves all stash and historical branches. Missing evidence
   means keep the branch.
8. Report MERGED / CLEANED only for completed actions. Recover from actual Git/PR
   state on another machine, even without local runtime markers. No-change sessions
   produce no empty commit/PR. Release tags/deploy are separate operations.

Record residual STUBs and failed/missing checks faithfully, without `|| true` masking.
Do not end by asking whether to commit/push/PR when the task already authorizes them.
