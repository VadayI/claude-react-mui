# auth

Handles authentication for the Bearer/JWT flow (ADR 0021).

## Purpose

Provides typed API functions for the `/api/v1/auth/*` endpoints defined in the external
contract (`claude-api-contract@v0.1.0`). Token lifecycle (store + inject + refresh)
lives in `src/lib/auth/` to avoid circular imports with the API client.

## Public exports

| Export | File | Description |
|---|---|---|
| `login` | `authApi.ts` | POST /api/v1/auth/login → stores access+refresh tokens |
| `logout` | `authApi.ts` | POST /api/v1/auth/logout → clears tokens from store |
| `register` | `authApi.ts` | POST /api/v1/auth/register → create a new user account |

## Cross-feature dependencies

- `src/lib/auth/authStore` — Zustand in-memory store (access + refresh tokens).
- `src/lib/api/client` — `apiClient` auto-injects `Bearer` and handles 401→refresh.

## Out of scope

Service-to-service (client_credentials) flow — the browser cannot safely hold a
client secret; that flow belongs to the backend only.
