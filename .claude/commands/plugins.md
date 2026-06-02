---
model: sonnet
---
Report installed vs expected Claude plugins and print paste-ready `/plugin install` commands for any that are missing.

## Log
```bash
node scripts/log-cmd.mjs /plugins "$ARGUMENTS"
```

## Steps

### 1. Required plugin baseline
The expected plugins for this project are:
| Plugin | Purpose |
|---|---|
| `superpowers@superpowers-marketplace` | Core agent capabilities |
| `engineering@knowledge-work-plugins` | Engineering workflows |
| `playwright@claude-plugins-official` | E2e test integration |
| `github@claude-plugins-official` | GitHub MCP (PRs, reviews) |
| `context7@claude-plugins-official` | Up-to-date library docs |

Optional (personal/global, not committed):
- `claude-hud@claude-hud` — HUD UI for monitoring sessions.

Intentionally NOT in the baseline (covered by project agents):
- `code-review`, `code-simplifier` — replaced by `reviewer`, `security-scanner`, `react-refactoring-expert`.

### 2. Read installed plugins
Read `.claude/settings.json` `enabledPlugins`. Cross-reference against the baseline table above.

### 3. Check for MCP conflicts
Verify that `github` and `context7` are not enabled both via plugin AND via `.mcp.json` `enabledMcpjsonServers`. Dual registration causes duplicate tool names. Report any conflict and explain how to disable one path.

### 4. Report
Print a status table:
| Plugin | Expected | Installed | Status |
|---|---|---|---|

For each missing plugin, print the exact install command:
```
/plugin install <plugin-name>
```

### 5. Token reminder (no values)
Remind the user that even with plugins installed, the following env vars must be set:
- `GITHUB_PERSONAL_ACCESS_TOKEN` — GitHub MCP + `gh` CLI auth.
- `CONTEXT7_API_KEY` — Context7 library doc lookups.

Never print token values.

<!-- last reviewed: 2026-06-02 -->
