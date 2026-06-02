#!/usr/bin/env bash
# scripts/session-start.sh
#
# SessionStart hook entrypoint — run automatically when Claude Code starts a session.
#
# Order of operations:
#   1. Clear a stale empty .git/index.lock if the project is on a /mnt path (WSL2 safety).
#   2. MANDATORY: run detect-env.mjs to write .claude/memory/env-detect.json.
#   3. SAFE: seed .env from .env.example if .env is missing.
#   4. OPT-IN: npm install if CLAUDE_REACT_AUTO_INSTALL=1 and node_modules is absent.
#
# This script uses set -uo pipefail but wraps every step so a failure in one
# step never aborts the session (Claude Code must always start successfully).
# Never prints secrets.

set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# ---------------------------------------------------------------------------
# Step 1 — Clear stale empty .git/index.lock on /mnt paths (WSL2 quirk)
# ---------------------------------------------------------------------------
(
  LOCK_FILE="$PROJECT_ROOT/.git/index.lock"
  if [[ "$PROJECT_ROOT" == /mnt/* ]] && [[ -f "$LOCK_FILE" ]]; then
    # Only remove if file is empty (a real lock has content)
    if [[ ! -s "$LOCK_FILE" ]]; then
      rm -f "$LOCK_FILE" && echo "[session-start] Removed stale empty .git/index.lock"
    fi
  fi
) || true

# ---------------------------------------------------------------------------
# Step 2 — MANDATORY: write .claude/memory/env-detect.json via detect-env.mjs
# ---------------------------------------------------------------------------
(
  if command -v node >/dev/null 2>&1; then
    node "$SCRIPT_DIR/detect-env.mjs"
  else
    echo "[session-start] ERROR: 'node' not found on PATH."
    echo "[session-start] Node 18+ is required for this project."
    echo "[session-start] Install Node via nvm: run scripts/setup-wsl.sh or visit https://nodejs.org"
    echo "[session-start] env-detect.json was NOT written — /doctor will report missing env data."
  fi
) || echo "[session-start] WARNING: detect-env.mjs failed (non-fatal)"

# ---------------------------------------------------------------------------
# Step 3 — SAFE: seed .env from .env.example if .env is missing
# ---------------------------------------------------------------------------
(
  ENV_FILE="$PROJECT_ROOT/.env"
  EXAMPLE_FILE="$PROJECT_ROOT/.env.example"
  if [[ ! -f "$ENV_FILE" ]] && [[ -f "$EXAMPLE_FILE" ]]; then
    cp "$EXAMPLE_FILE" "$ENV_FILE"
    echo "[session-start] .env seeded from .env.example — fill in real values before running."
  fi
) || true

# ---------------------------------------------------------------------------
# Step 4 — OPT-IN: npm install (only if CLAUDE_REACT_AUTO_INSTALL=1)
# ---------------------------------------------------------------------------
(
  AUTO_INSTALL="${CLAUDE_REACT_AUTO_INSTALL:-0}"
  if [[ "$AUTO_INSTALL" == "1" ]]; then
    if [[ ! -d "$PROJECT_ROOT/node_modules" ]]; then
      echo "[session-start] node_modules missing — running npm install (CLAUDE_REACT_AUTO_INSTALL=1)"
      cd "$PROJECT_ROOT" && npm install
    fi
  fi
) || echo "[session-start] WARNING: npm install step failed (non-fatal)"

echo "[session-start] Done."
