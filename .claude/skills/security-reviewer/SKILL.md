---
name: security-reviewer
description: Frontend security checklist — XSS, auth token storage, CSRF, CSP, dependency audit, no secrets in bundle — activate for security review.
---

# Frontend Security Review

References: `@.claude/rules/mcp-stack.md`, `@.claude/rules/api-client.md`

## XSS prevention
- Never use `dangerouslySetInnerHTML` with unsanitised input
- If user-generated HTML must be rendered, sanitise first with `DOMPurify`

```tsx
import DOMPurify from 'dompurify';

// Safe: sanitise before rendering
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(userHtml) }} />

// Dangerous: NEVER do this
<div dangerouslySetInnerHTML={{ __html: userInput }} />
```

- Prefer React's default text rendering (auto-escapes) over innerHTML patterns
- Avoid `eval()`, `new Function()`, and dynamic `import()` with user-controlled paths

## Auth token storage trade-offs

| Storage | XSS Risk | CSRF Risk | Recommendation |
|---------|----------|-----------|----------------|
| `localStorage` | HIGH — JS readable | none | avoid for tokens |
| `sessionStorage` | HIGH — JS readable | none | avoid for tokens |
| Memory (Zustand) | low — not persistent | none | good for SPAs; lost on refresh |
| `httpOnly` cookie | none — JS cannot read | HIGH without CSRF token | best for sessions; needs CSRF mitigation |

- For SPAs with Bearer auth: store token in memory (Zustand store), refresh via a `httpOnly` refresh-token cookie flow
- Never log tokens, never put tokens in URL params or query strings

## CSRF for cookie-based auth
- Include `X-CSRFToken` header for state-changing requests when using cookie auth
- The Django backend sets the CSRF cookie; read it and send it back in the header

```ts
apiClient.use({
  onRequest({ request }) {
    const csrf = document.cookie.match(/csrftoken=([^;]+)/)?.[1];
    if (csrf && ['POST','PUT','PATCH','DELETE'].includes(request.method)) {
      request.headers.set('X-CSRFToken', csrf);
    }
    return request;
  },
});
```

## Content Security Policy (CSP)
- Set via HTTP response headers (Django `django-csp`), not `<meta>` tags
- Avoid `unsafe-inline` for scripts; use nonces or hash-based CSP
- Review any dynamic `<script>` injection in third-party libraries

## Open redirects
- Never redirect to a URL from query params without validation
- Allowlist or validate that redirect targets are same-origin

```ts
// Safe: only redirect to same-origin paths
const redirect = new URL(returnTo, window.location.origin);
if (redirect.origin === window.location.origin) navigate(redirect.pathname);
```

## No secrets in the client bundle
- All `VITE_*` environment variables are PUBLIC — they are embedded in the built JS
- Never put API keys, secrets, private tokens, or internal URLs in `VITE_*` vars
- Backend secrets stay server-side; the frontend only holds a public API base URL

## Dependency audit
```bash
npm audit                           # check for known vulnerabilities
npm audit --audit-level=high        # fail CI on high+ severity
# override vulnerable transitive deps via package.json "overrides" if no fix available
```

## PII in logs and state
- Never `console.log` passwords, tokens, full card numbers, or sensitive PII
- Zustand persist middleware: allowlist only what is safe to store (no tokens, no PII)
- Error tracking (Sentry): scrub PII fields before sending; use `beforeSend` hook

<!-- last reviewed: 2026-06-02 -->
