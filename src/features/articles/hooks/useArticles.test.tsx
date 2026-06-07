/**
 * Unit tests for the useArticles hook.
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
import { useArticles } from './useArticles'

function makeWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }
  return { Wrapper, queryClient }
}

describe('useArticles', () => {
  it('starts in a loading state', () => {
    server.use(http.get('http://localhost:8000/api/v1/articles', () => new Promise(() => {})))
    const { Wrapper } = makeWrapper()
    const { result } = renderHook(() => useArticles(), { wrapper: Wrapper })
    expect(result.current.isLoading).toBe(true)
    expect(result.current.articles).toEqual([])
  })

  it('returns articles after successful fetch', async () => {
    const { Wrapper } = makeWrapper()
    const { result } = renderHook(() => useArticles(), { wrapper: Wrapper })

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.isError).toBe(false)
    expect(result.current.articles).toHaveLength(2)
    expect(result.current.articles[0].title).toBe('Getting Started with TypeSpec')
  })

  it('returns distinct data for different articles', async () => {
    const { Wrapper } = makeWrapper()
    const { result } = renderHook(() => useArticles(), { wrapper: Wrapper })

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    const titles = result.current.articles.map((a) => a.title)
    expect(titles).toContain('Getting Started with TypeSpec')
    expect(titles).toContain('OpenAPI 3.1 Deep Dive')
  })

  it('enters error state on server failure', async () => {
    server.use(
      http.get('http://localhost:8000/api/v1/articles', () => {
        return HttpResponse.json({ detail: 'fail' }, { status: 500 })
      }),
    )
    const { Wrapper } = makeWrapper()
    const { result } = renderHook(() => useArticles(), { wrapper: Wrapper })

    await waitFor(() => expect(result.current.isError).toBe(true))

    expect(result.current.articles).toEqual([])
    expect(result.current.error).toBeInstanceOf(Error)
  })
})
