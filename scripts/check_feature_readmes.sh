#!/usr/bin/env bash
# scripts/check_feature_readmes.sh
#
# Gate: every directory directly under src/features/ must contain a
# non-empty README.md.
#
# Rationale: each feature is self-explanatory at the README level — what it
# owns, its public surface (components, hooks, exports), and cross-feature
# dependencies. No feature ships without a one-page primer.
#
# If src/features/ does not exist yet (project not yet scaffolded), prints
# an informational note and exits 0 (not an error at project bootstrap).
#
# Exits 1 if any feature directory is missing its README.md, else exits 0.

set -uo pipefail

FEATURES_DIR="src/features"
FAIL=0

if [[ ! -d "$FEATURES_DIR" ]]; then
  echo "[check_feature_readmes] NOTE — $FEATURES_DIR does not exist yet (not scaffolded)."
  echo "  When you create features, each must have a README.md."
  exit 0
fi

MISSING=()

# Iterate over direct subdirectories only (not recursive)
while IFS= read -r -d '' feature_dir; do
  # Must be a directory
  [[ ! -d "$feature_dir" ]] && continue

  readme="$feature_dir/README.md"

  if [[ ! -f "$readme" ]]; then
    MISSING+=("$feature_dir (missing README.md)")
    FAIL=1
  elif [[ ! -s "$readme" ]]; then
    MISSING+=("$feature_dir (README.md is empty)")
    FAIL=1
  fi
done < <(find "$FEATURES_DIR" -maxdepth 1 -mindepth 1 -type d -print0)

if (( FAIL == 1 )); then
  echo "[check_feature_readmes] FAIL — the following features are missing a README.md:"
  for entry in "${MISSING[@]}"; do
    echo "  MISSING: $entry"
  done
  echo ""
  echo "  Each feature directory under $FEATURES_DIR/ must have a non-empty README.md."
  echo "  Required sections: Purpose, Components/Hooks, Public exports, Cross-feature deps."
  exit 1
fi

# Count how many features were checked
count=0
while IFS= read -r -d '' _; do (( count++ )) || true; done < <(find "$FEATURES_DIR" -maxdepth 1 -mindepth 1 -type d -print0)

if (( count == 0 )); then
  echo "[check_feature_readmes] OK — no feature directories found in $FEATURES_DIR/ (nothing to check)."
else
  echo "[check_feature_readmes] OK — all $count feature(s) have a README.md."
fi
exit 0
