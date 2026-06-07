#!/usr/bin/env bash
# check_contract_sync.sh — verify vendored contract matches the pinned tag
# Reads CONTRACT_REPO + CONTRACT_VERSION from .env or .env.example if not already in env.
set -euo pipefail

LOCK_FILE="contract.lock.json"
VENDOR_FILE="src/lib/api/openapi.yml"
TMPDIR_LOCAL=$(mktemp -d)
REMOTE_TMP="$TMPDIR_LOCAL/remote-contract.yml"

cleanup() { rm -rf "$TMPDIR_LOCAL"; }
trap cleanup EXIT

# Load from .env or .env.example (first found wins)
for envfile in .env .env.example; do
  if [ -f "$envfile" ]; then
    # shellcheck disable=SC2046
    export $(grep -E '^(CONTRACT_REPO|CONTRACT_VERSION)=' "$envfile" | xargs) 2>/dev/null || true
    break
  fi
done

REPO="${CONTRACT_REPO:-VadayI/claude-api-contract}"
VERSION="${CONTRACT_VERSION:-}"

if [ -z "$VERSION" ]; then
  echo "[sync] ERROR: CONTRACT_VERSION is not set (check .env or environment)."
  exit 1
fi

if [ ! -f "$LOCK_FILE" ]; then
  echo "[sync] ERROR: $LOCK_FILE not found — run 'npm run api:pull' first."
  exit 1
fi

if [ ! -f "$VENDOR_FILE" ]; then
  echo "[sync] ERROR: $VENDOR_FILE not found — run 'npm run api:pull' first."
  exit 1
fi

# Fetch the remote contract to a temp file (preserves exact bytes)
REMOTE_URL="https://raw.githubusercontent.com/${REPO}/${VERSION}/openapi.yml"
echo "[sync] Fetching contract from $REMOTE_URL"
curl -fsSL "$REMOTE_URL" -o "$REMOTE_TMP"

# Compute sha256 from files (not shell-captured strings, which strip trailing newlines)
REMOTE_SHA=$(sha256sum "$REMOTE_TMP" | awk '{print $1}')
VENDOR_SHA=$(sha256sum "$VENDOR_FILE" | awk '{print $1}')
LOCK_SHA=$(node -e "const l=JSON.parse(require('fs').readFileSync('$LOCK_FILE','utf8')); process.stdout.write(l.sha256 ?? '')")

echo "[sync] Remote sha256: $REMOTE_SHA"
echo "[sync] Vendor sha256: $VENDOR_SHA"
echo "[sync] Lock   sha256: $LOCK_SHA"

if [ "$REMOTE_SHA" != "$VENDOR_SHA" ]; then
  echo "[sync] FAIL: vendored $VENDOR_FILE does not match contract@${VERSION}."
  echo "[sync] Run 'npm run api:pull' to update."
  exit 1
fi

if [ "$REMOTE_SHA" != "$LOCK_SHA" ]; then
  echo "[sync] FAIL: $LOCK_FILE sha256 does not match contract@${VERSION}."
  echo "[sync] Run 'npm run api:pull' and update $LOCK_FILE."
  exit 1
fi

echo "[sync] OK — vendored contract matches ${REPO}@${VERSION}."
