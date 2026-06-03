# User-facing guides (mandatory, enforced at the Quality Gate)

The route/component contract and `docs/verify/<feature>.md` prove the UI is correct for a *reviewer*. They do NOT tell a **real user** or an **integrating developer** how to actually use the app. This rule mandates two living guides that grow with the project:

1. **`docs/guides/user.md`** — for the **end user** of the app: what the app does, how to sign in, how to perform the main flows, where things are, and how to recover from common errors.
2. **`docs/guides/developer.md`** — for a **developer working on or integrating with this frontend**: how to run it, environment variables, how the API contract is consumed and refreshed (`api:pull`/`api:types`), how routing/auth/state are structured, how to add a feature, and where the full contract lives (the backend OpenAPI schema / Swagger).

These are **narrative onboarding documents**, not a component dump. The contract is the OpenAPI schema (@.claude/rules/api-client.md); the per-feature manual smoke test is `docs/verify/` (@.claude/rules/verification.md). The guides are the **"how do I get started"** layer above both.

## Required sections

### `docs/guides/user.md` (in order)

1. **Overview** — one paragraph: what the app does, who it's for.
2. **Getting in** — how to reach the app (URL), sign-in/sign-up flow if any.
3. **Main flows** — step-by-step for the primary user journeys the app actually ships (name the real screens/buttons).
4. **Tips & recovery** — empty states, common errors and what to do, where settings live.
5. **Where to go next** — links to support/help if applicable.

### `docs/guides/developer.md` (in order)

1. **Overview** — stack, that it's a frontend consuming a separate backend API.
2. **Run it locally** — prerequisites (Node 20.19+), `npm ci`, `cp .env.example .env` + which `VITE_*` vars to fill (base API URL, OpenAPI URL), `npm run dev`. Copy-paste runnable; dev URL `http://localhost:5173`.
3. **The API contract** — how the typed client/types are generated from the backend OpenAPI (`npm run api:pull`, `npm run api:types`), the drift gate, where `openapi.yml`/`schema.d.ts` live, and the link to the backend's Swagger/Redoc.
4. **Architecture** — feature-sliced layout, routing/guards, server-state (Query) vs client-state (Zustand), the theme.
5. **Add a feature** — the pipeline in one paragraph (contract → RED tests → GREEN → docs), where files go, the feature README requirement.
6. **Where to go next** — `docs/verify/`, ADRs, the backend repo.

Keep both copy-paste runnable and **derived from what the project actually ships** — real routes, real env vars, real scripts. Never invent a screen or command the code lacks; if a capability is not built yet, write "not yet available".

## Source of truth & reconciliation

- **Routes/flows** in `user.md` and **commands/env/endpoints** in `developer.md` MUST exist in the live code (`src/app/router.tsx`, `package.json` scripts, `.env.example`) and the OpenAPI schema. `guide-writer` verifies these before declaring the guide ready.

## Lifecycle (grows with the project)

1. **Born at bootstrap.** `/bootstrap` Mode A copies `templates/guides_user.md` → `docs/guides/user.md` and `templates/guides_developer.md` → `docs/guides/developer.md` as skeletons with `{TODO}` markers.
2. **Updated in the same PR** as user-visible surface changes (a new flow, a new auth method, a new top-level route, a new env var) — by `guide-writer` in the Documentation phase. Most volatile: *Main flows* (user) and *Run it locally* + *The API contract* (developer).
3. **Verified on demand** via `/guides`.

## Enforcement (Quality Gate, not a CI script)

No standalone shell gate; quality is narrative, judged by `reviewer` at the Quality Gate plus `guide-writer` in the docs phase:

- `reviewer` blocks a PR that changes user-visible surface — a new/changed **auth flow**, **top-level route**, **first-run step**, or a new **env var** — without updating the relevant guide. A stale "Run it locally" or "Main flows" section is 🟡 Important.
- `guide-writer` runs the reconciliation (every route/command/endpoint the guide names traces to code/schema) before declaring the PR ready.

## Binds these agents (rule is auto-loaded)

- `guide-writer` — owns both guides; creates them from templates, keeps them in sync, runs the reconciliation.
- `ui-architect` — when a contract change adds/removes an auth flow or top-level route, notes that `user.md`/`developer.md` need updating.
- `react-developer` — when adding an env var or changing the run flow, flags that `developer.md` needs updating.
- `docs-writer` — coordinates with `guide-writer` so guides, `docs/api/`, and `docs/verify/` stay consistent.
- `reviewer` — blocks PRs that change first-run / auth / top-level routes / env without a guide update.

> Goal: at every commit, a user can operate the app and a developer can run it and make their first successful API-backed screen by reading two short, always-current guides.
