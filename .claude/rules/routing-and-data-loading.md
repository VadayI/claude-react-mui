# Routing & data loading (data router, Query owns server-state)

React Router 7's data router adds loaders, actions, and `errorElement` — powerful, but easy to misuse by turning loaders into a second, competing data layer next to TanStack Query. This project draws the line: **TanStack Query owns server-state**, the **router owns navigation, gating, URL-state, and error/pending boundaries**. Routes are split, guarded, and each declares its states — the routing companion to @.claude/rules/state-management.md and @.claude/rules/component-contract.md.

> **Package note (ADR 0026):** React Router 7 ships as a single consolidated package (`react-router`); the separate `react-router-dom` package is no longer published. The app entry (`src/main.tsx`) imports `RouterProvider` from `react-router/dom` (the real-DOM sub-path); all other files — including Vitest test helpers — import from the top-level `react-router`. Route elements are `React.lazy` + `<Suspense fallback={<RouteFallback />}>` (accessible `role="status"` fallback); the shell, index route, and `RequireAuth` guard remain synchronous.

## The data router is the routing source of truth

- Routes live in `src/app/router.tsx` as a **data router** (`createBrowserRouter`), not scattered `<Route>` trees. Each route maps to a screen and declares its guard and its `errorElement`.
- **Code-split at the route boundary** — route elements are `React.lazy` + `Suspense` with an accessible fallback (`role="status"`), per @.claude/rules/performance-budgets.md. The shell + first route is the only synchronous JS.

## Loaders/actions vs TanStack Query (the boundary)

- **Server data is fetched and cached by TanStack Query**, in feature hooks with structured keys (@.claude/rules/state-management.md). Components do not get their list/entity data from a raw loader return that bypasses the Query cache.
- **Loaders stay thin** and do routing-level work: parse/validate route params, enforce auth/role gating (redirect anonymous → login with `?next=`), and optionally **warm the cache** via `queryClient.ensureQueryData(...)` so the screen has data on first paint — the component still reads through `useQuery`, so caching/refetch/invalidation stay in one place.
- **Actions** handle route-level form submissions only where it genuinely simplifies things; otherwise mutations go through TanStack Query mutation hooks (@.claude/rules/forms-and-validation.md). Pick one per form deliberately — don't split a submit across both.

## URL is state — don't duplicate it

- Filters, pagination, sort, selected tab, and search live in the **URL search params** (the shareable, back-button-correct source), read via the router — not copied into a Zustand store. Derive from the URL at render time (@.claude/rules/state-management.md).
- Query keys incorporate the URL-derived params so navigation drives refetch naturally.

## Guards & errors

- Authorization is **separate, testable guards** in `src/app/guards/` (or loader redirects), never `if (user) …` sprinkled in pages. Anonymous → login (preserve destination); authenticated-but-forbidden → a 403 screen, not a blank page (@.claude/rules/component-contract.md).
- Every route has an `errorElement` so a thrown loader/render error shows an accessible, recoverable fallback scoped to that screen, not a white page (@.claude/rules/observability-and-errors.md).

## Rules

- One data router in `src/app/router.tsx`; routes are lazy, guarded, and each declares its `errorElement`.
- Server-state is TanStack Query's job; loaders are thin (params, gating, optional cache-warm), not a parallel cache.
- One submission mechanism per form (Query mutation **or** route action), chosen deliberately.
- URL search params hold filter/sort/pagination/tab state; don't duplicate them in a store.

## Testing (mandatory)

Guards are tested for **allowed and denied** paths (user A must not reach user B's protected screen). A loader redirect (anonymous → login preserving `next`) is tested. A route `errorElement` renders its accessible fallback when a child throws. URL-param-driven state is tested (changing the param changes what renders / refetches). A Playwright journey covers the primary navigation path. `jest-axe` clean on guard/error screens.

## Binds these agents (rule is auto-loaded)

- `ui-architect` — declares routes, their guards, lazy boundaries, `errorElement`s, and which params are URL-state; records routes in `.claude/memory/routes.json` (@.claude/rules/verification.md).
- `state-architect` — owns the Query/loader boundary and the query keys that incorporate URL params; ensures loaders warm the cache rather than bypass it.
- `react-developer` — implements the data router, lazy routes, guards, and thin loaders; keeps server data in Query.
- `tester` — guard allowed/denied, loader redirect, `errorElement` fallback, URL-param-driven render, Playwright nav path.
- `reviewer` — flags loaders that duplicate the Query cache, URL-state copied into stores, routes without an `errorElement`, and inline auth checks in pages.

> Goal: the router owns navigation, gating, URL-state, and error boundaries; TanStack Query owns server-state — the two never become competing data layers.
