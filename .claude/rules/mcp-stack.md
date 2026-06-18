# MCP Stack — Tool Usage Guide

Configured in `.mcp.json`, enabled in `.claude/settings.json`. Set the env vars before use.

> **Recommended mechanism (ADR `0011`):** `github` and `context7` are provided by the **official plugins** `github@claude-plugins-official` + `context7@claude-plugins-official` (auto-enabled via `enabledPlugins`). The `.mcp.json` + `enabledMcpjsonServers` setup is the **optional committed fallback** — do NOT enable both at once. Tool names are identical either way. Tokens still required: `GITHUB_PERSONAL_ACCESS_TOKEN` (also used by `gh`) and `CONTEXT7_API_KEY`. The `playwright` plugin (browser automation) is also enabled — see below.

## GitHub MCP (`github`) — env `GITHUB_PERSONAL_ACCESS_TOKEN`

PR data and review automation. Prefer over scraping or `curl`.

| Tool                            | When to use                      |
| ------------------------------- | -------------------------------- |
| `pull_request_read`             | Read PR details (review, fix-ci) |
| `list_pull_requests`            | List open PRs                    |
| `pull_request_review_write`     | Create/submit a review           |
| `add_comment_to_pending_review` | Post inline review comments      |
| `create_pull_request`           | Open a PR (`docs-writer` only)   |

For GitHub Actions data (run logs, job status) use the `gh` CLI (`gh run list/view`, `gh pr checks`), not the MCP.

## Context7 (`context7`) — env `CONTEXT7_API_KEY`

Up-to-date library docs. Use before implementing against APIs that may have changed.

| Tool                 | When to use                                                                   |
| -------------------- | ----------------------------------------------------------------------------- |
| `resolve-library-id` | Find the library id first                                                     |
| `query-docs`         | Current docs for React, MUI, TanStack Query, React Router, Vitest, Playwright |

## Playwright MCP (`playwright`) — opening a running design / page

Provided by the enabled `playwright@claude-plugins-official` plugin. This is **browser automation** (navigate, screenshot, read computed styles) — distinct from the Playwright **E2E test runner** (`npm run e2e` / `e2e:ui`, which drives the specs in `e2e/` against the app under test). Use this MCP to open and inspect a **running design** served at a URL (e.g. `http://localhost:8331/`) per `@.claude/rules/design-reference.md`.

| Tool                      | When to use                                                                      |
| ------------------------- | -------------------------------------------------------------------------------- |
| `browser_navigate`        | Open the design URL (or any page to inspect)                                     |
| `browser_snapshot`        | Read the accessibility tree / structure of the rendered page                     |
| `browser_take_screenshot` | Capture a screen's visual state for layout / colour reference                    |
| `browser_evaluate`        | Run `getComputedStyle` to read exact computed tokens (colour, size, spacing) — L1 |

- **Read-only inspection** — never mutate the running design.
- Opening a **local** design URL (`localhost`) is allowed; it is not a blocked web fetch.
- The design URL is recorded in `docs/PROJECT.md` § Design reference; reachability is probed by `/doctor`, `/preflight`, and `/audit`.
- For the app under test (E2E), keep using the test runner (`npm run e2e` / `e2e:ui`), not this MCP.

## Notes

- Web/CI data restrictions: do not bypass blocked fetches via `curl`/scripts.
- Secrets (tokens/keys) only via env — never commit them.
- Vet third-party MCP servers/skills before enabling: check what they run, where, and what they can access. Prefer audited, well-known sources.
