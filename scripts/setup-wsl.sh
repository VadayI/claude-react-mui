#!/usr/bin/env bash
# scripts/setup-wsl.sh
#
# One-shot idempotent toolchain installer for WSL2 Ubuntu / Debian / Linux.
#
# What it does (in order):
#   1. Ensure nvm + Node LTS (install nvm if missing, then node --lts).
#      Verifies node/npm resolve to a Linux path, not /mnt/c (Windows interop trap).
#   2. Install the WSL2-native Claude Code CLI via npm (global).
#      Adds a PATH-precedence note to ~/.bashrc if needed.
#   3. Install GitHub CLI (gh) if missing (via official apt method).
#   4. Print a note about Playwright deps (optional, for E2E testing).
#   5. Print a setup summary and next steps.
#
# Philosophy: detect -> inform -> install only what is missing.
# Never runs git. Never prints secret values. Safe to re-run.

set -uo pipefail

# ---------------------------------------------------------------------------
# Colors / helpers
# ---------------------------------------------------------------------------
RED='\033[0;31m'; YELLOW='\033[1;33m'; GREEN='\033[0;32m'; NC='\033[0m'
info()    { echo -e "${GREEN}[setup-wsl]${NC} $*"; }
warn()    { echo -e "${YELLOW}[setup-wsl] WARN:${NC} $*"; }
problem() { echo -e "${RED}[setup-wsl] PROBLEM:${NC} $*"; }
step()    { echo ""; echo -e "${GREEN}=== $* ===${NC}"; }

# ---------------------------------------------------------------------------
# Guard: must be Linux (WSL2 or native)
# ---------------------------------------------------------------------------
if [[ "$(uname -s)" != "Linux" ]]; then
  problem "This script is for Linux / WSL2 only. Detected: $(uname -s)"
  echo "  On macOS, use Homebrew: brew install node gh"
  exit 1
fi

step "Step 1 — nvm + Node LTS"

NVM_DIR="${NVM_DIR:-$HOME/.nvm}"

if [[ ! -s "$NVM_DIR/nvm.sh" ]]; then
  info "nvm not found — installing nvm..."
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
  # Load nvm for the rest of this script
  export NVM_DIR="$HOME/.nvm"
  # shellcheck source=/dev/null
  [ -s "$NVM_DIR/nvm.sh" ] && source "$NVM_DIR/nvm.sh"
  info "nvm installed."
else
  info "nvm already present at $NVM_DIR"
  # shellcheck source=/dev/null
  source "$NVM_DIR/nvm.sh"
fi

# Install Node LTS if not already managed by nvm
if ! command -v node >/dev/null 2>&1 || [[ "$(node --version 2>/dev/null | sed 's/v//' | cut -d. -f1)" -lt 18 ]]; then
  info "Installing Node LTS via nvm..."
  nvm install --lts
  nvm use --lts
  nvm alias default 'lts/*'
  info "Node LTS installed: $(node --version)"
else
  info "Node already installed: $(node --version)"
fi

# Verify node/npm are NOT the Windows interop binaries
NODE_PATH="$(command -v node 2>/dev/null || true)"
NPM_PATH="$(command -v npm 2>/dev/null || true)"

windows_path=false
[[ "$NODE_PATH" == /mnt/c/* ]] && windows_path=true
[[ "$NPM_PATH"  == /mnt/c/* ]] && windows_path=true

if $windows_path; then
  problem "node or npm resolves to a Windows path (/mnt/c/...):"
  problem "  node -> $NODE_PATH"
  problem "  npm  -> $NPM_PATH"
  problem "Your npm may be the Windows binary. Fix: let nvm own node+npm:"
  echo ""
  echo "  export NVM_DIR=\"\$HOME/.nvm\""
  echo "  [ -s \"\$NVM_DIR/nvm.sh\" ] && source \"\$NVM_DIR/nvm.sh\""
  echo "  nvm install --lts && hash -r"
  echo ""
  echo "Then re-run this script."
  exit 1
else
  info "node -> $NODE_PATH  (Linux path — good)"
  info "npm  -> $NPM_PATH   (Linux path — good)"
fi

step "Step 2 — Claude Code CLI (WSL2-native)"

CLAUDE_PATH="$(command -v claude 2>/dev/null || true)"

if [[ -n "$CLAUDE_PATH" ]] && [[ "$CLAUDE_PATH" != /mnt/c/* ]]; then
  info "Claude Code CLI already installed at: $CLAUDE_PATH"
else
  if [[ -n "$CLAUDE_PATH" ]]; then
    warn "Existing 'claude' resolves to a Windows path: $CLAUDE_PATH"
    warn "Installing Linux-native version to shadow it..."
  else
    info "Installing Claude Code CLI..."
  fi

  npm install -g @anthropic-ai/claude-code
  hash -r

  NEW_CLAUDE_PATH="$(command -v claude 2>/dev/null || true)"
  if [[ -z "$NEW_CLAUDE_PATH" ]] || [[ "$NEW_CLAUDE_PATH" == /mnt/c/* ]]; then
    warn "After install, 'claude' still resolves to: $NEW_CLAUDE_PATH"
    warn "Windows interop PATH may be taking precedence. Adding npm-global/bin fix to ~/.bashrc..."
    NPM_PREFIX="$(npm config get prefix)"
    FIXLINE="export PATH=\"${NPM_PREFIX}/bin:\$PATH\""
    if ! grep -qF "$FIXLINE" ~/.bashrc 2>/dev/null; then
      echo "" >> ~/.bashrc
      echo "# Ensure WSL2-native npm global bin takes precedence over Windows interop" >> ~/.bashrc
      echo "$FIXLINE" >> ~/.bashrc
      info "Added PATH fix to ~/.bashrc — run: source ~/.bashrc"
    else
      info "PATH fix already in ~/.bashrc"
    fi
  else
    info "Claude Code CLI installed: $NEW_CLAUDE_PATH"
  fi
fi

step "Step 3 — GitHub CLI (gh)"

if command -v gh >/dev/null 2>&1; then
  info "gh already installed: $(gh --version 2>/dev/null | head -1)"
else
  info "Installing GitHub CLI via official apt method..."
  (
    type -p curl >/dev/null || (sudo apt-get update && sudo apt-get install -y curl)
    curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg \
      | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg
    sudo chmod go+r /usr/share/keyrings/githubcli-archive-keyring.gpg
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" \
      | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null
    sudo apt-get update && sudo apt-get install -y gh
  ) && info "gh installed: $(gh --version | head -1)" \
    || warn "gh installation failed — install manually from https://cli.github.com"
fi

step "Step 4 — Playwright deps (optional, for E2E)"

info "If you plan to run Playwright E2E tests, install browser deps with:"
echo ""
echo "  npx playwright install --with-deps"
echo ""
info "This is optional — skip if you don't need E2E tests."

step "Summary & Next Steps"

echo ""
info "Toolchain check:"
printf "  %-10s %s\n" "node"   "$(node   --version 2>/dev/null || echo '(not found)')"
printf "  %-10s %s\n" "npm"    "$(npm    --version 2>/dev/null || echo '(not found)')"
printf "  %-10s %s\n" "claude" "$(command -v claude  2>/dev/null || echo '(not found)')"
printf "  %-10s %s\n" "gh"     "$(gh     --version  2>/dev/null | head -1 || echo '(not found)')"
printf "  %-10s %s\n" "git"    "$(git    --version  2>/dev/null | head -1 || echo '(not found)')"
echo ""
info "Next steps:"
echo "  1. Set required env vars (in ~/.bashrc or your shell rc — never commit secrets):"
echo "       export GITHUB_PERSONAL_ACCESS_TOKEN='github_pat_...'"
echo "       export CONTEXT7_API_KEY='...'"
echo "  2. Authenticate gh:  gh auth login"
echo "  3. Reload shell:     source ~/.bashrc"
echo "  4. Start Claude:     claude"
echo "  5. Run doctor:       /doctor"
echo ""
info "setup-wsl.sh complete."
