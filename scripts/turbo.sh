#!/usr/bin/env bash
# turbo.sh — toggle "all-Opus turbo mode" for Claude Code subagents.
#
#   on     : write  model=opus  +  env.CLAUDE_CODE_SUBAGENT_MODEL  into
#            .claude/settings.local.json (gitignored, personal — NOT committed,
#            does NOT propagate to bootstrapped projects).
#   off    : remove those two keys → main reverts to opusplan, subagents revert
#            to their per-agent frontmatter (13 opus / 9 sonnet).
#   status : show current state.
#
# Why this works: CLAUDE_CODE_SUBAGENT_MODEL overrides EVERY subagent's
# frontmatter model. settings.local.json `model` overrides settings.json's
# opusplan for the main session. Both live in the gitignored local file.
#
# NOTE: restart Claude Code after on/off — env vars apply at session start.
# Override the Opus id with:  TURBO_MODEL=claude-opus-4-8 bash scripts/turbo.sh on
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
LOCAL="${TURBO_SETTINGS:-$ROOT/.claude/settings.local.json}"
MODEL_ID="${TURBO_MODEL:-claude-opus-4-8}"
CMD="${1:-status}"

TURBO_FILE="$LOCAL" TURBO_CMD="$CMD" TURBO_MODEL_ID="$MODEL_ID" node - <<'NODE'
const fs = require('fs');
const file = process.env.TURBO_FILE;
const cmd = process.env.TURBO_CMD;
const modelId = process.env.TURBO_MODEL_ID;

let cfg = {};
if (fs.existsSync(file)) {
  try { cfg = JSON.parse(fs.readFileSync(file, 'utf8')); }
  catch (e) { console.error('ERROR: ' + file + ' is not valid JSON: ' + e.message); process.exit(1); }
}
const on = () => cfg.model === 'opus' && cfg.env && cfg.env.CLAUDE_CODE_SUBAGENT_MODEL;

if (cmd === 'status') {
  if (on()) console.log('TURBO: ON  — main=opus, subagents=' + cfg.env.CLAUDE_CODE_SUBAGENT_MODEL);
  else      console.log('TURBO: OFF — main=opusplan (settings.json), subagents=per-agent frontmatter');
  process.exit(0);
}
if (cmd === 'on') {
  cfg.model = 'opus';
  cfg.env = Object.assign({}, cfg.env, { CLAUDE_CODE_SUBAGENT_MODEL: modelId });
} else if (cmd === 'off') {
  delete cfg.model;
  if (cfg.env) {
    delete cfg.env.CLAUDE_CODE_SUBAGENT_MODEL;
    if (Object.keys(cfg.env).length === 0) delete cfg.env;
  }
} else {
  console.error('usage: turbo.sh [on|off|status]'); process.exit(2);
}
fs.writeFileSync(file, JSON.stringify(cfg, null, 2) + '\n');
console.log(cmd === 'on'
  ? 'TURBO: ON  — all subagents on ' + modelId + '. Restart Claude Code to apply.'
  : 'TURBO: OFF — restored opusplan + per-agent models. Restart Claude Code to apply.');
NODE
