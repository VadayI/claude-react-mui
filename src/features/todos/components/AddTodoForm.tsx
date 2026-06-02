/**
 * Presentational form component for adding a new todo.
 *
 * Pure: accepts `onAdd` as a callback and calls it with the trimmed title.
 * Owns only local controlled-input state; no data fetching.
 * Disables submission when the title is empty or whitespace.
 * Exposes an error prop that renders a visible, accessible validation message.
 */
import { useState } from 'react'
import Box from '@mui/material/Box'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import FormHelperText from '@mui/material/FormHelperText'

interface AddTodoFormProps {
  /**
   * Called when the user submits a valid title.
   * @param title - The trimmed title string.
   */
  onAdd: (title: string) => void
  /** If set, renders a validation error associated with the input via aria-describedby. */
  error?: string
  /** Disables the form when true (e.g. while a mutation is in flight). */
  disabled?: boolean
}

const HELPER_ID = 'add-todo-error'

/**
 * A controlled form with a text input and submit button.
 *
 * Accessibility:
 * - The input is labelled via `<TextField label>`.
 * - When `error` is set, `aria-describedby` links the input to the error text.
 * - The submit button is disabled when the input is blank.
 */
export function AddTodoForm({ onAdd, error, disabled = false }: AddTodoFormProps) {
  const [title, setTitle] = useState('')

  const trimmed = title.trim()
  const isBlank = trimmed.length === 0

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (isBlank || disabled) return
    onAdd(trimmed)
    setTitle('')
  }

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{ display: 'flex', gap: 1, alignItems: 'flex-start', mb: 2 }}
      noValidate
    >
      <Box sx={{ flex: 1 }}>
        <TextField
          label="New todo"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          inputProps={{
            'aria-describedby': error ? HELPER_ID : undefined,
          }}
          error={!!error}
          disabled={disabled}
          fullWidth
          autoComplete="off"
        />
        {error && (
          <FormHelperText id={HELPER_ID} error>
            {error}
          </FormHelperText>
        )}
      </Box>
      <Button
        type="submit"
        variant="contained"
        disabled={isBlank || disabled}
        sx={{ mt: 0.5 }}
      >
        Add
      </Button>
    </Box>
  )
}
