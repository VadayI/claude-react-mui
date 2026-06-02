/**
 * Presentational component for the todos list.
 *
 * Pure: receives `items` and `onToggle` via props; emits no side effects.
 * Handles the EMPTY state (no items) inline with a helpful message.
 * Easy to unit-test because it has no data-fetching or global-state dependencies.
 *
 * Accessibility: each list item uses a Checkbox as the primary accessible control.
 * The surrounding text is associated via `aria-labelledby`. The Checkbox (not a
 * wrapping button) carries `tabIndex={0}` to avoid nested interactive element violations.
 */
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Checkbox from '@mui/material/Checkbox'
import Typography from '@mui/material/Typography'
import type { TodoViewModel } from '../api/todosApi'

interface TodoListProps {
  /** The todos to display. An empty array renders the empty state. */
  items: TodoViewModel[]
  /**
   * Called when the user toggles a todo's completed state.
   * @param id - The id of the toggled todo.
   */
  onToggle: (id: number) => void
}

/**
 * Renders an accessible MUI list of todos.
 *
 * When `items` is empty, shows a friendly empty-state message. The Checkbox is
 * the interactive element per item; it carries `tabIndex={0}` and is associated
 * with the item text via `aria-labelledby`. No nested interactive controls.
 */
export function TodoList({ items, onToggle }: TodoListProps) {
  if (items.length === 0) {
    return (
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ py: 4, textAlign: 'center' }}
        data-testid="todo-empty-message"
      >
        No todos yet. Add one above!
      </Typography>
    )
  }

  return (
    <List aria-label="todos list">
      {items.map((todo) => {
        const labelId = `todo-label-${todo.id}`
        return (
          <ListItem
            key={todo.id}
            divider
            sx={{ cursor: 'pointer' }}
            onClick={() => onToggle(todo.id)}
          >
            <ListItemIcon>
              <Checkbox
                edge="start"
                checked={todo.completed}
                tabIndex={0}
                disableRipple
                inputProps={{ 'aria-labelledby': labelId }}
                onClick={(e) => {
                  // Prevent the ListItem click from firing twice
                  e.stopPropagation()
                  onToggle(todo.id)
                }}
              />
            </ListItemIcon>
            <ListItemText
              id={labelId}
              primary={todo.title}
              sx={{
                textDecoration: todo.completed ? 'line-through' : 'none',
                color: todo.completed ? 'text.secondary' : 'text.primary',
              }}
            />
          </ListItem>
        )
      })}
    </List>
  )
}
