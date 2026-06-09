/**
 * RTL tests for RequireAuth route guard.
 *
 * Uses createMemoryRouter so that Navigate, Outlet, and useLocation
 * work correctly in test — MemoryRouter cannot handle data-router guards.
 *
 * Tests:
 * - Authenticated user sees the protected child (Outlet rendered)
 * - Anonymous user is redirected to /login?next=%2Farticles
 * - jest-axe on the authenticated state
 */
import { describe, it, expect, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from '@mui/material/styles'
import { theme } from '../../theme/theme'
import { useAuthStore } from '../../lib/auth/authStore'
import { RequireAuth } from './RequireAuth'
import { axe } from '../../test/setup'

afterEach(() => {
  useAuthStore.getState().clearTokens()
})

function buildRouter(initialEntry = '/articles') {
  return createMemoryRouter(
    [
      {
        element: <RequireAuth />,
        children: [{ path: '/articles', element: <div>Protected articles content</div> }],
      },
      { path: '/login', element: <div data-testid="login-page">Login</div> },
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

describe('RequireAuth', () => {
  describe('when authenticated', () => {
    it('renders the protected child (Outlet)', () => {
      useAuthStore.setState({ accessToken: 'valid-token' })
      const router = buildRouter()
      renderRouter(router)
      expect(screen.getByText('Protected articles content')).toBeInTheDocument()
    })

    it('has no accessibility violations', async () => {
      useAuthStore.setState({ accessToken: 'valid-token' })
      const router = buildRouter()
      const { container } = renderRouter(router)
      expect(await axe(container)).toHaveNoViolations()
    })
  })

  describe('when anonymous (no accessToken)', () => {
    it('redirects to /login?next=%2Farticles', () => {
      // accessToken is null by default (cleared in afterEach)
      const router = buildRouter('/articles')
      renderRouter(router)
      // Should render the login page, not the protected content
      expect(screen.getByTestId('login-page')).toBeInTheDocument()
      expect(screen.queryByText('Protected articles content')).not.toBeInTheDocument()
      // The router's current location should be /login with ?next=%2Farticles
      expect(router.state.location.pathname).toBe('/login')
      expect(router.state.location.search).toBe('?next=%2Farticles')
    })
  })
})
