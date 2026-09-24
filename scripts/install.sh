#!/usr/bin/env bash
# Seed or update the complete Claude/Codex payload with ownership preflight.
# Usage: bash scripts/install.sh [TARGET_DIR] --ci-mode local|github [--ref REF] [--url URL] [--dry-run]
# Python 3.13+ and Git required. Native Windows: explicit Git for Windows Bash.
# No app generation, env copies, Git writes or dependency installs.
set -euo pipefail
UPSTREAM_URL="${CLAUDE_REACT_MUI_URL:-https://github.com/VadayI/claude-react-mui.git}"
TARGET="."
REF=""
APPLY=1
CI_MODE=""
while [ "$#" -gt 0 ]; do
  case "$1" in
    --ref|--url|--ci-mode)
      [ "$#" -ge 2 ] && [ -n "$2" ] || { echo "$1 needs a value" >&2; exit 2; }
      if [ "$1" = --ref ]; then REF="$2"; elif [ "$1" = --url ]; then UPSTREAM_URL="$2"; else CI_MODE="$2"; fi
      shift 2 ;;
    --dry-run) APPLY=0; shift ;;
    --force) echo "--force is deprecated; ownership conflicts still block all writes." >&2; shift ;;
    -h|--help) sed -n '2,5p' "$0"; exit 0 ;;
    -*) echo "Unknown option: $1" >&2; exit 2 ;;
    *) TARGET="$1"; shift ;;
  esac
done
if [ -n "$CI_MODE" ] && [ "$CI_MODE" != local ] && [ "$CI_MODE" != github ]; then
  echo "--ci-mode must be local or github" >&2; exit 2
fi
command -v git >/dev/null || { echo "Git required" >&2; exit 2; }
PYTHON="${PYTHON:-python}"
"$PYTHON" -c 'import sys; sys.exit(0 if sys.version_info >= (3, 13) else 2)' || {
  echo "Python 3.13+ required; set PYTHON to its executable." >&2; exit 2;
}
# The shell owns only this new temporary clone. The Python installer validates
# source/destination paths before creating the target or writing any payload.
CLONE="$(mktemp -d)"
cleanup() { rm -rf -- "$CLONE"; }
trap cleanup EXIT
if [ -n "$REF" ]; then
  git clone --quiet --depth 1 --branch "$REF" "$UPSTREAM_URL" "$CLONE"
else
  git clone --quiet --depth 1 "$UPSTREAM_URL" "$CLONE"
fi
"$PYTHON" "$CLONE/scripts/ai/generate.py" --check
CI_ARGS=()
if [ -n "$CI_MODE" ]; then CI_ARGS=(--ci-mode "$CI_MODE"); fi
if [ "$APPLY" -eq 1 ]; then
  "$PYTHON" "$CLONE/scripts/ai/install.py" --target "$TARGET" "${CI_ARGS[@]}" --apply
else
  "$PYTHON" "$CLONE/scripts/ai/install.py" --target "$TARGET" "${CI_ARGS[@]}"
fi
printf '%s\n' "Payload verified. Read docs/ai/workflows/bootstrap.md with Claude /bootstrap or Codex bootstrap skill."
printf '%s\n' "The selected CI workflow is ready for review before the first push."
