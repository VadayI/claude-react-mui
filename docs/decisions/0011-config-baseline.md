# 0011. Config baseline from a real setup (plugins via official plugins)

Status: accepted · 2026-06-02 · amended 2026-07-07 (engineering plugin removed from baseline)

## Context

Mirrors the backend's ADR 0011: pick one recommended mechanism for github + context7 and a committed plugin baseline.

## Decision

Committed `enabledPlugins` baseline: `superpowers@superpowers-marketplace`, `engineering@knowledge-work-plugins`, `playwright@claude-plugins-official`, `github@claude-plugins-official`, `context7@claude-plugins-official`. `github` + `context7` come from the official plugins; the committed `.mcp.json` + `enabledMcpjsonServers` path is an optional fallback — do NOT enable both for the same MCP. `claude-hud` is recommended but stays personal/global. Tool names are identical either way; tokens (`GITHUB_PERSONAL_ACCESS_TOKEN`, `CONTEXT7_API_KEY`) are still required.

## Consequences

- Predictable, identical config across machines via git.
- `playwright` plugin included (E2E is first-class here).

## Amendment (2026-07-07)

`engineering@knowledge-work-plugins` removed from the plugin baseline — it was enabled but never installed, and its generic commands overlap the local `reviewer`/`debugger` agents. See `docs/plans/0005-template-optimization.md` (PR1/A3).
