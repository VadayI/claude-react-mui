# Wrap-up — shared finalize procedure

Read AGENTS.md, git-operations and living-plan rules. One completed logical session
is the unit, not each intermediate answer. Use a separate executor role for Git
mutations when acting as coordinator. Preserve the initial inventory of foreign work.

1. Inspect repository/root/gitdir, branch, HEAD, index, worktrees, stash OIDs, remote
   and related PR. Reconcile current refs; never blindly pull/rebase over dirty work.
2. Summarize actual changes/checks, update HANDOFF/WORKLOG and relevant plan/backlog,
   lessons, ADRs and registries. Preserve unknown legacy memory. Record a known
   prior commit/tree; do not create self-referential SHA churn.
3. Review exact task-owned diff. Stage only explicit files/hunks, preserving partial
   staging and foreign changes in the same file. If separation is uncertain, stop
   the commit step and identify it. Do not use blanket add, automatic stash or reset.
4. Create logical commits on a task branch, never main. Validate the actual candidate
   and base in a separate checkout with the selected full checks. Dirty-tree tests
   alone are not push evidence. P05/P08 will automate this currently explicit process.
5. Push without force, create/update the existing PR, verify remote and PR head.
   A network error requires state inspection before retry. In local mode do not
   dispatch Actions; in GitHub mode wait for exact-head required checks. No CI choice
   is inferred for a fresh project; bootstrap must obtain it before hosted activation.
6. Return BRANCH_SYNCED / MERGE_PENDING only after verified push/PR; otherwise report
   the exact unfinished step. Do not merge until the user explicitly commands it.
7. On that command, recheck head/base/checks, then merge only the verified revision.
   Cleanup requires merged-PR evidence (including squash content), no extra commits,
   and no active worktree. Remove only this task's completed branch/resources;
   preserve all stash and historical branches. Missing evidence means keep the branch.
8. Report MERGED / CLEANED only for completed actions. Recover from actual Git/PR
   state on another machine, even without local runtime markers. No-change sessions
   produce no empty commit/PR. Release tags/deploy are separate operations.

Record residual STUBs and failed/missing checks faithfully, without `|| true` masking.
Do not end by asking whether to commit/push/PR when the task already authorizes them.
