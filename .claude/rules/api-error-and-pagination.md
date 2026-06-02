# API errors & pagination contract (DRF, enforced)

The DRF backend shapes errors and paginated lists predictably; the frontend normalizes them in **one place** so components never parse raw DRF payloads.

## Errors — one normalizer

- The backend standardizes errors (recommend **`drf-standardized-errors`**, RFC-9457 style). The API client (@.claude/rules/api-client.md) maps every non-2xx into one typed `ApiError { status, code, detail, fieldErrors? }`.
- **Field (400) errors** map onto form fields via react-hook-form `setError` (@.claude/rules/forms-and-validation.md) — **not** a toast.
- Non-field errors (401/403/404/409/5xx) surface as the component's **error state** (@.claude/rules/component-contract.md) with a retry affordance.

## Pagination — typed envelope

- DRF list responses use `{ count, next, previous, results }`. A typed `Page<T>` mapper lives in `src/lib/api`; features consume `Page<T>`, never the raw envelope.
- Infinite lists use TanStack `useInfiniteQuery` with `getNextPageParam` derived from `next`; page-number lists derive the param from the URL.

## Retry policy

- Set once on the QueryClient (@.claude/rules/state-management.md): **never retry 4xx**; retry idempotent reads on 5xx/network with backoff. Mutations are not retried by default.

## Schema hygiene (so types stay clean)

- The backend's drf-spectacular schema sets `ENABLE_LIST_MECHANICS_ON_NON_2XX = False` so error responses are not wrongly typed as paginated. `Page<T>` and error types trace to the schema (@.claude/rules/openapi-conventions.md), never hand-written.

## Binds these agents (rule is auto-loaded)

- `state-architect` — owns the QueryClient retry defaults and infinite-query keys.
- `react-developer` — uses `ApiError` / `Page<T>` mappers; never parses raw DRF payloads in components.
- `tester` — MSW handlers return real DRF shapes (standardized error + paginated envelope); triangulate empty/one/many/error.
- `reviewer` — flags raw-envelope parsing in components, toasted field errors, and 4xx retries.

> Goal: every DRF error and page is normalized once at the boundary; the UI speaks `ApiError` and `Page<T>`, not raw DRF JSON.
