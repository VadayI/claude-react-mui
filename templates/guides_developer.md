# Developer Guide — {PROJECT_NAME}

> For the **developer** integrating with or contributing to this frontend. Covers local setup, the API contract workflow, architecture, and the feature pipeline. Commands are copy-paste runnable.

---

## Overview

{TODO: One paragraph — what this frontend does, which backend it consumes, and the high-level technical approach.}

This is a **frontend-only** repository. Both this frontend and the backend are consumers of the `VadayI/claude-api-contract` REST API schema — neither generates the canon. The contract is vendored at `src/lib/api/openapi.yml` via `npm run api:pull`.

---

## Run it locally

### Prerequisites

- Node 20+ (`node --version`)
- npm 10+ (`npm --version`)
- A running backend instance (or a mock — see MSW section below)

### First-time setup

```bash
git clone {REPO_URL}
cd {PROJECT_SLUG}
npm ci
cp .env.example .env
# Edit .env: set VITE_API_BASE_URL to your running backend, e.g. http://localhost:8000
#            set CONTRACT_VERSION to the pinned tag, e.g. v0.2.0
npm run api:pull      # fetch openapi.yml from VadayI/claude-api-contract
npm run api:types     # generate src/lib/api/schema.d.ts
npm run dev           # http://localhost:5173
```

### Everyday commands

```bash
npm run dev           # dev server with HMR
npm run build         # production build (output: dist/)
npm run preview       # serve the production build locally
npm run test          # Vitest watch mode
npm run test:run      # single-pass (CI)
npm run test:cov      # with coverage report
npm run e2e           # Playwright (requires dev or preview server)
npm run e2e:ui        # Playwright interactive UI
npm run lint          # ESLint
npm run lint:fix      # ESLint with auto-fix
npm run format        # Prettier
npm run typecheck     # tsc --noEmit
```

---

## The API contract

### Pulling the schema

```bash
npm run api:pull      # downloads openapi.yml → src/lib/api/openapi.yml
```

`CONTRACT_VERSION` in `.env` pins the release tag from `VadayI/claude-api-contract` (e.g. `v0.2.0`). The downloaded file is **committed** — it is the locked contract snapshot for this frontend version. `contract.lock.json` records the sha256 for integrity verification.

### Generating TypeScript types

```bash
npm run api:types     # runs openapi-typescript → src/lib/api/schema.d.ts
```

`schema.d.ts` is **committed** and kept in sync with `openapi.yml` by the CI drift gate. Never edit it by hand.

### Drift gate

```bash
bash scripts/check_types_drift.sh
```

CI fails if `schema.d.ts` is stale relative to the committed `openapi.yml`. Run this locally before pushing.

### Viewing the contract

- **Full contract** — `VadayI/claude-api-contract` (authoritative source)
- **Committed snapshot** — `src/lib/api/openapi.yml`
- **Human index** — `docs/api/INDEX.md`
- **Swagger UI** — {SWAGGER_UI_URL} (requires a running backend; convenience only, not the canon)

---

## Architecture

### Feature-sliced layout

```
src/
  features/          # one folder per domain feature
    {feature}/
      components/    # UI components (container + presentational)
      hooks/         # custom hooks (queries, mutations, local state)
      pages/         # route-level page components
      store/         # Zustand slice (if needed)
      tests/         # Vitest + RTL unit/integration tests
      README.md      # mandatory (gate: check_feature_readmes.sh)
  lib/
    api/
      openapi.yml    # committed schema snapshot
      schema.d.ts    # generated types (committed, kept in sync by drift gate)
      client.ts      # axios/fetch instance configured with base URL
    query/           # TanStack Query client + global config
  store/             # root Zustand store (composes feature slices)
  theme/             # MUI theme config
  router/            # React Router route definitions + guards
```

### Routing & guards

Routes are defined centrally in `src/router/`. Protected routes render an auth guard component that redirects unauthenticated users to the sign-in page. Route-level code splitting is applied with `React.lazy` + `Suspense`.

### TanStack Query vs Zustand — when to use each

| Concern                                                        | Tool                                               |
| -------------------------------------------------------------- | -------------------------------------------------- |
| Server data (API responses, caching, background refetch)       | TanStack Query                                     |
| Client-only UI state (sidebar open, selected tab, wizard step) | Zustand                                            |
| Auth tokens / session                                          | Zustand (in-memory only — never persist tokens)    |

Never mirror server data into Zustand manually — let Query own the cache.

### Theme

MUI theme is configured in `src/theme/`. Override component defaults there, not with inline `sx` props on individual components. Design tokens (palette, typography, spacing) live in the theme config so they are consistent and SSR-safe.

---

## Add a feature (pipeline)

All non-trivial changes go through the feature pipeline. Do not skip steps.

```
ba → ui-architect → tester (RED) → react-developer (GREEN)
  → [reviewer | security-scanner | state-architect]
  → docs-writer
```

1. **Branch** off fresh `main`:
   ```bash
   git checkout main && git pull
   git checkout -b feat/{slug}
   ```
2. **`ba`** — write user stories and acceptance criteria.
3. **`ui-architect`** — define component tree, routes, query keys, consumed endpoints. Records routes in `.claude/memory/routes.json`.
4. **`tester` (RED)** — write failing Vitest + RTL tests and MSW handlers. Tests must fail for the right reason.
5. **`react-developer` (GREEN)** — implement until tests pass. Run `npm run typecheck && npm run lint`.
6. **Quality Gate (parallel)** — `reviewer`, `security-scanner`, `state-architect` produce independent reports.
7. **`docs-writer`** — updates `src/features/{feature}/README.md`, `docs/api/INDEX.md`, `docs/verify/{feature}.md`, WORKLOG.
8. **PR** — CI must be green. `docs-writer` opens the PR with `gh pr create`.

### Gate scripts (run before opening the PR)

```bash
bash scripts/check_types_drift.sh
bash scripts/check_stubs.sh
bash scripts/check_file_size.sh
bash scripts/check_feature_readmes.sh
# or: make gates
```

---

## Where to go next

- **User guide** — `docs/guides/user.md`
- **Feature READMEs** — `src/features/*/README.md`
- **API index** — `docs/api/INDEX.md`
- **Verification guides** — `docs/verify/`
- **Decisions** — `docs/decisions/`
- **Backlog** — `docs/todo.md`
