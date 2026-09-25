# Environment specification

Doctor is read-only: detect, report and identify a concrete remedy. It never
installs dependencies/plugins, starts services, copies env files or repairs Git.
Existing user authorization applies to separately requested remediation.

## System capabilities

- Node 24 is the primary React target; Node 26 is an additional compatibility
  check, never a substitute. npm must resolve to the same operating environment.
- Python 3.13+ runs shared template tooling without application dependencies.
- Native Windows uses PowerShell and explicit Git Bash for Bash gate scripts.
  Do not accidentally invoke the WSL launcher named `bash`. Linux uses native
  tools. WSL/macOS support is NOT_VERIFIED unless actually exercised.
- Paths may include spaces, Unicode and Windows drive mounts. Do not suggest
  relocating a project merely because it lives on a mounted drive.
- Record Git, gh, selected agent CLI, shell and runtime versions. Claude is not
  required for Codex operation, nor Codex for Claude operation.
- Playwright browser availability is needed for E2E. Installation is a separate
  authorized setup action, not a read-only capability check.
- Docker is optional for local Vite development; required checks that depend on
  it remain NOT_VERIFIED if unavailable. Never silently omit those checks.
- Do not mix Windows Node/CLI with Linux dependencies in WSL. Report mixed PATH
  evidence and select a consistent toolchain; do not change global PATH/trust.

Run `node scripts/session-start.mjs` explicitly (or `node scripts/detect-env.mjs` for
the stack probe alone). The shared detector writes `.ai-runtime/environment.json`
(`python scripts/ai/detector.py --repository . --write`, Python 3.13+) and the stack
probe writes `.ai-runtime/env-detect.json`; these are the only allowed doctor report
side effects. A legacy `.claude/memory/env-detect.json` is moved to `.ai-runtime/` by
the probe; two differing copies are reported, never merged. A previous hook report
can be stale. Never hand-edit detection facts or fabricate supported flags.

## Access and project state

Use `gh auth status` and repository reachability to check GitHub access without
printing tokens or personal account metadata. Existing credential-manager auth is
valid; a named PAT environment variable is not mandatory. Check only access
required for the requested operation. Optional MCP/plugins are capability
implementations, with documented CLI/browser/official-doc equivalents.

Inspect the app skeleton, package/lockfile, Vite/TypeScript config, non-secret
`.env.example`, API pin, docs and registries. Missing app/dependencies before
bootstrap are 'not set up', not a failed app. Never read real env files. An absent
local env file alone does not block an app configured through safe defaults.

Read Git branch/status and tracked paths. Preserve foreign work, stash, refs and
worktrees. Verify feature-branch policy and active CI choice. Branch protection
must correspond to real checks; do not require nonexistent hosted statuses in
local mode. Missing hosted access does not block independent local work.

Full type/lint/test/contract/build checks belong to `verify`, not environment
inspection. Distinguish available commands from commands actually executed.
