# Typed API client from the external contract repo (enforced)

This is a **frontend-only** repository. It does not own the REST API — the **external contract repository `VadayI/claude-api-contract`** does. That repo is the single source of truth; `openapi.yml` is vendored here at `src/lib/api/openapi.yml` by pulling the pinned tag. The frontend can **never silently drift** from the contract because two CI gates enforce it.

## What "the contract" means here

1. **The schema file** — `src/lib/api/openapi.yml` is vendored from `VadayI/claude-api-contract` at the tag pinned in `CONTRACT_VERSION`. It is updated by `npm run api:pull` (which reads `CONTRACT_REPO` + `CONTRACT_VERSION`), never hand-edited.
2. **Generated types** — `openapi-typescript` turns `openapi.yml` into `src/lib/api/schema.d.ts` (pure types, no runtime). Every request/response shape the UI uses comes from here. Hand-writing a DTO type that the schema already defines is forbidden.
3. **The thin client** — `src/lib/api/client.ts` wraps `fetch` (via `openapi-fetch`) with the base URL, auth header injection, and error normalization. It is typed by `schema.d.ts`, so a wrong path/method/body is a **compile error**.
4. **View-model mappers** — where the API shape and the UI shape differ, a mapper in `src/features/<feature>/api/` converts DTO → view model. Mappers are unit-tested; components depend on view models, not raw DTOs.

## The gates

**Gate 1 — `scripts/check_types_drift.sh`**

CI regenerates `schema.d.ts` from the committed `openapi.yml` and diffs it against the committed `schema.d.ts`. If they differ, the PR fails.

```bash
bash scripts/check_types_drift.sh
# or regenerate:
npm run api:types     # openapi-typescript src/lib/api/openapi.yml -o src/lib/api/schema.d.ts
```

**Gate 2 — `scripts/check_contract_sync.sh`**

CI fetches the contract from GitHub raw at the pinned tag, computes sha256, and compares it against both the vendored `src/lib/api/openapi.yml` and `contract.lock.json`. If they differ (someone hand-edited the vendor file or the lock is stale), the PR fails.

```bash
bash scripts/check_contract_sync.sh
```

## Refreshing the contract pin (deliberate, reviewed step)

```bash
# 1. Bump CONTRACT_VERSION in .env (and commit the change)
# 2. Pull the new contract
CONTRACT_VERSION=v0.2.0 npm run api:pull
# 3. Recompute sha256 and update contract.lock.json
sha256sum src/lib/api/openapi.yml
# update contract.lock.json with the new version + sha256
# 4. Regenerate types
npm run api:types
# 5. Review the diff — a breaking change needs an ADR + coordinated migration
# 6. Commit openapi.yml + schema.d.ts + contract.lock.json + .env together
```

Bumping `CONTRACT_VERSION` is a **deliberate PR** — not an automatic drift.

## Lifecycle (per feature)

1. `ui-architect` reads the contract and declares which endpoints the feature consumes (method + path from the schema), and records the routes in `.claude/memory/routes.json`.
2. `tester` writes MSW handlers whose response shapes are taken **from the schema types**, so the mock cannot drift from the real API; tests fail RED.
3. `react-developer` implements the query/mutation against the typed client until GREEN; if a new endpoint is needed that the schema lacks, that is a **contract-repo** task — STOP and flag it, do not fake the endpoint in production code (an inline fake is a `// STUB:` per @.claude/rules/no-stubs.md), and record it in `docs/api/CONTRACT_ISSUES.md` (@.claude/rules/contract-deviations.md).
4. **Before opening the PR**: run `bash scripts/check_types_drift.sh` and `bash scripts/check_contract_sync.sh` locally. Both must pass.
5. `docs-writer` keeps `docs/api/INDEX.md` (the consumed-endpoints index) in sync with the schema and `routes.json`.

## Rules

- **Never hand-author a type the schema defines.** Generate it. Local-only view models live next to the feature and are clearly not DTOs.
- **The client is the only place that talks HTTP.** Components and hooks call the client / TanStack Query, never `fetch` directly.
- **Auth tokens** are injected by the client from the auth store; they are never read from `localStorage` inside components (@.claude/rules/state-management.md).
- **A breaking contract change is a versioned, coordinated event** — not a silent edit. The contract repo gates it (oasdiff); the frontend must bump its pin deliberately.
- **The backend (`claude-django`) is also a consumer of `VadayI/claude-api-contract`** — it does not generate the schema. If an endpoint is missing from the contract, the fix belongs in the contract repo, not in the backend directly.

## Binds these agents (rule is auto-loaded)

- `ui-architect` — the contract is incomplete until the consumed endpoints (from the schema) and the query keys are declared and recorded in `.claude/memory/routes.json`.
- `react-developer` — generates types, uses the typed client, runs both drift checks locally, commits regenerated `schema.d.ts`.
- `state-architect` — owns the TanStack Query keys/cache invalidation tied to those endpoints.
- `docs-writer` — owns `docs/api/INDEX.md`; verifies both drift gates pass before declaring the PR ready.
- `reviewer` — blocks PRs where a hand-written DTO duplicates the schema, or where the schema/types diff suggests an un-migrated breaking change.

> Goal: the contract repo is the law; the frontend's types are re-derived from it on every build, so the UI is never coded against an imagined API.

> **Skill:** activate the `api-client-typing` skill for the openapi-typescript workflow and typed-client recipes.
