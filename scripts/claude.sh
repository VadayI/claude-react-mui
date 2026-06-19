#!/usr/bin/env bash
# scripts/claude.sh — launch Claude Code with the project .env sourced.
#
# WHY: Claude Code does NOT auto-load a project .env, and ${VAR} in .mcp.json
# (plus the github/context7 plugins) resolves from the *process environment that
# launched `claude`*. Launch Claude through this wrapper (or `make cc`) so the
# secrets you keep in .env — GITHUB_PERSONAL_ACCESS_TOKEN, CONTEXT7_API_KEY —
# reach the MCP servers and the gh CLI WITHOUT exporting them in your shell rc.
#
# Isolation: each project sources its OWN .env into its OWN `claude` process, so
# parallel projects never share a token (unlike a global export in ~/.bashrc).
# Never prints secret values. .env stays gitignored.
set -uo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# Remember anything already in the environment so an EMPTY placeholder in .env
# (e.g. a freshly seeded GITHUB_PERSONAL_ACCESS_TOKEN=) cannot clobber it.
_pre_pat="${GITHUB_PERSONAL_ACCESS_TOKEN:-}"
_pre_c7="${CONTEXT7_API_KEY:-}"

if [ -f "$ROOT/.env" ]; then
  set -a
  # shellcheck disable=SC1090,SC1091
  . "$ROOT/.env"
  set +a
fi

# .env wins when filled; otherwise fall back to what was already in the shell.
[ -z "${GITHUB_PERSONAL_ACCESS_TOKEN:-}" ] && [ -n "$_pre_pat" ] && export GITHUB_PERSONAL_ACCESS_TOKEN="$_pre_pat"
[ -z "${CONTEXT7_API_KEY:-}" ] && [ -n "$_pre_c7" ] && export CONTEXT7_API_KEY="$_pre_c7"

# gh reads GH_TOKEN / GITHUB_TOKEN — not GITHUB_PERSONAL_ACCESS_TOKEN. Mirror it
# so the same .env value authenticates gh too. (Prefer `gh auth login` if you
# want gh creds in the OS keychain instead — then leave GH_TOKEN unset.)
if [ -n "${GITHUB_PERSONAL_ACCESS_TOKEN:-}" ] && [ -z "${GH_TOKEN:-}" ] && [ -z "${GITHUB_TOKEN:-}" ]; then
  export GH_TOKEN="$GITHUB_PERSONAL_ACCESS_TOKEN"
fi

exec claude "$@"
