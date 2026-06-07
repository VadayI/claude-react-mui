---
model: sonnet
---

Focused security audit over working changes via `security-scanner`. Covers XSS, token handling, npm vulnerabilities, CSP, and open-redirect risks.

## Log

```bash
node scripts/log-cmd.mjs /security-check "$ARGUMENTS"
```

## Steps

### 1. Scope detection

If `$ARGUMENTS` specifies a file, feature, or PR number — scope the audit there. Otherwise audit all changes since `main`:

```bash
git diff --name-only main..HEAD
```

If on `main`, audit the entire `src/` directory.

### 2. Dispatch security-scanner

Delegate to `security-scanner` with the changed files and this checklist:

**XSS**

- Any `dangerouslySetInnerHTML`? Must have sanitization (DOMPurify or equivalent).
- User-supplied content rendered into the DOM via `innerHTML`? Flag.
- URL parameters interpolated into `href` or `src` without validation?

**Token and credential handling**

- Are auth tokens stored in `localStorage`? Flag if they are JWTs with sensitive claims (prefer `httpOnly` cookies or memory-only stores).
- Any hardcoded secrets, API keys, or passwords in `src/`?
- Environment variables not prefixed `VITE_` (these are not injected at build time — no false sense of security).

**Open redirects**

- Does any route use `redirect_to` or similar URL params to navigate? Validate against allowlist.

**CSP**

- Is a `Content-Security-Policy` meta tag or server header defined? Flag if absent.
- Does the CSP allow `unsafe-inline` scripts or `unsafe-eval`? Flag.

**npm audit**

```bash
npm audit --audit-level=high
```

Report high/critical vulnerabilities. Note: auditing only, no auto-fix.

**Dependency review**

- Any new `package.json` dependencies added in this diff? Check for: unusual packages, packages with very few downloads, or packages with known supply-chain issues.

### 3. Report

Print findings grouped by severity:

- 🔴 Critical — must fix before merge.
- 🟡 Important — fix in this PR or open a tracked follow-up.
- 🟢 Minor — note for awareness.

No auto-fixes. All proposed remediations require user confirmation before `react-developer` implements them.

<!-- last reviewed: 2026-06-02 -->
