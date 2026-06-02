# TDD Walkthrough — Todos Feature

## Overview

This feature was built using **double-loop TDD** (outside-in at the HTTP boundary), following `.claude/rules/tdd.md`. Here is the narrative of the RED → GREEN → REFACTOR cycles.

## Outer Loop: The Acceptance Test (RED)

The first thing written was the failing outer test in `TodosPage.test.tsx`:

```tsx
it('renders the todo titles after loading', async () => {
  renderWithProviders(<TodosPage />)
  expect(await screen.findByText('Buy groceries')).toBeInTheDocument()
})
```

This test failed immediately because:
1. `TodosPage` did not exist.
2. There were no MSW handlers to intercept the network call.
3. The `useTodos` hook did not exist.
4. The `apiClient` had no endpoint typed for `/api/v1/todos/`.

**Why start here?** The outer test defines the entire feature's contract from the user's perspective: "when I visit /todos, I see my todos." Everything else is just implementation to satisfy this.

## Inner Loops

### Loop 1 — OpenAPI Schema + Generated Types

**RED**: `apiClient.GET('/api/v1/todos/')` fails TypeScript compilation (path not in schema).

**GREEN**: Wrote `src/lib/api/openapi.yml` with the `GET /api/v1/todos/` operation. Ran `npm run api:types` to generate `schema.d.ts`. The TypeScript error disappeared.

**REFACTOR**: Added the `POST /api/v1/todos/` operation to the same schema so the next loop could start green.

### Loop 2 — API Functions

**RED**: `getTodos()` does not exist, so `useTodos` cannot call it.

**GREEN**: Wrote `todosApi.ts` with `getTodos()` and `createTodo()`. Added the `toViewModel` mapper.

**REFACTOR**: Extracted the DTO→ViewModel mapping into its own `toViewModel` function; no inline casts.

### Loop 3 — MSW Handlers

**RED**: `TodosPage.test.tsx` throws `Error: [MSW] No handler found for GET http://localhost:8000/api/v1/todos/`.

**GREEN**: Wrote `src/mocks/handlers.ts` with the default success handler returning `DEFAULT_TODOS`. Wired it into `src/test/server.ts`.

**REFACTOR**: Made `DEFAULT_TODOS` an exported constant so `TodosPage.test.tsx` can reference specific titles in assertions.

### Loop 4 — `useTodos` Hook

**RED**: `TodosPage` tries to call `useTodos()` which does not exist.

**GREEN**: Wrote `hooks/useTodos.ts` wrapping `getTodos` in `useQuery`. The outer test still failed because `TodosPage` didn't exist yet.

**REFACTOR**: Added the `UseTodosResult` interface and `refetch` wrapper so the hook API is typed and testable.

### Loop 5 — `TodoList` Presentational Component (inner unit tests first)

**RED**: Wrote `TodoList.test.tsx` (empty state, items, toggle, axe). All tests fail because `TodoList` doesn't exist.

**GREEN**: Implemented `TodoList.tsx` with the MUI List. Tests went green one by one:
1. Empty state message — added `data-testid="todo-empty-message"`.
2. Item rendering — added `items.map(...)`.
3. Checkbox state — `checked={todo.completed}`.
4. Toggle callback — `onClick={() => onToggle(todo.id)}`.
5. Axe clean — no violations from the start because we used semantic MUI components.

**REFACTOR**: Extracted the `labelId` constant per item; made `aria-labelledby` explicit.

### Loop 6 — `AddTodoForm` Presentational Component (inner unit tests first)

**RED**: Wrote `AddTodoForm.test.tsx`. All tests fail.

**GREEN**: Implemented `AddTodoForm.tsx` with controlled state and form submission.
Triangulation was key: "disables when empty" AND "enables with text" forced real implementation. A hardcoded `disabled={false}` would pass one but not the other.

**REFACTOR**: Added `FormHelperText` with `aria-describedby` to make error association explicit.

### Loop 7 — `TodosPage` Container (outer test goes GREEN)

**RED**: `TodosPage` does not exist.

**GREEN**: Assembled the container in `TodosPage.tsx` using all the inner-loop pieces. The original outer test finally went **GREEN**:
```
✓ renders the todo titles after loading
```

**REFACTOR**: Added the filter store integration; split loading/error/empty/success branches clearly.

### Loop 8 — Additional TodosPage Tests (triangulation)

Added error-state, empty-state, and add-todo tests to complete triangulation.

## Key Lessons from This Feature

1. **Outer test first** — defining the acceptance criterion up front prevented over-engineering. Everything built was strictly necessary to pass that one outer test.

2. **Triangulation prevents stubs** — writing "renders 'Buy groceries'" AND "renders 'Read a book'" in the same test forces the component to render real data, not a hardcoded string.

3. **MSW makes integration tests realistic** — tests hit the actual HTTP client code. If the API URL or method changes, the test fails immediately.

4. **Presentational/container split pays off** — `TodoList` and `AddTodoForm` were fully unit-tested in isolation before the container was built. The container test found no layout bugs because the pieces were already proven.

5. **Axe in unit tests catches early** — adding `jest-axe` to the inner loop (not just Playwright) means accessibility issues are caught at the cheapest point: the component unit test.
