/**
 * Unit tests for the useTodos hook.
 *
 * Uses MSW to intercept HTTP calls. Tests loading, success, and error states
 * to triangulate — ensuring a single hardcoded response cannot satisfy all tests.
 */
import { describe, it, expect } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactNode } from 'react'
import { server } from '../../../test/server'
import { useTodos } from './useTodos'

function makeWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }
  return { Wrapper, queryClient }
}

describe('useTodos', () => {
  it('starts in a loading state', () => {
    server.use(
      http.get('http://localhost:8000/api/v1/todos/', () => new Promise(() => {})),
    )
    const { Wrapper } = makeWrapper()
    const { result } = renderHook(() => useTodos(), { wrapper: Wrapper })
    expect(result.current.isLoading).toBe(true)
    expect(result.current.todos).toEqual([])
  })

  it('returns todos after successful fetch', async () => {
    const { Wrapper } = makeWrapper()
    const { result } = renderHook(() => useTodos(), { wrapper: Wrapper })

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.isError).toBe(false)
    expect(result.current.todos).toHaveLength(2)
    expect(result.current.todos[0].title).toBe('Buy groceries')
  })

  it('returns distinct data for different todos', async () => {
    const { Wrapper } = makeWrapper()
    const { result } = renderHook(() => useTodos(), { wrapper: Wrapper })

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    const titles = result.current.todos.map((t) => t.title)
    expect(titles).toContain('Buy groceries')
    expect(titles).toContain('Read a book')
  })

  it('enters error state on server failure', async () => {
    server.use(
      http.get('http://localhost:8000/api/v1/todos/', () => {
        return HttpResponse.json({ detail: 'fail' }, { status: 500 })
      }),
    )
    const { Wrapper } = makeWrapper()
    const { result } = renderHook(() => useTodos(), { wrapper: Wrapper })

    await waitFor(() => expect(result.current.isError).toBe(true))

    expect(result.current.todos).toEqual([])
    expect(result.current.error).toBeInstanceOf(Error)
  })
})
