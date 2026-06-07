/**
 * Unit tests for AddArticleForm presentational component.
 *
 * TDD cycle: tests written first (RED), then AddArticleForm built GREEN.
 * Triangulation: tests cover empty (disabled), non-empty (enabled), and
 * submission scenarios to prevent hardcoded return values from passing.
 */
import { describe, it, expect, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from '../../../test/setup'
import { renderWithProviders } from '../../../test/renderWithProviders'
import { AddArticleForm } from './AddArticleForm'

describe('AddArticleForm', () => {
  describe('submit button disabled state', () => {
    it('disables the Add button when the title input is empty', () => {
      renderWithProviders(<AddArticleForm onAdd={vi.fn()} />)
      expect(screen.getByRole('button', { name: /add article/i })).toBeDisabled()
    })

    it('disables the Add button when the title is only whitespace', async () => {
      const user = userEvent.setup()
      renderWithProviders(<AddArticleForm onAdd={vi.fn()} />)
      await user.type(screen.getByLabelText(/article title/i), '   ')
      expect(screen.getByRole('button', { name: /add article/i })).toBeDisabled()
    })

    it('enables the Add button when the title has non-whitespace text', async () => {
      const user = userEvent.setup()
      renderWithProviders(<AddArticleForm onAdd={vi.fn()} />)
      await user.type(screen.getByLabelText(/article title/i), 'My article')
      expect(screen.getByRole('button', { name: /add article/i })).toBeEnabled()
    })
  })

  describe('submission', () => {
    it('calls onAdd with the trimmed title and body when submitted', async () => {
      const user = userEvent.setup()
      const onAdd = vi.fn()
      renderWithProviders(<AddArticleForm onAdd={onAdd} />)

      await user.type(screen.getByLabelText(/article title/i), '  My Title  ')
      await user.type(screen.getByLabelText(/article body/i), 'Some body text')
      await user.click(screen.getByRole('button', { name: /add article/i }))

      expect(onAdd).toHaveBeenCalledOnce()
      expect(onAdd).toHaveBeenCalledWith('My Title', 'Some body text')
    })

    it('clears the inputs after successful submission', async () => {
      const user = userEvent.setup()
      renderWithProviders(<AddArticleForm onAdd={vi.fn()} />)

      const titleInput = screen.getByLabelText(/article title/i)
      await user.type(titleInput, 'Something')
      await user.click(screen.getByRole('button', { name: /add article/i }))

      expect(titleInput).toHaveValue('')
    })

    it('does not call onAdd when submitted with an empty title', async () => {
      const user = userEvent.setup()
      const onAdd = vi.fn()
      renderWithProviders(<AddArticleForm onAdd={onAdd} />)

      await user.keyboard('{Enter}')
      expect(onAdd).not.toHaveBeenCalled()
    })
  })

  describe('error display', () => {
    it('shows the error message when error prop is set', () => {
      renderWithProviders(<AddArticleForm onAdd={vi.fn()} error="Title is required" />)
      expect(screen.getByText('Title is required')).toBeInTheDocument()
    })

    it('associates the error with the title input via aria-describedby', () => {
      renderWithProviders(<AddArticleForm onAdd={vi.fn()} error="Some error" />)
      const input = screen.getByLabelText(/article title/i)
      const errorId = input.getAttribute('aria-describedby')
      expect(errorId).toBeTruthy()
      const errorEl = document.getElementById(errorId!)
      expect(errorEl).toHaveTextContent('Some error')
    })

    it('does not show error text when error prop is not set', () => {
      renderWithProviders(<AddArticleForm onAdd={vi.fn()} />)
      expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    })
  })

  describe('accessibility', () => {
    it('has no axe violations in default state', async () => {
      const { container } = renderWithProviders(<AddArticleForm onAdd={vi.fn()} />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('has no axe violations in error state', async () => {
      const { container } = renderWithProviders(
        <AddArticleForm onAdd={vi.fn()} error="Something went wrong" />,
      )
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })
})
