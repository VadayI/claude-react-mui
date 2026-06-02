/**
 * Mutation hook for creating a new todo.
 *
 * On success, invalidates the todos list query so the UI re-fetches fresh data.
 */
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createTodo } from '../api/todosApi'
import { todoKeys } from '../api/keys'

/**
 * The shape returned by `useCreateTodo`.
 */
export interface UseCreateTodoResult {
  /**
   * Call with a title string to create a new todo.
   * The returned Promise resolves when the mutation settles.
   */
  mutate: (title: string) => void
  /** True while the POST request is in flight. */
  isPending: boolean
  /** The error from the last failed attempt, or null. */
  error: Error | null
}

/**
 * Returns a mutation function for creating a new todo.
 *
 * After a successful creation, `todoKeys.list()` is invalidated so `useTodos`
 * automatically refetches the updated list.
 */
export function useCreateTodo(): UseCreateTodoResult {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (title: string) => createTodo(title),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: todoKeys.list() })
    },
  })

  return {
    mutate: (title: string) => mutation.mutate(title),
    isPending: mutation.isPending,
    error: mutation.error instanceof Error ? mutation.error : null,
  }
}
