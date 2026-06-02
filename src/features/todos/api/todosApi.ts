/**
 * Todos API wrappers.
 *
 * The only layer that communicates with the backend for the todos feature.
 * All functions return view-model types (not raw DTOs) so higher layers are
 * insulated from schema changes.
 */
import { apiClient, normaliseError } from '../../../lib/api/client'
import type { components } from '../../../lib/api/schema.d.ts'

/** Raw DTO from the API schema. */
type TodoDto = components['schemas']['Todo']

/**
 * View-model for a single todo item.
 *
 * Currently a 1:1 mirror of the DTO, but the indirection allows UI-friendly
 * transformations (e.g. adding `displayTitle`) without touching the schema.
 */
export interface TodoViewModel {
  id: number
  title: string
  completed: boolean
}

/**
 * Maps a raw Todo DTO to the view-model used by the UI.
 *
 * @param dto - The raw DTO from the API response.
 * @returns The UI-friendly view-model.
 */
function toViewModel(dto: TodoDto): TodoViewModel {
  return {
    id: dto.id,
    title: dto.title,
    completed: dto.completed,
  }
}

/**
 * Fetches all todos for the authenticated user.
 *
 * @returns An array of `TodoViewModel` instances.
 * @throws `Error` on network failure or non-2xx status.
 */
export async function getTodos(): Promise<TodoViewModel[]> {
  const { data, error } = await apiClient.GET('/api/v1/todos/')
  if (error) throw normaliseError(error, 'Failed to fetch todos')
  return (data ?? []).map(toViewModel)
}

/**
 * Creates a new todo for the authenticated user.
 *
 * @param title - The title text for the new todo.
 * @returns The newly created `TodoViewModel`.
 * @throws `Error` on network failure, validation error (400), or auth failure (401).
 */
export async function createTodo(title: string): Promise<TodoViewModel> {
  const { data, error } = await apiClient.POST('/api/v1/todos/', {
    body: { title },
  })
  if (error) throw normaliseError(error, 'Failed to create todo')
  if (!data) throw new Error('No data returned from create todo')
  return toViewModel(data)
}
