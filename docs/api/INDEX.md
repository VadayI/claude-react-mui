# API Endpoints — Consumed by This Frontend

> Source of truth: `src/lib/api/openapi.yml` (vendored from `VadayI/claude-api-contract`).
> Generated types: `src/lib/api/schema.d.ts`.
> Full schema: see contract repo `VadayI/claude-api-contract`.

## Articles (`src/features/articles`)

| Method | Path             | operationId   | Feature  |
| ------ | ---------------- | ------------- | -------- |
| GET    | /api/v1/articles | listArticles  | articles |
| POST   | /api/v1/articles | createArticle | articles |

## Auth (API-layer only, `src/features/auth` + `src/lib/api/client.ts`)

Auth endpoints are consumed via the auth middleware and `authApi.ts` — there is no
UI route for login/logout. Contract v0.2.0 moved all auth paths to `/api/v1/auth/*`.

| Method | Path                  | operationId  | Used by                    |
| ------ | --------------------- | ------------ | -------------------------- |
| POST   | /api/v1/auth/login    | loginUser    | `authApi.ts`               |
| POST   | /api/v1/auth/logout   | logoutUser   | `authApi.ts`               |
| POST   | /api/v1/auth/refresh  | refreshToken | `client.ts` 401 middleware |
| POST   | /api/v1/auth/register | registerUser | `authApi.ts`               |
