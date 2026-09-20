# Doctor — explicit, read-only environment inspection

Read AGENTS.md and the environment, node-commands and mcp-stack rules. Respect an
already chosen language. Inspect Git root, branch, HEAD, status, worktrees and
relevant config without changing them. Classify fresh, incomplete, active or foreign
project. A missing fresh-project artifact is not a passing installed capability.

Run `python --version`, `node --version`, `npm --version`, `git --version` and
`gh --version`. Probe the selected CLI version; the other CLI is optional for a
single-runtime project. On Windows locate explicit Git Bash separately from WSL.
Run `node scripts/detect-env.mjs` explicitly for the current legacy detector;
record its exit and limitations (PowerShell can report no MSYSTEM despite installed
Git Bash). Do not fabricate or repair detector JSON. P05 replaces this legacy path.

Inspect package/lock presence, types/gates, browser prerequisites, docs and selected
contract source. Inspect GitHub authentication/repo/rules only through available
authenticated tooling; never print credential values. Missing gh/remote means
NOT_VERIFIED for remote checks, not success. Do not require a PAT when gh already
has valid keyring authentication. Optional MCP capabilities: current library docs,
browser inspection and GitHub operations; official docs, test/browser tools and gh
are valid equivalents. List unsupported/untrusted/missing capabilities distinctly.

Return a scope/item/status/evidence/next-action table. Do not start install, services,
Docker, formatters, commits or pushes from doctor, or seed env/delete index.lock.
Carry out separately authorized repairs through the corresponding implementation
role. Do not ask again for choices already supplied in the session.
