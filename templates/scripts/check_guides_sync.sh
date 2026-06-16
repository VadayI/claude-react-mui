#!/usr/bin/env bash
# check_guides_sync.sh — user/developer guides gate (@.claude/rules/user-guides.md)
#
# On a PR: if a top-level route (src/app/router.tsx) or the auth flow
# (src/lib/auth/**) changes, docs/guides/{user,developer}.md must be updated in
# the same PR. (Env-var/script changes should also update the developer guide —
# advisory, not gated here.) Enforces on pull_request.
set -uo pipefail

if [ "${GITHUB_EVENT_NAME:-}" = "push" ]; then
  echo "[check_guides_sync] NOTE — push event; enforcement runs on pull_request. Skipping."; exit 0
fi
BASE="${GATE_BASE:-}"
if [ -z "$BASE" ]; then
  if git rev-parse --verify -q origin/main >/dev/null 2>&1; then BASE="origin/main"
  elif git rev-parse --verify -q HEAD~1 >/dev/null 2>&1; then BASE="HEAD~1"
  else echo "[check_guides_sync] NOTE — no base ref to diff; skipping."; exit 0; fi
fi
CHANGED="$(git diff --name-only "$BASE"...HEAD 2>/dev/null || git diff --name-only "$BASE" HEAD 2>/dev/null || true)"
[ -z "$CHANGED" ] && { echo "[check_guides_sync] OK — no changes vs $BASE."; exit 0; }

if ! printf '%s\n' "$CHANGED" | grep -Eq '^(src/app/router\.tsx$|src/lib/auth/)'; then
  echo "[check_guides_sync] OK — no top-level route / auth-flow change."; exit 0
fi
if printf '%s\n' "$CHANGED" | grep -Eq '^docs/guides/.*\.md$'; then
  echo "[check_guides_sync] OK — guides updated alongside route/auth change."; exit 0
fi
echo "[check_guides_sync] FAIL — top-level route or auth flow changed without updating docs/guides/."
echo "  Update docs/guides/user.md and/or docs/guides/developer.md (@.claude/rules/user-guides.md)."
exit 1
