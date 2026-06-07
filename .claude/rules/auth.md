# Authentication — Bearer/JWT (enforced)

This frontend consumes a **Bearer/JWT** backend (`djangorestframework-simplejwt` on `claude-django`). Auth is a **decision recorded up front** in ADR `0021` (`docs/decisions/0021-auth-bearer-jwt-default.md`), which supersedes ADR `0018`.

The default and only mode for this template is **Bearer/JWT user-flow** as specified in the external contract (`VadayI/claude-api-contract`, `bearerAuth` global security scheme, `/auth/*` endpoints).

## Token storage (hard rule)

- **Never** store a JWT or session id in `localStorage`/`sessionStorage` (XSS-exfiltratable).
- Access token: held **in memory** in `useAuthStore` (`src/lib/auth/authStore.ts`) — never persisted.
- Refresh token: held **in memory** in `useAuthStore` (returned in the response body, D2). Trade-off: a script on the same origin could exfiltrate it from memory (same as a closure), but it cannot be stolen via cookie-theft. Mitigation: short-lived access tokens, rotate refresh on use, token blacklist on logout.
- Components never read tokens; the API client injects them automatically.

## Token injection (one place)

`src/lib/api/client.ts` has a single `onRequest` middleware that reads `useAuthStore.getState().accessToken` and sets `Authorization: Bearer <token>`. No per-component auth header — ever.

## The 401 flow (one place)

A single `onResponse` middleware in `src/lib/api/client.ts` handles 401:

1. If the failing request is itself to `/api/v1/auth/refresh` → return the 401 (avoid infinite loop).
2. If `refreshToken` is absent → return the 401 (caller or route guard redirects to login).
3. Attempt **one** `POST /api/v1/auth/refresh` with the stored refresh token.
4. On success: update store (`setTokens` / `setAccessToken`), clone the original request with the new access token, return the retry response.
5. On failure (network error or non-2xx): `clearTokens()`, return the original 401.

Route guards (`src/app/guards/`) observe `accessToken` from `useAuthStore` and redirect to login (with `?next=`) when null.

## User-flow endpoints

| Method + path | Security | Purpose |
|---|---|---|
| `POST /api/v1/auth/register` | public | create account (optional initial tokens) |
| `POST /api/v1/auth/login` | public | credentials → TokenPair stored in authStore |
| `POST /api/v1/auth/refresh` | public | refresh token → new access token (handled by middleware) |
| `POST /api/v1/auth/logout` | Bearer | revoke refresh token, clear store |

## Service-flow (out of scope for frontend)

`POST /api/v1/auth/token` (client_credentials) is defined in the contract for service-to-service use. A browser SPA cannot safely hold a client secret, so this endpoint is not used by this frontend.

## Alternative: same-origin session/CSRF

Projects that deploy the SPA and backend on the same origin can switch to DRF `SessionAuthentication` + Django CSRF. That switch **supersedes this ADR** with a project-specific one. The 401 flow and token-injection points stay in the same files; only the credential transport changes.

## Binds these agents (rule is auto-loaded)

- `integration-architect` — designs the chosen auth mode and the refresh/redirect flow.
- `state-architect` — owns the auth store (in-memory only; nothing secret persisted).
- `react-developer` — wires token injection in `client.ts` only; guards in `src/app/guards/`.
- `security-scanner` — blocks tokens in web storage, `SameSite`/`Secure` gaps, `credentials` + wildcard CORS.

> Goal: auth is one recorded decision with one token-injection point and one 401 flow — never reinvented per request.
