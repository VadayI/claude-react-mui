/**
 * TanStack Query key factory for the articles feature.
 *
 * Using a factory keeps keys consistent across queries, mutations, and
 * invalidations. Any query that touches articles uses a key from this factory
 * so `queryClient.invalidateQueries({ queryKey: articleKeys.all })` invalidates
 * everything articles-related.
 */

/**
 * Query key factory for articles.
 *
 * - `all`  — root key; invalidates every articles query.
 * - `list` — key for the list endpoint (`GET /api/v1/articles`).
 */
export const articleKeys = {
  /** Root key; matches all articles queries. */
  all: ['articles'] as const,
  /** Key for the full articles list. */
  list: () => [...articleKeys.all, 'list'] as const,
}
