/**
 * Presentational form component for adding a new article.
 *
 * Pure: accepts `onAdd` as a callback and calls it with trimmed title + body.
 * Owns only local controlled-input state; no data fetching.
 * Disables submission when the title is empty or whitespace.
 * Exposes an error prop that renders a visible, accessible validation message.
 */
import { useState } from 'react'
import Box from '@mui/material/Box'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import FormHelperText from '@mui/material/FormHelperText'

interface AddArticleFormProps {
  /**
   * Called when the user submits a valid title and body.
   * @param title - The trimmed title string.
   * @param body  - The trimmed body string.
   */
  onAdd: (title: string, body: string) => void
  /** If set, renders a validation error associated with the title input via aria-describedby. */
  error?: string
  /** Disables the form when true (e.g. while a mutation is in flight). */
  disabled?: boolean
}

const HELPER_ID = 'add-article-error'

/**
 * A controlled form with title + body inputs and a submit button.
 *
 * Accessibility:
 * - Each input is labelled via `<TextField label>`.
 * - When `error` is set, `aria-describedby` links the title input to the error text.
 * - The submit button is disabled when the title input is blank.
 */
export function AddArticleForm({ onAdd, error, disabled = false }: AddArticleFormProps) {
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')

  const trimmedTitle = title.trim()
  const isTitleBlank = trimmedTitle.length === 0

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (isTitleBlank || disabled) return
    onAdd(trimmedTitle, body.trim())
    setTitle('')
    setBody('')
  }

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}
      noValidate
    >
      <Box>
        <TextField
          label="Article title"
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
      <TextField
        label="Article body"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        disabled={disabled}
        fullWidth
        multiline
        minRows={3}
        autoComplete="off"
      />
      <Box>
        <Button type="submit" variant="contained" disabled={isTitleBlank || disabled}>
          Add Article
        </Button>
      </Box>
    </Box>
  )
}
