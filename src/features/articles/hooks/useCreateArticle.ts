/**
 * Mutation hook for creating a new article.
 *
 * On success, invalidates the articles list query so the UI re-fetches fresh data.
 */
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createArticle } from '../api/articlesApi'
import { articleKeys } from '../api/keys'

/**
 * The shape returned by `useCreateArticle`.
 */
export interface UseCreateArticleResult {
  /**
   * Call with title and body strings to create a new article.
   * The returned Promise resolves when the mutation settles.
   */
  mutate: (title: string, body: string) => void
  /** True while the POST request is in flight. */
  isPending: boolean
  /** The error from the last failed attempt, or null. */
  error: Error | null
}

/**
 * Returns a mutation function for creating a new article.
 *
 * After a successful creation, `articleKeys.list()` is invalidated so
 * `useArticles` automatically refetches the updated list.
 */
export function useCreateArticle(): UseCreateArticleResult {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: ({ title, body }: { title: string; body: string }) =>
      createArticle(title, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: articleKeys.list() })
    },
  })

  return {
    mutate: (title: string, body: string) => mutation.mutate({ title, body }),
    isPending: mutation.isPending,
    error: mutation.error instanceof Error ? mutation.error : null,
  }
}
