#!/usr/bin/env bash
# Claude SessionStart (Bash entry point): run only the explicit environment
# detectors via scripts/session-start.mjs — shared detector (.ai-runtime/environment.json)
# and the React stack probe (.ai-runtime/env-detect.json).
# No Git lock removal, .env creation, package install, format, push, or merge.
set -uo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
if ! command -v node >/dev/null 2>&1; then
  echo '[session-start] NOT_VERIFIED: Node is unavailable for detect-env.mjs.' >&2
  exit 1
fi
node "$SCRIPT_DIR/session-start.mjs"
