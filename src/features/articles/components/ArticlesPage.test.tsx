/**
 * Integration tests for the ArticlesPage container.
 *
 * Uses MSW to intercept HTTP calls — no real network requests.
 * Tests the four UI states: loading, success, empty, and error.
 * Triangulation: each state is tested distinctly so no single mock response
 * could satisfy all tests.
 */
import { describe, it, expect } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { server } from '../../../test/server'
import { renderWithProviders } from '../../../test/renderWithProviders'
import { axe } from '../../../test/setup'
import { ArticlesPage } from './ArticlesPage'

const BASE = import.meta.env.VITE_API_BASE_URL as string

describe('ArticlesPage', () => {
  describe('loading state', () => {
    it('shows a loading indicator while fetching', () => {
      server.use(
        http.get(`${BASE}/api/v1/articles`, () => {
          return new Promise(() => {
            // Never resolves — simulates infinite loading
          })
        }),
      )
      renderWithProviders(<ArticlesPage />)
      expect(screen.getByRole('status')).toBeInTheDocument()
    })

    it('progressbar has an accessible name', () => {
      server.use(
        http.get(`${BASE}/api/v1/articles`, () => {
          return new Promise(() => {
            // Never resolves — simulates infinite loading
          })
        }),
      )
      renderWithProviders(<ArticlesPage />)
      expect(screen.getByRole('progressbar', { name: /loading articles/i })).toBeInTheDocument()
    })

    it('has no axe violations in loading state', async () => {
      server.use(
        http.get(`${BASE}/api/v1/articles`, () => {
          return new Promise(() => {
            // Never resolves — simulates infinite loading
          })
        }),
      )
      const { container } = renderWithProviders(<ArticlesPage />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })

  describe('success state', () => {
    it('renders the article titles after loading', async () => {
      renderWithProviders(<ArticlesPage />)
      expect(await screen.findByText('Getting Started with TypeSpec')).toBeInTheDocument()
      expect(await screen.findByText('OpenAPI 3.1 Deep Dive')).toBeInTheDocument()
    })

    it('does not show the loading indicator after data arrives', async () => {
      renderWithProviders(<ArticlesPage />)
      await screen.findByText('Getting Started with TypeSpec')
      expect(screen.queryByRole('status')).not.toBeInTheDocument()
    })

    it('renders the page heading', async () => {
      renderWithProviders(<ArticlesPage />)
      expect(await screen.findByRole('heading', { name: /articles/i })).toBeInTheDocument()
    })
  })

  describe('empty state', () => {
    it('shows the empty state message when the server returns an empty list', async () => {
      server.use(
        http.get(`${BASE}/api/v1/articles`, () => {
          return HttpResponse.json({ count: 0, next: null, previous: null, results: [] })
        }),
      )
      renderWithProviders(<ArticlesPage />)
      expect(await screen.findByTestId('article-empty-message')).toBeInTheDocument()
    })

    it('does not show article items when list is empty', async () => {
      server.use(
        http.get(`${BASE}/api/v1/articles`, () => {
          return HttpResponse.json({ count: 0, next: null, previous: null, results: [] })
        }),
      )
      renderWithProviders(<ArticlesPage />)
      await screen.findByTestId('article-empty-message')
      expect(screen.queryByRole('list')).not.toBeInTheDocument()
    })
  })

  describe('error state', () => {
    it('shows an error alert when the server returns 500', async () => {
      server.use(
        http.get(`${BASE}/api/v1/articles`, () => {
          return HttpResponse.json({ detail: 'Server error' }, { status: 500 })
        }),
      )
      renderWithProviders(<ArticlesPage />)
      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument()
      })
    })

    it('shows a retry button in the error state', async () => {
      server.use(
        http.get(`${BASE}/api/v1/articles`, () => {
          return HttpResponse.json({ detail: 'Server error' }, { status: 500 })
        }),
      )
      renderWithProviders(<ArticlesPage />)
      expect(await screen.findByRole('button', { name: /retry/i })).toBeInTheDocument()
    })

    it('refetches when the retry button is clicked', async () => {
      const user = userEvent.setup()
      let callCount = 0

      server.use(
        http.get(`${BASE}/api/v1/articles`, () => {
          callCount++
          if (callCount === 1) {
            return HttpResponse.json({ detail: 'Server error' }, { status: 500 })
          }
          return HttpResponse.json({ count: 0, next: null, previous: null, results: [] })
        }),
      )

      renderWithProviders(<ArticlesPage />)
      const retryBtn = await screen.findByRole('button', { name: /retry/i })
      await user.click(retryBtn)

      await waitFor(() => {
        expect(screen.queryByRole('alert')).not.toBeInTheDocument()
      })
    })
  })

  describe('adding an article', () => {
    it('adds a new article and clears the form after submission', async () => {
      const user = userEvent.setup()
      renderWithProviders(<ArticlesPage />)

      // Wait for initial load
      await screen.findByText('Getting Started with TypeSpec')

      // Type and submit
      await user.type(screen.getByLabelText(/article title/i), 'My new article')
      await user.click(screen.getByRole('button', { name: /add article/i }))

      // Input should clear after successful submission
      await waitFor(() => {
        expect(screen.queryByDisplayValue('My new article')).not.toBeInTheDocument()
      })
    })
  })
})
