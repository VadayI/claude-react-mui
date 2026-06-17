# 0026. Upgrade React Router 6 → 7 (+ route-level code-splitting)

Status: accepted · 2026-06-17

## Context

Part of the staged stack upgrade (plan `docs/plans/0004-stack-upgrade-latest-versions.md`, PR D).
ADR 0015 included React Router (data router) as a stack component without pinning it to a specific
major; by the time PRs A–C landed (TS 6, React 19, MUI 9), `react-router-dom ^6.28.0` (locked at
6.30.4) was the remaining outdated major. React Router 7 consolidates the previously separate
`react-router` and `react-router-dom` packages into a **single `react-router` package** with a
`react-router/dom` sub-path for real DOM rendering — `react-router-dom` is no longer published as a
separate package.

Two motivations coincided in this PR:

1. **Bundle pressure.** Post-PR-C the initial JS bundle was 188.38 KB gz (single chunk), within the
   190 KB budget but with only 1.62 KB headroom. Before route-lazy was applied, the PR-D monolithic
   build measured **198.46 KB gz**, which would have breached the 190 KB ceiling. Route code-splitting
   was deferred from PR C specifically as a structural performance task; folding it into PR D meant
   the Router 7 migration and the code-splitting work could be verified together under the same green
   test suite.

2. **Future-flag de-risk.** The standard Router-6→7 migration pattern is to enable every v7 future
   flag on v6 first (verifying tests stay green), then bump to v7 and remove the flags (they become
   defaults). This project followed that pattern to confirm no behavior change would be hidden by
   the major bump.

The React 19 baseline (ADR 0024) and MUI 9 baseline (ADR 0025) are prerequisites — both are in
place before this PR.

## Decision

Upgrade the React Router ecosystem and add route-level code-splitting in a single coordinated patch:

- **`react-router-dom ^6.28.0`** (locked 6.30.4) removed entirely; zero lock-file references remain.
- **`react-router ^7.18.0`** added as the consolidated single package (latest 7.x stable at the
  time of the upgrade).
- **Import consolidation across 8 import sites:**
  - `src/main.tsx` — imports `RouterProvider` from **`react-router/dom`** (the real-DOM sub-path;
    this is the one file that needs the DOM-renderer entry, which wires React DOM's `flushSync`).
  - The remaining 7 files (components, guards, hooks, and two test files) import from the top-level
    **`react-router`** package — including `createMemoryRouter` and `RouterProvider` used in Vitest
    / jsdom tests, which is correct (the memory router does not need the DOM renderer).
- **Future-flag de-risk approach:** all v7 future flags were temporarily enabled on v6 to confirm
  zero test failures; then the package was bumped to v7 and the flags removed (they are defaults
  in v7). Important distinction discovered during migration: `v7_startTransition` is a
  **component-level** flag (passed to `<RouterProvider>` / `<MemoryRouter>`), while the data-router
  flags (`v7_relativeSplatPath`, `v7_fetcherPersist`, `v7_normalizeFormMethod`,
  `v7_partialHydration`, `v7_skipActionErrorRevalidation`) go on `createBrowserRouter` /
  `createMemoryRouter`. All flags removed after the v7 bump.
- **`json()` / `defer()` / `useLoaderData`** — not used in the app; data-router API surface is
  unchanged. Routes remain `/`, `/login`, `/articles` (semantically identical paths; only the
  loading mechanism changed).
- **Route-level code-splitting added:**
  - New `src/components/RouteFallback.tsx` — accessible loading fallback (`role="status"`,
    `aria-label="Loading"`) with a theme-driven MUI `CircularProgress`; carries a TSDoc comment;
    accompanied by a test (`RouteFallback.test.tsx`).
  - `ArticlesPage` and `LoginPage` are now **module-scope `React.lazy`** (declared at module top,
    not inside a component, to avoid re-creating the lazy reference on each render).
  - `<Suspense fallback={<RouteFallback />}>` wraps `<Outlet />` in `src/app/App.tsx`.
  - Shell (`App.tsx`), the index Welcome route, and the `RequireAuth` guard remain **synchronous**
    (no lazy wrapping) — they are needed on every navigation and are small.
- **This is library/data-router mode**, NOT framework/Remix mode. The Router 7 framework mode
  (file-based routing, server rendering) is not adopted; the project continues to use
  `createBrowserRouter` with the same explicit route configuration.

## Consequences

- **React Router 7 is the new baseline.** The React Router version pin portion of ADR 0015 is
  superseded by this ADR. ADR 0015 itself remains on disk and immutable.
- **Bundle reduced significantly.** Initial JS gz: 198.46 KB (pre-lazy) → **137.29 KB** (−31%)
  with separate lazy chunks: ArticlesPage ~11 KB gz, LoginPage ~25.8 KB gz, shared TextField chunk
  ~27.5 KB gz.
- **Performance budget ratcheted down.** `.performance-budget.json` `initialJsGzipKb` lowered
  from 190 → **145** (≈7.7 KB headroom), reflecting the improvement rather than leaving the old
  ceiling in place.
- **84 tests green** (was 82; +2 RouteFallback tests); zero future-flag console warnings.
- The single-package consolidation means **`react-router-dom` is no longer installed**; any future
  tooling that searched for `react-router-dom` in lock files would find nothing — expected and
  correct.
- Lazy chunks are served only when the corresponding route is first visited, so the login and
  articles screens incur a small first-visit waterfall. This is acceptable given the bundle saving
  and the accessible `RouteFallback` that renders during the load.
- The `react-router/dom` vs `react-router` import distinction must be maintained: only the app
  entry (`main.tsx`) uses the `/dom` sub-path; all other imports (including test helpers) use the
  root `react-router` export.

## Supersedes

The React Router version pin portion of ADR 0015 (React Router 6 → 7). ADR 0015 itself stays
immutable on disk.

## Relates

- ADR 0015 — original stack pin (partially superseded by this ADR for the Router portion).
- ADR 0024 — React 19 adoption; prerequisite for this upgrade.
- ADR 0025 — MUI 9 adoption; prerequisite for this upgrade.
- `.claude/rules/performance-budgets.md` — bundle budget ratcheted here (190 → 145 KB gz).
- `.claude/rules/routing-and-data-loading.md` — updated to reflect React Router 7 and
  route-level `React.lazy` + `Suspense`.
