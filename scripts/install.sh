#!/usr/bin/env bash
# install.sh -- one-line seed of the claude-react-mui config into a project folder.
#
# Collapses the multi-step "Quick start" copy block into a single command: clones
# the template to a temp dir and copies the config + scaffolding inputs into the
# target folder, then wipes transient state the SessionStart hook regenerates.
#
# After it finishes you still: launch `claude` from the folder (WSL2-native, or native Windows) and
# run /doctor -> /bootstrap. This script ONLY seeds files; it never runs git,
# never pushes, never touches secrets, never runs npm.
#
# SUPPORTED: native Debian/Ubuntu/macOS bash, WSL2 Ubuntu, and native Windows via
# Git Bash (Git for Windows) -- the single bash dialect per ADR 0028 (amends 0005).
# Windows PowerShell/cmd are NOT supported.
#
# Usage (in a bash shell -- WSL2, Linux, macOS, or Git Bash on Windows -- from your project root):
#   bash <(curl -fsSL https://raw.githubusercontent.com/VadayI/claude-react-mui/main/scripts/install.sh)
# or, if you already have the file:
#   bash scripts/install.sh [TARGET_DIR] [--ref GIT_REF] [--url REPO_URL] [--force]
#
# Options:
#   TARGET_DIR     where to seed the config (default: current dir).
#   --ref GIT_REF  branch/tag to clone (default: the upstream default branch).
#   --url URL      clone from a fork instead of the canonical upstream.
#   --force        overwrite an already-seeded folder (.claude/ present).
#                  For upgrading an existing project prefer /update-from-template,
#                  which preserves project-owned files.
#
# Env override: CLAUDE_REACT_MUI_URL takes precedence over the built-in default URL.
set -euo pipefail

UPSTREAM_URL="${CLAUDE_REACT_MUI_URL:-https://github.com/VadayI/claude-react-mui.git}"
REF=""
TARGET="."
FORCE=0

log()  { printf '\033[1;34m==>\033[0m %s\n' "$*"; }
ok()   { printf '\033[1;32m  ok\033[0m %s\n' "$*"; }
warn() { printf '\033[1;33m  !!\033[0m %s\n' "$*" >&2; }
die()  { printf '\033[1;31mFATAL\033[0m %s\n' "$*" >&2; exit 1; }
have() { command -v "$1" >/dev/null 2>&1; }

# --- 0. Parse args ------------------------------------------------------------
while [ $# -gt 0 ]; do
  case "$1" in
    --ref)   REF="${2:-}"; [ -n "$REF" ] || die "--ref needs a value"; shift 2 ;;
    --url)   UPSTREAM_URL="${2:-}"; [ -n "$UPSTREAM_URL" ] || die "--url needs a value"; shift 2 ;;
    --force) FORCE=1; shift ;;
    -h|--help) sed -n '2,30p' "$0" 2>/dev/null || true; exit 0 ;;
    -*)      die "unknown option: $1" ;;
    *)       TARGET="$1"; shift ;;
  esac
done

# --- 1. Platform + tool guards ------------------------------------------------
case "$(uname -s)" in
  Linux)               grep -qiE 'microsoft|wsl' /proc/version 2>/dev/null && ok "running inside WSL2" || warn "not WSL2 -- assuming native Linux. Continuing." ;;
  Darwin)              ok "running on macOS (native bash)" ;;
  MINGW*|MSYS*|CYGWIN*) ok "running on native Windows via Git Bash (ADR 0028)" ;;
  *)                   die "Unsupported platform '$(uname -s)'. On Windows use Git Bash (Git for Windows) or WSL2 (ADR 0028/0005)." ;;
esac
have git || die "git not found. Install it first (WSL2: sudo apt install -y git)."

# --- 2. Resolve + guard the target -------------------------------------------
mkdir -p "$TARGET"
TARGET="$(cd "$TARGET" && pwd)"
log "Seeding claude-react-mui config into: $TARGET"

if [ -e "$TARGET/.claude" ] && [ "$FORCE" -ne 1 ]; then
  die "$TARGET already has .claude/ (looks seeded). Re-run with --force to overwrite, or use /update-from-template to upgrade an existing project (preserves your edits)."
fi

# --- 3. Clone the template to a temp dir (cleaned on exit) --------------------
CLONE="$(mktemp -d)"
cleanup() { rm -rf "$CLONE"; }
trap cleanup EXIT

log "Cloning $UPSTREAM_URL${REF:+ @ $REF}"
if [ -n "$REF" ]; then
  git clone --quiet --depth 1 --branch "$REF" "$UPSTREAM_URL" "$CLONE" \
    || die "clone failed (bad --ref '$REF' or URL?)"
else
  git clone --quiet --depth 1 "$UPSTREAM_URL" "$CLONE" \
    || die "clone failed (check the URL / your network)."
fi
ok "cloned"

# --- 4. Copy the config + scaffolding inputs ----------------------------------
# Mirrors the README "Quick start" copy block, kept in lockstep with it. This
# seeds ONLY the Claude config + the /bootstrap inputs -- the actual Vite+MUI app
# (src/, package.json, vite.config.ts, ...) is scaffolded by /bootstrap Mode A
# from templates/, not copied here.
log "Copying config files"
cp -r "$CLONE/.claude"        "$TARGET/"
cp    "$CLONE/CLAUDE.md"      "$TARGET/"
cp    "$CLONE/.mcp.json"      "$TARGET/"
cp    "$CLONE/.gitignore"     "$TARGET/"
cp    "$CLONE/.gitattributes" "$TARGET/"
cp -r "$CLONE/scripts"        "$TARGET/"   # detect-env.mjs (SessionStart hook) -- REQUIRED, hook fails silently without it
cp -r "$CLONE/templates"      "$TARGET/"   # FULL templates/ -- /bootstrap Mode A needs all of it
cp    "$CLONE/templates/Makefile" "$TARGET/"   # make help/setup/test/gates/...
mkdir -p "$TARGET/.github/workflows"
cp "$CLONE"/templates/.github/workflows/* "$TARGET/.github/workflows/"
ok "copied"

# --- 4b. Seed a gitignored .env head-start (one home for your secrets) --------
# install.sh seeds ONLY the config; .env is gitignored, so we give the project a
# .env now (from templates/.env.example) for you to drop your PAT / Context7 key
# into. /bootstrap Mode A later regenerates .env.example per your contract choice.
if [ ! -f "$TARGET/.env" ]; then
  cp "$CLONE/templates/.env.example" "$TARGET/.env"
  ok "seeded .env from templates/.env.example (gitignored — put your PAT here)"
else
  ok ".env already present — left untouched"
fi

# --- 5. Wipe transient state (regenerated by the SessionStart hook) ----------
rm -f "$TARGET/.claude/memory/env-detect.json" "$TARGET/.claude/memory/command-log.jsonl"
ok "wiped transient memory"

# --- 6. Runner check + next steps ---------------------------------------------
echo
claude_path="$(command -v claude || true)"
case "$(uname -s)" in
  MINGW*|MSYS*|CYGWIN*)
    case "$claude_path" in
      "") warn "\`claude\` not on PATH yet. Install Git for Windows + the CLI: winget install Anthropic.ClaudeCode (or npm i -g @anthropic-ai/claude-code)." ;;
      *)  ok "\`claude\` resolves to: $claude_path (native Windows)" ;;
    esac ;;
  *)
    case "$claude_path" in
      /mnt/c/*|*.exe) warn "\`claude\` resolves to the Windows binary ($claude_path) inside a Unix shell. Use the WSL2-native CLI (bash scripts/setup-wsl.sh), or run natively on Windows from Git Bash." ;;
      "")             warn "\`claude\` not on PATH yet. Install it: bash scripts/setup-wsl.sh (then open a new shell)." ;;
      *)              ok "\`claude\` resolves to a Linux/macOS path: $claude_path" ;;
    esac ;;
esac

echo
log "Seeded. Next steps:"
echo "  1) cd $TARGET"
echo "  2) (first time on this machine) toolchain:"
echo "       WSL2/Linux/macOS:  bash scripts/setup-wsl.sh                 # node (nvm) + claude + gh"
echo "       native Windows:    Git for Windows + Node 24+, then 'winget install Anthropic.ClaudeCode GitHub.cli'"
echo "  3) put your secrets in .env (gitignored): GITHUB_PERSONAL_ACCESS_TOKEN=, CONTEXT7_API_KEY="
echo "  4) launch:  make cc      # sources .env so the token reaches the MCPs & gh (plain 'claude' won't)"
echo "  5) in the session:  /doctor   ->   /bootstrap   ->   /preflight"
