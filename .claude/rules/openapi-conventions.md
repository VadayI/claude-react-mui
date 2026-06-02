# OpenAPI schema hygiene (clean generated types, enforced)

The typed client and all DTO types are generated from the backend's `openapi.yml` (@.claude/rules/api-client.md). Garbage in the schema = garbage in `schema.d.ts`. This rule states the contract the schema must satisfy and what the frontend does when it doesn't.

## Requirements on the schema (drf-spectacular)

- **Stable `operationId`s** — they become type/function names; a rename is a breaking change and needs an ADR.
- **Named components & enums** — inline anonymous objects produce unusable nested types; enums are named (post-processing hook) so they map to TS unions.
- **No `spectacular --validate` warnings** — a schema with warnings is not accepted for generation.
- **Errors not paginated** — `ENABLE_LIST_MECHANICS_ON_NON_2XX = False` (see @.claude/rules/api-error-and-pagination.md).

## Frontend handling

- If the schema is missing or ambiguous for an endpoint the UI needs, that is a **backend task** — STOP and flag it; do not hand-write the DTO (a hand-written type duplicating the schema is forbidden, @.claude/rules/api-client.md). An inline fake is a `// STUB:` (@.claude/rules/no-stubs.md).
- A defective schema is fixed at the backend, then `npm run api:pull` + `npm run api:types`; the change is reflected in `docs/api/INDEX.md` and locked by the drift gate.

## Binds these agents (rule is auto-loaded)

- `ui-architect` — declares consumed endpoints by `operationId` / path; flags schema gaps to the backend.
- `react-developer` — regenerates types; never patches `schema.d.ts` by hand.
- `docs-writer` — keeps `docs/api/INDEX.md` in sync; verifies the drift gate is green.
- `reviewer` — blocks hand-written DTOs and un-ADR'd `operationId` renames.

> Goal: generated types are clean because the schema is clean; schema defects are fixed at the backend, never patched on the frontend.
