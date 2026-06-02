/**
 * Query hook for the todos list.
 *
 * Wraps `getTodos()` in a TanStack Query `useQuery` so components get
 * declarative loading/error/success states without manual fetching.
 */
import { useQuery } from '@tanstack/react-query'
import { getTodos } from '../api/todosApi'
import { todoKeys } from '../api/keys'
import type { TodoViewModel } from '../api/todosApi'

/**
 * The shape returned by `useTodos`.
 */
export interface UseTodosResult {
  /** The list of todos (empty array while loading). */
  todos: TodoViewModel[]
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
 * Returns the current todos list with loading/error states.
 *
 * Uses `todoKeys.list()` as the query key so any mutation that calls
 * `queryClient.invalidateQueries({ queryKey: todoKeys.list() })` will
 * automatically trigger a refetch.
 */
export function useTodos(): UseTodosResult {
  const query = useQuery({
    queryKey: todoKeys.list(),
    queryFn: getTodos,
  })

  return {
    todos: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error instanceof Error ? query.error : null,
    refetch: () => { void query.refetch() },
  }
}
