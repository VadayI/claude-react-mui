import { describe, it, expect, beforeEach } from 'vitest'
import { useAuthStore } from './authStore'

describe('authStore', () => {
  beforeEach(() => useAuthStore.getState().clearTokens())

  it('starts with null tokens', () => {
    expect(useAuthStore.getState().accessToken).toBeNull()
    expect(useAuthStore.getState().refreshToken).toBeNull()
  })

  it('setTokens stores both tokens', () => {
    useAuthStore.getState().setTokens('access-1', 'refresh-1')
    expect(useAuthStore.getState().accessToken).toBe('access-1')
    expect(useAuthStore.getState().refreshToken).toBe('refresh-1')
  })

  it('setAccessToken updates only the access token', () => {
    useAuthStore.getState().setTokens('old-access', 'my-refresh')
    useAuthStore.getState().setAccessToken('new-access')
    expect(useAuthStore.getState().accessToken).toBe('new-access')
    expect(useAuthStore.getState().refreshToken).toBe('my-refresh')
  })

  it('clearTokens resets both to null', () => {
    useAuthStore.getState().setTokens('a', 'r')
    useAuthStore.getState().clearTokens()
    expect(useAuthStore.getState().accessToken).toBeNull()
    expect(useAuthStore.getState().refreshToken).toBeNull()
  })
})
