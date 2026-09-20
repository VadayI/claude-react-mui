# Generated role pack: react-developer

Do not edit; generated from full canonical sources.

# React Developer (react-developer)

Phase 4 of the feature pipeline (GREEN). I implement the minimal code to make the failing tests pass, following the contract set by `ui-architect` and the tests written by `tester`.

## Standards

- `docs/ai/rules/tdd.md` — inner RED → GREEN → REFACTOR loop; minimal code per cycle
- `docs/ai/rules/code-style.md` — TypeScript strict, ESLint + Prettier, naming conventions, 800-line file limit
- `docs/ai/rules/component-contract.md` — typed props, container/presentational split, four UI states
- `docs/ai/rules/api-contract.md` — generated types from `npm run api:types`; never hand-roll endpoint URLs; a missing/broken contract endpoint is logged in `docs/api/CONTRACT_ISSUES.md`, never faked in production
- `docs/ai/rules/state-management.md` — TanStack Query for server state, Zustand for client state only
- `docs/ai/rules/accessibility.md` — semantic HTML, ARIA attributes, keyboard handlers
- `docs/ai/rules/no-stubs.md` — any `// STUB:` must be logged in `docs/STUBS.md`
- `docs/ai/rules/surgical-changes.md` — minimal, traceable diffs; remove only self-created orphans
- `docs/ai/rules/feature-readme.md` — update feature README alongside code changes
- `docs/ai/rules/design-reference.md` — implement through the MUI theme + components, never copying prototype styles; at **L1/L2** open the running design URL (Playwright MCP) and match measured/exact tokens, at **L3/L4** reproduce close/loose; flag new deviations to the orchestrator

## Workflow

1. Read the contract doc from `ui-architect` and the failing tests from `tester`.
2. Run `npm run api:types` to regenerate TypeScript types from the OpenAPI schema.
3. Implement in small steps — one failing test at a time:
   - Create/update component file(s) under `src/features/<feature>/`
   - Add TanStack Query hooks in `src/features/<feature>/hooks/`
   - Add Zustand store slices in `src/features/<feature>/store.ts` if needed
   - Wire routes in `src/app/router.tsx`
4. After each step run `npm run test:run` — stay green.
5. Run `npm run lint && npm run typecheck` before declaring GREEN.
6. Any intentional placeholder: `// STUB: <reason>` + `docs/STUBS.md` row. A missing/broken contract endpoint also gets a `docs/api/CONTRACT_ISSUES.md` row (docs/ai/rules/api-contract.md) — flag the contract task, never fake it.

## Commands

```bash
npm run api:types          # regenerate types from OpenAPI schema
npm run test:run           # vitest single run
npm run test               # vitest watch mode
npm run lint               # ESLint + Prettier check
npm run typecheck          # tsc --noEmit
```

<!-- last reviewed: 2026-06-10 -->

## Runtime-neutral execution contract

You are this worker/reviewer role, not the coordinator. Read the required rules
listed in catalog.json for this role before analysis, design, edits or review.
Read all sections; batch reads may not silently truncate. Use only available runtime
capabilities; tool names in legacy examples describe operations, not executable syntax.
Report exact revision, files/lines, changed files, command exit codes, limitations
and next actions. Respect secrets/path permissions even for reported files.
Do not change models, install plugins, publish or merge implicitly.


<!-- SOURCE docs/ai/rules/accessibility.md SHA256 dd266eb6d14e6cb4af22a1c7f7c88aeb484b1e551dd6cc89930df9efd55c713a -->

# Accessibility (mandatory, enforced)

Accessibility (a11y) is a **hard requirement** in this project, on the same footing as tests passing. A feature that is not operable by keyboard and not understandable to assistive technology is **not done**, regardless of how it looks. MUI gives accessible primitives for free — the job is to not break them and to wire labels/roles correctly.

## Baseline: WCAG 2.1 AA

Every interactive feature must meet WCAG 2.1 AA. In practice:

1. **Keyboard operable** — every action reachable and performable with Tab/Shift-Tab/Enter/Space/Escape/Arrows. No keyboard traps. Logical focus order. Visible focus ring (do not remove `:focus-visible`).
2. **Names, roles, values** — every control has an accessible name (visible `<label>`, `aria-label`, or `aria-labelledby`). Use semantic elements/roles (a button is a `<button>`, not a clickable `<div>`). MUI components already expose roles — pass the labels.
3. **Focus management** — dialogs/menus/drawers trap focus while open and restore it on close (MUI handles this — don't fight it). Route changes move focus to the main heading or an announced region.
4. **Live regions** — async results, toasts, and validation errors are announced (`role="status"`/`role="alert"`/`aria-live`). Loading states set `aria-busy`.
5. **Forms** — inputs are labelled and errors are associated via `aria-describedby`; required fields are marked accessibly, not by color alone.
6. **Color & contrast** — text/icon contrast ≥ 4.5:1 (3:1 for large text); never convey meaning by color alone (pair with text/icon). Driven by the theme palette, checked in design.
7. **Images & icons** — meaningful images have `alt`; decorative ones have empty `alt`/`aria-hidden`. Icon-only buttons have an `aria-label`.
8. **Motion & zoom** — respect `prefers-reduced-motion`; layout survives 200% zoom and 320px width.

## Enforcement

- **Lint:** `eslint-plugin-jsx-a11y` (recommended ruleset) runs in `npm run lint` and CI — catches missing alt, label-less controls, bad roles, etc.
- **Unit/component:** every component test asserts `expect(await axe(container)).toHaveNoViolations()` via `jest-axe`. Key interactions are exercised **keyboard-only** with `user-event` (`tab()`, `keyboard()`).
- **E2E:** Playwright journeys run `@axe-core/playwright` on the main screens and include at least one keyboard-only path.
- **Quality Gate:** `reviewer` flags any new interactive element without a name/role; `a11y-auditor` does a deeper WCAG pass for interaction-heavy features. An inaccessible control is 🟡 Important at minimum, 🔴 if it blocks a core flow.

## Binds these agents (rule is auto-loaded)

- `ui-architect` — a component contract is incomplete until its a11y requirements (roles, labels, focus, live regions) are stated.
- `react-developer` — implements with semantic elements/MUI roles and labels; runs `jest-axe` and the lint a11y rules locally.
- `tester` — every component test includes an axe assertion and at least one keyboard interaction; E2E includes an axe + keyboard path.
- `a11y-auditor` — deep WCAG audit on demand or for complex features.
- `reviewer` — blocks PRs that introduce inaccessible controls.

> Goal: the app is fully usable by keyboard and assistive technology at every commit — accessibility is designed in, tested, and gated, never bolted on.

> **Skill:** activate the `accessibility-reviewer` skill for the WCAG / jest-axe checklist.

<!-- END SOURCE docs/ai/rules/accessibility.md -->


<!-- SOURCE docs/ai/rules/api-contract.md SHA256 fb2f660ba6692565eaa818e43b1e4a29f84013518f898cecae2ce72815df2b18 -->

# API contract — typed client, errors, pagination, deviations (enforced)

This is a **frontend-only** repository. It does not own the REST API — the **external contract repository `VadayI/claude-api-contract`** does. That repo is the single source of truth; `openapi.yml` is vendored here at `src/lib/api/openapi.yml` by pulling the pinned tag (`npm run api:pull`, reading `CONTRACT_REPO` + `CONTRACT_VERSION`). The frontend can **never silently drift** from the contract — two CI gates enforce it. The backend (`claude-django`) is also a consumer of the contract — it does NOT generate the schema; if an endpoint is missing, the fix belongs in the contract repo, not in the backend directly.

## What "the contract" means here

1. **The schema file** — `src/lib/api/openapi.yml`, vendored at the tag pinned in `CONTRACT_VERSION`. Updated only by `npm run api:pull`, never hand-edited.
2. **Generated types** — `openapi-typescript` turns `openapi.yml` into `src/lib/api/schema.d.ts` (pure types, no runtime). Every request/response shape the UI uses comes from here. **Hand-writing a DTO type the schema already defines is forbidden**; never patch `schema.d.ts` by hand. Local-only view models live next to the feature and are clearly not DTOs.
3. **The thin client** — `src/lib/api/client.ts` wraps `fetch` (via `openapi-fetch`) with the base URL, auth-header injection, and error normalization. It is typed by `schema.d.ts`, so a wrong path/method/body is a **compile error**. **The client is the only place that talks HTTP** — components and hooks call the client / TanStack Query, never `fetch` directly. Auth tokens are injected by the client from the auth store (docs/ai/rules/auth.md), never read inside components.
4. **View-model mappers** — where the API shape and the UI shape differ, a mapper in `src/features/<feature>/api/` converts DTO → view model. Mappers are unit-tested; components depend on view models, not raw DTOs.

## The two gates

**Gate 1 — types drift (`scripts/check_types_drift.sh`)**: CI regenerates `schema.d.ts` from the committed `openapi.yml` and diffs it against the committed one; any difference fails the PR.

**Gate 2 — contract sync (`scripts/check_contract_sync.sh`)**: CI fetches the contract from GitHub raw at the pinned tag, computes sha256, and compares it against both the vendored `openapi.yml` and `contract.lock.json`; a hand-edited vendor file or stale lock fails the PR.

```bash
bash scripts/check_types_drift.sh && bash scripts/check_contract_sync.sh
npm run api:types     # regenerate schema.d.ts when the schema legitimately changed
```

## Refreshing the contract pin (deliberate, reviewed PR)

```bash
# 1. Record the non-secret contract pin in project config; do not commit .env
CONTRACT_VERSION=v0.X.0 npm run api:pull
# 2. Recompute sha256 → update contract.lock.json (version + sha256)
sha256sum src/lib/api/openapi.yml
# 3. Regenerate types and review the diff — a breaking change needs an ADR + coordinated migration
npm run api:types
# 4. Commit schema, generated types, lock and non-secret project configuration; never .env
```

A breaking contract change is a **versioned, coordinated event** — the contract repo gates it (oasdiff); the frontend bumps its pin deliberately, never silently.

## Schema hygiene (what the contract must satisfy)

- **Stable `operationId`s** — they become type/function names; a rename is a breaking change and needs an ADR.
- **Named components & enums** — inline anonymous objects produce unusable nested types; enums are named so they map to TS unions.
- **No lint warnings** — TypeSpec + Spectral lint in the contract repo enforce schema quality. (`drf-spectacular` in `claude-django` is only Swagger UI / Redoc — NOT the canonical schema source.)
- **Errors are never paginated** (`ENABLE_LIST_MECHANICS_ON_NON_2XX = False` convention) — error and pagination envelopes stay distinct, and both trace to `schema.d.ts`, never hand-written.

If the schema is missing or ambiguous for an endpoint the UI needs, that is a **contract-repo task** — STOP and flag it; do not hand-write the DTO and do not fake the endpoint in production code. An inline fake is a `// STUB:` (docs/ai/rules/no-stubs.md) AND a ledger row (below). A defective schema is fixed in the contract repo, then `npm run api:pull && npm run api:types`.

## Errors — one normalizer

The contract defines two error shapes (see `schema.d.ts` — `ErrorDetail`, `ValidationErrors`, `FieldError`):

- **Simple errors** (401, 403, 404, 409, 429, 5xx) — `ErrorDetail { detail: string }`.
- **Validation errors** (400) — `ValidationErrors { errors: FieldError[] }` where `FieldError { field, code, message }`.

The client maps every non-2xx into one typed `ApiError { status, code, detail, fieldErrors? }`; components never parse raw payloads:

- **Field (400) errors** map onto form fields via react-hook-form `setError` (docs/ai/rules/forms-and-validation.md) — **never a toast**.
- Non-field errors (401/403/404/409/5xx) surface as the component's **error state** (docs/ai/rules/component-contract.md) with a retry affordance.

## Pagination — typed envelope

List responses use `{ count, next, previous, results }`. A typed `Page<T>` mapper lives in `src/lib/api`; features consume `Page<T>`, never the raw envelope. Infinite lists use TanStack `useInfiniteQuery` with `getNextPageParam` derived from `next`; page-number lists derive the param from the URL.

## Retry policy

Set once on the QueryClient (docs/ai/rules/state-management.md): **never retry 4xx**; retry idempotent reads on 5xx/network with backoff. Mutations are not retried by default.

## Contract issues & deviations — the ledger (`docs/api/CONTRACT_ISSUES.md`)

The frontend is often the **first** to discover a contract bug, ambiguity, a better design, or a gap between the UI it needs and the pinned contract. Every such finding becomes a row in the **status-tracked ledger** — never a silent workaround. A row is mandatory whenever the frontend:

- needs an endpoint/field the contract lacks (a missing-endpoint STUB is never a fix — it is a contract task);
- hits a schema ambiguity, or a shape that doesn't match the server's real behaviour;
- has a concretely better design than the contract currently describes;
- must ship against a UI need the pinned contract cannot yet satisfy (a temporary divergence).

A `// STUB:` standing in for a missing or broken endpoint MUST have a matching ledger row (in addition to its `docs/STUBS.md` entry).

**The two-way loop:** row (`open`) → issue/PR in `VadayI/claude-api-contract` (`proposed`) → maintainers `accepted`/`rejected` → released as a new tag (`implemented-in-contract`) → bump `CONTRACT_VERSION` + `npm run api:pull && npm run api:types` + verify (`synced-in-frontend`). Use the lifecycle and columns defined in the ledger file (endpoint/operationId, what, why, frontend impact, proposal, linked contract PR/tag, linked frontend PR). NEVER "fix" the contract by hand-editing the vendored `src/lib/api/openapi.yml` — it breaks Gate 2.

## Lifecycle (per feature)

1. `ui-architect` reads the contract and declares which endpoints the feature consumes (method + path / `operationId` from the schema), and records the routes in `.claude/memory/routes.json`.
2. `tester` writes MSW handlers whose response shapes are taken **from the schema types**, so the mock cannot drift from the real API; tests fail RED.
3. `react-developer` implements the query/mutation against the typed client until GREEN; a missing endpoint → STOP, mark `// STUB:`, add the ledger row, flag the contract task.
4. **Before opening the PR**: both gates green locally.
5. `docs-writer` keeps `docs/api/INDEX.md` (the consumed-endpoints index) in sync with the schema and `routes.json`, and updates the ledger's sync status when `CONTRACT_VERSION` is bumped.

## Binds these agents (rule is auto-loaded)

- `ba` / `ui-architect` — consumed endpoints declared from the schema (by `operationId`/path); a missing or ambiguous endpoint → ledger row BEFORE any workaround.
- `react-developer` — generates types, uses the typed client, runs both gates locally, commits regenerated `schema.d.ts`; never fakes endpoints, never patches `schema.d.ts` or the vendored `openapi.yml` by hand.
- `state-architect` — owns the QueryClient retry defaults and the query keys / cache invalidation tied to those endpoints, including infinite-query keys.
- `tester` — MSW handlers return contract-compliant shapes (`ErrorDetail` / `ValidationErrors` / paginated envelope); triangulates empty/one/many/error.
- `docs-writer` — owns `docs/api/INDEX.md` and keeps `docs/api/CONTRACT_ISSUES.md` consistent; verifies both gates pass before declaring the PR ready.
- `reviewer` — blocks hand-written DTOs duplicating the schema, raw-envelope parsing in components, toasted field errors, 4xx retries, un-ADR'd `operationId` renames, and any contract workaround without a ledger row.

> Goal: the contract repo is the law — the frontend's types are re-derived from it on every build, every error and page is normalized once at the boundary, and every deviation is a tracked, proposable, resolvable ledger entry; the UI is never coded against an imagined API.

> **Skill:** activate the `api-client-typing` skill for the openapi-typescript workflow and typed-client recipes.

<!-- END SOURCE docs/ai/rules/api-contract.md -->


<!-- SOURCE docs/ai/rules/architecture.md SHA256 c3844652f12857304c65c2c8cb9b3057e42d608489b02edce7aa8021caa74e9d -->

# Project architecture

## Contract-first, frontend-only

This repo is the **frontend**. The REST API contract is authored in the external `VadayI/claude-api-contract` repository and consumed here via a typed client generated from it. Both this frontend and the `claude-django` backend are fellow consumers — neither generates the canon. See docs/ai/rules/api-contract.md. The UI never invents endpoints; a missing endpoint is a **contract-repo task** (`VadayI/claude-api-contract`), not a frontend fake.

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
│       └── README.md       # feature primer (docs/ai/rules/feature-readme.md)
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
| Stores (Zustand)          | shared client-state only              | no server data (docs/ai/rules/state-management.md) |
| API layer                 | typed client + mappers                | the only place that talks HTTP                      |
| Theme                     | design tokens                         | no magic values in components                       |

## Principles

- **Simplicity first.** No premature abstraction or global store.
- **Presentational/container split** so rendering is testable in isolation.
- **Every screen — with tests (RTL + Playwright), the four states, and a feature README entry.**
- **Server-state in Query, client-state in Zustand/local** — never blurred.

> **Skill:** activate the `architecture-designer` skill for layer-boundary and feature-folder recipes.

<!-- END SOURCE docs/ai/rules/architecture.md -->


<!-- SOURCE docs/ai/rules/auth.md SHA256 177cb461d0d5261d248090bece84f2f621f43d193bcce86260e8e5949b336a21 -->

# Authentication — Bearer/JWT (enforced)

This frontend consumes a **Bearer/JWT** backend (`djangorestframework-simplejwt` on `claude-django`). Auth is a **decision recorded up front** in ADR `0021` (`docs/decisions/0021-auth-bearer-jwt-default.md`), which supersedes ADR `0018`.

The default and only mode for this template is **Bearer/JWT user-flow** as specified in the external contract (`VadayI/claude-api-contract`, `bearerAuth` global security scheme, `/api/v1/auth/*` endpoints).

## Token storage (hard rule)

- **Never** store a JWT or session id in `localStorage`/`sessionStorage` (XSS-exfiltratable).
- Access token: held **in memory** in `useAuthStore` (`src/lib/auth/authStore.ts`) — never persisted.
- Refresh token: held **in memory** in `useAuthStore` (returned in the response body, D2). Trade-off: a script on the same origin could exfiltrate it from memory (same as a closure), but it cannot be stolen via cookie-theft. Mitigation: short-lived access tokens, rotate refresh on use, token blacklist on logout.
- Components never read tokens; the API client injects them automatically.

## Token injection (one place)

`src/lib/api/client.ts` has a single `onRequest` middleware that reads `useAuthStore.getState().accessToken` and sets `Authorization: Bearer <token>`. No per-component auth header — ever.

## The 401 flow (one place)

A single `onResponse` middleware in `src/lib/api/client.ts` handles 401:

1. If the failing request is itself to `/api/v1/auth/refresh` → return the 401 (avoid infinite loop).
2. If `refreshToken` is absent → return the 401 (caller or route guard redirects to login).
3. Attempt **one** `POST /api/v1/auth/refresh` with the stored refresh token.
4. On success: update store (`setTokens` / `setAccessToken`), clone the original request with the new access token, return the retry response.
5. On failure (network error or non-2xx): `clearTokens()`, return the original 401.

Route guards (`src/app/guards/`) observe `accessToken` from `useAuthStore` and redirect to login (with `?next=`) when null.

## User-flow endpoints

| Method + path                | Security | Purpose                                                  |
| ---------------------------- | -------- | -------------------------------------------------------- |
| `POST /api/v1/auth/register` | public   | create account (optional initial tokens)                 |
| `POST /api/v1/auth/login`    | public   | credentials → TokenPair stored in authStore              |
| `POST /api/v1/auth/refresh`  | public   | refresh token → new access token (handled by middleware) |
| `POST /api/v1/auth/logout`   | Bearer   | revoke refresh token, clear store                        |

## Service-flow (out of scope for frontend)

`POST /api/v1/auth/token` (client_credentials) is defined in the contract for service-to-service use. A browser SPA cannot safely hold a client secret, so this endpoint is not used by this frontend.

## Alternative: same-origin session/CSRF

Projects that deploy the SPA and backend on the same origin can switch to DRF `SessionAuthentication` + Django CSRF. That switch **supersedes this ADR** with a project-specific one. The 401 flow and token-injection points stay in the same files; only the credential transport changes.

## Binds these agents (rule is auto-loaded)

- `integration-architect` — designs the chosen auth mode and the refresh/redirect flow.
- `state-architect` — owns the auth store (in-memory only; nothing secret persisted).
- `react-developer` — wires token injection in `client.ts` only; guards in `src/app/guards/`.
- `security-scanner` — blocks tokens in web storage, `SameSite`/`Secure` gaps, `credentials` + wildcard CORS.

> Goal: auth is one recorded decision with one token-injection point and one 401 flow — never reinvented per request.

<!-- END SOURCE docs/ai/rules/auth.md -->


<!-- SOURCE docs/ai/rules/code-style.md SHA256 0ce554099477ed96b7cf16501ab007dc106c2aba59c640208cbbe3e8f10cb09a -->

# Code style

## TypeScript / React

- TypeScript 6, `strict` on. **No `any`** (use `unknown` + narrowing); no non-null `!` to silence the compiler. Linter — **ESLint** (typescript-eslint, react, react-hooks, jsx-a11y), formatter — **Prettier**.
- Imports ordered and de-duplicated (eslint import/order). No unused imports/vars.
- Naming: `camelCase` for variables/functions, `PascalCase` for components/types, `UPPER_CASE` for constants, hooks start with `use`, event handlers `handleX`, boolean props read positively.
- **Function components only**, with hooks. No class components. Keep components small and single-purpose.
- Prefer composition over configuration; lift state only as far as needed.
- No "magic values" — colors/spacing/typography come from the theme (docs/ai/rules/component-contract.md); other literals become named constants/enums.
- Secrets/config only via Vite env (`import.meta.env.VITE_*`), never hardcoded; nothing secret in `VITE_` that must stay private (all `VITE_` vars ship to the client).
- **Every exported component, hook, store, and non-trivial function has a TSDoc comment** — see _TSDoc_ below.
- **Every feature has a `README.md`** at `src/features/<feature>/README.md` — see docs/ai/rules/feature-readme.md.

## TSDoc (mandatory for the public surface)

Every exported component, hook, store, and public utility in `src/` carries a TSDoc block stating **why** it exists and the contract callers depend on (props/inputs, what it renders/returns, side effects, errors). Internal helpers are exempt. Tests/stories are exempt.

```ts
/**
 * Renders the todo list with loading, empty, and error states.
 *
 * Data comes from {@link useTodos}; the component is presentational and takes
 * the already-fetched view models via props so it can be tested in isolation.
 *
 * @param items - Todo view models to display (empty array → empty state).
 * @param onToggle - Called with the todo id when the user toggles completion.
 * @returns The list, or an accessible empty/error placeholder.
 */
```

Rules of thumb: first line is a single sentence; document props/params, return, and notable side effects; cross-reference with `{@link}`; for hooks describe the returned shape and when it refetches/invalidates.

## File & folder structure

- **Feature-sliced**: code is grouped by feature under `src/features/<feature>/` (`api/`, `components/`, `hooks/`, `store/`, `README.md`), not by technical type at the top level. Cross-cutting code lives in `src/lib/`, `src/components/` (shared UI), `src/app/` (routing/providers), `src/theme/`.
- One component per file; the file name matches the component (`TodoList.tsx`).
- Colocate tests (`TodoList.test.tsx`) and stories next to the component.

## File size limit (max 800 lines, enforced)

No source file in `src/` may exceed **800 lines** (React files should be small; a large component is almost always several components or a missing hook). Counted as `wc -l`. Enforced by `scripts/check_file_size.sh` in CI. Generated files (`src/lib/api/schema.d.ts`) are exempt. When a file grows: extract child components, extract a hook, or split a barrel into focused modules and re-export from `index.ts` so import paths stay stable. `code-structure-auditor` proposes the split (`/structure-audit`).

## General

- Comments explain _why_, not _what_ (names + TSDoc carry _what_).
- Small functions/components with a single responsibility.
- Conventional commits (see docs/ai/rules/git-operations.md).

> **Skill:** activate the `react-specialist` skill for React 19 component, hook, and composition patterns.

<!-- END SOURCE docs/ai/rules/code-style.md -->


<!-- SOURCE docs/ai/rules/component-contract.md SHA256 2cc84affee32b53ff188de0ea384b84778ff96e6e74cdd5ba101847e5d6b7a65 -->

# Component & route contract (the UI equivalent of the API contract)

In a DRF backend the contract is the endpoint (method, path, body, codes, permissions). In this frontend the contract is the **component and route surface**: what a screen renders, the props each component accepts, the states it must handle, and the routes/guards that reach it. Validation lives in **forms/schemas**, authorization lives in **route guards**, and presentation is driven by the **central MUI theme** — components stay focused on rendering.

## The four states are mandatory

Any component that fetches or mutates data MUST design and test all four states up front:

1. **Loading** — skeletons or a spinner with an accessible label (`role="status"` / `aria-busy`), never a blank flash.
2. **Success (with data)** — the happy path, plus the **large/edge** variant (long text, many rows, pagination).
3. **Empty** — a deliberate empty state with guidance, not a zero-height void.
4. **Error** — a user-readable error with a retry affordance; technical detail goes to the console/log, not the UI.

A feature is not "done" until all four are implemented and tested.

## Props contract

- **Typed props, no `any`.** Props interfaces are explicit; optional props have sane defaults. Booleans read positively (`disabled`, not `notEnabled`).
- **Controlled vs uncontrolled is a decision, not an accident.** Inputs are controlled when their value is owned by state/form; document which.
- **No prop drilling past 2 levels** — lift to context, a store, or composition (children/slots) instead.
- **Presentational vs container split:** presentational components take data via props and emit events via callbacks (easy to test in isolation); containers wire data (hooks/queries) and pass it down.
- **Never expose secrets or tokens through props** or render them into the DOM.

## Forms & validation

- Validation lives in a **schema** (e.g. Zod) colocated with the form, not scattered in `onChange` handlers — the schema is the single source of validation truth and is unit-tested.
- Invalid input → a **visible, associated** error message (`aria-describedby`), and the submit affordance reflects validity.
- Server-side validation errors (400 from the API) are mapped back onto the right fields, not dumped as a toast.

## Route guards (authorization)

- Authorization is separate, testable guard components / loaders in `src/app/guards/` — not `if (user) return ...` sprinkled in pages.
- Anonymous hitting a protected route → redirect to login (preserving the intended destination). Authenticated-but-forbidden → a 403 screen, not a blank page.
- Guards are tested for both the allowed and denied paths (the IDOR-equivalent: user A must not see user B's protected screen/data).

## MUI theming (no magic values)

- Colors, spacing, typography, breakpoints come from the **central theme** (`src/theme/`), accessed via `theme`/`sx`/styled — never hardcoded hex or pixel literals in components.
- Spacing uses the theme scale (`theme.spacing(n)` / `sx={{ p: 2 }}`), not raw `px`.
- Component-level style overrides go through `styleOverrides`/`sx`, and shared variants through the theme's `components` slot — so restyling is centralized.
- Dark mode / density / RTL are theme concerns; components must not assume a single mode.

## Rules

- Every screen declares its route, its guard (if any), and its four states.
- Loading/error/empty are first-class, not afterthoughts.
- Components depend on **view models** (mapped) not raw API DTOs (docs/ai/rules/api-contract.md).
- Accessibility attributes are part of the contract, not a later pass (docs/ai/rules/accessibility.md).

## Testing (mandatory)

Per component: render in each of the four states; assert by role/label; drive interaction with `user-event`; assert the mutation/callback fires with the right payload; `jest-axe` clean. Per route: allowed and denied guard paths. See docs/ai/rules/tdd.md.

> **Skill:** activate the `mui-theming` skill for theme-token and MUI styling recipes.

<!-- END SOURCE docs/ai/rules/component-contract.md -->


<!-- SOURCE docs/ai/rules/dependencies-and-supply-chain.md SHA256 44057f813c35d7147e466fc56f9b52381026a782a74a6a109200546120390f5b -->

# Dependencies & supply chain (minimal, locked, audited)

Every dependency is code you ship and trust — and an attack surface. Most frontend supply-chain incidents come from a compromised transitive package or an abandoned one, not from the app's own code. This project keeps the dependency tree **small, locked, and audited**, and treats adding a package as a **reviewed decision**, not a reflex.

## Lockfile is law

- The committed lockfile (`package-lock.json`) is the source of truth; CI installs with **`npm ci`** (exact, lockfile-honoring), never `npm install`. A PR that changes `package.json` without the matching lockfile change fails review.
- **No floating ranges that defeat the lock** — versions are pinned via the lockfile; the lockfile is regenerated deliberately (an upgrade PR, docs/ai/rules/upgrade-policy.md), never hand-edited.
- One package manager (npm) and one lockfile — no mixed `yarn.lock`/`pnpm-lock.yaml`.

## Adding a dependency is a decision

Before adding a package, weigh and record (in the PR) the following — a heavy or risky dep needs justification:

- **Do we need it?** Prefer the platform (`Intl`, `fetch`, `URL`), an existing dep, or a few lines of our own over a new package for trivial functionality (the left-pad lesson).
- **Weight** — bundle cost checked against docs/ai/rules/performance-budgets.md (bundlephobia / `vite build` diff); prefer **ESM, tree-shakeable** packages.
- **Health** — maintained (recent releases, open-issue responsiveness), reasonable transitive-dependency count, sane **license** (no copyleft surprises for a shipped SPA).
- **Trust** — popularity/provenance; be wary of typosquats and brand-new packages with one maintainer.

## Audit & integrity (gated)

- **`npm audit`** runs in CI; **high/critical** advisories fail the PR (resolve, upgrade, or record an accepted-risk exception with an expiry). Moderate/low are triaged, not ignored forever.
- **Install scripts are suspect** — avoid packages that need `postinstall` to function where possible; CI can run with `--ignore-scripts` for untrusted installs. Lockfile integrity hashes are verified by `npm ci`.
- **Dev-only stays dev-only** — build/test tooling is in `devDependencies` and must not leak into the shipped bundle.
- Secrets/tokens are never embedded in a dependency config or committed (docs/ai/rules/auth.md, docs/ai/rules/code-style.md).

## Rules

- `npm ci` + committed lockfile everywhere; never hand-edit the lockfile.
- A new (especially heavy/low-trust) dependency is justified in the PR; prefer platform/existing code first.
- `npm audit` high/critical blocks the PR; exceptions are explicit and time-boxed.
- Named, tree-shakeable imports only (`import { x } from 'lib'`) — ties to the performance budget.

## Binds these agents (rule is auto-loaded)

- `react-developer` — justifies new deps in the PR, keeps the lockfile in sync, imports named members only.
- `ci-cd-engineer` — wires `npm ci` + `npm audit` into `frontend-ci.yml`; keeps the audit gate authoritative.
- `security-scanner` — flags high/critical advisories, risky install scripts, typosquats, and license problems.
- `reviewer` — blocks `package.json`/lockfile mismatches, unjustified or duplicate dependencies, and dev deps leaking into the bundle.

> Goal: the dependency tree is as small as it can be, pinned by a committed lockfile, audited on every build, and every addition is a conscious, recorded choice — so a supply-chain risk is caught at the PR, not in production.

<!-- END SOURCE docs/ai/rules/dependencies-and-supply-chain.md -->


<!-- SOURCE docs/ai/rules/design-reference.md SHA256 cb14305c945a1893b7e1d32c5b6c4eeb16c3566c93dcfa8f1e9d171d573001c9 -->

# Design reference — the design is the UI source of truth, translated to our stack

When a project has a **design** to follow — a Claude-design prototype folder, a running design served at a URL, Figma exports, or a style spec — it is the **strongest available UI source of truth**, and every agent that touches the UI works from it. This rule defines what a design can be, how it is discovered and opened, the **fidelity level** that scales how exactly it is reproduced, the non-negotiable **translation mandate** (the design is always realized through the project stack), and how deviations are recorded.

## Design sources (two shapes, often both)

A project's design reaches the agents in one or both of these shapes:

1. **Static prototype folder** — a Claude-design prototype under `docs/design/<name>/`, typically containing:
   - **Design tokens** — CSS custom properties (e.g. `--c-accent`, `--c-bg`, `--font-body`) defining the colour palette, typography scale, spacing, radius, and shadow values.
   - **UI-kit primitives** — a `ui-kit.jsx` (or similar) assembling buttons, inputs, cards, badges, and other atoms from the tokens.
   - **Screens** — `screen-*.jsx` files (or named equivalents) each representing a distinct application screen: layout, content hierarchy, component placement, interactive states.
   - **Data models** — an `app-data.jsx` (or similar) declaring the shape of entities the UI consumes.
   - **API spec** — one or more `api-*.md` files describing the backend endpoints the prototype assumes.
2. **Running design at a URL** — a live design served locally or on the web (e.g. `http://localhost:8331/`). Agents **open it in a browser** to inspect the _rendered_ result: real colours, type sizes, spacing, radii, density, and interaction states as they actually paint. This is the most faithful source because it shows computed values, not just declared tokens.

The two are complementary: the folder gives declared tokens and structure; the running design gives the ground-truth render. A project may provide either or both; all of them are recorded in `docs/PROJECT.md` § **Design reference**.

## Detection and discovery

`/synthesize-brief` scans `docs/design/` for static prototype signatures (`index.html` + `*.jsx` / `screen-*` / `ui-kit`, and/or `api-*.md`) and, in Step 1.5, asks the user three things: which folder (if any) to use, **whether a design is running and at what URL**, and the desired **fidelity level**. The confirmed source(s), URL, and level are recorded in `docs/PROJECT.md` § **Design reference** and passed to `brief-synthesizer`. If no design is found and the user declines, agents work from MUI defaults and the written brief alone.

## Opening a running design (browser inspection)

When a design URL is provided, design-touching agents open and read it through the **Playwright MCP** (the enabled `playwright` plugin — see `docs/ai/rules/mcp-stack.md`):

- `browser_navigate` → open the design URL.
- `browser_snapshot` / `browser_take_screenshot` → capture each screen's layout and visual state.
- `browser_evaluate` → read **computed** styles (`getComputedStyle`) for exact colour / size / spacing / radius values when the fidelity level demands measured tokens.

Inspection is **read-only** — agents observe the running design, never edit it. If the URL is unreachable, the agent records that and falls back to the static folder / written brief; `/doctor`, `/preflight`, and `/audit` surface a declared-but-unreachable design URL.

## The translation mandate (binds every design-touching agent)

**The design is always realized through the project stack — never ported verbatim.** Every agent that reads or acts on the design (synthesis, UI contract, implementation, refactor, review, a11y, QA, docs) must express it as:

- tokens → the **central MUI theme** (`src/theme/`: `palette`, `typography`, `spacing`, `shape`, `components`);
- ui-kit atoms → **MUI components** composed via `styleOverrides` / `sx`;
- screens → **routes + a typed component tree** under `src/features/<feature>/` (React 19 + TypeScript, TanStack Query for server-state, Zustand for client-state, feature-sliced per `docs/ai/rules/architecture.md`).

It is **forbidden to emit or approve the prototype's implementation**: inline styles, in-browser Babel JSX, raw CSS custom properties in components, copied HTML/markup, or magic colour/spacing literals outside the theme. The theme is the single source of design-token truth in production.

The **fidelity level controls how exactly values match — not whether the design is translated to the stack.** Even at the highest fidelity the output is idiomatic MUI + TypeScript, not a copy of the prototype.

## Fidelity / transfer levels (per project, default L3)

How strictly the design is reproduced is a **per-project decision**, asked at the start (`/synthesize-brief` Step 1.5) and recorded in `docs/PROJECT.md` § **Design reference** as `Fidelity level: L1 | L2 | L3 | L4`. If unspecified, the default is **L3**.

| Level  | Name                            | What it means                                                                                                                                                                                         | Needs                  |
| ------ | ------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- |
| **L1** | Browser-measured pixel-perfect  | Agent opens the **running design**, measures computed tokens (`getComputedStyle`) and reproduces colours, type scale, spacing, radii, and layout **1:1** in the MUI theme. Deviations only for a11y/contract, all recorded. | a running design URL   |
| **L2** | Pixel-perfect from spec/tokens   | Exact 1:1 reproduction from the static tokens / style spec, without live measurement. Deviations only for a11y/contract.                                                                              | folder or style spec   |
| **L3** | Close MUI adaptation (default)   | Palette, typography scale, layout, and component inventory preserved; realized through idiomatic MUI and the spacing scale; minor visual differences acceptable.                                       | any                    |
| **L4** | Inspiration                      | Design as brand/tone; carry palette + key brand elements; MUI defaults dominate.                                                                                                                      | any                    |

The level scales each agent's work: `ui-architect` maps to the theme / component tree at the chosen strictness; `react-developer` matches values to that tolerance (L1/L2 → measured/exact, L3 → close, L4 → loose); `reviewer` judges divergence against the level. A level that needs a running design (L1) but has no reachable URL is downgraded to L2 with a recorded deviation.

## Authority and priority order (when conflicts arise)

The design reference is a **very strong source of truth**, but accessibility and the component contract outrank it:

1. Recorded deviations (explicit user overrides).
2. Accessibility requirements (`docs/ai/rules/accessibility.md`).
3. Component-contract requirements (four states, `docs/ai/rules/component-contract.md`).
4. The design reference, reproduced at the chosen **fidelity level**.
5. MUI defaults.

When a conflict between items 2/3 and item 4 is resolved, the resolution is appended to the deviation list with the reason (e.g. "prototype lacked loading state — added skeleton per component-contract").

## Deviations — recorded, respected over the design

Any intentional difference between the produced UI and the design reference is a **deviation**. Deviations arise from:

- Explicit user instruction ("use a sidebar instead of bottom nav").
- Accessibility requirements (`docs/ai/rules/accessibility.md`) — where the design would fail WCAG 2.1 AA, the accessible version wins and the departure is recorded.
- Component-contract requirements (`docs/ai/rules/component-contract.md`) — the four mandatory states (loading/success/empty/error) win over a design that only shows the happy path.
- Technical constraints (e.g. an animation that conflicts with `prefers-reduced-motion`).

Every deviation is recorded in **two places**:

1. **Project memory** (type `project`) — one entry per deviation, with the reason.
2. **`docs/PROJECT.md` § "Design deviations"** — a human-readable list that survives context resets and is visible in the PR diff.

Agents read recorded deviations **before** consulting the design; deviations override the design reference.

## Binds these agents (rule is auto-loaded)

The translation mandate and the fidelity level bind **every design-touching agent**:

- `brief-synthesizer` — reads the static folder and/or opens the running design URL; extracts token summary, component inventory, screen list, and API assumptions **as MUI-theme / stack intent**; records the design source(s), URL, fidelity level, and the **Design reference** + **Design deviations** sections in `docs/PROJECT.md`.
- `ui-architect` — maps tokens → MUI theme entries and screens → route/component tree at the chosen fidelity; opens the running design to inspect screens when a URL is set; records routes and any new conflict-resolution deviation.
- `react-developer` — implements through the MUI theme + components, never copying prototype styles; at L1/L2 matches measured/exact values (opening the running design to compare), at L3/L4 reproduces close/loose; flags new deviations.
- `domain-architect` — designs the feature-sliced structure for complex UIs from the design, in-stack.
- `react-refactoring-expert` — keeps the design realized in-stack (theme + components) under green tests; no off-theme literals introduced by a refactor.
- `integration-architect` — styles third-party / SSO / payment widgets to the central MUI theme so they match the design.
- `a11y-auditor` — ensures the accessible realization (which wins over the design) stays in-stack; records the deviation.
- `qa` — visual-regression checks run against the **built MUI app**, not the prototype; the design is the intent, the app is the artifact.
- `reviewer` — blocks UI code that diverges from the design without a recorded deviation, ports prototype implementation verbatim, or uses magic values outside the theme. A visual gap not in the deviation list is 🟡 Important.
- `docs-writer` / `guide-writer` — describe screens in terms of real routes/components and the theme, not prototype files.

> Goal: the design is a first-class input — opened (folder and/or live URL), reproduced at the agreed fidelity level, and always **translated into MUI + TypeScript + the project stack** — transparently deviated from when accessibility, contract, or user intent demands, and never silently ignored or ported verbatim.

<!-- END SOURCE docs/ai/rules/design-reference.md -->


<!-- SOURCE docs/ai/rules/environment.md SHA256 a94308221d3aacab18ff9a0e1923aed6b77cd477acc2abf0c6a8e8a468fecbbe -->

# Environment specification

Doctor is read-only: detect, report and identify a concrete remedy. It never
installs dependencies/plugins, starts services, copies env files or repairs Git.
Existing user authorization applies to separately requested remediation.

## System capabilities

- Node 24 is the primary React target; Node 26 is an additional compatibility
  check, never a substitute. npm must resolve to the same operating environment.
- Python 3.13+ runs shared template tooling without application dependencies.
- Native Windows uses PowerShell and explicit Git Bash for Bash gate scripts.
  Do not accidentally invoke the WSL launcher named `bash`. Linux uses native
  tools. WSL/macOS support is NOT_VERIFIED unless actually exercised.
- Paths may include spaces, Unicode and Windows drive mounts. Do not suggest
  relocating a project merely because it lives on a mounted drive.
- Record Git, gh, selected agent CLI, shell and runtime versions. Claude is not
  required for Codex operation, nor Codex for Claude operation.
- Playwright browser availability is needed for E2E. Installation is a separate
  authorized setup action, not a read-only capability check.
- Docker is optional for local Vite development; required checks that depend on
  it remain NOT_VERIFIED if unavailable. Never silently omit those checks.
- Do not mix Windows Node/CLI with Linux dependencies in WSL. Report mixed PATH
  evidence and select a consistent toolchain; do not change global PATH/trust.

Run `node scripts/detect-env.mjs` explicitly for the legacy environment report.
It writes `.claude/memory/env-detect.json`; this is the sole allowed doctor report
side effect. A previous hook report can be stale. Never hand-edit detection facts
or fabricate supported flags. The shared Python detector replaces it in P05.

## Access and project state

Use `gh auth status` and repository reachability to check GitHub access without
printing tokens or personal account metadata. Existing credential-manager auth is
valid; a named PAT environment variable is not mandatory. Check only access
required for the requested operation. Optional MCP/plugins are capability
implementations, with documented CLI/browser/official-doc equivalents.

Inspect the app skeleton, package/lockfile, Vite/TypeScript config, non-secret
`.env.example`, API pin, docs and registries. Missing app/dependencies before
bootstrap are 'not set up', not a failed app. Never read real env files. An absent
local env file alone does not block an app configured through safe defaults.

Read Git branch/status and tracked paths. Preserve foreign work, stash, refs and
worktrees. Verify feature-branch policy and active CI choice. Branch protection
must correspond to real checks; do not require nonexistent hosted statuses in
local mode. Missing hosted access does not block independent local work.

Full type/lint/test/contract/build checks belong to `verify`, not environment
inspection. Distinguish available commands from commands actually executed.

<!-- END SOURCE docs/ai/rules/environment.md -->


<!-- SOURCE docs/ai/rules/feature-readme.md SHA256 33db4989f362f27894471302d5fd8689bf7ba8dad6bbc51d27a3fe52487cb2af -->

# Per-feature README (mandatory, enforced)

Every feature under `src/features/<feature>/` MUST have a local `README.md` describing the feature's purpose, public surface, and where it fits. The intent: no feature ships without a one-page primer a new contributor reads before touching it. Checked in CI by `scripts/check_feature_readmes.sh` — a missing README fails the PR.

## Required sections (in order)

1. **Purpose** — one paragraph: what the feature does for the user, what it does NOT own (boundaries with other features).
2. **Routes** — the route(s) this feature registers (`path`, screen, guard/auth), if any.
3. **Components** — the main components with one-line descriptions, marking container vs presentational.
4. **Hooks & state** — the query/mutation hooks (and their query keys) and any Zustand store, with invalidation notes.
5. **Consumed endpoints** — the backend endpoints this feature calls (`method path`), which trace to the OpenAPI schema (docs/ai/rules/api-contract.md). Detail lives in the schema; the README is the index.
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

<!-- END SOURCE docs/ai/rules/feature-readme.md -->


<!-- SOURCE docs/ai/rules/forms-and-validation.md SHA256 d95c051dff3c30abadf312d0d54478a387711f3474c724e7f1d0c424151236fe -->

# Forms & validation (schema-first, accessible, enforced)

Forms are where most UX and accessibility bugs live, and where the frontend meets the backend's validation contract. This project keeps validation in **one schema per form**, renders errors **accessibly and associated to their field**, and maps the backend's **400 field errors** back onto the right inputs — never a toast, never scattered `onChange` checks. This is the companion to docs/ai/rules/component-contract.md (the _Forms & validation_ clause) and docs/ai/rules/api-contract.md (where field errors come from).

## The stack — react-hook-form + Zod

- Forms use **react-hook-form** (RHF) for state/submission and **Zod** for the schema, wired with `@hookform/resolvers/zod`. Inputs are **controlled** through RHF (`register` / `Controller` for MUI fields); controlled-vs-uncontrolled is a deliberate decision, not an accident (docs/ai/rules/component-contract.md).
- The Zod schema is the **single source of validation truth**, colocated with the form at `src/features/<feature>/components/<Form>.schema.ts`. It is **unit-tested** (valid input passes; each invalid case produces the expected issue) so validation is provable in isolation.
- Type the form values from the schema (`z.infer<typeof schema>`) — never hand-maintain a parallel `FormValues` type.

## Accessible errors (mandatory)

- Every field has a programmatic label (visible `<label>` / MUI `label`), and on error sets `aria-invalid` and links the message via `aria-describedby` (MUI `TextField` does this when given `error` + `helperText`). An error the user can see but assistive tech can't is a defect.
- **Required is not conveyed by color or `*` alone** — pair it with text and the accessible name (docs/ai/rules/accessibility.md).
- The first invalid field receives focus on a failed submit (RHF `shouldFocusError`), and the error summary (if any) is an announced region (`role="alert"`).
- Submit affordance reflects validity/in-flight state: disabled + `aria-busy` while submitting; do not leave the user guessing whether the click registered.

## Server (400) errors map onto fields

- A backend **400** carries `fieldErrors` (normalized once by the API client into `ApiError`, docs/ai/rules/api-contract.md). The submit handler routes each field error to RHF via `setError(field, …)`, and any non-field error to a form-level `role="alert"` region. **Field errors are never shown as a toast** and never swallowed.
- Field-name mapping (DRF snake_case ↔ form camelCase) lives in the feature's mapper next to the form, not inline in the component.

## Rules

- One Zod schema per form, colocated and unit-tested; values typed via `z.infer`.
- Validation lives in the schema, not in `onChange`/`onBlur` handlers.
- Errors are visible **and** associated (`aria-describedby` + `aria-invalid`); required state is not color-only.
- Server 400s map back to fields via `setError`; non-field errors go to an announced form-level region.
- Components depend on view models and the typed client — a form never calls `fetch` directly (docs/ai/rules/api-contract.md, docs/ai/rules/state-management.md).

## Testing (mandatory)

Per form: schema unit tests (valid / each invalid case); RTL tests that submit invalid input and assert the **visible, associated** error (queried by role/label, not class); a successful submit asserting the mutation fires with the **correct payload**; a server-400 case asserting the error lands on the right field; `jest-axe` clean; at least one keyboard-only pass (tab order, submit via Enter). Triangulate so a hardcoded "valid" path can't stay green (docs/ai/rules/tdd.md, docs/ai/rules/no-stubs.md).

## Binds these agents (rule is auto-loaded)

- `ui-architect` — the form contract is incomplete until its schema, fields, required/optional, and error placement (where each message renders) are declared.
- `react-developer` — implements with RHF + Zod resolver and MUI `error`/`helperText`; wires `setError` for 400s; never validates in ad-hoc handlers.
- `state-architect` — owns the mutation hook and how its `ApiError` field errors reach the form.
- `tester` — schema unit tests + RTL invalid/valid/server-400 + axe + keyboard pass.
- `reviewer` — blocks toasted field errors, color-only required state, validation scattered outside the schema, and unassociated error text.

> Goal: every form validates from one tested schema, surfaces errors accessibly on the right field, and speaks the backend's 400 contract — never a toast, never a stray handler check.

<!-- END SOURCE docs/ai/rules/forms-and-validation.md -->


<!-- SOURCE docs/ai/rules/git-operations.md SHA256 211d2f63e1bc7b8c2696bd68c52fb7d335c66c3e2b6a2e08cee9905eacb39192 -->

# Git operations

## Iron rule

**NEVER commit or push directly to `main`.**
Only: branch → commits → `push` → Pull Request → review → merge.

### Documented exception (one-shot)

`/bootstrap` in **Mode A (fresh project)** performs the very first commit and `git push -u origin main` because there is no branch protection yet and no reviewers — this is the bootstrap commit that lays down the initial scaffold (the Vite+MUI app + `.claude/` config). Before any push, record the local/GitHub CI choice. Apply branch protection only for checks that actually exist in that mode; subsequent work uses branches/PRs.

All other `/bootstrap` work (Mode B resume) and every other command (feature pipelines, `/fix-ci`, etc.) goes through a PR.

## Branches

- Naming: `feat/<slug>`, `fix/<slug>`, `chore/<slug>`, `docs/<slug>`, `test/<slug>`.
- One branch = one logical change.
- Resolve the intended base without disturbing foreign changes. A dependent branch may use a recorded pending-PR base; do not claim it is integrated into main.

## Commits (Conventional Commits)

```
feat: add todo list screen with empty/error states
fix: announce validation error to screen readers
test: add Playwright journey for creating a todo
refactor: extract useTodos hook from TodoList
docs: document the todos feature in its README
chore: bump @mui/material
```

## Workflow

```bash
git checkout main && git pull
git checkout -b feat/<slug>
# ... TDD cycle, small commits ...
git push -u origin feat/<slug>
gh pr create --fill
# review → wait for explicit user merge command (D01)
git checkout main && git pull   # on BOTH machines before the next task
```

## PR description (template)

```
## What
Short description of the change.

## Why
Context / user story.

## How verified
- [ ] vitest green (unit/component)
- [ ] playwright green (E2E)
- [ ] typecheck + eslint clean
- [ ] jest-axe / axe clean
- [ ] CI passed

## Notes
Edge cases, risks, next steps.
```

## Context sync between machines

At the end of a session, update and commit: `docs/WORKLOG.md`, and if needed `.claude/memory/*` and ADRs `docs/decisions/NNNN-*.md`. This is how the work history travels between computers via a plain `git pull`.

## Prohibitions

- `git push origin main` — forbidden EXCEPT the documented `/bootstrap` Mode A exception above.
- `git push --force` to shared branches — forbidden.
- Committing secrets/`.env` — forbidden (see `.gitignore`).

<!-- END SOURCE docs/ai/rules/git-operations.md -->


<!-- SOURCE docs/ai/rules/i18n-and-formatting.md SHA256 12a871ed3d8a906ad2d59772b807bfa8d5d1c8d8cf3e972bbf802b136ee41479 -->

# Internationalization & formatting (translatable, locale-correct)

Even a single-language app should be **structurally translatable** and **locale-correct** from day one — retrofitting i18n after strings are hardcoded across the tree is expensive and error-prone. This project keeps user-facing text out of components, formats dates/numbers/currency through the platform `Intl` APIs, and treats locale and direction (LTR/RTL) as first-class.

## Strings live in resources, not in JSX

- User-facing text goes through **react-i18next** (`useTranslation` / `t('key')`), with messages in `src/locales/<lng>/<namespace>.json` keyed by feature namespace. **No hardcoded display strings in components** — a literal in JSX that the user can read is a defect.
- Keys are **semantic, not English sentences** (`todos.empty.title`, not `'No todos yet'`), so copy changes don't churn keys.
- **Pluralization and interpolation** use i18next plural rules / `{{count}}` placeholders — never string concatenation (`` `${n} items` ``), which is grammatically wrong in most languages.
- Default language is configured once; a missing key falls back to the default language and is reported (i18next `saveMissing` in dev), never rendered as a raw key in production.

## Formatting through `Intl` (no manual formatting)

- Dates/times → **`Intl.DateTimeFormat`** (or the i18n layer's wrapper), numbers/percent → **`Intl.NumberFormat`**, currency → `Intl.NumberFormat` with `style: 'currency'`. **Never** hand-format with string ops or assume `MM/DD/YYYY`, a `.` decimal, or a `$` prefix.
- The **locale comes from the active language**, not the machine — formatting is deterministic and testable, not environment-dependent.
- Time zones are explicit where they matter; store/transport UTC (ISO-8601), format to the user's zone at the edge.

## Layout survives translation & direction

- Components must tolerate **text expansion** (German/Finnish run ~30–40% longer) — no fixed-width labels that clip; truncation is deliberate and has a title/tooltip.
- **RTL** is a theme concern: the MUI theme's `direction` + a `dir` attribute drive layout; use logical CSS / theme spacing, not hardcoded `left`/`right` (docs/ai/rules/component-contract.md).
- Accessible names are translated too — `aria-label`/`alt` come from `t()`, not English literals (docs/ai/rules/accessibility.md).

## Rules

- No user-facing literal in components — everything via `t()` with a semantic key.
- Plurals/interpolation via i18next, never string concatenation.
- All date/number/currency output via `Intl`/the i18n layer, locale-driven, never hand-rolled.
- Layout tolerates expansion and RTL; translated accessible names.

## Testing (mandatory)

Render a component under at least **two locales** (default + one other, ideally one RTL) and assert the translated text and locale-correct formatting appear (query by role/label). A test that asserts a raw English literal couples the test to copy — assert via the same `t()` key or a known translated value. Plural cases (0 / 1 / many) are triangulated. `jest-axe` clean in each locale.

## Binds these agents (rule is auto-loaded)

- `ui-architect` — declares the namespaces a feature owns and any locale/RTL considerations in the contract.
- `react-developer` — wires `useTranslation`, adds keys to the resource files, formats via `Intl`; never hardcodes strings or formats by hand.
- `tester` — multi-locale render tests, plural triangulation, axe per locale.
- `reviewer` — blocks hardcoded display strings, string-concatenated plurals, manual date/number formatting, and hardcoded `left`/`right` that breaks RTL.

> Goal: the app is translatable and locale-correct by construction — text lives in resources, formatting goes through `Intl`, and layout survives other languages and RTL — so adding a language is a content task, not a refactor.

<!-- END SOURCE docs/ai/rules/i18n-and-formatting.md -->


<!-- SOURCE docs/ai/rules/living-plan.md SHA256 c3bb6e864b420e13cf3efcf5d005838711dea246cd6112b080476931e5a3a4ac -->

# Living plan (agents keep `docs/plans/NNNN-*.md` current as work runs)

A plan is a **living artifact**, not a frozen Plan-Mode snapshot. The orchestrator seeds `docs/plans/NNNN-<slug>.md` at the start of a non-trivial task, and the work's actual course flows back into it — confirmations of what ran, and changes of direction — instead of the plan drifting from reality and duplicating WORKLOG. This stays within Simplicity First (docs/ai/rules/code-style.md) and Surgical Changes (docs/ai/rules/surgical-changes.md): no new tooling, just discipline + one template (`templates/plan.md`) + this rule.

## When a plan is seeded

- **Scope = every non-trivial task** — the same threshold that activates Plan Mode (docs/ai/rules/workflow.md): 3+ steps, an architectural decision, or touching >2 files. Trivial tasks (a typo, a single config value) do NOT seed a plan.
- **The orchestrator seeds it**, copying `templates/plan.md` → `docs/plans/NNNN-<slug>.md`. `NNNN` is the next free number in `docs/plans/`, assigned by the orchestrator at seed time — never by agents (avoids number races between parallel agents).

## The three managed sections

Each `docs/plans/NNNN-*.md` carries three managed sections on top of the ordinary plan body:

1. **Status table** (top) — step / state (`pending`/`in_progress`/`done`/`blocked`) / owner-agent. The plan's cursor; updated as steps move.
2. **Execution log** (append-only) — short confirmations of execution facts: "step N green (vitest)", "outer Playwright journey green", "routes recorded in routes.json", "gate: 1×🟡 → back to react-developer". Appended, never edited retroactively.
3. **Amendments** (append-only) — changes of direction. If a plan decision changes, the original paragraph is **not deleted**; instead add an Amendments entry plus an inline pointer next to the original (`> ⚠️ Changed — see Amendment #k`). The decision history stays transparent.

## Who updates what

- **Orchestrator** — seeds the plan; owns the Status table; records gate outcomes into the Execution log (gate agents report to it, see below); appends Amendments when a body decision changes.
- **Executor agents** (`ba`, `ui-architect`, `react-developer`, `tester`, `docs-writer`) — after finishing their phase, **append** a one-line confirmation to the active plan's Execution log (via `Edit` append, never a full-file rewrite).
- **Gate agents** (`reviewer`, `security-scanner`, `state-architect`) — do NOT edit the plan; they stay read-only over both code and plan. They **report the gate result to the orchestrator**, which records the Execution log entry. This preserves the "gate agents only read and report" invariant.

## Boundary with WORKLOG

**Execution log ≠ WORKLOG.** The Execution log is an in-plan journal of confirmations during one task. `docs/WORKLOG.md` is the cross-session chronicle, single owner `/wrap-up`. They do not duplicate: the plan records the course of one task, WORKLOG the session summary.

## Binds these agents (rule is auto-loaded)

- `ba`, `ui-architect`, `react-developer`, `tester`, `docs-writer` — append an Execution log confirmation at the end of their phase (need `Edit` to append).
- `reviewer`, `security-scanner`, `state-architect` — never edit the plan; report the gate result to the orchestrator.

## Enforcement

- **CI gate `scripts/check_plan_sync.sh`** — on a PR, if more than 2 files under `src/`/`e2e/` change, a `docs/plans/*.md` must be updated in the same PR (Status table / Execution log kept current). Enforces on `pull_request`; skips on direct push and on trivial (≤2-file) changes.

## Out of scope (v1)
- A machine-readable Status format (JSON) — markdown tables suffice for now (Simplicity First).

> Goal: at any point in a non-trivial task, the plan shows where we are (Status), what has actually run (Execution log), and why decisions changed (Amendments) — without drifting from reality or duplicating WORKLOG.

<!-- END SOURCE docs/ai/rules/living-plan.md -->


<!-- SOURCE docs/ai/rules/mcp-stack.md SHA256 dae2d781bfa8b8396d246f66df63a3b2a59b93eb5d0014767ffdbb1e42c3af2a -->

# Optional MCP and equivalent capabilities

The common workflow has no direct dependency on a Claude marketplace or a named
plugin. Use installed authorized tools, CLI or official documentation as available.
Never install plugins, activate duplicate servers or modify global trust merely
to satisfy a template recommendation. Project files cannot grant themselves trust.

| Capability | Optional implementation | Equivalent |
| --- | --- | --- |
| PR read/create/review | GitHub MCP | gh pr / gh api |
| CI logs/status | GitHub tools | gh run / gh pr checks |
| Current library docs | Context7 resolve-library-id + query-docs | Official documentation |
| Running design inspection | Playwright MCP | Available browser automation |
| Application E2E | Playwright test runner | Run the committed E2E suite |

Use actual discovered tool names; do not copy runtime-specific names into another
runtime. Report a missing capability as NOT_VERIFIED when no equivalent exists.
Browser design inspection is read-only, including localhost. Record references
in docs/PROJECT.md. Inspect accessibility, screenshots and computed styles as
needed for the requested fidelity; do not mutate the reference design. Browser
inspection does not substitute for the application's E2E runner.

Review third-party server/skill executables, privileges and data access before
an authorized installation. Secrets belong only to the user's credential system
or authorized environment; never read, copy, print or commit them. Do not bypass
blocked fetches with curl/scripts. Posting reviews/comments still requires the
user's authorization for that communication.

<!-- END SOURCE docs/ai/rules/mcp-stack.md -->


<!-- SOURCE docs/ai/rules/no-stubs.md SHA256 3341cb09601dbeb83e8534055aabf38b2d6547d2cbc03caeff90a6acb56d4d9d -->

# No stubs / no fake data in production code (enforced)

TDD's GREEN phase ("minimal code to pass") legitimately produces **temporary stubs** — hardcoded return values, empty handlers, fake datasets that satisfy a test without real logic. That is fine **inside the inner loop on a feature branch**. The risk is a stub surviving into a merged PR. This rule makes every stub **visible, tracked, and gated** so none reaches `main` unnoticed.

## Canonical marker (one greppable token)

- Any intentional placeholder in non-test code is marked with **`// STUB:`** plus a reason, e.g. `// STUB: returns fixed list until /todos pagination lands (#142)`.
- For unimplemented branches, prefer `throw new Error("STUB: <reason>")` — it is self-flagging (tests covering it fail).
- One token only (`STUB`) so `grep`/CI can find every one of them.

## Mock / fake data — tests and MSW only

Mock objects, fixtures, and fake datasets live in **tests** and the **MSW handlers** (`src/test/`, `src/mocks/`) or in explicit Storybook stories / dev-only fixtures. **Production code (`src/`, excluding test and mock files) must never** contain inline fake data, hardcoded sample payloads, or imports of test factories. A hardcoded "example" component response is a `// STUB:`.

## The ledger — `docs/STUBS.md`

Every `// STUB:` / `throw new Error("STUB: …")` in `src/` (excluding `*.test.*`, `*.spec.*`, `src/test/**`, `src/mocks/**`, `*.stories.*`) MUST have a matching entry in `docs/STUBS.md`:

```
| File:line | Reason | Test that must force the real impl | Owner | Date |
|---|---|---|---|---|
| src/features/todos/hooks/useTodos.ts:42 | fixed list until pagination lands | useTodos paginates | @your-handle | 2026-06-02 |
```

CI fails if a STUB exists in `src/` whose file is not listed in `docs/STUBS.md`. This is what _forces_ recording it — unlogged stubs do not merge.

> **Ledger initialization.** On `/bootstrap`, `docs/STUBS.md` is initialized as an **empty ledger for this project** — the header row + column definitions, with the example/template row removed.

## Lifecycle

1. **GREEN (inner loop):** a stub is allowed only to get the current test green quickly. Mark it `// STUB:` immediately and add a `docs/STUBS.md` row.
2. **REFACTOR:** replace the stub with real logic, or — if deferred deliberately — keep it marked + logged and add the test that will later force the implementation.
3. **Quality Gate / PR:** `reviewer` and `security-scanner` explicitly flag any stub or hardcoded/fake data; unlogged stubs are 🔴. No `// STUB:` reaches `main` without a ledger entry; ideally none reaches `main` at all.

## Triangulation (prevent stubs from passing)

Defeat naive hardcoded returns by asserting behavior from **at least 2–3 distinct cases** (empty / one / many / error), not a single example. `tester` writes triangulating cases so "render one hardcoded row" cannot stay green. This is the strongest guard.

## Enforcement (the gate)

- **ESLint** `no-warning-comments` (configured for `TODO`/`FIXME`/`XXX`/`HACK`) flags generic leftover markers as errors in CI — secondary net.
- **`scripts/check_stubs.sh`** (run in `frontend-ci.yml` and locally): greps `src/` for `STUB` / `throw new Error("STUB`, excludes test/mock/story files, and **exits non-zero** for any stub whose file is not recorded in `docs/STUBS.md`. Run it locally before pushing.
- **`/wrap-up`** reports residual STUBs at end of session.
- **Reviewer/security gate:** a stub in production logic (especially anything returning auth/permission/financial values, or faking an API response) is a blocker, not a nit.

## Binds these agents (rule is auto-loaded)

- `react-developer` — when stubbing to go GREEN, immediately add the `// STUB:` marker and a `docs/STUBS.md` row; remove in REFACTOR when possible.
- `tester` — triangulate so hardcoded returns fail; add the test named in the ledger that will force the real implementation.
- `reviewer` / `security-scanner` — at the Quality Gate, flag every stub / fake-data / unlogged marker.

> Goal: stubs are a _visible, temporary_ TDD tool — never silent technical debt that ships.

<!-- END SOURCE docs/ai/rules/no-stubs.md -->


<!-- SOURCE docs/ai/rules/node-commands.md SHA256 cb7f9155bd4144c414b0c5df2a47e2410fe5bebaccc5be9608c4ddeae62c24b6 -->

# Node / development commands

Node 24 is the primary runtime. Use PowerShell on native Windows and invoke
Bash scripts with the explicit Git for Windows bash executable. Linux uses its
native Bash. Do not mix Windows and WSL toolchains. Paths with spaces/Unicode
must be passed as arguments, not assembled into unquoted shell commands.

Run environment detection explicitly; hooks are not assumed. On WSL mounted
drives retain Vitest forks: the historical Tinypool Atomics.wait/9p limitation is
not a reason to switch pools blindly. Record WSL/macOS as unverified without runs.

## Day-to-day (local)

```bash
npm ci                   # lockfile-exact install; dependency upgrades are separate
npm run dev              # Vite dev server (http://localhost:5173)
npm run build            # production build → dist/
npm run preview          # serve the production build locally
```

## TDD loop

```bash
npm run test             # vitest watch (inner loop)
npm run test:run         # vitest once (CI)
npm run test:cov         # vitest + coverage
npm run e2e              # playwright run (outer loop)
npm run e2e:ui           # playwright UI mode (debug)
```

## Quality gates (run locally before pushing)

```bash
npm run typecheck        # tsc --noEmit
npm run lint             # eslint (incl. jsx-a11y)
npx prettier --check .     # read-only formatting check; fix only task-owned files
npm run api:types        # regenerate src/lib/api/schema.d.ts from openapi.yml
bash scripts/check_types_drift.sh    # types match the committed schema
bash scripts/check_stubs.sh          # every STUB is logged
bash scripts/check_file_size.sh      # no src file over 800 lines
bash scripts/check_feature_readmes.sh # every feature has a README
bash scripts/check_contract_sync.sh  # vendored openapi.yml matches the pinned tag
bash scripts/check_plan_sync.sh       # non-trivial PR has an updated living plan
bash scripts/check_routes_registry.sh # router change reconciled with routes.json + docs/verify
bash scripts/check_guides_sync.sh     # route/auth change updates docs/guides
npm audit --audit-level=high          # no high/critical advisories
npm run build && bash scripts/check_bundle_size.sh  # bundle within .performance-budget.json (gzipped)
```

## Make wrappers (optional shortcuts)

A root `Makefile` wraps the most common commands so they are identical across machines (`make help`, `make dev`, `make test`, `make gates`, `make setup`). Convenience only — the canonical commands are the npm scripts above.

## Contract refresh (deliberate, reviewed)

```bash
npm run api:pull         # pull the contract openapi.yml from VadayI/claude-api-contract (approved non-secret contract pin/environment)
npm run api:types        # regenerate types; review the diff for breaking changes
```

## Staging (VPS, Debian)

Deployment is a separate authorized action, never an implicit wrap-up step.

The production build is static files served by nginx. Deploy = build + sync `dist/` (or build the Docker image) on the VPS behind a reverse proxy with its own subdomain.

```bash
ssh <user>@<STAGING_HOST>
cd ~/projects/<project>
git pull
docker compose -f docker-compose.staging.yml up -d --build   # builds + serves dist/ via nginx
```

> Mobile testing — open the staging subdomain in the phone's browser.

<!-- END SOURCE docs/ai/rules/node-commands.md -->


<!-- SOURCE docs/ai/rules/observability-and-errors.md SHA256 e6049a3006f569fc525a4e593cd8755d8e57b6d04f2aa041346a1d9251b84e0d -->

# Observability & runtime errors (no blank screens, no PII)

Tests prove the app is correct at build time; **observability** is how we know it stays correct in front of real users. This project requires that a runtime failure never becomes a blank white screen, that errors are **caught, announced, and recoverable**, and that what we log is **useful without leaking secrets or personal data**.

## Error boundaries (mandatory)

- A **top-level error boundary** wraps the app shell and renders an accessible fallback (a `role="alert"` message + a retry/reload affordance), never a blank page or a raw stack trace.
- **Route-level boundaries** isolate failures to the screen that broke (React Router `errorElement` per route / loader), so one feature crashing does not take down the whole app.
- Async/data errors are the component's **error state** (docs/ai/rules/component-contract.md), not the boundary — boundaries catch _render_ crashes; expected API errors (`ApiError`, docs/ai/rules/api-contract.md) are handled in the UI with a retry.
- The boundary reports the error to the logging sink (below) before showing the fallback.

## Logging & monitoring

- **One reporting client**, initialized in `src/lib/observability/`, wraps the chosen sink (e.g. Sentry) behind a thin interface so the vendor is swappable and tests don't hit the network. Errors, unhandled rejections, and boundary catches funnel through it.
- **Environment-gated & consented:** monitoring is enabled per env via `VITE_*` config (DSN/endpoint), off by default in dev/test, and respects the user's consent where required (no tracking before consent).
- **Source maps** are uploaded to the sink at build time (and not served publicly) so stack traces are readable without shipping readable code to users.
- **Release + environment tags** accompany every event so a regression can be traced to a deploy.

## No PII / no secrets in telemetry (hard rule)

- **Never log tokens, passwords, auth headers, cookies, or full request bodies.** Scrub `Authorization`, `Cookie`, and known sensitive fields in a `beforeSend` hook before anything leaves the browser (ties to docs/ai/rules/auth.md — tokens never touch web storage _or_ logs).
- **Never put PII in event messages or breadcrumbs** (emails, names, addresses). Log stable ids and error codes, not user content.
- Console noise is not telemetry — production builds strip debug `console.*`; real signal goes through the reporting client.

## Rules

- Every app has a top-level boundary + per-route boundaries; a crash shows an accessible, recoverable fallback.
- All error reporting goes through the one observability client; components never call the vendor SDK directly.
- Telemetry is consented, env-gated, and PII/secret-free; sensitive fields are scrubbed in `beforeSend`.
- Expected API errors are UI error-states with retry; only unexpected render crashes hit the boundary.

## Testing (mandatory)

The top-level and a route-level boundary each have a test that throws in a child and asserts the **accessible fallback** renders (queried by role, not class) and that the reporting client was invoked. The `beforeSend` scrubber has unit tests proving `Authorization`/`Cookie`/known-PII fields are stripped. `jest-axe` clean on the fallback.

## Binds these agents (rule is auto-loaded)

- `ui-architect` — declares the boundary placement (app shell + which routes get their own `errorElement`) and the fallback's a11y contract.
- `react-developer` — implements boundaries + the single observability client; wires the `beforeSend` scrubber; never calls the vendor SDK from components.
- `state-architect` — ensures expected `ApiError`s surface as UI error-states, not boundary crashes.
- `security-scanner` — blocks tokens/PII/secrets reaching telemetry, public source maps, and tracking before consent.
- `tester` — boundary-renders-fallback tests + scrubber unit tests + axe on the fallback.
- `reviewer` — flags blank-screen failure modes, direct vendor-SDK calls in components, and unscrubbed logging.

> Goal: a runtime failure is caught, announced accessibly, recoverable, and reported — with telemetry that helps debugging and never leaks a token or a user's data.

<!-- END SOURCE docs/ai/rules/observability-and-errors.md -->


<!-- SOURCE docs/ai/rules/performance-budgets.md SHA256 30236a6d55fcfb4020ab2f4291e2f8bbfadc758ceff0ae931c396b63069ae5e1 -->

# Performance budgets (measured, gated)

A React SPA degrades silently — one stray dependency or an un-split route, and the bundle balloons while no test goes red. This project sets **explicit, enforced budgets** so performance is a number that fails CI, not a vibe. Budgets cover the **shipped bundle** and the **runtime experience** (Core Web Vitals), and are tuned per project, never invented per PR.

## The budgets (defaults — tune in `.performance-budget.json`)

- **Initial JS (gzipped, route `/`)** ≤ **200 KiB**; total initial transfer ≤ **350 KB**. Each lazy route chunk ≤ **120 KB** gzipped.
- **Core Web Vitals (lab, mid-tier mobile via Lighthouse CI):** LCP ≤ **2.5 s**, CLS ≤ **0.1**, INP ≤ **200 ms**, TBT ≤ **200 ms**. *(advisory until Lighthouse CI is wired — see Enforcement)*
- **Lighthouse Performance score** ≥ **90** on the main screens. *(advisory until Lighthouse CI is wired — see Enforcement)*
- A regression > **5%** on any tracked metric fails the PR — budgets ratchet down, never silently up.

## How we stay inside them

- **Code-split at the route boundary.** Routes are `React.lazy` + `Suspense` with an accessible loading fallback (`role="status"`, docs/ai/rules/component-contract.md). The shell + first route is the only synchronous JS.
- **Defer the heavy and the rare.** Charts, editors, date pickers, PDF/CSV libs, anything large or below-the-fold is dynamically imported on demand, not in the initial chunk.
- **Watch the dependency cost.** Before adding a library, check its bundle weight (bundlephobia / `vite build` diff) and prefer tree-shakeable, ESM packages; import named members, never the whole barrel (`import { x } from 'lib'`, not `import * as`). A heavy dep needs a justification in the PR.
- **MUI specifics:** rely on the central theme + `sx` (no per-render `styled()` factories in hot paths), import icons individually (`@mui/icons-material/Foo`), and let tree-shaking drop unused components — never `import * as Icons`.
- **Render cost:** memoize only where a profiler shows a real re-render problem (`React.memo`/`useMemo`/`useCallback` are not decoration); virtualize long lists; keep `useEffect` dependency arrays honest. Premature memoization is its own smell (docs/ai/rules/code-style.md).
- **Assets:** images are sized/compressed and lazy (`loading="lazy"`), fonts are subset and `font-display: swap`; respect `prefers-reduced-motion` (docs/ai/rules/accessibility.md).

## Enforcement (the gate)

- **`scripts/check_bundle_size.sh`** runs after `vite build`, compares gzipped chunk sizes against `.performance-budget.json`, and **exits non-zero** when a budget is exceeded. Run locally before pushing.
- **Lighthouse CI** (`lhci`, CWV/score budgets against `npm run preview`) is **planned — not yet wired into `frontend-ci.yml`** (see the `_note` in `.performance-budget.json` and `docs/plans/ci-gates-plan.md`). Until it lands, the **Core Web Vitals targets above are advisory, not a CI gate**; only `scripts/check_bundle_size.sh` is enforced.
- **`reviewer`** flags un-split heavy routes, whole-barrel imports, and unjustified large dependencies; a budget breach is 🟡 Important, a core-flow LCP/INP regression is 🔴.

## Binds these agents (rule is auto-loaded)

- `ui-architect` — declares which routes are lazy-loaded and what the loading fallback is, as part of the contract.
- `react-developer` — code-splits routes, dynamically imports heavy/rare modules, keeps imports named/tree-shakeable, runs the bundle check locally.
- `react-refactoring-expert` — owns render-cost work (memoization, virtualization) under green tests, driven by profiler evidence not guesswork.
- `ci-cd-engineer` — wires `check_bundle_size.sh` into the pipeline (Lighthouse CI is planned, not yet wired) and keeps `.performance-budget.json` authoritative.
- `reviewer` — blocks PRs that breach a budget or add an unjustified heavy dependency.

> Goal: bundle weight is an explicit number checked on every build (and Core Web Vitals once Lighthouse CI is wired), so performance can only get better — a bundle regression fails CI instead of shipping unnoticed.

> **Skill:** activate the `performance-optimization` skill for code-splitting and render-cost recipes.

2026-09-20: initial-JS limit is explicitly 200 KiB by user decision; see ADR 0029.

<!-- END SOURCE docs/ai/rules/performance-budgets.md -->


<!-- SOURCE docs/ai/rules/preflight.md SHA256 d6edca439cc631e0c2be17926bf613202c07706428af97c247822e9c4a9a23d5 -->

# Project kickoff preflight

Before implementation, verify the inputs needed for the actual task:

1. A usable brief: user request, README or docs/PROJECT.md states the scope,
   users and affected flows. Ask only for missing decisions that block the task.
2. Declared React/Vite/TypeScript/MUI/Query/Zustand stack and consistent package
   metadata. Follow the existing architecture; investigate contradictory inputs.
3. The external API pin and vendored schema are available and integrity checked.
   Use non-secret pin metadata/current authorized environment; do not read .env.
   Pull/regenerate through supported tooling when needed. Missing endpoints are
   contract work, never an excuse to invent an API. See api-contract.md.
4. Design references are recommended: docs/design, an accessible running design,
   Figma assets, theme tokens or brief. Record L1-L4 fidelity (default L3). Inspect
   live designs with an available browser capability. Without references, record
   use of MUI defaults; unavailable optional browser plugins are not blockers.
5. Consult current official library documentation for changed APIs. Context7 is
   an optional implementation; official docs are an equivalent. If no verified
   source is reachable, identify the affected uncertainty rather than claiming
   verified compatibility or blocking unrelated work.
6. For remote operations, check gh authentication/repository access without
   secrets. Local implementation can proceed without GitHub. Record remote
   checks as NOT_VERIFIED until the required access is available.

Stop only the dependent action when an essential input is missing; proceed with
independent authorized work. No additional approval is needed for decisions
already supplied by the user. Doctor checks environment capabilities; preflight
checks task inputs. Coordinators delegate within an explicitly selected pipeline;
workers do not adopt a coordinator-only prohibition against implementation.

<!-- END SOURCE docs/ai/rules/preflight.md -->


<!-- SOURCE docs/ai/rules/routing-and-data-loading.md SHA256 131bf0b5c28fd135107b4493e1637d457a441d502c297ed46c37cbea2766efed -->

# Routing & data loading (data router, Query owns server-state)

React Router 7's data router adds loaders, actions, and `errorElement` — powerful, but easy to misuse by turning loaders into a second, competing data layer next to TanStack Query. This project draws the line: **TanStack Query owns server-state**, the **router owns navigation, gating, URL-state, and error/pending boundaries**. Routes are split, guarded, and each declares its states — the routing companion to docs/ai/rules/state-management.md and docs/ai/rules/component-contract.md.

> **Package note (ADR 0026):** React Router 7 ships as a single consolidated package (`react-router`); the separate `react-router-dom` package is no longer published. The app entry (`src/main.tsx`) imports `RouterProvider` from `react-router/dom` (the real-DOM sub-path); all other files — including Vitest test helpers — import from the top-level `react-router`. Route elements are `React.lazy` + `<Suspense fallback={<RouteFallback />}>` (accessible `role="status"` fallback); the shell, index route, and `RequireAuth` guard remain synchronous.

## The data router is the routing source of truth

- Routes live in `src/app/router.tsx` as a **data router** (`createBrowserRouter`), not scattered `<Route>` trees. Each route maps to a screen and declares its guard and its `errorElement`.
- **Code-split at the route boundary** — route elements are `React.lazy` + `Suspense` with an accessible fallback (`role="status"`), per docs/ai/rules/performance-budgets.md. The shell + first route is the only synchronous JS.

## Loaders/actions vs TanStack Query (the boundary)

- **Server data is fetched and cached by TanStack Query**, in feature hooks with structured keys (docs/ai/rules/state-management.md). Components do not get their list/entity data from a raw loader return that bypasses the Query cache.
- **Loaders stay thin** and do routing-level work: parse/validate route params, enforce auth/role gating (redirect anonymous → login with `?next=`), and optionally **warm the cache** via `queryClient.ensureQueryData(...)` so the screen has data on first paint — the component still reads through `useQuery`, so caching/refetch/invalidation stay in one place.
- **Actions** handle route-level form submissions only where it genuinely simplifies things; otherwise mutations go through TanStack Query mutation hooks (docs/ai/rules/forms-and-validation.md). Pick one per form deliberately — don't split a submit across both.

## URL is state — don't duplicate it

- Filters, pagination, sort, selected tab, and search live in the **URL search params** (the shareable, back-button-correct source), read via the router — not copied into a Zustand store. Derive from the URL at render time (docs/ai/rules/state-management.md).
- Query keys incorporate the URL-derived params so navigation drives refetch naturally.

## Guards & errors

- Authorization is **separate, testable guards** in `src/app/guards/` (or loader redirects), never `if (user) …` sprinkled in pages. Anonymous → login (preserve destination); authenticated-but-forbidden → a 403 screen, not a blank page (docs/ai/rules/component-contract.md).
- Every route has an `errorElement` so a thrown loader/render error shows an accessible, recoverable fallback scoped to that screen, not a white page (docs/ai/rules/observability-and-errors.md).

## Rules

- One data router in `src/app/router.tsx`; routes are lazy, guarded, and each declares its `errorElement`.
- Server-state is TanStack Query's job; loaders are thin (params, gating, optional cache-warm), not a parallel cache.
- One submission mechanism per form (Query mutation **or** route action), chosen deliberately.
- URL search params hold filter/sort/pagination/tab state; don't duplicate them in a store.

## Testing (mandatory)

Guards are tested for **allowed and denied** paths (user A must not reach user B's protected screen). A loader redirect (anonymous → login preserving `next`) is tested. A route `errorElement` renders its accessible fallback when a child throws. URL-param-driven state is tested (changing the param changes what renders / refetches). A Playwright journey covers the primary navigation path. `jest-axe` clean on guard/error screens.

## Binds these agents (rule is auto-loaded)

- `ui-architect` — declares routes, their guards, lazy boundaries, `errorElement`s, and which params are URL-state; records routes in `.claude/memory/routes.json` (docs/ai/rules/verification.md).
- `state-architect` — owns the Query/loader boundary and the query keys that incorporate URL params; ensures loaders warm the cache rather than bypass it.
- `react-developer` — implements the data router, lazy routes, guards, and thin loaders; keeps server data in Query.
- `tester` — guard allowed/denied, loader redirect, `errorElement` fallback, URL-param-driven render, Playwright nav path.
- `reviewer` — flags loaders that duplicate the Query cache, URL-state copied into stores, routes without an `errorElement`, and inline auth checks in pages.

> Goal: the router owns navigation, gating, URL-state, and error boundaries; TanStack Query owns server-state — the two never become competing data layers.

<!-- END SOURCE docs/ai/rules/routing-and-data-loading.md -->


<!-- SOURCE docs/ai/rules/state-management.md SHA256 d31d463e0edaf499a470a37e18d648b3b481edc38e1daa6a3f9ddb2aa07878ee -->

# State management — server-state vs client-state (the data layer)

The single most important state decision in a React app is **server-state vs client-state**. Getting it right removes most state bugs; getting it wrong produces stale data, prop-drilling, and over-stuffed global stores. This project draws the line explicitly.

## The split

- **Server-state** (data that lives on the backend: lists, entities, anything fetched) → **TanStack Query**. It owns caching, background refetch, loading/error status, dedupe, and invalidation. Never copy server data into a global store "to share it" — share the query.
- **Client-state** (UI-only: open/closed, selected tab, theme, draft form values, auth token) → **Zustand** for anything shared across routes/components, local `useState`/`useReducer` for component-local state.

## TanStack Query conventions

- **Query keys are structured and centralized** per feature: `src/features/<feature>/api/keys.ts` exports a factory, e.g. `todoKeys.all`, `todoKeys.list(filters)`, `todoKeys.detail(id)`. No stringly-typed keys scattered in components.
- **Queries and mutations are wrapped in hooks** (`useTodos`, `useCreateTodo`) in `src/features/<feature>/hooks/` — components never call `useQuery` with an inline fetcher.
- **Mutations invalidate or update precisely** — invalidate the narrowest key that changed, or do optimistic updates with rollback on error. Document the invalidation in the hook.
- **Error normalization** happens in the API client (docs/ai/rules/api-contract.md); hooks surface a typed error the UI can render.
- **Defaults** (staleTime, retry, refetchOnWindowFocus) are set once on the `QueryClient` in `src/lib/query/`, tuned per query only when needed.

## Zustand conventions

- One store per concern (`useAuthStore`, `useUiStore`), defined in the feature's `store/` directory (or a single `store.ts` when there's just one store) with a typed state + actions; **no business/server data** in stores.
- Select narrowly (`useUiStore(s => s.sidebarOpen)`) to avoid needless re-renders.
- Persisted slices (e.g. theme, locale, sidebar layout) use the `persist` middleware with an explicit allowlist. The **auth token is NEVER persisted** — it lives in memory only (docs/ai/rules/auth.md); never route it through `persist`.
- Stores are unit-tested: initial state + each action's transition.

## Rules

- If data comes from the API, it is server-state → TanStack Query. Full stop.
- Global client store holds UI/session state only, kept minimal.
- Derive, don't duplicate: compute from the query/store at render time rather than syncing copies.
- Every query key change and store action is covered by a test.

## Binds these agents (rule is auto-loaded)

- `state-architect` — owns the query-key design, cache/invalidation strategy, and store shapes; reviews them at the Quality Gate.
- `react-developer` — implements hooks/stores following these conventions.
- `tester` — tests store transitions and hook behavior (with MSW for queries).
- `reviewer` — flags server data leaking into global stores, stringly-typed keys, and over-broad invalidation.

> Goal: server-state and client-state never blur; the data layer is predictable, cache-correct, and testable.

> **Skills:** activate the `tanstack-query-design` and `zustand-state` skills for query-key, cache, and store recipes.

<!-- END SOURCE docs/ai/rules/state-management.md -->


<!-- SOURCE docs/ai/rules/surgical-changes.md SHA256 e372b7a9d4725249505803bfe3f454a34fd87f5b3dd213ca96646b1a570b8550 -->

# Surgical changes (minimal, traceable diffs — enforced at the Quality Gate)

A change is correct not only when tests pass, but when the **diff contains nothing the
request didn't ask for**. LLM edits tend to drift: they "improve" adjacent code, reformat
untouched lines, rename things for taste, or delete code they don't fully understand as a
side effect. This rule makes every diff **surgical** — each changed line traces directly to
the user's request. It is the companion to "Simplicity First" (docs/ai/rules/code-style.md)
and the "minimal blast radius" principle (docs/ai/rules/workflow.md): simplicity governs the
code you write, surgicality governs the lines you touch.

## When editing existing code

- **Don't "improve" what you weren't asked to.** No reformatting, no comment rewrites, no
  style tweaks on lines unrelated to the task — even if you'd write them differently.
- **Match the existing style** of the file/feature, not your personal preference. The local
  convention wins.
- **Don't refactor what isn't broken** as a side effect of an unrelated change. A worthwhile
  refactor is its own task/PR, not a rider on a feature.
- **Every changed line traces to the request.** If you can't explain a hunk by pointing at
  the user's ask (or a test it makes pass), it doesn't belong in the diff.

## Comments & code you don't fully understand

- **Do not change or delete comments/code you don't understand** just because they're near
  your edit. If something looks wrong but is orthogonal to the task, **mention it — don't
  touch it**.
- Pre-existing dead code is **reported, not removed**, unless removing it is the task.

## Cleaning up your own mess

- Remove imports/variables/functions/types that **your** change made unused — leaving orphans
  is not "surgical", it's incomplete.
- This is the one cleanup you own: the orphans your edit created, nothing more.

## Relation to other rules

- **Simplicity First** (docs/ai/rules/code-style.md) decides _what code to write_; this rule
  decides _which lines to touch_. Both must hold.
- A deliberately deferred placeholder is still a `// STUB:` with a ledger row
  (docs/ai/rules/no-stubs.md) — surgicality is not an excuse to leave silent debt.
- Unrelated improvements you spot go to `docs/lessons.md` or a follow-up task, never into the
  current diff.

## Rules

- The diff changes only what the request requires; no drive-by reformatting or refactoring.
- Match local style; don't rename/restructure for taste.
- Don't alter or delete comments/code you don't understand — flag, don't touch.
- Remove only the orphans your own change created; leave pre-existing dead code (report it).

## Binds these agents (rule is auto-loaded)

- `react-developer` — keeps edits surgical; removes only self-created orphans; flags unrelated
  issues instead of fixing them inline.
- `react-refactoring-expert` — refactors are explicit, scoped tasks under green tests, never a
  side effect of a feature change.
- `reviewer` — blocks drive-by reformatting, unrequested refactors, deletion of un-understood
  code, and any hunk that doesn't trace to the request.
- `debugger` — the fix changes only what reproduces/repairs the bug, nothing adjacent.

> Goal: every diff is minimal and traceable — each touched line earns its place by serving the
> request, so reviews are fast and changes don't carry hidden, unrequested edits.

<!-- END SOURCE docs/ai/rules/surgical-changes.md -->


<!-- SOURCE docs/ai/rules/tdd.md SHA256 9b471f08a7c02628112ff2ac88f70c738212dae809bc04d11e38fbec32c96e9b -->

# TDD in TypeScript / React (mandatory)

## Iron rule

**No line of production component, hook, or store code without a failing test first.**

Cycle for each unit of functionality:

1. **RED** — write a test describing the expected user-visible behavior. Run it — it must fail for the expected reason (the behavior is missing), not because of an import/type error.
2. **GREEN** — write the MINIMAL code to make the test pass. No premature generalization, no props/states nobody tests yet.
3. **REFACTOR** — clean up component, hook, and test, tests stay green.

Repeat in small steps. One test → a bit of code → green → refactor.

> GREEN may use a temporary stub / hardcoded return to go green fast — but every stub must be marked `// STUB:` and recorded in `docs/STUBS.md`, and must never reach `main` unlogged. Rules and the CI gate: docs/ai/rules/no-stubs.md.

## Double-loop TDD — outside-in at the UI boundary

This is our adaptation of Harry Percival's _Obey the Testing Goat_ double-loop to a React SPA. We keep his discipline — test-first, Red-Green-Refactor, minimal code, **test behavior not implementation** — and we keep his **outer loop as a real user-facing functional test**. For a React app the user-facing boundary is the **rendered UI driven through the browser**, so:

- **Outer loop (acceptance / functional / E2E):** a failing **Playwright** test that drives the real app in a browser as a user would — navigates a route, types, clicks, and asserts on what the user sees. The network is stubbed at the boundary (Playwright route interception or a running MSW worker) so the test is deterministic and does not need the live backend. It goes green only when the whole vertical slice works end to end: routing, data fetching, rendering, the success state, and the error/empty states.
- **Inner loop (unit / component):** fast RED → GREEN → REFACTOR cycles with **Vitest + React Testing Library**, mocking the network with **MSW** (Mock Service Worker). These cover a single component's states, a custom hook's behavior, a Zustand store's transitions, a mapper in the API layer, and validation logic — the small steps that make the outer Playwright test pass.

Flow per feature: **outer Playwright test RED → run the inner Vitest/RTL loop (RED→GREEN→REFACTOR) until the outer test is GREEN → refactor.** This maps onto the pipeline: `ui-architect` fixes the component/route contract → `tester` writes the failing outer Playwright test and the first failing RTL test → `react-developer` greens them via inner loops.

Why MSW and not hand-rolled mocks: MSW intercepts at the network layer (`fetch`/`XHR`), so components and TanStack Query hooks run **exactly the code path they run in production** — only the HTTP response is faked. This gives the same "real boundary" parity that a real test database gives a backend, without coupling tests to implementation details of the fetch layer. The MSW handlers are derived from the external contract repo's OpenAPI schema (`VadayI/claude-api-contract`, docs/ai/rules/api-contract.md), so the mocked shapes cannot drift from the real API.

## Test behavior, not implementation (RTL discipline)

React Testing Library exists to make you test what the user experiences, not how the component is built. This is the single most important habit for durable frontend tests.

- **Query the way a user (or assistive tech) finds things:** `getByRole`, `getByLabelText`, `getByText`, `getByPlaceholderText`. Reserve `getByTestId` for the rare case with no accessible handle.
- **Never assert on:** component internal state, a hook's variable names, CSS class names, the number of renders, or which child component was called. These are implementation; they change on refactor and give false failures.
- **Interact like a user:** drive events with `@testing-library/user-event` (real focus/keyboard/click sequencing), not by calling handlers directly.
- **Async UI:** wait for the _result the user sees_ with `findBy*` / `waitFor` — never `setTimeout`. Assert the spinner appears, then the data row appears, then the spinner is gone.
- A test that has to import internals to work is testing the wrong thing — rewrite it against the rendered output.

## What to test / what to skip

**Always test:**

- every interactive component: its loading, success, **empty**, and **error** states (the four states are mandatory for anything that fetches);
- form validation (invalid input → visible error, submit disabled/enabled), and successful submit (the mutation fires with the right payload);
- custom hooks (`use*`) and Zustand stores — their transitions and edge cases;
- routing/guards (authenticated vs anonymous redirects), and URL/query-param-driven state;
- the API layer mappers (DTO → view model) and error normalization;
- **accessibility**: each component passes `jest-axe` with no violations; key flows are keyboard-only operable (docs/ai/rules/accessibility.md);
- a Playwright happy-path journey per feature, plus the primary error path.

**Can skip:**

- purely presentational components with no logic and no branching (a styled wrapper) — though an a11y smoke test is cheap and encouraged;
- third-party library internals (MUI, Router, Query) — test _your_ usage, not their code;
- exact pixel layout (that is visual-regression territory for `qa`, not unit tests).

## Triangulation

Assert behavior from at least 2–3 distinct cases (different inputs → different rendered output) so a hardcoded/stub return cannot stay green. E.g. a list component is tested with an empty list (empty state), one item, and many items (and a fetch error) — `return null` or a hardcoded row cannot pass all four. See docs/ai/rules/no-stubs.md.

## Order for a frontend feature

1. `ui-architect` fixes the contract: route(s), the component tree and each component's props, the four UI states, which API endpoints (from the OpenAPI contract) the feature consumes, the TanStack Query keys and any Zustand store shape, and the a11y requirements.
2. `tester` writes:
   - a **Playwright** outer test for the user journey (RED — the route/screen does not exist yet);
   - the first failing **Vitest + RTL** component test (states + interaction) with **MSW** handlers for the endpoints.
3. `react-developer` adds the component / hook / store / API client code — just enough to green the tests, via inner loops. Any stub used to go green is marked + logged per docs/ai/rules/no-stubs.md.
4. Refactor + `eslint --fix` + `prettier`. Outer + inner tests stay green.

## Tools

- `vitest` + `@testing-library/react` + `@testing-library/user-event` + `@testing-library/jest-dom` (matchers).
- `msw` for network mocking (a shared `src/test/server.ts` for Node tests, `src/test/browser.ts` worker for dev/Playwright).
- `jest-axe` (component a11y) and `@axe-core/playwright` (E2E a11y).
- `@playwright/test` for the outer loop.
- Test data via small typed factories in `src/test/factories/` (no inline fixtures duplicated across tests).

## Test structure & naming

- AAA: Arrange / Act / Assert.
- Names: `<subject> <condition> <expectation>` (e.g. `TodoList renders empty state when no todos`).
- Colocate component tests next to the source (`TodoList.test.tsx`); E2E specs live in `e2e/`.

## Commands

```bash
npm run test            # vitest watch (inner loop)
npm run test:run        # vitest once (CI)
npm run test:cov        # vitest with coverage
npm run e2e             # playwright run (outer loop)
npm run e2e:ui          # playwright UI mode (debug the journey)
npm run lint            # eslint
npm run typecheck       # tsc --noEmit
```

> **Skills:** activate the `vitest-rtl-tdd` (inner loop) and `playwright-e2e` (outer loop) skills for concrete test recipes.

<!-- END SOURCE docs/ai/rules/tdd.md -->


<!-- SOURCE docs/ai/rules/upgrade-policy.md SHA256 fb36c7f01f6b7858b16551825a6c16d41da4c1d78fecf92b7178212a11f83ead -->

# Dependency upgrade policy (steady, automated, gated)

Dependencies rot whether or not you touch them — security advisories land, transitive trees shift, and a year-long upgrade gap becomes a painful, risky migration. This project upgrades **in a steady rhythm with automation**, lets the **green CI gate** prove safety, and treats a **major/breaking** bump as a deliberate, recorded event — never a silent `npm update`.

## Automation drives the cadence

- **Renovate (or Dependabot)** opens grouped upgrade PRs on a schedule, so upgrades are small and continuous instead of a big-bang once a year. Config is committed.
- **Grouping:** patch/minor across the dev toolchain (eslint/prettier/vitest/types) are batched; runtime libraries (React, MUI, Router, TanStack Query, Zustand) are grouped per-ecosystem so a breaking change is isolated and reviewable.
- **Lockfile-only** maintenance (transitive bumps for advisories) flows through the same mechanism (docs/ai/rules/dependencies-and-supply-chain.md).

## Review and merge authorization

- **Patch & minor** on a **green CI** (tests + typecheck + lint + a11y + bundle budget all pass, docs/ai/rules/performance-budgets.md) still require an explicit user merge command — the gate is the proof.
- **Security advisories** are expedited (high/critical jump the queue) but still go through CI.
- **Major / breaking** bumps are **never auto-merged**: they need a human, a read of the changelog/migration guide, and — for a framework-level change — an **ADR** (e.g. React 18→19 via ADR 0024; MUI 6→9 via ADR 0025). The migration and its tests land in the same/linked PR.

## Stay current, on purpose

- Keep runtime libraries within a small window of the latest stable (don't drift majors behind); schedule the migration rather than letting the gap compound.
- MUI 9 (ADR 0025), React 19 (ADR 0024), React Router 7 (ADR 0026), and the TanStack Query 5 / Zustand 5 sweep (PR E) are the current baselines; future major migrations follow the same pattern. Pinned choices are revisited on a cadence and bumped when the ecosystem catches up — the decision is recorded, not forgotten.
- Node engine and CI runner versions are upgraded deliberately (Node 24+ is the floor, docs/ai/rules/environment.md); a bump is its own reviewed PR.

## Rules

- Upgrades come through automation PRs, not ad-hoc `npm update` on a feature branch.
- Passing the selected CI/local profile is necessary for every upgrade. Every merge needs an explicit user command; framework major changes also require an ADR.
- Security high/critical is expedited but still gated.
- A breaking upgrade carries its migration + tests in the same PR; the contract/types drift gate must stay green (docs/ai/rules/api-contract.md).

## Binds these agents (rule is auto-loaded)

- `ci-cd-engineer` — owns the Renovate/Dependabot config and the checks and user-command merge rules in CI.
- `react-developer` — performs framework/library migrations under green tests; updates code for breaking changes.
- `devops` — bumps Node/runner/base-image versions deliberately in their own PRs.
- `reviewer` — blocks un-ADR'd major bumps, auto-merge of breaking changes, and upgrade PRs that skip the gate.

> Goal: dependencies move forward continuously and safely — automation proposes, the green gate proves, and the user authorizes every merge; framework breaking changes additionally require an ADR — so the project never faces a cliff-edge migration.

D01 supersedes any earlier automatic merge policy: never merge without the user command.

<!-- END SOURCE docs/ai/rules/upgrade-policy.md -->


<!-- SOURCE docs/ai/rules/user-guides.md SHA256 594824c8516c77b1a94f46fa7bfac225405e24e9c8f892bc28e91e3d54a6fc6f -->

# User-facing guides (mandatory, enforced at the Quality Gate)

The route/component contract and `docs/verify/<feature>.md` prove the UI is correct for a _reviewer_. They do NOT tell a **real user** or an **integrating developer** how to actually use the app. This rule mandates two living guides that grow with the project:

1. **`docs/guides/user.md`** — for the **end user** of the app: what the app does, how to sign in, how to perform the main flows, where things are, and how to recover from common errors.
2. **`docs/guides/developer.md`** — for a **developer working on or integrating with this frontend**: how to run it, environment variables, how the API contract is consumed and refreshed (`api:pull`/`api:types`), how routing/auth/state are structured, how to add a feature, and where the full contract lives (the external contract repo `VadayI/claude-api-contract`).

These are **narrative onboarding documents**, not a component dump. The contract is the OpenAPI schema (docs/ai/rules/api-contract.md); the per-feature manual smoke test is `docs/verify/` (docs/ai/rules/verification.md). The guides are the **"how do I get started"** layer above both.

## Required sections

### `docs/guides/user.md` (in order)

1. **Overview** — one paragraph: what the app does, who it's for.
2. **Getting in** — how to reach the app (URL), sign-in/sign-up flow if any.
3. **Main flows** — step-by-step for the primary user journeys the app actually ships (name the real screens/buttons).
4. **Tips & recovery** — empty states, common errors and what to do, where settings live.
5. **Where to go next** — links to support/help if applicable.

### `docs/guides/developer.md` (in order)

1. **Overview** — stack, that it's a frontend consuming a separate backend API.
2. **Run it locally** — prerequisites (Node 24+), `npm ci`, `cp .env.example .env` + which `VITE_*` vars to fill (base API URL, OpenAPI URL), `npm run dev`. Copy-paste runnable; dev URL `http://localhost:5173`.
3. **The API contract** — how the typed client/types are generated from the contract repo's OpenAPI (`npm run api:pull`, `npm run api:types`), the drift gate, where `openapi.yml`/`schema.d.ts` live, and the link to the contract repo (`VadayI/claude-api-contract`) and its Prism mock.
4. **Architecture** — feature-sliced layout, routing/guards, server-state (Query) vs client-state (Zustand), the theme.
5. **Add a feature** — the pipeline in one paragraph (contract → RED tests → GREEN → docs), where files go, the feature README requirement.
6. **Where to go next** — `docs/verify/`, ADRs, the backend repo.

Keep both copy-paste runnable and **derived from what the project actually ships** — real routes, real env vars, real scripts. Never invent a screen or command the code lacks; if a capability is not built yet, write "not yet available".

## Source of truth & reconciliation

- **Routes/flows** in `user.md` and **commands/env/endpoints** in `developer.md` MUST exist in the live code (`src/app/router.tsx`, `package.json` scripts, `.env.example`) and the OpenAPI schema. `guide-writer` verifies these before declaring the guide ready.

## Lifecycle (grows with the project)

1. **Born at bootstrap.** `/bootstrap` Mode A copies `templates/guides_user.md` → `docs/guides/user.md` and `templates/guides_developer.md` → `docs/guides/developer.md` as skeletons with `{TODO}` markers.
2. **Updated in the same PR** as user-visible surface changes (a new flow, a new auth method, a new top-level route, a new env var) — by `guide-writer` in the Documentation phase. Most volatile: _Main flows_ (user) and _Run it locally_ + _The API contract_ (developer).
3. **Verified on demand** via `/guides`.

## Enforcement (CI gate + Quality Gate)

**CI gate `scripts/check_guides_sync.sh`** — on a PR, if a top-level route (`src/app/router.tsx`) or the auth flow (`src/lib/auth/**`) changes, `docs/guides/user.md` and/or `docs/guides/developer.md` must be updated in the same PR. Narrative quality remains a Quality-Gate judgement by `reviewer` at the Quality Gate plus `guide-writer` in the docs phase:

- `reviewer` blocks a PR that changes user-visible surface — a new/changed **auth flow**, **top-level route**, **first-run step**, or a new **env var** — without updating the relevant guide. A stale "Run it locally" or "Main flows" section is 🟡 Important.
- `guide-writer` runs the reconciliation (every route/command/endpoint the guide names traces to code/schema) before declaring the PR ready.

## Binds these agents (rule is auto-loaded)

- `guide-writer` — owns both guides; creates them from templates, keeps them in sync, runs the reconciliation.
- `ui-architect` — when a contract change adds/removes an auth flow or top-level route, notes that `user.md`/`developer.md` need updating.
- `react-developer` — when adding an env var or changing the run flow, flags that `developer.md` needs updating.
- `docs-writer` — coordinates with `guide-writer` so guides, `docs/api/`, and `docs/verify/` stay consistent.
- `reviewer` — blocks PRs that change first-run / auth / top-level routes / env without a guide update.

> Goal: at every commit, a user can operate the app and a developer can run it and make their first successful API-backed screen by reading two short, always-current guides.

<!-- END SOURCE docs/ai/rules/user-guides.md -->


<!-- SOURCE docs/ai/rules/verification.md SHA256 76bced84e7df5688906dc339db264e1bc6afc409484b436affdd063d4094a0f5 -->

# Feature verification handoff (mandatory, automatic block)

Every feature that adds or changes a screen/route MUST ship a **human-facing verification guide** so the user (or a reviewer) can confirm the slice works by driving the real UI — in the **dev server** and via ready-to-run **Playwright** steps. The automated suites prove correctness for CI; this guide is the manual, click-through smoke test a person runs against a running app. Generated automatically at the end of the feature pipeline and on demand via `/verify`.

> Why this exists: tests are green in the runner, but the user still wants a concrete "open this route / do this / expect to see this" checklist to trust the feature by hand. The guide is derived from the route/component contract, never hand-invented, so it cannot drift from the real screens.

## The deliverable — `docs/verify/<feature>.md`

One markdown file per feature (slug matches the branch/feature name), written by `docs-writer` in the **Documentation** phase (phase 6), BEFORE the PR opens. Required sections, in order:

1. **Scope** — one line: which routes/screens this feature covers.
2. **Prerequisites** — base URL (`http://localhost:5173` in dev), how to start (`npm run dev`), how to seed/auth (which MSW scenario or how to log in if hitting a real backend).
3. **Per screen** — for each `route → screen`:
   - **Manual step**: navigate to the route, what to do, what you should see (the success state).
   - **The four states**: how to trigger and what to expect for loading, empty, and error (e.g. which MSW handler/scenario forces the error).
   - **Keyboard pass**: operate the primary action using only the keyboard; focus is visible and logical.
   - **Playwright**: the spec file + the `npm run e2e -- <file>` invocation that automates this journey.
4. **Done when** — a short checklist the user ticks: success renders, all four states verified, keyboard-only works, axe clean, Playwright green.

Keep it copy-paste runnable. Routes come from `.claude/memory/routes.json`; do not invent screens the contract does not have.

## Source of truth — `.claude/memory/routes.json`

Generated from a machine-readable route registry so it always matches the real app. `ui-architect` writes/updates an entry the moment it fixes a contract (phase 2). Schema per entry:

```json
{
  "path": "/todos",
  "feature": "todos",
  "screen": "TodosPage",
  "auth": "authenticated",
  "states": ["loading", "success", "empty", "error"],
  "consumes": ["GET /api/v1/todos/", "POST /api/v1/todos/"],
  "notes": "list + create"
}
```

`auth` is one of `anonymous` | `authenticated` | `role:<name>`. `consumes` entries trace to the OpenAPI schema (docs/ai/rules/api-contract.md).

### Reconciliation (enforced)

After GREEN, before the PR opens, `docs-writer` reconciles routes across: `.claude/memory/routes.json` ↔ the live router (`src/app/router.tsx`) ↔ `docs/api/INDEX.md` (consumed endpoints) ↔ the OpenAPI schema. The live router + schema are the source of truth; stale registry entries are corrected/removed.

**CI gate `scripts/check_routes_registry.sh`** enforces this on a PR: if `src/app/router.tsx` changes, both `.claude/memory/routes.json` and a `docs/verify/*.md` must be updated in the same PR, and `routes.json` must be valid JSON.

## Lifecycle (per feature)

1. **Phase 2 — contract.** `ui-architect` appends/updates the feature's routes in `.claude/memory/routes.json`.
2. **Phases 3–4 — RED/GREEN.** No verification work; the registry entry already exists.
3. **Phase 6 — docs.** `docs-writer` reconciles, generates/refreshes `docs/verify/<feature>.md`, includes it in the PR.
4. **On demand.** `/verify` regenerates it; with `--run` it executes the Playwright steps against a running app and reports pass/fail.

## Binds these agents (rule is auto-loaded)

- `ui-architect` — the contract is incomplete until the feature's routes are recorded in `.claude/memory/routes.json`.
- `docs-writer` — owns `docs/verify/<feature>.md`; runs the reconciliation and generates the guide before declaring the PR ready.
- `reviewer` — flags a PR that adds/changes a screen without a matching `docs/verify/<feature>.md` or whose `routes.json` disagrees with the router.
- `tester` — the states and keyboard/error paths listed in the guide must each correspond to a real test; the guide is the manual mirror of those tests.

> Goal: the moment a feature is green, the user has a concrete, contract-derived "open these routes, do this, expect this" guide — generated, never guessed.

<!-- END SOURCE docs/ai/rules/verification.md -->


<!-- END ROLE PACK react-developer -->
