# Project architecture

## Contract-first, frontend-only

This repo is the **frontend**. The REST API contract is authored in the external `VadayI/claude-api-contract` repository and consumed here via a typed client generated from it. Both this frontend and the `claude-django` backend are fellow consumers — neither generates the canon. See @.claude/rules/api-contract.md. The UI never invents endpoints; a missing endpoint is a **contract-repo task** (`VadayI/claude-api-contract`), not a frontend fake.

Order of work on a feature:

1. The UI slice is built test-first: UI contract (routes/components/states) → outer Playwright test (RED) → inner Vitest/RTL tests with MSW (RED) → components/hooks/stores/client (GREEN) → docs.
2. If the feature needs a new endpoint, that is flagged to the contract repo; the frontend codes against the schema once it exists (or a `// STUB:` + ledger entry while waiting, never a silent fake).

## Project structure (feature-sliced)

```
src/
├── app/                    # application shell
│   ├── App.tsx             # root, providers composed here
│   ├── router.tsx          # React Router data router (routes + loaders)
│   ├── providers/          # QueryClientProvider, ThemeProvider, etc.
│   └── guards/             # route guards (auth/role)
├── theme/                  # central MUI theme (palette, typography, components)
├── lib/
│   ├── api/                # openapi.yml, schema.d.ts (generated), client.ts
│   └── query/              # QueryClient + defaults
├── components/             # shared, generic presentational components
├── features/               # domain features (one folder per feature)
│   └── <feature>/
│       ├── api/            # endpoint wrappers, query keys, DTO→view-model mappers
│       ├── hooks/          # use<Feature> query/mutation hooks
│       ├── components/     # feature components (container + presentational)
│       ├── store/          # feature-local Zustand store(s) — or store.ts for a single store
│       └── README.md       # feature primer (@.claude/rules/feature-readme.md)
├── test/                   # test setup, MSW server, factories
└── mocks/                  # MSW handlers + browser worker (dev)
e2e/                        # Playwright specs
```

## Layers and boundaries

| Layer                     | Purpose                               | Rule                                                |
| ------------------------- | ------------------------------------- | --------------------------------------------------- |
| Pages/routes              | compose a screen, wire data           | thin; delegate rendering to components              |
| Container components      | fetch via hooks, hold local UI state  | no presentation details                             |
| Presentational components | render props, emit callbacks          | pure, no data fetching — easy to test               |
| Hooks                     | server-state (Query) & reusable logic | one concern per hook                                |
| Stores (Zustand)          | shared client-state only              | no server data (@.claude/rules/state-management.md) |
| API layer                 | typed client + mappers                | the only place that talks HTTP                      |
| Theme                     | design tokens                         | no magic values in components                       |

## Principles

- **Simplicity first.** No premature abstraction or global store.
- **Presentational/container split** so rendering is testable in isolation.
- **Every screen — with tests (RTL + Playwright), the four states, and a feature README entry.**
- **Server-state in Query, client-state in Zustand/local** — never blurred.

> **Skill:** activate the `architecture-designer` skill for layer-boundary and feature-folder recipes.
