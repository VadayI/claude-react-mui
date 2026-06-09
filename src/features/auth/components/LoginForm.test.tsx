/**
 * RTL tests for LoginForm (presentational component).
 *
 * Tests cover:
 * - Idle state rendering
 * - Server error displayed in role="alert"
 * - Alert container is empty (not absent) when serverError is null
 * - Valid submit calls onSubmit with correct payload
 * - Invalid email: validation error shown, onSubmit NOT called
 * - isSubmitting: button disabled + aria-busy="true"
 * - jest-axe: idle and error states
 */
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from '../../../test/setup'
import { LoginForm } from './LoginForm'

function renderForm(props: Partial<React.ComponentProps<typeof LoginForm>> = {}) {
  const defaults = {
    onSubmit: vi.fn(),
    isSubmitting: false,
    serverError: null,
  }
  return render(<LoginForm {...defaults} {...props} />)
}

describe('LoginForm', () => {
  describe('idle state', () => {
    it('renders email field, password field, and Sign in button', () => {
      renderForm()
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
    })

    it('has no accessibility violations in idle state', async () => {
      const { container } = renderForm()
      expect(await axe(container)).toHaveNoViolations()
    })
  })

  describe('server error state', () => {
    it('shows the server error in role="alert" when serverError is not null', () => {
      renderForm({ serverError: 'Invalid credentials.' })
      expect(screen.getByRole('alert')).toHaveTextContent('Invalid credentials.')
    })

    it('alert container is present but empty when serverError is null', () => {
      renderForm({ serverError: null })
      // The alert region is always rendered (for re-announcement on repeat errors).
      // When there is no error it must be empty so it is not announced at load time.
      const alert = screen.getByRole('alert')
      expect(alert).toBeInTheDocument()
      expect(alert).toHaveTextContent('')
    })

    it('has no accessibility violations when serverError is shown', async () => {
      const { container } = renderForm({ serverError: 'Invalid credentials.' })
      expect(await axe(container)).toHaveNoViolations()
    })
  })

  describe('form submission', () => {
    it('calls onSubmit with { email, password } when the form is valid', async () => {
      const onSubmit = vi.fn()
      renderForm({ onSubmit })
      const user = userEvent.setup()

      await user.type(screen.getByLabelText(/email/i), 'alice@example.com')
      await user.type(screen.getByLabelText(/password/i), 'secret123')
      await user.click(screen.getByRole('button', { name: /sign in/i }))

      expect(onSubmit).toHaveBeenCalledOnce()
      expect(onSubmit).toHaveBeenCalledWith({ email: 'alice@example.com', password: 'secret123' })
    })

    it('does NOT call onSubmit when email format is invalid', async () => {
      const onSubmit = vi.fn()
      renderForm({ onSubmit })
      const user = userEvent.setup()

      await user.type(screen.getByLabelText(/email/i), 'not-an-email')
      await user.type(screen.getByLabelText(/password/i), 'secret123')
      await user.click(screen.getByRole('button', { name: /sign in/i }))

      expect(onSubmit).not.toHaveBeenCalled()
      expect(screen.getByText(/enter a valid email address/i)).toBeInTheDocument()
    })
  })

  describe('submitting state', () => {
    it('button is disabled when isSubmitting is true', () => {
      renderForm({ isSubmitting: true })
      expect(screen.getByRole('button', { name: /sign in/i })).toBeDisabled()
    })

    it('button has aria-busy="true" when isSubmitting is true', () => {
      renderForm({ isSubmitting: true })
      expect(screen.getByRole('button', { name: /sign in/i })).toHaveAttribute('aria-busy', 'true')
    })
  })
})
