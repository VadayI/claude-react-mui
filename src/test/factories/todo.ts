/**
 * Test factory for TodoViewModel.
 *
 * Provides a typed helper to create todo fixtures with sensible defaults
 * that can be overridden per-test. Using a factory rather than inline
 * object literals keeps tests readable and DRY.
 */
import type { TodoViewModel } from '../../features/todos/api/todosApi'

let _nextId = 1

/**
 * Creates a `TodoViewModel` test fixture.
 *
 * @param overrides - Partial fields to override the defaults.
 * @returns A valid `TodoViewModel` with auto-incrementing id.
 *
 * @example
 * ```ts
 * const todo = makeTodo({ title: 'Buy milk', completed: true })
 * ```
 */
export function makeTodo(overrides: Partial<TodoViewModel> = {}): TodoViewModel {
  return {
    id: _nextId++,
    title: `Todo ${_nextId}`,
    completed: false,
    ...overrides,
  }
}

/**
 * Resets the auto-increment counter.
 * Call in `beforeEach` when deterministic ids are important.
 */
export function resetTodoFactory(): void {
  _nextId = 1
}
