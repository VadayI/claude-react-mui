#!/usr/bin/env bash
# Claude SessionStart: run only the explicit environment detector.
# No Git lock removal, .env creation, package install, format, push, or merge.
set -uo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
if ! command -v node >/dev/null 2>&1; then
  echo '[session-start] NOT_VERIFIED: Node is unavailable for detect-env.mjs.' >&2
  exit 1
fi
node "$SCRIPT_DIR/detect-env.mjs"
