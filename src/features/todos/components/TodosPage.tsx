/**
 * Container component for the /todos route.
 *
 * Wires data-fetching hooks (`useTodos`, `useCreateTodo`) and UI-state
 * (`useTodosUiStore`) to the presentational components (`AddTodoForm`,
 * `TodoList`). Handles all four UI states: loading, error, empty, and success.
 */
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Skeleton from '@mui/material/Skeleton'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import { useTodos } from '../hooks/useTodos'
import { useCreateTodo } from '../hooks/useCreateTodo'
import { useTodosUiStore, selectFilter } from '../store/todosUiStore'
import type { TodoFilter } from '../store/todosUiStore'
import { AddTodoForm } from './AddTodoForm'
import { TodoList } from './TodoList'

/**
 * The Todos page container.
 *
 * UI states:
 * - Loading: skeleton list + spinner role=status
 * - Error:   MUI Alert with a retry button
 * - Empty:   empty state via TodoList
 * - Success: TodoList + AddTodoForm
 */
export function TodosPage() {
  const { todos, isLoading, isError, error, refetch } = useTodos()
  const { mutate: addTodo, isPending, error: createError } = useCreateTodo()
  const filter = useTodosUiStore(selectFilter)
  const setFilter = useTodosUiStore((s) => s.setFilter)

  const filteredTodos = todos.filter((todo) => {
    if (filter === 'active') return !todo.completed
    if (filter === 'completed') return todo.completed
    return true
  })

  function handleToggle(_id: number) {
    // Toggle is a future enhancement; the API doesn't expose PATCH yet.
    // Intentionally no-op for now — the presentational layer is wired.
  }

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Todos
      </Typography>

      <AddTodoForm
        onAdd={addTodo}
        error={createError?.message}
        disabled={isPending}
      />

      <ToggleButtonGroup
        value={filter}
        exclusive
        onChange={(_e, val: TodoFilter | null) => {
          if (val) setFilter(val)
        }}
        size="small"
        aria-label="filter todos"
        sx={{ mb: 2 }}
      >
        <ToggleButton value="all" aria-label="show all todos">All</ToggleButton>
        <ToggleButton value="active" aria-label="show active todos">Active</ToggleButton>
        <ToggleButton value="completed" aria-label="show completed todos">Completed</ToggleButton>
      </ToggleButtonGroup>

      {isLoading && (
        <Box role="status" aria-label="Loading todos" sx={{ mt: 1 }}>
          <CircularProgress size={20} sx={{ mr: 1 }} />
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} variant="rectangular" height={48} sx={{ mb: 1 }} />
          ))}
        </Box>
      )}

      {isError && !isLoading && (
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={refetch}>
              Retry
            </Button>
          }
        >
          {error?.message ?? 'Failed to load todos.'}
        </Alert>
      )}

      {!isLoading && !isError && (
        <TodoList items={filteredTodos} onToggle={handleToggle} />
      )}
    </Box>
  )
}
