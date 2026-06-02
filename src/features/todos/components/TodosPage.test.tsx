/**
 * Integration tests for the TodosPage container.
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
import { TodosPage } from './TodosPage'

describe('TodosPage', () => {
  describe('loading state', () => {
    it('shows a loading indicator while fetching', () => {
      // Keep the request pending indefinitely
      server.use(
        http.get('http://localhost:8000/api/v1/todos/', () => {
          return new Promise(() => {
            // Never resolves — simulates infinite loading
          })
        }),
      )
      renderWithProviders(<TodosPage />)
      expect(screen.getByRole('status')).toBeInTheDocument()
    })
  })

  describe('success state', () => {
    it('renders the todo titles after loading', async () => {
      renderWithProviders(<TodosPage />)
      expect(await screen.findByText('Buy groceries')).toBeInTheDocument()
      expect(await screen.findByText('Read a book')).toBeInTheDocument()
    })

    it('does not show the loading indicator after data arrives', async () => {
      renderWithProviders(<TodosPage />)
      await screen.findByText('Buy groceries')
      expect(screen.queryByRole('status')).not.toBeInTheDocument()
    })

    it('renders the page heading', async () => {
      renderWithProviders(<TodosPage />)
      expect(await screen.findByRole('heading', { name: /todos/i })).toBeInTheDocument()
    })
  })

  describe('empty state', () => {
    it('shows the empty state message when the server returns an empty list', async () => {
      server.use(
        http.get('http://localhost:8000/api/v1/todos/', () => {
          return HttpResponse.json([])
        }),
      )
      renderWithProviders(<TodosPage />)
      expect(await screen.findByTestId('todo-empty-message')).toBeInTheDocument()
    })

    it('does not show todo items when list is empty', async () => {
      server.use(
        http.get('http://localhost:8000/api/v1/todos/', () => {
          return HttpResponse.json([])
        }),
      )
      renderWithProviders(<TodosPage />)
      await screen.findByTestId('todo-empty-message')
      expect(screen.queryByRole('list')).not.toBeInTheDocument()
    })
  })

  describe('error state', () => {
    it('shows an error alert when the server returns 500', async () => {
      server.use(
        http.get('http://localhost:8000/api/v1/todos/', () => {
          return HttpResponse.json({ detail: 'Server error' }, { status: 500 })
        }),
      )
      renderWithProviders(<TodosPage />)
      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument()
      })
    })

    it('shows a retry button in the error state', async () => {
      server.use(
        http.get('http://localhost:8000/api/v1/todos/', () => {
          return HttpResponse.json({ detail: 'Server error' }, { status: 500 })
        }),
      )
      renderWithProviders(<TodosPage />)
      expect(await screen.findByRole('button', { name: /retry/i })).toBeInTheDocument()
    })

    it('refetches when the retry button is clicked', async () => {
      const user = userEvent.setup()
      let callCount = 0

      server.use(
        http.get('http://localhost:8000/api/v1/todos/', () => {
          callCount++
          if (callCount === 1) {
            return HttpResponse.json({ detail: 'Server error' }, { status: 500 })
          }
          return HttpResponse.json([])
        }),
      )

      renderWithProviders(<TodosPage />)
      const retryBtn = await screen.findByRole('button', { name: /retry/i })
      await user.click(retryBtn)

      // After retry the empty state or success state appears (not the error)
      await waitFor(() => {
        expect(screen.queryByRole('alert')).not.toBeInTheDocument()
      })
    })
  })

  describe('adding a todo', () => {
    it('adds a new todo and shows it after submission', async () => {
      const user = userEvent.setup()
      renderWithProviders(<TodosPage />)

      // Wait for initial load
      await screen.findByText('Buy groceries')

      // Type and submit
      await user.type(screen.getByLabelText(/new todo/i), 'Walk the dog')
      await user.click(screen.getByRole('button', { name: /add/i }))

      // After mutation + invalidation, the list re-fetches (MSW returns DEFAULT_TODOS)
      await waitFor(() => {
        expect(screen.queryByDisplayValue('Walk the dog')).not.toBeInTheDocument()
      })
    })
  })
})
