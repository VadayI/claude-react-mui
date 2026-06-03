#!/usr/bin/env bash
# templates/scripts/check_types_drift.sh
#
# Gate (analog of the Django framework's OpenAPI drift gate):
# Regenerate API TypeScript types from the committed OpenAPI schema and fail
# if they differ from the committed generated file.
#
# Required files:
#   src/lib/api/openapi.yml    — the committed OpenAPI contract
#   src/lib/api/schema.d.ts   — the committed generated types
#
# How to fix a drift failure:
#   npm run api:types   (or: npx openapi-typescript src/lib/api/openapi.yml -o src/lib/api/schema.d.ts)
#   git add src/lib/api/schema.d.ts && git commit -m "chore: regenerate API types"
#
# Exits 0 if types are in sync (or if the schema is not yet wired).
# Exits 1 if types have drifted or if the tooling is unavailable.

set -uo pipefail

SCHEMA_FILE="src/lib/api/openapi.yml"
GENERATED_FILE="src/lib/api/schema.d.ts"
TMP_FILE="/tmp/schema.gen.d.ts"

# ---------------------------------------------------------------------------
# Skip: schema not wired yet
# ---------------------------------------------------------------------------
if [[ ! -f "$SCHEMA_FILE" ]]; then
  echo "[check_types_drift] SKIP — $SCHEMA_FILE not found (API contract not wired yet)."
  echo "  When you add your OpenAPI schema, wire it via: npm run api:types"
  exit 0
fi

# ---------------------------------------------------------------------------
# Guard: npx must be available
# ---------------------------------------------------------------------------
if ! command -v npx >/dev/null 2>&1; then
  echo "[check_types_drift] FAIL — npx not found on PATH."
  echo "  Install Node 20.19+ (includes npx): scripts/setup-wsl.sh"
  exit 1
fi

# ---------------------------------------------------------------------------
# Guard: openapi-typescript must be resolvable by npx
# ---------------------------------------------------------------------------
if ! npx --yes openapi-typescript --version >/dev/null 2>&1; then
  echo "[check_types_drift] FAIL — openapi-typescript is not available via npx."
  echo "  Install it: npm install -D openapi-typescript"
  echo "  Then add a script to package.json:  \"api:types\": \"openapi-typescript src/lib/api/openapi.yml -o src/lib/api/schema.d.ts\""
  exit 1
fi

# ---------------------------------------------------------------------------
# Regenerate types to a temp file
# ---------------------------------------------------------------------------
if ! npx --yes openapi-typescript "$SCHEMA_FILE" -o "$TMP_FILE" --quiet 2>/dev/null; then
  echo "[check_types_drift] FAIL — openapi-typescript could not parse $SCHEMA_FILE."
  echo "  Verify the schema is valid OpenAPI 3.x YAML."
  exit 1
fi

# ---------------------------------------------------------------------------
# Guard: committed file must exist to diff against
# ---------------------------------------------------------------------------
if [[ ! -f "$GENERATED_FILE" ]]; then
  echo "[check_types_drift] FAIL — $GENERATED_FILE not found."
  echo "  Generate it first: npm run api:types"
  echo "  Then commit: git add $GENERATED_FILE"
  exit 1
fi

# ---------------------------------------------------------------------------
# Diff
# ---------------------------------------------------------------------------
if ! diff -u "$GENERATED_FILE" "$TMP_FILE" > /dev/null 2>&1; then
  echo "[check_types_drift] FAIL — API types have drifted from the schema."
  echo ""
  diff -u "$GENERATED_FILE" "$TMP_FILE" || true
  echo ""
  echo "  Regenerate and commit:"
  echo "    npm run api:types"
  echo "    git add $GENERATED_FILE && git commit -m 'chore: regenerate API types'"
  exit 1
fi

echo "[check_types_drift] OK — $GENERATED_FILE is in sync with $SCHEMA_FILE."
exit 0
