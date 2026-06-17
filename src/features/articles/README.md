# Articles Feature

## Purpose

Manages the articles list. Provides a full-page UI at `/articles` for viewing and adding articles. This feature does NOT own user authentication or any other domain — it calls `GET /api/v1/articles` and `POST /api/v1/articles` endpoints from the external contract (`VadayI/claude-api-contract@v0.1.0`).

## Routes

| Path        | Screen                                          | Auth                         |
| ----------- | ----------------------------------------------- | ---------------------------- |
| `/articles` | ArticlesPage — full articles list with add form | Authenticated (Bearer token) |

`/articles` is wrapped in a `RequireAuth` layout route guard (`src/app/guards/RequireAuth.tsx`).
Anonymous users are redirected to `/login?next=%2Farticles`; they are returned here after a
successful login.

`ArticlesPage` is **lazy-loaded** (`React.lazy`) at the route boundary; the router wraps it
in `<Suspense fallback={<RouteFallback />}>` so the chunk is fetched only on first navigation
to `/articles`.

## Components

| Component        | Type           | Description                                                                            |
| ---------------- | -------------- | -------------------------------------------------------------------------------------- |
| `ArticlesPage`   | Container      | Fetches data via hooks, composes the sub-components, handles all four UI states        |
| `ArticleList`    | Presentational | Renders the accessible MUI list; handles empty state                                   |
| `AddArticleForm` | Presentational | Controlled title + body inputs; disables when title is empty; accessible error display |

## Hooks & State

| Hook               | Type              | Description                                                                |
| ------------------ | ----------------- | -------------------------------------------------------------------------- |
| `useArticles`      | TanStack Query    | `queryKey: articleKeys.list()` → `getArticles()`                           |
| `useCreateArticle` | TanStack Mutation | `createArticle(title, body)` → invalidates `articleKeys.list()` on success |

`articleKeys` factory ensures consistent invalidation:

- `articleKeys.all` — root; matches every articles query.
- `articleKeys.list()` — specific to the list endpoint.

## Consumed Endpoints

| Method | Path               | Notes                                                                                          |
| ------ | ------------------ | ---------------------------------------------------------------------------------------------- |
| `GET`  | `/api/v1/articles` | Returns `ArticleList` envelope (`count/next/previous/results`); mapped to `ArticleViewModel[]` |
| `POST` | `/api/v1/articles` | Body: `{ title, body }`; returns the created `Article`                                         |

Full schema in `src/lib/api/openapi.yml` (vendored from `VadayI/claude-api-contract@v0.1.0`).
Generated types in `src/lib/api/schema.d.ts`.

## Article Schema

| Field        | Type                                   | Description           |
| ------------ | -------------------------------------- | --------------------- |
| `id`         | `string`                               | Unique identifier     |
| `title`      | `string`                               | Article title         |
| `body`       | `string`                               | Article body content  |
| `slug`       | `string`                               | URL-friendly slug     |
| `status`     | `"draft" \| "published" \| "archived"` | Publication status    |
| `author_id`  | `string`                               | Author identifier     |
| `tags`       | `string[]`                             | Tag labels            |
| `created_at` | `string` (date-time)                   | Creation timestamp    |
| `updated_at` | `string` (date-time)                   | Last update timestamp |

## UI States

| State               | Trigger                                                        | UI                                                                                                                            |
| ------------------- | -------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Route-level loading | First navigation to `/articles` while the lazy chunk downloads | `<Suspense>` shows `RouteFallback` (`role="status"`) with a centered spinner; cached on repeat visits. **Distinct from the in-page data-fetch loading below.** |
| Loading             | Initial data fetch in flight (chunk already loaded)           | `CircularProgress` (`aria-label="Loading articles"`) + `Skeleton` rows, `role="status"` wrapper                               |
| Error               | Query settled with error                                       | `MUI Alert` with severity=error + Retry button                                                                                |
| Empty               | Query resolved, `results = []`                                 | Empty-state message via `ArticleList`                                                                                         |
| Success             | Query resolved, data present                                   | `ArticleList` + `AddArticleForm`                                                                                              |

> **Two distinct loading states:** "Route-level loading" is triggered by the JS chunk download
> (handled by `<Suspense>` + `RouteFallback`, shown once then cached). "Loading" is triggered by
> the in-page data fetch from `useArticles` (handled by `ArticlesPage`, shown on every hard
> refresh or cache miss).

## Accessibility Notes

- `ArticleList` uses `<List aria-label="articles list">`.
- `AddArticleForm` uses labelled TextFields and links error text via `aria-describedby`.
- `ArticlesPage` loading state: `<Box role="status">` announces the live region; `<CircularProgress aria-label="Loading articles">` names the progressbar directly (WCAG 2.1 AA, rule `aria-progressbar-name`).
- All components pass jest-axe in unit tests (all four states covered).

## Cross-Feature Dependencies

- `src/lib/api/client.ts` — typed HTTP client (shared).
- `src/lib/query/queryClient.ts` — QueryClient singleton (shared).
- `src/theme/theme.ts` — MUI theme (shared via `ThemeProvider`).
- `src/app/guards/RequireAuth.tsx` — layout route guard protecting `/articles`.
- No other feature dependencies.

## Decisions

- DTO → ViewModel mapping in `articlesApi.ts` decouples the schema from the UI.
- Contract source: `VadayI/claude-api-contract@v0.1.0` (not the backend). See ADR `docs/decisions/0020-external-openapi-contract-variant-a.md`.
