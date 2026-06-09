/**
 * RTL tests for LoginPage container.
 *
 * Uses createMemoryRouter so useSearchParams, useNavigate, and Navigate
 * work correctly in test.
 *
 * Tests:
 * - Already authenticated (no ?next): redirects to /
 * - Already authenticated + ?next=%2Farticles: redirects to /articles
 * - Already authenticated + ?next=https://evil.com: redirects to / (open redirect blocked)
 * - Anonymous: renders the LoginForm
 * - Successful submit: calls setTokens and navigates to next ?? '/'
 * - 401 response: shows server error "Invalid credentials." and re-enables submit button
 * - ?next=https://evil.com on success: redirects to / (open redirect blocked)
 * - jest-axe on the anonymous (form visible) state
 */
import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from '@mui/material/styles'
import { http, HttpResponse } from 'msw'
import { theme } from '../../../theme/theme'
import { useAuthStore } from '../../../lib/auth/authStore'
import { LoginPage } from './LoginPage'
import { server } from '../../../test/server'
import { axe } from '../../../test/setup'

const BASE = import.meta.env.VITE_API_BASE_URL as string

afterEach(() => {
  useAuthStore.getState().clearTokens()
})

function buildRouter(initialEntry = '/login') {
  return createMemoryRouter(
    [
      { path: '/login', element: <LoginPage /> },
      { path: '/', element: <div data-testid="home-page">Home</div> },
      { path: '/articles', element: <div data-testid="articles-page">Articles</div> },
    ],
    { initialEntries: [initialEntry] },
  )
}

function renderRouter(router: ReturnType<typeof buildRouter>) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  return render(
    <ThemeProvider theme={theme}>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </ThemeProvider>,
  )
}

describe('LoginPage', () => {
  describe('when already authenticated', () => {
    it('redirects to / when there is no ?next param', () => {
      useAuthStore.setState({ accessToken: 'existing-token' })
      const router = buildRouter('/login')
      renderRouter(router)
      expect(screen.getByTestId('home-page')).toBeInTheDocument()
    })

    it('redirects to /articles when ?next=%2Farticles is set', () => {
      useAuthStore.setState({ accessToken: 'existing-token' })
      const router = buildRouter('/login?next=%2Farticles')
      renderRouter(router)
      expect(screen.getByTestId('articles-page')).toBeInTheDocument()
    })

    it('redirects to / when ?next=https://evil.com (open redirect blocked)', () => {
      useAuthStore.setState({ accessToken: 'existing-token' })
      const router = buildRouter('/login?next=https%3A%2F%2Fevil.com')
      renderRouter(router)
      expect(screen.getByTestId('home-page')).toBeInTheDocument()
    })
  })

  describe('when anonymous', () => {
    it('renders the login form with email and password fields', () => {
      const router = buildRouter('/login')
      renderRouter(router)
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
    })

    it('has no accessibility violations', async () => {
      const router = buildRouter('/login')
      const { container } = renderRouter(router)
      expect(await axe(container)).toHaveNoViolations()
    })
  })

  describe('on successful login', () => {
    it('calls setTokens and navigates to / when no ?next param', async () => {
      server.use(
        http.post(`${BASE}/api/v1/auth/login`, () =>
          HttpResponse.json({ access: 'new-acc', refresh: 'new-ref' }),
        ),
      )
      const router = buildRouter('/login')
      renderRouter(router)
      const user = userEvent.setup()

      await user.type(screen.getByLabelText(/email/i), 'alice@example.com')
      await user.type(screen.getByLabelText(/password/i), 'secret123')
      await user.click(screen.getByRole('button', { name: /sign in/i }))

      await waitFor(() => {
        expect(screen.getByTestId('home-page')).toBeInTheDocument()
      })
      const { accessToken, refreshToken } = useAuthStore.getState()
      expect(accessToken).toBe('new-acc')
      expect(refreshToken).toBe('new-ref')
    })

    it('navigates to /articles when ?next=%2Farticles is set', async () => {
      server.use(
        http.post(`${BASE}/api/v1/auth/login`, () =>
          HttpResponse.json({ access: 'new-acc', refresh: 'new-ref' }),
        ),
      )
      const router = buildRouter('/login?next=%2Farticles')
      renderRouter(router)
      const user = userEvent.setup()

      await user.type(screen.getByLabelText(/email/i), 'alice@example.com')
      await user.type(screen.getByLabelText(/password/i), 'secret123')
      await user.click(screen.getByRole('button', { name: /sign in/i }))

      await waitFor(() => {
        expect(screen.getByTestId('articles-page')).toBeInTheDocument()
      })
    })

    it('navigates to / when ?next=https://evil.com (open redirect blocked)', async () => {
      server.use(
        http.post(`${BASE}/api/v1/auth/login`, () =>
          HttpResponse.json({ access: 'new-acc', refresh: 'new-ref' }),
        ),
      )
      const router = buildRouter('/login?next=https%3A%2F%2Fevil.com')
      renderRouter(router)
      const user = userEvent.setup()

      await user.type(screen.getByLabelText(/email/i), 'alice@example.com')
      await user.type(screen.getByLabelText(/password/i), 'secret123')
      await user.click(screen.getByRole('button', { name: /sign in/i }))

      await waitFor(() => {
        expect(screen.getByTestId('home-page')).toBeInTheDocument()
      })
    })
  })

  describe('on 401 response', () => {
    it('shows server error "Invalid credentials." in role="alert" and re-enables submit button', async () => {
      server.use(
        http.post(`${BASE}/api/v1/auth/login`, () =>
          HttpResponse.json({ detail: 'Invalid credentials.' }, { status: 401 }),
        ),
      )
      const router = buildRouter('/login')
      renderRouter(router)
      const user = userEvent.setup()

      await user.type(screen.getByLabelText(/email/i), 'alice@example.com')
      await user.type(screen.getByLabelText(/password/i), 'wrongpass')
      await user.click(screen.getByRole('button', { name: /sign in/i }))

      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent('Invalid credentials.')
      })

      const submitButton = screen.getByRole('button', { name: /sign in/i })
      expect(submitButton).not.toBeDisabled()
      expect(submitButton).not.toHaveAttribute('aria-busy', 'true')
    })
  })
})
