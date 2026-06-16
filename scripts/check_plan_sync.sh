#!/usr/bin/env bash
# check_plan_sync.sh — living-plan gate (@.claude/rules/living-plan.md)
#
# On a PR: if the change is non-trivial (>2 files under src/ or e2e/), an active
# living plan under docs/plans/*.md must be touched in the same PR (its Status
# table / Execution log / Amendments kept current). Trivial changes (<=2 files)
# need no plan. Enforces on pull_request; skips on direct push (post-merge).
set -uo pipefail

if [ "${GITHUB_EVENT_NAME:-}" = "push" ]; then
  echo "[check_plan_sync] NOTE — push event; enforcement runs on pull_request. Skipping."; exit 0
fi
BASE="${GATE_BASE:-}"
if [ -z "$BASE" ]; then
  if git rev-parse --verify -q origin/main >/dev/null 2>&1; then BASE="origin/main"
  elif git rev-parse --verify -q HEAD~1 >/dev/null 2>&1; then BASE="HEAD~1"
  else echo "[check_plan_sync] NOTE — no base ref to diff; skipping."; exit 0; fi
fi
CHANGED="$(git diff --name-only "$BASE"...HEAD 2>/dev/null || git diff --name-only "$BASE" HEAD 2>/dev/null || true)"
[ -z "$CHANGED" ] && { echo "[check_plan_sync] OK — no changes vs $BASE."; exit 0; }

SRC_N=$(printf '%s\n' "$CHANGED" | grep -Ec '^(src/|e2e/)' || true)
if [ "${SRC_N:-0}" -le 2 ]; then
  echo "[check_plan_sync] OK — ${SRC_N:-0} src/e2e file(s) changed (<=2: trivial, no plan required)."; exit 0
fi
if printf '%s\n' "$CHANGED" | grep -Eq '^docs/plans/.*\.md$'; then
  echo "[check_plan_sync] OK — non-trivial change ($SRC_N files) and a docs/plans/*.md is updated."; exit 0
fi
echo "[check_plan_sync] FAIL — $SRC_N src/e2e files changed but no docs/plans/*.md updated."
echo "  Non-trivial work needs a living plan (@.claude/rules/living-plan.md):"
echo "  seed docs/plans/NNNN-<slug>.md and keep its Status table + Execution log current."
exit 1
