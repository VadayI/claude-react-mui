---
model: sonnet
---

Comprehensive review of an open Pull Request via the GitHub MCP. Dispatches `reviewer`, `security-scanner`, and `a11y-auditor` in parallel and posts consolidated inline comments per `@.claude/rules/mcp-stack.md`.

## Log

```bash
node scripts/log-cmd.mjs /review-pr "$ARGUMENTS"
```

## Steps

### 1. Identify the PR

If `$ARGUMENTS` contains a PR number or URL, use it. Otherwise:

```bash
gh pr list --state open
```

Ask the user which PR to review if ambiguous.

### 2. Read PR details

Use the GitHub MCP:

- `pull_request_read` — get description, changed files, diff.
- `list_pull_requests` — confirm open state.

Also read: `docs/api/openapi.yml`, `src/lib/api/types.ts`, relevant feature READMEs.

### 3. Parallel review dispatch

Dispatch all three agents simultaneously (no dependencies between them):

**`reviewer`** — code quality review:

- Component contracts met (`@.claude/rules/component-contract.md`).
- No stubs in `src/` without `docs/STUBS.md` entries.
- No file over 400 lines.
- Feature README updated if surface changed.
- Tests cover success, 400, 401, 403, 404, edge cases.
- TypeScript types correct; no `any` without justification.
- Conventional commit messages.

**`security-scanner`** — security review:

- No secrets, tokens, or API keys in source.
- XSS-safe rendering (no `dangerouslySetInnerHTML` without sanitization).
- Auth tokens handled correctly (not in localStorage unencrypted if sensitive).
- Safe redirect handling — no open redirect from URL params.
- CSP headers in `index.html` or server config.
- `npm audit` results (if available).

**`a11y-auditor`** — accessibility review:

- All interactive elements have accessible names.
- Keyboard navigation correct (focus traps, tab order).
- jest-axe tests present for new components.
- ARIA roles/labels used correctly.
- Color contrast (flag if MUI theme overrides may reduce contrast).

### 4. Consolidate and post

Collect all three reports. For each finding:

- 🔴 Critical / 🟡 Important → post as inline comment via `pull_request_review_write` + `add_comment_to_pending_review`.
- 🟢 Minor → batch into a summary comment.

Post the review with a summary: APPROVE / REQUEST_CHANGES / COMMENT.

### 5. Report

Print a brief summary of findings by category and the GitHub review URL.

<!-- last reviewed: 2026-06-02 -->
