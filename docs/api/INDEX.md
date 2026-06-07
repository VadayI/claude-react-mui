# API Endpoints — Consumed by This Frontend

> Source of truth: `src/lib/api/openapi.yml` (vendored from `VadayI/claude-api-contract`).
> Generated types: `src/lib/api/schema.d.ts`.
> Full schema: see contract repo `VadayI/claude-api-contract`.

## Articles (`src/features/articles`)

| Method | Path | operationId | Feature |
|--------|------|-------------|---------|
| GET | /api/v1/articles | listArticles | articles |
| POST | /api/v1/articles | createArticle | articles |

## Auth (API-layer only, `src/features/auth` + `src/lib/api/client.ts`)

Auth endpoints are consumed via the auth middleware and `authApi.ts` — there is no
UI route for login/logout. These will be updated with v0.2.0 paths in the next PR.

| Method | Path | operationId | Used by |
|--------|------|-------------|---------|
| POST | /auth/login | loginUser | `authApi.ts` |
| POST | /auth/logout | logoutUser | `authApi.ts` |
| POST | /auth/refresh | refreshToken | `client.ts` 401 middleware |
| POST | /auth/register | registerUser | `authApi.ts` |
