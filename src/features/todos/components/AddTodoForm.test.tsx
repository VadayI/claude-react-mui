/**
 * Unit tests for AddTodoForm presentational component.
 *
 * TDD cycle: tests written first (RED), then AddTodoForm built GREEN.
 * Triangulation: tests cover empty (disabled), non-empty (enabled), and
 * submission scenarios to prevent hardcoded return values from passing.
 */
import { describe, it, expect, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from '../../../test/setup'
import { renderWithProviders } from '../../../test/renderWithProviders'
import { AddTodoForm } from './AddTodoForm'

describe('AddTodoForm', () => {
  describe('submit button disabled state', () => {
    it('disables the Add button when the input is empty', () => {
      renderWithProviders(<AddTodoForm onAdd={vi.fn()} />)
      expect(screen.getByRole('button', { name: /add/i })).toBeDisabled()
    })

    it('disables the Add button when the input is only whitespace', async () => {
      const user = userEvent.setup()
      renderWithProviders(<AddTodoForm onAdd={vi.fn()} />)
      await user.type(screen.getByLabelText(/new todo/i), '   ')
      expect(screen.getByRole('button', { name: /add/i })).toBeDisabled()
    })

    it('enables the Add button when the input has non-whitespace text', async () => {
      const user = userEvent.setup()
      renderWithProviders(<AddTodoForm onAdd={vi.fn()} />)
      await user.type(screen.getByLabelText(/new todo/i), 'Do the thing')
      expect(screen.getByRole('button', { name: /add/i })).toBeEnabled()
    })
  })

  describe('submission', () => {
    it('calls onAdd with the trimmed value when submitted', async () => {
      const user = userEvent.setup()
      const onAdd = vi.fn()
      renderWithProviders(<AddTodoForm onAdd={onAdd} />)

      await user.type(screen.getByLabelText(/new todo/i), '  Buy milk  ')
      await user.click(screen.getByRole('button', { name: /add/i }))

      expect(onAdd).toHaveBeenCalledOnce()
      expect(onAdd).toHaveBeenCalledWith('Buy milk')
    })

    it('clears the input after successful submission', async () => {
      const user = userEvent.setup()
      renderWithProviders(<AddTodoForm onAdd={vi.fn()} />)

      const input = screen.getByLabelText(/new todo/i)
      await user.type(input, 'Something')
      await user.click(screen.getByRole('button', { name: /add/i }))

      expect(input).toHaveValue('')
    })

    it('calls onAdd when the user presses Enter in the input', async () => {
      const user = userEvent.setup()
      const onAdd = vi.fn()
      renderWithProviders(<AddTodoForm onAdd={onAdd} />)

      await user.type(screen.getByLabelText(/new todo/i), 'Press enter{Enter}')
      expect(onAdd).toHaveBeenCalledWith('Press enter')
    })

    it('does not call onAdd when submitted with an empty input', async () => {
      const user = userEvent.setup()
      const onAdd = vi.fn()
      renderWithProviders(<AddTodoForm onAdd={onAdd} />)

      await user.keyboard('{Enter}')
      expect(onAdd).not.toHaveBeenCalled()
    })
  })

  describe('error display', () => {
    it('shows the error message when error prop is set', () => {
      renderWithProviders(<AddTodoForm onAdd={vi.fn()} error="Title is too long" />)
      expect(screen.getByText('Title is too long')).toBeInTheDocument()
    })

    it('associates the error with the input via aria-describedby', () => {
      renderWithProviders(<AddTodoForm onAdd={vi.fn()} error="Some error" />)
      const input = screen.getByLabelText(/new todo/i)
      const errorId = input.getAttribute('aria-describedby')
      expect(errorId).toBeTruthy()
      const errorEl = document.getElementById(errorId!)
      expect(errorEl).toHaveTextContent('Some error')
    })

    it('does not show error text when error prop is not set', () => {
      renderWithProviders(<AddTodoForm onAdd={vi.fn()} />)
      expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    })
  })

  describe('accessibility', () => {
    it('has no axe violations in default state', async () => {
      const { container } = renderWithProviders(<AddTodoForm onAdd={vi.fn()} />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('has no axe violations in error state', async () => {
      const { container } = renderWithProviders(
        <AddTodoForm onAdd={vi.fn()} error="Something went wrong" />,
      )
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })
})
