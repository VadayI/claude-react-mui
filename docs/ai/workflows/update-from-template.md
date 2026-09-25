# Update from the React template

Input: optional upstream URL/path and ref; default is
`https://github.com/VadayI/claude-react-mui.git`. Respect an existing verified
lineage record. This procedure is shared by Claude and Codex. Runtime tool names
are not interchangeable. A coordinator delegates writes to the update worker.

1. Inspect Git branch/HEAD/index/status/worktrees and project lineage. Preserve
   foreign work and stage only explicit task files. Use a new task branch from
   the reconciled base; never push directly to main or merge implicitly.
2. Clone the selected source into a new unique temporary directory. Never reuse
   or delete a fixed `/tmp/claude-react-mui`. Record source URL/ref/exact SHA.
   No secrets, personal configuration or project code are copied upstream.
3. From the verified upstream run `python scripts/ai/generate.py --check`, then
   `python scripts/ai/install.py --target <project>` (preview). The complete
   `docs/ai/delivery-manifest.json` is authoritative for managed paths and hashes.
   The renderer/core must be consistent before any project writes.
4. Report writes and conflicts. `--apply` performs the same whole-payload
   preflight and writes only if there are no conflicts. Previously installed,
   unchanged template paths may update; differing custom files and mixed
   instructions/settings/Makefile require a reviewed diff. Known legacy hashes
   migrate only their exact matching paths. No recursive copy or force bypass.
5. Keep project code, notes, registries, output language, overrides, personal
   settings, env and unknown paths intact. New legacy-only paths without a prior
   receipt may conflict: compare with the recorded old source, review the diff,
   then reconcile explicitly. Do not manufacture ownership for unknown content.
6. Inventory stale paths recorded by the previous manifest but absent upstream;
   list them for review, never delete automatically. Preserve live workflows and
   branch settings. Newly delivered check scripts do not establish CI coverage;
   the exact-runner workflow is materialized only by the project's explicit CI
   choice (`scripts/ai/install.py --target <project> --ci-mode local|github`);
   never activate automatic triggers without that recorded choice.
7. Run installed `core_sync.py --target <project> --check`,
   `generate_adapters.py --root <project> --check`, and relevant delivery tests.
   Customized mixed instructions may require a documented explicit adaptation;
   report drift honestly. Record commands, exact candidate/base and limitations.
8. Record the verified source SHA, previous lineage and migration results in the
   existing project update record (`docs/project-state/template-lineage.json`; a legacy
   `.claude/memory/template-sync.json` is migrated first with
   `python scripts/ai/project_state.py --root . --apply`, never written in parallel).
   Do not overwrite unrelated fields or claim untested app/DB/runtime acceptance.
9. Commit the reviewed task paths, push the task branch and create/update a draft
   PR with changed files, conflicts, preserved paths, stale inventory and checks.
   Report BRANCH_SYNCED / MERGE_PENDING. Release/deploy/merge require separate
   authorization. Clean up only the exact task-owned temporary clone after
   verifying its resolved path; never touch a user's checkout or worktree.

For `--dry-run`, perform source inspection and preview only: no project writes,
lineage mutation, commit, push or PR. Conflicts preserve the entire target tree.
Interrupted delivery can be repeated because already-equal content is accepted;
full transactional rollback is P13, not claimed by this checkpoint.
