# Authentication & CSRF with the Django backend (enforced)

This frontend consumes a **DRF** backend. Auth is a **decision recorded up front** (an ADR), not improvised per call. Pick one mode per project:

- **Same-origin (default):** DRF `SessionAuthentication` + Django CSRF. The session lives in an httpOnly cookie; the client sends `X-CSRFToken` on unsafe methods.
- **Cross-origin:** `djangorestframework-simplejwt` — short-lived access + rotating refresh + token blacklist.

## Token storage (hard rule)

- **Never** store a JWT or session id in `localStorage`/`sessionStorage` (XSS-exfiltratable).
- Session/refresh tokens live in **httpOnly, Secure, SameSite** cookies set by the backend. An access token, if used, is held **in memory** in the auth store — never persisted.
- Components never read tokens; the API client injects them (@.claude/rules/api-client.md).

## CSRF (session mode)

- The client reads the `csrftoken` cookie and sends it as `X-CSRFToken` for POST/PUT/PATCH/DELETE; safe methods (GET/HEAD/OPTIONS) send none. DRF enforces CSRF only for authenticated session requests.
- A 403 CSRF failure → re-bootstrap the token, never swallow it silently.

## The 401 flow (one place)

- A single response interceptor handles 401: in JWT mode, attempt **one** refresh then retry the original request; on failure, clear the auth store and redirect to login preserving the destination (`?next=`). No per-component auth branching — that lives in route guards (@.claude/rules/component-contract.md).

## Cookies & CORS

- `HttpOnly` + `Secure` + `SameSite=Lax` (same-origin) or `None` (cross-origin, requires HTTPS + `credentials`). The CORS allowlist is explicit — never `*` with credentials.

## Binds these agents (rule is auto-loaded)

- `integration-architect` — designs the chosen auth mode and the refresh/redirect flow.
- `state-architect` — owns the auth store (in-memory access token; nothing secret persisted).
- `react-developer` — wires token/CSRF injection in the client only; guards in `src/app/guards/`.
- `security-scanner` — blocks tokens in web storage, missing CSRF on unsafe methods, `SameSite`/`Secure` gaps, and `credentials` + wildcard CORS.

> Goal: auth is one recorded decision with one token-injection point and one 401 flow — never reinvented per request.
