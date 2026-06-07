# Per-feature README (mandatory, enforced)

Every feature under `src/features/<feature>/` MUST have a local `README.md` describing the feature's purpose, public surface, and where it fits. The intent: no feature ships without a one-page primer a new contributor reads before touching it. Checked in CI by `scripts/check_feature_readmes.sh` — a missing README fails the PR.

## Required sections (in order)

1. **Purpose** — one paragraph: what the feature does for the user, what it does NOT own (boundaries with other features).
2. **Routes** — the route(s) this feature registers (`path`, screen, guard/auth), if any.
3. **Components** — the main components with one-line descriptions, marking container vs presentational.
4. **Hooks & state** — the query/mutation hooks (and their query keys) and any Zustand store, with invalidation notes.
5. **Consumed endpoints** — the backend endpoints this feature calls (`method path`), which trace to the OpenAPI schema (@.claude/rules/api-client.md). Detail lives in the schema; the README is the index.
6. **UI states** — how loading / empty / error are handled here.
7. **Accessibility notes** — key roles/labels/focus decisions for this feature.
8. **Cross-feature dependencies** — which other features/shared modules it relies on, and why.
9. **Decisions** — links to ADRs in `docs/decisions/` that affect this feature.

## Lifecycle

- A new feature is **born with a README** — newly scaffolded features copy `templates/FEATURE_README.md`. `/bootstrap` Mode A creates the example feature with its README from this template.
- The README is updated **in the same PR** as component/route/endpoint changes that affect it (the _Routes_, _Consumed endpoints_, and _Components_ sections are the most volatile). `reviewer` flags PRs that change a feature's components/routes without touching its README.
- **After GREEN, before the PR opens:** drop any RED-phase "target surface" framing, and reconcile _Routes_ and _Consumed endpoints_ against the live code, `.claude/memory/routes.json`, and the OpenAPI schema. The schema/routes registry are the source of truth.

## Enforcement (the gate)

- **`scripts/check_feature_readmes.sh`** — for each directory under `src/features/`, asserts a non-empty `README.md` exists. Exits non-zero with the missing feature names.
- **Reviewer / docs-writer at Quality Gate** — flag any PR that changes a feature's surface without updating its README.

## Binds these agents (rule is auto-loaded)

- `react-developer` — when creating a feature, copies `templates/FEATURE_README.md` and fills _Purpose_ + initial _Components_ before opening the PR.
- `ui-architect` — updates _Routes_ and _Consumed endpoints_ whenever the contract changes.
- `docs-writer` — owns the per-feature README in the docs pipeline; runs the gate locally.
- `reviewer` — blocks PRs that change a feature's surface without a README update.

> Goal: each feature is self-explanatory at the README level; the OpenAPI schema is the contract, the README is the map.
