import { afterEach, describe, expect, it } from 'vitest'
import { http, HttpResponse } from 'msw'
import { server } from '../../test/server'
import { login, logout, register } from './authApi'
import { useAuthStore } from '../../lib/auth/authStore'

const BASE = 'http://localhost:8000'

/**
 * MSW handlers use the v0.2.0 contract paths: /api/v1/auth/*.
 * These tests are RED against production code that still fetches /auth/*
 * (MSW "onUnhandledRequest: error" fires for unmatched requests).
 * They turn GREEN after authApi.ts is migrated to /api/v1/auth/*.
 */

afterEach(() => {
  useAuthStore.getState().clearTokens()
})

describe('login', () => {
  it('calls POST /api/v1/auth/login and stores tokens on success', async () => {
    server.use(
      http.post(`${BASE}/api/v1/auth/login`, () =>
        HttpResponse.json({ access: 'acc-tok', refresh: 'ref-tok' }),
      ),
    )

    await login({ username: 'alice', password: 'secret' })

    const { accessToken, refreshToken } = useAuthStore.getState()
    expect(accessToken).toBe('acc-tok')
    expect(refreshToken).toBe('ref-tok')
  })

  it('throws on non-ok response from /api/v1/auth/login', async () => {
    server.use(
      http.post(`${BASE}/api/v1/auth/login`, () =>
        HttpResponse.json({ detail: 'No active account found' }, { status: 401 }),
      ),
    )

    await expect(login({ username: 'x', password: 'bad' })).rejects.toThrow()
  })
})

describe('logout', () => {
  it('calls POST /api/v1/auth/logout and clears tokens (best-effort)', async () => {
    useAuthStore.setState({ accessToken: 'acc', refreshToken: 'ref' })
    server.use(
      http.post(`${BASE}/api/v1/auth/logout`, () => new HttpResponse(null, { status: 204 })),
    )

    await logout()

    const { accessToken, refreshToken } = useAuthStore.getState()
    expect(accessToken).toBeNull()
    expect(refreshToken).toBeNull()
  })
})

describe('register', () => {
  it('calls POST /api/v1/auth/register and stores tokens when provided', async () => {
    server.use(
      http.post(`${BASE}/api/v1/auth/register`, () =>
        HttpResponse.json({
          user: { id: 1, username: 'bob', email: 'bob@example.com' },
          tokens: { access: 'new-acc', refresh: 'new-ref' },
        }),
      ),
    )

    await register({ username: 'bob', password: 'pw123', email: 'bob@example.com' })

    const { accessToken, refreshToken } = useAuthStore.getState()
    expect(accessToken).toBe('new-acc')
    expect(refreshToken).toBe('new-ref')
  })

  it('calls POST /api/v1/auth/register without storing tokens when not provided', async () => {
    server.use(
      http.post(`${BASE}/api/v1/auth/register`, () =>
        HttpResponse.json({
          user: { id: 2, username: 'carol', email: 'carol@example.com' },
        }),
      ),
    )

    await register({ username: 'carol', password: 'pw', email: 'carol@example.com' })

    const { accessToken } = useAuthStore.getState()
    expect(accessToken).toBeNull()
  })
})
