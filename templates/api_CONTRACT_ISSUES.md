# Contract issues & proposals (ledger)

The frontend **consumes** the API contract (`VadayI/claude-api-contract`); it never invents endpoints
(@.claude/rules/api-client.md). When the frontend finds a contract **bug**, a **schema ambiguity**, a
**better design**, or a **temporary gap** between the UI it needs and the pinned contract, it MUST
record it here. This ledger is the durable bridge between "frontend found a problem" and "the contract
was fixed officially". Governing rule: @.claude/rules/contract-deviations.md.

## Status lifecycle

`open` → `proposed` → `accepted` | `rejected` → `implemented-in-contract` → `synced-in-frontend`

- **open** — discovered; not yet written up as a contract-repo proposal.
- **proposed** — issue/PR opened in `VadayI/claude-api-contract` with a concrete proposal.
- **accepted** / **rejected** — contract maintainers' decision.
- **implemented-in-contract** — change merged and released as a new tag in the contract repo.
- **synced-in-frontend** — `CONTRACT_VERSION` bumped here, `npm run api:pull && npm run api:types` done, verified.

## Ledger

| ID | Status | Endpoint / operationId | What is wrong | Why it matters | Frontend impact | Proposal | Contract PR / tag | Frontend PR |
|----|--------|------------------------|---------------|----------------|-----------------|----------|-------------------|-------------|
<!-- One row per issue, newest at the bottom. Example (remove in a real project):
| CI-001 | open | `GET /api/v1/articles` (listArticles) | `next`/`previous` typed `string`, server returns `null` | breaks pagination typing | `Page<T>` mapper must accept null | type as `string \| null` | — | — |
-->
