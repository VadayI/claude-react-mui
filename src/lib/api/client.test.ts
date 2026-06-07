/**
 * Tests for apiClient auth middleware (Bearer injection + 401 refresh flow).
 *
 * MSW intercepts globalThis.fetch at the node level. The client uses
 * `dynamicFetch` which always delegates to globalThis.fetch at call time,
 * so MSW handlers are picked up correctly.
 *
 * URL: http://localhost:8000 (set by vitest.config.ts → define → VITE_API_BASE_URL).
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { http, HttpResponse } from 'msw'
import { server } from '../../test/server'
import { useAuthStore } from '../auth/authStore'
import { apiClient, normaliseError } from './client'

const BASE = 'http://localhost:8000'

describe('apiClient — Bearer injection', () => {
  beforeEach(() => useAuthStore.getState().clearTokens())

  it('injects Authorization: Bearer when accessToken is set', async () => {
    let capturedAuth: string | null = null
    server.use(
      http.get(`${BASE}/api/v1/articles`, ({ request }) => {
        capturedAuth = request.headers.get('Authorization')
        return HttpResponse.json({ count: 0, next: null, previous: null, results: [] })
      }),
    )
    useAuthStore.getState().setTokens('my-access', 'my-refresh')
    await apiClient.GET('/api/v1/articles')
    expect(capturedAuth).toBe('Bearer my-access')
  })

  it('does not inject Authorization when no accessToken', async () => {
    let capturedAuth: string | null = null
    server.use(
      http.get(`${BASE}/api/v1/articles`, ({ request }) => {
        capturedAuth = request.headers.get('Authorization')
        return HttpResponse.json({ count: 0, next: null, previous: null, results: [] })
      }),
    )
    await apiClient.GET('/api/v1/articles')
    expect(capturedAuth).toBeNull()
  })
})

describe('apiClient — 401 refresh flow', () => {
  beforeEach(() => useAuthStore.getState().clearTokens())

  it('refreshes token on 401 and retries the original request', async () => {
    useAuthStore.getState().setTokens('old-access', 'my-refresh')
    let articlesCallCount = 0

    server.use(
      http.get(`${BASE}/api/v1/articles`, () => {
        articlesCallCount++
        if (articlesCallCount === 1) {
          return HttpResponse.json({ detail: 'Unauthorized' }, { status: 401 })
        }
        return HttpResponse.json({ count: 0, next: null, previous: null, results: [] })
      }),
      http.post(`${BASE}/api/v1/auth/refresh`, () => {
        return HttpResponse.json({ access: 'new-access', refresh: 'new-refresh' })
      }),
    )

    const { response } = await apiClient.GET('/api/v1/articles')
    expect(response.status).toBe(200)
    expect(articlesCallCount).toBe(2)
    expect(useAuthStore.getState().accessToken).toBe('new-access')
    expect(useAuthStore.getState().refreshToken).toBe('new-refresh')
  })

  it('handles refresh without rotation (only new access returned)', async () => {
    useAuthStore.getState().setTokens('old-access', 'original-refresh')
    let articlesCallCount = 0

    server.use(
      http.get(`${BASE}/api/v1/articles`, () => {
        articlesCallCount++
        if (articlesCallCount === 1) {
          return HttpResponse.json({ detail: 'Unauthorized' }, { status: 401 })
        }
        return HttpResponse.json({ count: 0, next: null, previous: null, results: [] })
      }),
      http.post(`${BASE}/api/v1/auth/refresh`, () => {
        return HttpResponse.json({ access: 'new-access' })
      }),
    )

    const { response } = await apiClient.GET('/api/v1/articles')
    expect(response.status).toBe(200)
    expect(useAuthStore.getState().accessToken).toBe('new-access')
    expect(useAuthStore.getState().refreshToken).toBe('original-refresh')
  })

  it('clears tokens when refresh fails (refresh 401)', async () => {
    useAuthStore.getState().setTokens('old-access', 'my-refresh')

    server.use(
      http.get(`${BASE}/api/v1/articles`, () => {
        return HttpResponse.json({ detail: 'Unauthorized' }, { status: 401 })
      }),
      http.post(`${BASE}/api/v1/auth/refresh`, () => {
        return HttpResponse.json({ detail: 'Token expired' }, { status: 401 })
      }),
    )

    const { response } = await apiClient.GET('/api/v1/articles')
    expect(response.status).toBe(401)
    expect(useAuthStore.getState().accessToken).toBeNull()
    expect(useAuthStore.getState().refreshToken).toBeNull()
  })

  it('returns 401 immediately when no refreshToken in store', async () => {
    server.use(
      http.get(`${BASE}/api/v1/articles`, () => {
        return HttpResponse.json({ detail: 'Unauthorized' }, { status: 401 })
      }),
    )

    const { response } = await apiClient.GET('/api/v1/articles')
    expect(response.status).toBe(401)
    expect(useAuthStore.getState().accessToken).toBeNull()
    expect(useAuthStore.getState().refreshToken).toBeNull()
  })

  it('does not loop when /api/v1/auth/refresh itself returns 401', async () => {
    useAuthStore.getState().setTokens('old-access', 'bad-refresh')
    let refreshCallCount = 0

    server.use(
      http.get(`${BASE}/api/v1/articles`, () => {
        return HttpResponse.json({ detail: 'Unauthorized' }, { status: 401 })
      }),
      http.post(`${BASE}/api/v1/auth/refresh`, () => {
        refreshCallCount++
        return HttpResponse.json({ detail: 'Unauthorized' }, { status: 401 })
      }),
    )

    const { response } = await apiClient.GET('/api/v1/articles')
    expect(response.status).toBe(401)
    expect(refreshCallCount).toBe(1)
    expect(useAuthStore.getState().accessToken).toBeNull()
  })
})

describe('normaliseError', () => {
  it('passes through Error instances', () => {
    const err = new Error('original')
    expect(normaliseError(err)).toBe(err)
  })

  it('wraps string errors', () => {
    expect(normaliseError('oops').message).toBe('oops')
  })

  it('extracts detail from simple error envelope', () => {
    expect(normaliseError({ detail: 'Not found' }).message).toBe('Not found')
  })

  it('extracts all messages from validation errors envelope', () => {
    const err = {
      errors: [
        { field: 'email', code: 'invalid', message: 'Enter a valid email.' },
        { field: 'password', code: 'required', message: 'This field is required.' },
      ],
    }
    expect(normaliseError(err).message).toBe('Enter a valid email.; This field is required.')
  })

  it('returns fallback for unrecognised error shape', () => {
    expect(normaliseError({}).message).toBe('Request failed')
    expect(normaliseError(null).message).toBe('Request failed')
    expect(normaliseError(42).message).toBe('Request failed')
  })
})
