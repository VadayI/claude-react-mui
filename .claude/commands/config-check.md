---
model: sonnet
---

Quick Claude config check — a focused subset of `/doctor` scope 2. Verifies plugins, required tokens, and GitHub auth without running the full environment audit.

## Log

```bash
node scripts/log-cmd.mjs /config-check "$ARGUMENTS"
```

## Steps

### 1. Plugins

Read `.claude/settings.json` `enabledPlugins`. Compare against the required baseline:

- `superpowers@superpowers-marketplace`
- `playwright@claude-plugins-official`
- `github@claude-plugins-official`
- `context7@claude-plugins-official`

Report ✅ installed / ❌ missing for each. For each missing plugin, output the paste-ready install command:

```
/plugin install <plugin-name>
```

### 2. Required tokens

Check presence (not value) of each:

- `GITHUB_PERSONAL_ACCESS_TOKEN` — required for `gh` CLI and the GitHub MCP.
- `CONTEXT7_API_KEY` — required for the Context7 MCP (library docs lookup).
- `CONTRACT_VERSION` — required for `npm run api:pull`. Check `.env` and shell env. Note as ⚠️ if absent (not a hard stop).

Never print token values.

### 3. GitHub auth

Run `gh auth status`. Report authenticated ✅ or unauthenticated ❌. If `GITHUB_TOKEN`/`GITHUB_PERSONAL_ACCESS_TOKEN` is set, `gh auth login` refusing to store creds is EXPECTED.

### 4. MCP conflict check

Verify that `github` and `context7` are not registered twice (once via plugin and once via `.mcp.json` `enabledMcpjsonServers`). Dual registration causes duplicate tool names. Report if both paths are active for the same server.

### Report

Print a two-column table: Item → Status. Paste-ready fix commands for any ❌ item.

<!-- last reviewed: 2026-06-09 -->
