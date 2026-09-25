#!/usr/bin/env bash
# check_routes_registry.sh — routes/verify reconciliation gate (@.claude/rules/verification.md)
#
# On a PR: if src/app/router.tsx changes, the routes registry (docs/project-state/routes.json,
# legacy .claude/memory/routes.json until migrated) AND a
# docs/verify/*.md must be updated in the same PR (the registry + manual
# verification handoff must track the live router). Enforces on pull_request.
set -uo pipefail

if [ "${GITHUB_EVENT_NAME:-}" = "push" ]; then
  echo "[check_routes_registry] NOTE — push event; enforcement runs on pull_request. Skipping."; exit 0
fi
# Registry path through the single resolver (docs/project-state/ or legacy .claude/memory/;
# two differing copies = FAIL). Python 3.13+ (AI_PYTHON) is a template-tooling prerequisite.
AI_PY="${AI_PYTHON:-python}"
if ! REGISTRY="$("$AI_PY" scripts/ai/project_state.py --root . --resolve routes.json 2>&1)"; then
  echo "[check_routes_registry] FAIL — NOT_VERIFIED: cannot resolve the routes registry ($REGISTRY)."; exit 1
fi
# routes.json must be valid JSON when present.
if [ -f "$REGISTRY" ]; then
  if command -v node >/dev/null 2>&1; then
    node -e "JSON.parse(require('fs').readFileSync(process.argv[1],'utf8'))" "$REGISTRY" 2>/dev/null \
      || { echo "[check_routes_registry] FAIL — $REGISTRY is not valid JSON."; exit 1; }
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
printf '%s\n' "$CHANGED" | grep -Eq '^(docs/project-state|\.claude/memory)/routes\.json$' || { echo "  MISSING: $REGISTRY not updated"; MISS=1; }
printf '%s\n' "$CHANGED" | grep -Eq '^docs/verify/.*\.md$'            || { echo "  MISSING: no docs/verify/*.md updated"; MISS=1; }
if [ "$MISS" -eq 1 ]; then
  echo "[check_routes_registry] FAIL — router changed without reconciling the registry/verification."
  echo "  Update $REGISTRY and docs/verify/<feature>.md (@.claude/rules/verification.md)."
  exit 1
fi
echo "[check_routes_registry] OK — router change reconciled with routes.json + docs/verify."
exit 0
