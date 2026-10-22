# 0030. WSL ext4 working clone; agent sessions on `/mnt` only with explicit permission

Status: accepted · 2026-10-22 · supersedes [0009](0009-mnt-working-dir-supported.md) · plan decisions D11, D12, D17

## Context

ADR 0009 declared a project on a Windows drive (`/mnt/c`, `/mnt/d`) fully supported and
treated slower file access as cosmetic. Measurements on a real derived project of the
family (Django backend; the same bridge serves Vite/Vitest here) showed it is the main
cause of long runs:

| Operation | On `D:` (`/mnt/d`, 9P) | On ext4 (`~/src`) |
|---|---|---|
| Full test suite | 55 min | 1 min 37 s |
| Image build | 36 min | 41 s |
| 16 parallel test workers | CPU 83 % of 1600 %, stalled 12 min | scale |

In WSL2 every read of a file on a Windows drive crosses the Windows → WSL bridge
(9P/drvfs). A frontend is dominated by many small reads — `node_modules`, Vite module
graph, Vitest workers, file watching, `.git` — so the penalty is the same 10–50×
(`time ls -R` on `/mnt` vs `~/src`). Parallel workers serialize on that I/O. The full
suite also ran far too often.

## Decision

1. In WSL the working clone lives in ext4 (`~/src/<repo>`); Git, Node, tests and the
   agent CLIs run there; VS Code via Remote-WSL. Native Windows via Git Bash (ADR 0028,
   NTFS without 9P) stays a supported runner.
2. **D17:** an agent session in a project on a Windows drive seen from WSL is blocked
   unless the user started it with `ALLOW_MNT_SESSION=1`. Enforced by the shared
   `scripts/ai/workdir.py`: Claude `UserPromptSubmit` and `PreToolUse` hooks exit 2 with
   the move checklist; `session_context.py --check` exits 1; `/doctor`, `/bootstrap` and
   `/wrap-up` stop at step 0. An allowed session continues and the allowance is written
   into the session record. The allowance is never stored in project settings.
3. `detect-env.mjs` reports `working_dir_on_windows_mount` (the `/mnt/*` heuristic removed
   on 2026-06-04 returns for the *working directory*, not for the node binary, which only
   `/mnt/c` identifies). `/doctor` shows ⚠️ with the checklist and the heuristic
   (`time ls -R`, `docker stats`); ext4 → ✅.
4. `templates/.dockerignore` is copied by bootstrap in the first commit.
5. **D12:** agents run only targeted tests (`npx vitest run <path>`,
   `npx playwright test <spec>`); the full suite runs at most twice a day and the user
   starts it or confirms the step that triggers it (pre-push runner on `share` in local
   CI mode). Unseen full runs are NOT_VERIFIED.

Move checklist (8 steps): `docs/ai/wsl-ext4-migration.md`.

## Consequences

- Full runs take minutes; agents stop burning time on the 9P bridge.
- Existing clones must be moved once; a user who deliberately works on `/mnt` starts
  each session with `ALLOW_MNT_SESSION=1`.
- If neither `python3` nor `AI_PYTHON` resolves in WSL, the hook fails as a non-blocking
  error; step 0 of the commands and `session_context` still report the block.
- NOT_VERIFIED: Claude Code CLI responsiveness in WSL on ext4 (P08a item 8) — measured by
  the user, recorded in the implementation status, not assumed.
