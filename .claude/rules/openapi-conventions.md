# OpenAPI schema hygiene (clean generated types, enforced)

The typed client and all DTO types are generated from the **external contract** (`VadayI/claude-api-contract`, vendored at the pinned tag via `npm run api:pull`) (@.claude/rules/api-client.md). Garbage in the schema = garbage in `schema.d.ts`. This rule states the contract the schema must satisfy and what the frontend does when it doesn't.

## Requirements on the contract schema

- **Stable `operationId`s** — they become type/function names; a rename is a breaking change and needs an ADR.
- **Named components & enums** — inline anonymous objects produce unusable nested types; enums are named (post-processing hook) so they map to TS unions.
- **No lint warnings** — TypeSpec + Spectral lint in `VadayI/claude-api-contract` enforce schema quality; a schema with violations is not accepted for release. (`drf-spectacular` in `claude-django` is used only for Swagger UI / Redoc — it is NOT the canonical schema source.)
- **Errors not paginated** — `ENABLE_LIST_MECHANICS_ON_NON_2XX = False` convention (see @.claude/rules/api-error-and-pagination.md).

## Frontend handling

- If the schema is missing or ambiguous for an endpoint the UI needs, that is a **contract-repo task** (`VadayI/claude-api-contract`) — STOP and flag it; do not hand-write the DTO (a hand-written type duplicating the schema is forbidden, @.claude/rules/api-client.md). An inline fake is a `// STUB:` (@.claude/rules/no-stubs.md).
- A defective schema is fixed in the **contract repo** (`VadayI/claude-api-contract`), then `npm run api:pull` + `npm run api:types`; the change is reflected in `docs/api/INDEX.md` and locked by the drift gate.

## Binds these agents (rule is auto-loaded)

- `ui-architect` — declares consumed endpoints by `operationId` / path; flags schema gaps to the contract repo.
- `react-developer` — regenerates types; never patches `schema.d.ts` by hand.
- `docs-writer` — keeps `docs/api/INDEX.md` in sync; verifies the drift gate is green.
- `reviewer` — blocks hand-written DTOs and un-ADR'd `operationId` renames.

> Goal: generated types are clean because the schema is clean; schema defects are fixed in the contract repo, never patched on the frontend.
