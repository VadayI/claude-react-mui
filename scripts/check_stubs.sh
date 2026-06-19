#!/usr/bin/env bash
# scripts/check_stubs.sh
#
# Gate: every "// STUB:" comment or throw new Error("STUB...") in src/ must
# be recorded in docs/STUBS.md.
#
# Philosophy (mirrors the Django framework):
#   - Stubs are a visible, temporary TDD tool.
#   - Every stub in production source must have a ledger entry.
#   - Unlogged stubs do not merge.
#
# Excluded file patterns (test/mock/story files — stubs there are fine):
#   *.test.ts   *.test.tsx   *.test.js
#   *.spec.ts   *.spec.tsx   *.spec.js
#   src/test/**
#   src/mocks/**
#   *.stories.ts  *.stories.tsx
#
# Exits 1 if any unlogged stub is found, 0 otherwise.

set -uo pipefail

SRC_DIR="src"
STUBS_DOC="docs/STUBS.md"
FAIL=0

if [[ ! -d "$SRC_DIR" ]]; then
  echo "[check_stubs] src/ does not exist — nothing to check."
  exit 0
fi

# Build grep exclude patterns for find
# We use find to filter files, then grep for the stub marker.
GREP_PATTERN='(// STUB:|throw new Error\("STUB)'

UNLOGGED=()

while IFS= read -r -d '' file; do
  # Skip test / mock / story files
  base="$(basename "$file")"
  [[ "$base" == *.test.ts   ]] && continue
  [[ "$base" == *.test.tsx  ]] && continue
  [[ "$base" == *.test.js   ]] && continue
  [[ "$base" == *.spec.ts   ]] && continue
  [[ "$base" == *.spec.tsx  ]] && continue
  [[ "$base" == *.spec.js   ]] && continue
  [[ "$base" == *.stories.ts  ]] && continue
  [[ "$base" == *.stories.tsx ]] && continue
  [[ "$file" == */src/test/*  ]] && continue
  [[ "$file" == */src/mocks/* ]] && continue

  # grep for stub markers in this file
  matches="$(grep -nE "$GREP_PATTERN" "$file" 2>/dev/null || true)"
  [[ -z "$matches" ]] && continue

  # For each matching line, check that the file path appears in STUBS.md
  rel_path="${file#./}"   # strip leading ./
  if [[ ! -f "$STUBS_DOC" ]] || ! grep -qF "$rel_path" "$STUBS_DOC" 2>/dev/null; then
    while IFS= read -r match_line; do
      UNLOGGED+=("$rel_path: $match_line")
    done <<< "$matches"
    FAIL=1
  fi
done < <(find "$SRC_DIR" \
  -not -path '*/node_modules/*' \
  -not -path '*/src/test/*' \
  -not -path '*/src/mocks/*' \
  \( -name '*.ts' -o -name '*.tsx' -o -name '*.js' \) \
  -print0)

if (( FAIL == 1 )); then
  echo "[check_stubs] FAIL — unlogged stubs found (add entries to $STUBS_DOC):"
  for entry in "${UNLOGGED[@]}"; do
    echo "  UNLOGGED: $entry"
  done
  echo ""
  echo "  Each stub must appear in $STUBS_DOC:"
  echo "  | File:line | Reason | Test that forces real impl | Owner | Date |"
  exit 1
fi

echo "[check_stubs] OK — no unlogged stubs found."
exit 0
