/**
 * TanStack Query key factory for the todos feature.
 *
 * Using a factory keeps keys consistent across queries, mutations, and
 * invalidations. Any query that touches todos uses a key from this factory
 * so `queryClient.invalidateQueries({ queryKey: todoKeys.all })` invalidates
 * everything todos-related.
 */

/**
 * Query key factory for todos.
 *
 * - `all`  — root key; invalidates every todos query.
 * - `list` — key for the list endpoint (`GET /api/v1/todos/`).
 */
export const todoKeys = {
  /** Root key; matches all todos queries. */
  all: ['todos'] as const,
  /** Key for the full todos list. */
  list: () => [...todoKeys.all, 'list'] as const,
}
