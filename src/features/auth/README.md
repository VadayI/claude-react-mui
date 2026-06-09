# auth

Handles user authentication for the Bearer/JWT flow (ADR 0021).

## Purpose

Provides the login UI and the route guard that protects authenticated routes.
This feature owns the `/login` screen, the `LoginForm`/`LoginPage` components,
the `useLogin` mutation hook, and the `RequireAuth` layout-route guard.

Token lifecycle (in-memory store, auto-injection, 401→refresh) lives in
`src/lib/auth/` to avoid circular imports with the API client. This feature
does **NOT** own registration, logout, or any other domain.

## Routes

| Path     | Screen      | Auth                                                                   |
| -------- | ----------- | ---------------------------------------------------------------------- |
| `/login` | `LoginPage` | Anonymous (authenticated visitors are immediately redirected via ?next) |

## Components

| Component     | Type           | Location                        | Description                                                                                           |
| ------------- | -------------- | ------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `LoginPage`   | Container      | `components/LoginPage.tsx`      | Reads `?next` param, checks auth store; on success stores tokens + navigates; on error surfaces alert |
| `LoginForm`   | Presentational | `components/LoginForm.tsx`      | Email + password fields with RHF + Zod; `role="alert"` region for server errors (always rendered)     |
| `RequireAuth` | Route guard    | `src/app/guards/RequireAuth.tsx` | Layout route; redirects anonymous users to `/login?next=<encoded-path>`                               |

## Hooks & State

| Hook       | Type              | Description                                                                               |
| ---------- | ----------------- | ----------------------------------------------------------------------------------------- |
| `useLogin` | TanStack Mutation | `mutationFn → POST /api/v1/auth/login`; throws normalised `Error` on non-2xx             |

Auth store (`useAuthStore`, `src/lib/auth/authStore.ts`):

- **Read** (`RequireAuth`, `LoginPage`): `accessToken` — presence/absence determines auth state.
- **Write** (`LoginPage.onSuccess`): `setTokens(access, refresh)` — stores both tokens in memory.
- Tokens are **never persisted** to `localStorage`/`sessionStorage` (ADR 0021).

## Consumed Endpoints

| Method | Path                    | Notes                                     |
| ------ | ----------------------- | ----------------------------------------- |
| `POST` | `/api/v1/auth/login`    | Body: `LoginRequest`; returns `TokenPair` |

Full schema in `src/lib/api/openapi.yml` (vendored from `VadayI/claude-api-contract@v0.2.0`).
Generated types in `src/lib/api/schema.d.ts`.

## UI States

| State       | Trigger                          | UI                                                                                    |
| ----------- | -------------------------------- | ------------------------------------------------------------------------------------- |
| Idle        | Page first loads (not authed)    | `LoginForm` rendered; all fields enabled; submit button active                        |
| Submitting  | Mutation in flight               | Submit button `disabled` + `aria-busy="true"`; fields remain editable                |
| Error       | Mutation settled with error      | `role="alert"` region announces the error message; form remains interactive for retry |
| Redirect    | Already authenticated on arrival | Immediate `<Navigate to={sanitizeNext(next)} replace />` — no form shown              |

## Accessibility Notes

- `role="alert"` is **always rendered** (even when empty) so repeated submission errors
  are re-announced by screen readers (an element appearing for the first time may be
  ignored by some AT; keeping it mounted guarantees re-announcement).
- `aria-live="assertive"` + `aria-atomic="true"` on the alert region.
- MUI `TextField` `label` prop provides accessible names for Email and Password inputs.
- MUI `helperText` + `error` combination links the validation message to the field
  via `aria-describedby` automatically.
- `autoComplete="email"` / `autoComplete="current-password"` on inputs — aids password
  managers and satisfies WCAG 1.3.5 (Identify Input Purpose).
- All components pass `jest-axe` in unit tests.

## Cross-Feature Dependencies

- `src/lib/auth/authStore.ts` — in-memory Zustand store for access/refresh tokens.
- `src/lib/api/client.ts` — `apiClient` typed client + `normaliseError` helper.
- `src/app/guards/RequireAuth.tsx` — consumed by `src/app/router.tsx`; guards all
  routes declared as `auth: "authenticated"` in `.claude/memory/routes.json`.

## Decisions

- **ADR 0021** (`docs/decisions/0021-auth-bearer-jwt-default.md`) — Bearer/JWT default;
  tokens held in-memory only; `sanitizeNext()` open-redirect protection.
