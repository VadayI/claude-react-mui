/**
 * Query hook for the articles list.
 *
 * Wraps `getArticles()` in a TanStack Query `useQuery` so components get
 * declarative loading/error/success states without manual fetching.
 */
import { useQuery } from '@tanstack/react-query'
import { getArticles } from '../api/articlesApi'
import { articleKeys } from '../api/keys'
import type { ArticleViewModel } from '../api/articlesApi'

/**
 * The shape returned by `useArticles`.
 */
export interface UseArticlesResult {
  /** The list of articles (empty array while loading). */
  articles: ArticleViewModel[]
  /** True while the initial fetch is in flight. */
  isLoading: boolean
  /** True if the query has settled with an error. */
  isError: boolean
  /** The error object if `isError` is true, otherwise null. */
  error: Error | null
  /** Refetch function to retry after an error. */
  refetch: () => void
}

/**
 * Returns the current articles list with loading/error states.
 *
 * Uses `articleKeys.list()` as the query key so any mutation that calls
 * `queryClient.invalidateQueries({ queryKey: articleKeys.list() })` will
 * automatically trigger a refetch.
 */
export function useArticles(): UseArticlesResult {
  const query = useQuery({
    queryKey: articleKeys.list(),
    queryFn: getArticles,
  })

  return {
    articles: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error instanceof Error ? query.error : null,
    refetch: () => { void query.refetch() },
  }
}
