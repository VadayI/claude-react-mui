# API Index — {PROJECT_NAME}

> This file indexes the backend endpoints this frontend consumes. It is the **human index** only — the authoritative contract is the backend OpenAPI schema committed at `src/lib/api/openapi.yml`. If this table disagrees with that file, the schema is correct and this index is wrong.
>
> Update this table in the same PR as any change to the consumed endpoint surface (new query, new mutation, removed call). `docs-writer` runs the reconciliation (`routes.json <-> openapi.yml <-> this file`) before declaring a PR ready.

## How to keep in sync

1. Pull the latest schema: `npm run api:pull`
2. Regenerate types: `npm run api:types`
3. Check drift: `bash scripts/check_types_drift.sh`
4. Update the table below to match.

## Consumed endpoints

| Method | Path | Consumed by (feature) | Notes |
|---|---|---|---|
| `GET` | `/api/v1/{resource}/` | `{feature}` | {TODO: e.g. paginated list, supports ?search=} |
| `POST` | `/api/v1/{resource}/` | `{feature}` | {TODO: e.g. creates resource, returns 201} |
| `GET` | `/api/v1/{resource}/{id}/` | `{feature}` | {TODO} |
| `PATCH` | `/api/v1/{resource}/{id}/` | `{feature}` | {TODO} |
| `DELETE` | `/api/v1/{resource}/{id}/` | `{feature}` | {TODO: returns 204} |

> Remove the example rows above and replace with real entries as features are built. Do not list endpoints the frontend does not actually call.
