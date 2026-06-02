# 0018. Default auth mode: DRF session + CSRF (same-origin), SimpleJWT for cross-origin

Status: accepted · 2026-06-02

## Context

`@.claude/rules/auth-and-csrf.md` requires the authentication mode to be a **decision recorded up front**, not improvised per request. This frontend consumes a DRF backend (ADR `0007`), and DRF supports two realistic modes for an SPA:

- **Same-origin:** `SessionAuthentication` + Django CSRF — the session lives in an httpOnly cookie, the client sends `X-CSRFToken` on unsafe methods.
- **Cross-origin:** `djangorestframework-simplejwt` — short-lived access + rotating refresh + token blacklist.

The hard constraints are fixed regardless of mode: **never** store a session id or JWT in `localStorage`/`sessionStorage` (XSS-exfiltratable); session/refresh tokens live in httpOnly+Secure+SameSite cookies; an access token, if used, is held in memory in the auth store; components never read tokens (the API client injects them); there is **one** 401 flow.

A starter template needs a sane default so the example app and the first feature are not blocked on this choice, while leaving the cross-origin path documented for projects that need it.

## Decision

**Default to same-origin DRF `SessionAuthentication` + Django CSRF.** Rationale: it is the simplest secure option when the SPA and API are served from the same origin (or behind one reverse proxy / subdomain pair with shared parent domain), needs no client-side token lifecycle, and keeps the secret entirely in an httpOnly cookie the JS never touches.

- The client reads the `csrftoken` cookie and sends `X-CSRFToken` on POST/PUT/PATCH/DELETE; safe methods send none. A 403 CSRF failure re-bootstraps the token, never silently swallowed.
- Cookies are `HttpOnly` + `Secure` + `SameSite=Lax` (same-origin).

**Cross-origin deployments switch to SimpleJWT** as the documented alternative: short-lived access token held **in memory** in the auth store, rotating refresh in an httpOnly+Secure+`SameSite=None` cookie (requires HTTPS + `credentials`), token blacklist on logout. The single 401 interceptor attempts **one** refresh then retries; on failure it clears the auth store and redirects to login preserving `?next=`. CORS allowlist is explicit — never `*` with credentials.

A project that needs cross-origin records that switch by **superseding this ADR** with a project-specific one; the rule (`auth-and-csrf.md`) and the 401-flow/token-injection points stay identical either way.

## Consequences

- The example app and first feature have an unambiguous, secure default; `integration-architect` and `state-architect` build the auth store and 401 flow against it.
- No token ever touches web storage or logs (ties to `@.claude/rules/observability-and-errors.md`); `security-scanner` enforces this regardless of mode.
- Switching to cross-origin is a recorded, reviewed event (a superseding ADR), not a silent code change — the token-injection point and 401 flow do not move, only the credential transport does.
