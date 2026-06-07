# ADR 0021 — Bearer/JWT as default auth mode (supersedes ADR 0018)

- **Status:** Accepted
- **Date:** 2026-06-07
- **Supersedes:** ADR 0018 (session/CSRF as default)

## Context

ADR 0018 established session+CSRF as the default auth mode for `claude-react-mui`. The contract inversion (ADR 0020) means the API contract is now owned by the external `VadayI/claude-api-contract` repository, which uses `djangorestframework-simplejwt` (Bearer/JWT) aligned with the external contract. The contract defines `bearerAuth` as the global security scheme and specifies the `/auth/login`, `/auth/refresh`, `/auth/logout`, and `/auth/register` user-flow endpoints. Session-based auth is incompatible with this contract.

The backend consumer (`claude-django`) is also a contract consumer and therefore also implements Bearer/JWT — there is no session/CSRF in the shared contract.

## Decision

- **Default auth mode: Bearer/JWT** (`djangorestframework-simplejwt` on the backend, `openapi-fetch` middleware on the frontend).
- **Access token:** in-memory Zustand store (`useAuthStore` at `src/lib/auth/authStore.ts`), never persisted to web storage or cookies from JS.
- **Refresh token:** returned in the **response body** (D2 — not an httpOnly cookie). XSS risk acknowledged: a malicious script on the same origin could exfiltrate the refresh token from JS memory, but cannot steal it via cookie-theft. Mitigations: short-lived access tokens (minutes), rotate refresh on each use, token blacklist on logout.
- **401 interceptor:** one global `onResponse` middleware in `src/lib/api/client.ts`; attempts one refresh, retries the original request; on failure clears the store. Route guards observe `accessToken` from `useAuthStore` and redirect to login.
- **Service-flow (client_credentials):** out of scope for the frontend — a browser cannot safely hold a client secret.

## Consequences

- Frontend can authenticate against the Prism mock (no backend needed during early development — PR4).
- CSRF protection is not needed for Bearer tokens (access token is not transported via cookie).
- The old session/CSRF rule (`.claude/rules/auth-and-csrf.md`) is replaced by `.claude/rules/auth.md`.
- Cookie-based refresh (httpOnly `SameSite=None`) is a future upgrade path: it eliminates the JS-accessible refresh token but requires HTTPS and explicit CORS `credentials` configuration on the backend. Record that switch by superseding this ADR.
- `security-scanner` blocks tokens in web storage and enforces that no secret is persisted — unchanged from ADR 0018 constraint.
