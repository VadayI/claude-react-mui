#!/usr/bin/env bash
# check_routes_registry.sh — routes/verify reconciliation gate (@.claude/rules/verification.md)
#
# On a PR: if src/app/router.tsx changes, .claude/memory/routes.json AND a
# docs/verify/*.md must be updated in the same PR (the registry + manual
# verification handoff must track the live router). Enforces on pull_request.
set -uo pipefail

if [ "${GITHUB_EVENT_NAME:-}" = "push" ]; then
  echo "[check_routes_registry] NOTE — push event; enforcement runs on pull_request. Skipping."; exit 0
fi
# routes.json must be valid JSON when present.
if [ -f .claude/memory/routes.json ]; then
  if command -v node >/dev/null 2>&1; then
    node -e "JSON.parse(require('fs').readFileSync('.claude/memory/routes.json','utf8'))" 2>/dev/null \
      || { echo "[check_routes_registry] FAIL — .claude/memory/routes.json is not valid JSON."; exit 1; }
  fi
fi
BASE="${GATE_BASE:-}"
if [ -z "$BASE" ]; then
  if git rev-parse --verify -q origin/main >/dev/null 2>&1; then BASE="origin/main"
  elif git rev-parse --verify -q HEAD~1 >/dev/null 2>&1; then BASE="HEAD~1"
  else echo "[check_routes_registry] NOTE — no base ref to diff; skipping."; exit 0; fi
fi
CHANGED="$(git diff --name-only "$BASE"...HEAD 2>/dev/null || git diff --name-only "$BASE" HEAD 2>/dev/null || true)"
[ -z "$CHANGED" ] && { echo "[check_routes_registry] OK — no changes vs $BASE."; exit 0; }

if ! printf '%s\n' "$CHANGED" | grep -Eq '^src/app/router\.tsx$'; then
  echo "[check_routes_registry] OK — src/app/router.tsx not changed."; exit 0
fi
MISS=0
printf '%s\n' "$CHANGED" | grep -Eq '^\.claude/memory/routes\.json$' || { echo "  MISSING: .claude/memory/routes.json not updated"; MISS=1; }
printf '%s\n' "$CHANGED" | grep -Eq '^docs/verify/.*\.md$'            || { echo "  MISSING: no docs/verify/*.md updated"; MISS=1; }
if [ "$MISS" -eq 1 ]; then
  echo "[check_routes_registry] FAIL — router changed without reconciling the registry/verification."
  echo "  Update .claude/memory/routes.json and docs/verify/<feature>.md (@.claude/rules/verification.md)."
  exit 1
fi
echo "[check_routes_registry] OK — router change reconciled with routes.json + docs/verify."
exit 0
