# API contract — typed client, errors, pagination, deviations (enforced)

This is a **frontend-only** repository. It does not own the REST API — the **external contract repository `VadayI/claude-api-contract`** does. That repo is the single source of truth; `openapi.yml` is vendored here at `src/lib/api/openapi.yml` by pulling the pinned tag (`npm run api:pull`, reading `CONTRACT_REPO` + `CONTRACT_VERSION`). The frontend can **never silently drift** from the contract — two CI gates enforce it. The backend (`claude-django`) is also a consumer of the contract — it does NOT generate the schema; if an endpoint is missing, the fix belongs in the contract repo, not in the backend directly.

## What "the contract" means here

1. **The schema file** — `src/lib/api/openapi.yml`, vendored at the tag pinned in `CONTRACT_VERSION`. Updated only by `npm run api:pull`, never hand-edited.
2. **Generated types** — `openapi-typescript` turns `openapi.yml` into `src/lib/api/schema.d.ts` (pure types, no runtime). Every request/response shape the UI uses comes from here. **Hand-writing a DTO type the schema already defines is forbidden**; never patch `schema.d.ts` by hand. Local-only view models live next to the feature and are clearly not DTOs.
3. **The thin client** — `src/lib/api/client.ts` wraps `fetch` (via `openapi-fetch`) with the base URL, auth-header injection, and error normalization. It is typed by `schema.d.ts`, so a wrong path/method/body is a **compile error**. **The client is the only place that talks HTTP** — components and hooks call the client / TanStack Query, never `fetch` directly. Auth tokens are injected by the client from the auth store (@.claude/rules/auth.md), never read inside components.
4. **View-model mappers** — where the API shape and the UI shape differ, a mapper in `src/features/<feature>/api/` converts DTO → view model. Mappers are unit-tested; components depend on view models, not raw DTOs.

## The two gates

**Gate 1 — types drift (`scripts/check_types_drift.sh`)**: CI regenerates `schema.d.ts` from the committed `openapi.yml` and diffs it against the committed one; any difference fails the PR.

**Gate 2 — contract sync (`scripts/check_contract_sync.sh`)**: CI fetches the contract from GitHub raw at the pinned tag, computes sha256, and compares it against both the vendored `openapi.yml` and `contract.lock.json`; a hand-edited vendor file or stale lock fails the PR.

```bash
bash scripts/check_types_drift.sh && bash scripts/check_contract_sync.sh
npm run api:types     # regenerate schema.d.ts when the schema legitimately changed
```

## Refreshing the contract pin (deliberate, reviewed PR)

```bash
# 1. Bump CONTRACT_VERSION in .env (and commit the change)
CONTRACT_VERSION=v0.X.0 npm run api:pull
# 2. Recompute sha256 → update contract.lock.json (version + sha256)
sha256sum src/lib/api/openapi.yml
# 3. Regenerate types and review the diff — a breaking change needs an ADR + coordinated migration
npm run api:types
# 4. Commit openapi.yml + schema.d.ts + contract.lock.json + .env together
```

A breaking contract change is a **versioned, coordinated event** — the contract repo gates it (oasdiff); the frontend bumps its pin deliberately, never silently.

## Schema hygiene (what the contract must satisfy)

- **Stable `operationId`s** — they become type/function names; a rename is a breaking change and needs an ADR.
- **Named components & enums** — inline anonymous objects produce unusable nested types; enums are named so they map to TS unions.
- **No lint warnings** — TypeSpec + Spectral lint in the contract repo enforce schema quality. (`drf-spectacular` in `claude-django` is only Swagger UI / Redoc — NOT the canonical schema source.)
- **Errors are never paginated** (`ENABLE_LIST_MECHANICS_ON_NON_2XX = False` convention) — error and pagination envelopes stay distinct, and both trace to `schema.d.ts`, never hand-written.

If the schema is missing or ambiguous for an endpoint the UI needs, that is a **contract-repo task** — STOP and flag it; do not hand-write the DTO and do not fake the endpoint in production code. An inline fake is a `// STUB:` (@.claude/rules/no-stubs.md) AND a ledger row (below). A defective schema is fixed in the contract repo, then `npm run api:pull && npm run api:types`.

## Errors — one normalizer

The contract defines two error shapes (see `schema.d.ts` — `ErrorDetail`, `ValidationErrors`, `FieldError`):

- **Simple errors** (401, 403, 404, 409, 429, 5xx) — `ErrorDetail { detail: string }`.
- **Validation errors** (400) — `ValidationErrors { errors: FieldError[] }` where `FieldError { field, code, message }`.

The client maps every non-2xx into one typed `ApiError { status, code, detail, fieldErrors? }`; components never parse raw payloads:

- **Field (400) errors** map onto form fields via react-hook-form `setError` (@.claude/rules/forms-and-validation.md) — **never a toast**.
- Non-field errors (401/403/404/409/5xx) surface as the component's **error state** (@.claude/rules/component-contract.md) with a retry affordance.

## Pagination — typed envelope

List responses use `{ count, next, previous, results }`. A typed `Page<T>` mapper lives in `src/lib/api`; features consume `Page<T>`, never the raw envelope. Infinite lists use TanStack `useInfiniteQuery` with `getNextPageParam` derived from `next`; page-number lists derive the param from the URL.

## Retry policy

Set once on the QueryClient (@.claude/rules/state-management.md): **never retry 4xx**; retry idempotent reads on 5xx/network with backoff. Mutations are not retried by default.

## Contract issues & deviations — the ledger (`docs/api/CONTRACT_ISSUES.md`)

The frontend is often the **first** to discover a contract bug, ambiguity, a better design, or a gap between the UI it needs and the pinned contract. Every such finding becomes a row in the **status-tracked ledger** — never a silent workaround. A row is mandatory whenever the frontend:

- needs an endpoint/field the contract lacks (a missing-endpoint STUB is never a fix — it is a contract task);
- hits a schema ambiguity, or a shape that doesn't match the server's real behaviour;
- has a concretely better design than the contract currently describes;
- must ship against a UI need the pinned contract cannot yet satisfy (a temporary divergence).

A `// STUB:` standing in for a missing or broken endpoint MUST have a matching ledger row (in addition to its `docs/STUBS.md` entry).

**The two-way loop:** row (`open`) → issue/PR in `VadayI/claude-api-contract` (`proposed`) → maintainers `accepted`/`rejected` → released as a new tag (`implemented-in-contract`) → bump `CONTRACT_VERSION` + `npm run api:pull && npm run api:types` + verify (`synced-in-frontend`). Use the lifecycle and columns defined in the ledger file (endpoint/operationId, what, why, frontend impact, proposal, linked contract PR/tag, linked frontend PR). NEVER "fix" the contract by hand-editing the vendored `src/lib/api/openapi.yml` — it breaks Gate 2.

## Lifecycle (per feature)

1. `ui-architect` reads the contract and declares which endpoints the feature consumes (method + path / `operationId` from the schema), and records the routes in `.claude/memory/routes.json`.
2. `tester` writes MSW handlers whose response shapes are taken **from the schema types**, so the mock cannot drift from the real API; tests fail RED.
3. `react-developer` implements the query/mutation against the typed client until GREEN; a missing endpoint → STOP, mark `// STUB:`, add the ledger row, flag the contract task.
4. **Before opening the PR**: both gates green locally.
5. `docs-writer` keeps `docs/api/INDEX.md` (the consumed-endpoints index) in sync with the schema and `routes.json`, and updates the ledger's sync status when `CONTRACT_VERSION` is bumped.

## Binds these agents (rule is auto-loaded)

- `ba` / `ui-architect` — consumed endpoints declared from the schema (by `operationId`/path); a missing or ambiguous endpoint → ledger row BEFORE any workaround.
- `react-developer` — generates types, uses the typed client, runs both gates locally, commits regenerated `schema.d.ts`; never fakes endpoints, never patches `schema.d.ts` or the vendored `openapi.yml` by hand.
- `state-architect` — owns the QueryClient retry defaults and the query keys / cache invalidation tied to those endpoints, including infinite-query keys.
- `tester` — MSW handlers return contract-compliant shapes (`ErrorDetail` / `ValidationErrors` / paginated envelope); triangulates empty/one/many/error.
- `docs-writer` — owns `docs/api/INDEX.md` and keeps `docs/api/CONTRACT_ISSUES.md` consistent; verifies both gates pass before declaring the PR ready.
- `reviewer` — blocks hand-written DTOs duplicating the schema, raw-envelope parsing in components, toasted field errors, 4xx retries, un-ADR'd `operationId` renames, and any contract workaround without a ledger row.

> Goal: the contract repo is the law — the frontend's types are re-derived from it on every build, every error and page is normalized once at the boundary, and every deviation is a tracked, proposable, resolvable ledger entry; the UI is never coded against an imagined API.

> **Skill:** activate the `api-client-typing` skill for the openapi-typescript workflow and typed-client recipes.
