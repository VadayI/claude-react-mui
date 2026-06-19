#!/usr/bin/env bash
# scripts/check_file_size.sh
#
# Gate: no TypeScript/TSX source file under src/ may exceed MAX_LINES lines.
#
# Excludes:
#   - src/lib/api/schema.d.ts   (generated API types)
#   - any *.d.ts file           (all generated type declarations)
#   - node_modules/             (dependencies)
#
# MAX_LINES defaults to 400; override via environment:
#   MAX_LINES=600 bash scripts/check_file_size.sh
#
# Exits 1 if any file exceeds the limit, 0 if all are within bounds.

set -uo pipefail

MAX_LINES="${MAX_LINES:-400}"
SRC_DIR="src"
FAIL=0

if [[ ! -d "$SRC_DIR" ]]; then
  echo "[check_file_size] src/ does not exist — nothing to check."
  exit 0
fi

# Collect oversized files
OVERSIZED=()

while IFS= read -r -d '' file; do
  # Skip generated declaration files
  [[ "$file" == *.d.ts ]]                          && continue
  [[ "$file" == */node_modules/* ]]                && continue

  lines=$(wc -l < "$file")
  if (( lines > MAX_LINES )); then
    OVERSIZED+=("$file ($lines lines)")
    FAIL=1
  fi
done < <(find "$SRC_DIR" \
  -not -path '*/node_modules/*' \
  \( -name '*.ts' -o -name '*.tsx' \) \
  -print0)

if (( FAIL == 1 )); then
  echo "[check_file_size] FAIL — the following files exceed $MAX_LINES lines:"
  for entry in "${OVERSIZED[@]}"; do
    echo "  OVER: $entry"
  done
  echo ""
  echo "  Files over the limit carry more than one responsibility."
  echo "  Split into smaller modules grouped under a folder with an index re-export."
  exit 1
fi

echo "[check_file_size] OK — all source files are within $MAX_LINES lines."
exit 0
