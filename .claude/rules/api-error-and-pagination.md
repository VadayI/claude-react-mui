# API errors & pagination contract (enforced)

The contract (`VadayI/claude-api-contract`) defines two error envelopes and one pagination envelope. The frontend normalizes errors in **one place** so components never parse raw payloads.

## Errors — one normalizer

The contract defines two error shapes (see `schema.d.ts` — `ErrorDetail`, `ValidationErrors`, `FieldError`):

- **Simple errors** (401, 403, 404, 409, 429, 5xx) — `ErrorDetail { detail: string }`.
- **Validation errors** (400) — `ValidationErrors { errors: FieldError[] }` where `FieldError { field: string, code: string, message: string }`.

The API client (@.claude/rules/api-client.md) maps every non-2xx into one typed `ApiError { status, code, detail, fieldErrors? }`:

- `ErrorDetail.detail` → `ApiError.detail`
- `ValidationErrors.errors` → `ApiError.fieldErrors`

- **Field (400) errors** map onto form fields via react-hook-form `setError` (@.claude/rules/forms-and-validation.md) — **not** a toast.
- Non-field errors (401/403/404/409/5xx) surface as the component's **error state** (@.claude/rules/component-contract.md) with a retry affordance.

## Pagination — typed envelope

- List responses use `{ count, next, previous, results }`. A typed `Page<T>` mapper lives in `src/lib/api`; features consume `Page<T>`, never the raw envelope.
- Infinite lists use TanStack `useInfiniteQuery` with `getNextPageParam` derived from `next`; page-number lists derive the param from the URL.

## Retry policy

- Set once on the QueryClient (@.claude/rules/state-management.md): **never retry 4xx**; retry idempotent reads on 5xx/network with backoff. Mutations are not retried by default.

## Schema hygiene (so types stay clean)

- Error responses use `ErrorDetail` / `ValidationErrors`, never the pagination envelope — the shapes are distinct and both trace to `schema.d.ts` (@.claude/rules/openapi-conventions.md), never hand-written.

## Binds these agents (rule is auto-loaded)

- `state-architect` — owns the QueryClient retry defaults and infinite-query keys.
- `react-developer` — uses `ApiError` / `Page<T>` mappers; never parses raw contract envelopes in components.
- `tester` — MSW handlers return contract-compliant shapes (`ErrorDetail` / `ValidationErrors` / paginated envelope); triangulate empty/one/many/error.
- `reviewer` — flags raw-envelope parsing in components, toasted field errors, and 4xx retries.

> Goal: every contract error and page is normalized once at the boundary; the UI speaks `ApiError` and `Page<T>`, not raw contract JSON.
