# Todos Feature

## Purpose

Manages the user's todo list. Provides a full-page UI at `/todos` for viewing, filtering, and adding todos. This feature does NOT own user authentication or any other domain — it calls the backend `GET /api/v1/todos/` and `POST /api/v1/todos/` endpoints only.

## Routes

| Path | Screen | Auth |
|------|--------|------|
| `/todos` | TodosPage — full todos list with add form | Authenticated (token injected via `injectAuthHeader`) |

## Components

| Component | Type | Description |
|-----------|------|-------------|
| `TodosPage` | Container | Fetches data via hooks, composes the sub-components, handles all four UI states |
| `TodoList` | Presentational | Renders the accessible MUI list; handles empty state |
| `AddTodoForm` | Presentational | Controlled input + submit button; disables when empty; accessible error display |

## Hooks & State

| Hook / Store | Type | Description |
|---|---|---|
| `useTodos` | TanStack Query | `queryKey: todoKeys.list()` → `getTodos()` |
| `useCreateTodo` | TanStack Mutation | `createTodo(title)` → invalidates `todoKeys.list()` on success |
| `useTodosUiStore` | Zustand | Client-only filter state (`'all' | 'active' | 'completed'`) |

`todoKeys` factory ensures consistent invalidation:
- `todoKeys.all` — root; matches every todos query.
- `todoKeys.list()` — specific to the list endpoint.

## Consumed Endpoints

| Method | Path | Notes |
|--------|------|-------|
| `GET` | `/api/v1/todos/` | Returns `Todo[]`; mapped to `TodoViewModel[]` |
| `POST` | `/api/v1/todos/` | Body: `{ title: string }`; returns the created `Todo` |

Full schema in `src/lib/api/openapi.yml`. Generated types in `src/lib/api/schema.d.ts`.

## UI States

| State | Trigger | UI |
|-------|---------|-----|
| Loading | Initial fetch in flight | `CircularProgress` + `Skeleton` rows, `role="status"` |
| Error | Query settled with error | `MUI Alert` with severity=error + Retry button |
| Empty | Query resolved, `data = []` | Empty-state message via `TodoList` |
| Success | Query resolved, data present | `TodoList` with checkboxes + `AddTodoForm` |

## Accessibility Notes

- `TodoList` uses `<List aria-label="todos list">` and Checkboxes with `aria-labelledby` linking to `<ListItemText id>`.
- `AddTodoForm` uses a labelled TextField and links error text via `aria-describedby`.
- `TodosPage` loading state includes `role="status"` for screen readers.
- All three states pass jest-axe in unit tests.

## Cross-Feature Dependencies

- `src/lib/api/client.ts` — typed HTTP client (shared).
- `src/lib/query/queryClient.ts` — QueryClient singleton (shared).
- `src/theme/theme.ts` — MUI theme (shared via `ThemeProvider`).
- No other feature dependencies.

## Decisions

- DTO → ViewModel mapping in `todosApi.ts` decouples the schema from the UI. See ADR `docs/decisions/` (pending).
- Filter state lives in Zustand (client-only) not in TanStack Query (server state separation principle).
