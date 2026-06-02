# Typed API client from the backend contract (enforced)

This is a **frontend-only** repository. It does not own the REST API — the backend repository does. The backend ships an **OpenAPI schema** (`drf-spectacular` in the `claude-django` backend) as the single source of truth for the contract. To make sure the frontend can **never silently drift** from that contract, the API types and a thin client are **generated from the schema** and the generation is **locked by a CI gate**, the mirror image of the backend's OpenAPI drift gate.

## What "the contract" means here

1. **The schema file** — the backend's `openapi.yml` is committed into this repo at `src/lib/api/openapi.yml`. It is updated by pulling the latest schema from the backend (a documented command), never hand-edited.
2. **Generated types** — `openapi-typescript` turns `openapi.yml` into `src/lib/api/schema.d.ts` (pure types, no runtime). Every request/response shape the UI uses comes from here. Hand-writing a DTO type that the schema already defines is forbidden.
3. **The thin client** — `src/lib/api/client.ts` wraps `fetch` (via `openapi-fetch` or a small typed wrapper) with the base URL, auth header injection, and error normalization. It is typed by `schema.d.ts`, so a wrong path/method/body is a **compile error**.
4. **View-model mappers** — where the API shape and the UI shape differ, a mapper in `src/features/<feature>/api/` converts DTO → view model. Mappers are unit-tested; components depend on view models, not raw DTOs.

## The gate — `scripts/check_types_drift.sh`

CI regenerates `schema.d.ts` from the committed `openapi.yml` and diffs it against the committed `schema.d.ts`. If they differ, the PR fails — exactly like the backend's `check_openapi_drift.sh`. This makes it physically impossible for the committed types to fall out of sync with the committed schema.

Run locally before pushing:

```bash
bash scripts/check_types_drift.sh
# or regenerate the committed types:
npm run api:types     # openapi-typescript src/lib/api/openapi.yml -o src/lib/api/schema.d.ts
```

Refreshing the schema from a newer backend (a deliberate, reviewed step):

```bash
npm run api:pull      # fetch the backend openapi.yml into src/lib/api/openapi.yml (URL from .env)
npm run api:types     # regenerate types
# review the diff — a breaking change (renamed/removed field, changed code) needs an ADR + a coordinated migration
```

## Lifecycle (per feature)

1. `ui-architect` reads the contract and declares which endpoints the feature consumes (method + path from the schema), and records the routes in `.claude/memory/routes.json`.
2. `tester` writes MSW handlers whose response shapes are taken **from the schema types**, so the mock cannot drift from the real API; tests fail RED.
3. `react-developer` implements the query/mutation against the typed client until GREEN; if a new endpoint is needed that the schema lacks, that is a **backend** task — STOP and flag it, do not fake the endpoint in production code (an inline fake is a `// STUB:` per @.claude/rules/no-stubs.md).
4. **Before opening the PR**: if `openapi.yml` changed, regenerate `schema.d.ts` and commit both. The drift gate will pass.
5. `docs-writer` keeps `docs/api/INDEX.md` (the consumed-endpoints index) in sync with the schema and `routes.json`.

## Rules

- **Never hand-author a type the schema defines.** Generate it. Local-only view models live next to the feature and are clearly not DTOs.
- **The client is the only place that talks HTTP.** Components and hooks call the client / TanStack Query, never `fetch` directly.
- **Auth tokens** are injected by the client from the auth store; they are never read from `localStorage` inside components (@.claude/rules/state-management.md, @.claude/rules/accessibility.md security notes in security-reviewer).
- **A breaking contract change is a versioned, coordinated event** — not a silent edit. Record it in an ADR and migrate the frontend in the same/linked PR.

## Binds these agents (rule is auto-loaded)

- `ui-architect` — the contract is incomplete until the consumed endpoints (from the schema) and the query keys are declared and recorded in `.claude/memory/routes.json`.
- `react-developer` — generates types, uses the typed client, runs the drift check locally, commits regenerated `schema.d.ts`.
- `state-architect` — owns the TanStack Query keys/cache invalidation tied to those endpoints.
- `docs-writer` — owns `docs/api/INDEX.md`; verifies the drift gate passes before declaring the PR ready.
- `reviewer` — blocks PRs where a hand-written DTO duplicates the schema, or where the schema/types diff suggests an un-migrated breaking change.

> Goal: the backend contract is the law; the frontend's types are re-derived from it on every build, so the UI is never coded against an imagined API.
