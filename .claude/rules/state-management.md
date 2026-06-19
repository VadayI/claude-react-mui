# State management — server-state vs client-state (the data layer)

The single most important state decision in a React app is **server-state vs client-state**. Getting it right removes most state bugs; getting it wrong produces stale data, prop-drilling, and over-stuffed global stores. This project draws the line explicitly.

## The split

- **Server-state** (data that lives on the backend: lists, entities, anything fetched) → **TanStack Query**. It owns caching, background refetch, loading/error status, dedupe, and invalidation. Never copy server data into a global store "to share it" — share the query.
- **Client-state** (UI-only: open/closed, selected tab, theme, draft form values, auth token) → **Zustand** for anything shared across routes/components, local `useState`/`useReducer` for component-local state.

## TanStack Query conventions

- **Query keys are structured and centralized** per feature: `src/features/<feature>/api/keys.ts` exports a factory, e.g. `todoKeys.all`, `todoKeys.list(filters)`, `todoKeys.detail(id)`. No stringly-typed keys scattered in components.
- **Queries and mutations are wrapped in hooks** (`useTodos`, `useCreateTodo`) in `src/features/<feature>/hooks/` — components never call `useQuery` with an inline fetcher.
- **Mutations invalidate or update precisely** — invalidate the narrowest key that changed, or do optimistic updates with rollback on error. Document the invalidation in the hook.
- **Error normalization** happens in the API client (@.claude/rules/api-client.md); hooks surface a typed error the UI can render.
- **Defaults** (staleTime, retry, refetchOnWindowFocus) are set once on the `QueryClient` in `src/lib/query/`, tuned per query only when needed.

## Zustand conventions

- One store per concern (`useAuthStore`, `useUiStore`), defined in the feature's `store/` directory (or a single `store.ts` when there's just one store) with a typed state + actions; **no business/server data** in stores.
- Select narrowly (`useUiStore(s => s.sidebarOpen)`) to avoid needless re-renders.
- Persisted slices (e.g. theme, locale, sidebar layout) use the `persist` middleware with an explicit allowlist. The **auth token is NEVER persisted** — it lives in memory only (@.claude/rules/auth.md); never route it through `persist`.
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
