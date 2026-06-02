/**
 * MSW request handlers for the test suite.
 *
 * These are the DEFAULT success-scenario handlers. Individual tests can override
 * specific routes with `server.use(...)` to exercise error / empty states.
 */
import { http, HttpResponse } from 'msw'
import type { TodoViewModel } from '../features/todos/api/todosApi'

/** Default todos returned by GET /api/v1/todos/ in tests. */
export const DEFAULT_TODOS: TodoViewModel[] = [
  { id: 1, title: 'Buy groceries', completed: false },
  { id: 2, title: 'Read a book', completed: true },
]

/**
 * Default MSW handlers.
 *
 * - `GET /api/v1/todos/`   → 200 with DEFAULT_TODOS
 * - `POST /api/v1/todos/`  → 201 with a new todo
 */
export const handlers = [
  http.get('http://localhost:8000/api/v1/todos/', () => {
    return HttpResponse.json(DEFAULT_TODOS)
  }),

  http.post('http://localhost:8000/api/v1/todos/', async ({ request }) => {
    const body = (await request.json()) as { title?: string }
    const newTodo: TodoViewModel = {
      id: 99,
      title: body.title ?? 'New todo',
      completed: false,
    }
    return HttpResponse.json(newTodo, { status: 201 })
  }),
]
