#!/usr/bin/env bash
# scripts/claude.sh — launch Claude Code with the project .env sourced.
#
# WHY: Claude Code does NOT auto-load a project .env, and ${VAR} in .mcp.json
# (plus the github/context7 plugins) resolves from the *process environment that
# launched `claude`*. Launch Claude through this wrapper (or `make cc`) so EVERY
# variable in .env reaches the MCP servers, the gh CLI, and the app tooling
# WITHOUT exporting anything in your shell rc:
#   - config : VITE_API_BASE_URL, VITE_OPENAPI_URL, CONTRACT_REPO,
#              CONTRACT_VERSION, VITE_MSW_ENABLED
#   - secrets: GITHUB_PERSONAL_ACCESS_TOKEN, CONTEXT7_API_KEY
#
# Isolation: each project sources its OWN .env into its OWN `claude` process, so
# parallel projects never share a token (unlike a global export in ~/.bashrc).
# Never prints secret values. .env stays gitignored.
set -uo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# Remember anything already in the environment so an EMPTY placeholder in .env
# (e.g. a freshly seeded GITHUB_PERSONAL_ACCESS_TOKEN=) cannot clobber it.
# One snapshot line per .env variable (portable; no associative arrays).
_pre_VITE_API_BASE_URL="${VITE_API_BASE_URL:-}"
_pre_VITE_OPENAPI_URL="${VITE_OPENAPI_URL:-}"
_pre_CONTRACT_REPO="${CONTRACT_REPO:-}"
_pre_CONTRACT_VERSION="${CONTRACT_VERSION:-}"
_pre_VITE_MSW_ENABLED="${VITE_MSW_ENABLED:-}"
_pre_GITHUB_PERSONAL_ACCESS_TOKEN="${GITHUB_PERSONAL_ACCESS_TOKEN:-}"
_pre_CONTEXT7_API_KEY="${CONTEXT7_API_KEY:-}"

if [ -f "$ROOT/.env" ]; then
  set -a
  # shellcheck disable=SC1090,SC1091
  . "$ROOT/.env"
  set +a
fi

# .env wins when filled; otherwise fall back to what was already in the shell.
[ -z "${VITE_API_BASE_URL:-}" ]            && [ -n "$_pre_VITE_API_BASE_URL" ]            && export VITE_API_BASE_URL="$_pre_VITE_API_BASE_URL"
[ -z "${VITE_OPENAPI_URL:-}" ]             && [ -n "$_pre_VITE_OPENAPI_URL" ]             && export VITE_OPENAPI_URL="$_pre_VITE_OPENAPI_URL"
[ -z "${CONTRACT_REPO:-}" ]                && [ -n "$_pre_CONTRACT_REPO" ]                && export CONTRACT_REPO="$_pre_CONTRACT_REPO"
[ -z "${CONTRACT_VERSION:-}" ]             && [ -n "$_pre_CONTRACT_VERSION" ]             && export CONTRACT_VERSION="$_pre_CONTRACT_VERSION"
[ -z "${VITE_MSW_ENABLED:-}" ]             && [ -n "$_pre_VITE_MSW_ENABLED" ]             && export VITE_MSW_ENABLED="$_pre_VITE_MSW_ENABLED"
[ -z "${GITHUB_PERSONAL_ACCESS_TOKEN:-}" ] && [ -n "$_pre_GITHUB_PERSONAL_ACCESS_TOKEN" ] && export GITHUB_PERSONAL_ACCESS_TOKEN="$_pre_GITHUB_PERSONAL_ACCESS_TOKEN"
[ -z "${CONTEXT7_API_KEY:-}" ]             && [ -n "$_pre_CONTEXT7_API_KEY" ]             && export CONTEXT7_API_KEY="$_pre_CONTEXT7_API_KEY"

# gh reads GH_TOKEN / GITHUB_TOKEN — not GITHUB_PERSONAL_ACCESS_TOKEN. Mirror it
# so the same .env value authenticates gh too. (Prefer `gh auth login` if you
# want gh creds in the OS keychain instead — then leave GH_TOKEN unset.)
if [ -n "${GITHUB_PERSONAL_ACCESS_TOKEN:-}" ] && [ -z "${GH_TOKEN:-}" ] && [ -z "${GITHUB_TOKEN:-}" ]; then
  export GH_TOKEN="$GITHUB_PERSONAL_ACCESS_TOKEN"
fi

exec claude "$@"
