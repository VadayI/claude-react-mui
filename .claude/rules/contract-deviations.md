# Contract issues & deviations (mandatory ledger)

This frontend consumes an external API contract (`VadayI/claude-api-contract`) and may never invent or
silently work around it (@.claude/rules/api-client.md, @.claude/rules/openapi-conventions.md). But the
frontend is often the **first** to discover a contract bug, ambiguity, a better design, or a temporary
gap between the UI it needs and the pinned contract. Every such finding is recorded in
**`docs/api/CONTRACT_ISSUES.md`** — a status-tracked ledger, the same governance pattern as the STUB
ledger (@.claude/rules/no-stubs.md) and the living plan (@.claude/rules/living-plan.md).

## When a ledger entry is mandatory

Append a row to `docs/api/CONTRACT_ISSUES.md` whenever the frontend:

- needs an endpoint/field the contract lacks (a missing-endpoint STUB is never a fix — it is a contract task);
- hits a schema ambiguity, or a shape that doesn't match the server's real behaviour;
- has a concretely better design than the contract currently describes;
- must ship against a UI need the pinned contract cannot yet satisfy (a temporary divergence).

A `// STUB:` placeholder standing in for a missing or broken endpoint MUST have a matching
`CONTRACT_ISSUES.md` row (in addition to its `docs/STUBS.md` entry).

## The two-way proposal loop

`frontend finds issue` → row in `CONTRACT_ISSUES.md` (`open`) → issue/PR in `VadayI/claude-api-contract`
(`proposed`) → maintainers `accepted`/`rejected` → released as a new tag (`implemented-in-contract`) →
bump `CONTRACT_VERSION` + `npm run api:pull && npm run api:types` + verify (`synced-in-frontend`).

This mirrors the contract repo's own discipline (breaking-change gate + tagged delivery): a contract
change is a deliberate, versioned event — never a silent frontend edit.

## Rules

- The ledger is **status-tracked**, not freeform notes — use the lifecycle and the columns defined in
  `docs/api/CONTRACT_ISSUES.md` (endpoint/operationId, what, why, frontend impact, proposal, linked
  contract PR/tag, linked frontend PR).
- Bumping `CONTRACT_VERSION` to pick up an accepted change is a deliberate, reviewed PR (@.claude/rules/api-client.md).
- NEVER fix the contract by hand-editing the vendored `src/lib/api/openapi.yml` — it breaks the contract-sync gate.

## Binds these agents (rule is auto-loaded)

- `ba` / `ui-architect` — when a needed endpoint/field is missing or ambiguous, open the ledger row before proposing any workaround.
- `react-developer` — never fakes a missing endpoint in production; marks a `// STUB:`, adds the `CONTRACT_ISSUES.md` row, and flags the contract task.
- `docs-writer` — keeps `docs/api/CONTRACT_ISSUES.md` consistent and updates sync status when `CONTRACT_VERSION` is bumped.
- `reviewer` — blocks a PR that works around the contract (faked endpoint/shape) without a `CONTRACT_ISSUES.md` row.

> Goal: every contract problem the frontend discovers becomes a tracked, proposable, resolvable ledger entry — never a silent fork from the contract.
