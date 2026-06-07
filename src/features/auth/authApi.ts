/**
 * Auth API — typed against the Claude API Contract schema.
 *
 * Uses direct `fetch` (not `apiClient`) to avoid circular dependency:
 * `apiClient` imports `authStore`, so auth operations that populate the store
 * must not go through `apiClient`.
 *
 * Covers the user-flow endpoints: register, login, logout.
 * The refresh flow is handled internally by the `apiClient` 401 middleware.
 *
 * Service-flow (client_credentials) is out of scope for the frontend
 * (a browser cannot safely hold a client secret) — see ADR 0021.
 */
import type { components } from '../../lib/api/schema.d.ts'
import { useAuthStore } from '../../lib/auth/authStore'

type LoginRequest = components['schemas']['LoginRequest']
type TokenPair = components['schemas']['TokenPair']
type RegisterRequest = components['schemas']['RegisterRequest']
type RegisterResponse = components['schemas']['RegisterResponse']

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4010'

/**
 * Authenticate with credentials → store tokens → return TokenPair.
 *
 * @throws Error with the API error message on failure.
 */
export async function login(credentials: LoginRequest): Promise<TokenPair> {
  const resp = await fetch(`${BASE_URL}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  })
  if (!resp.ok) {
    const body = await resp.json().catch(() => null)
    throw new Error(
      (body as { detail?: string })?.detail ?? `Login failed (${resp.status})`,
    )
  }
  const tokens = (await resp.json()) as TokenPair
  useAuthStore.getState().setTokens(tokens.access, tokens.refresh)
  return tokens
}

/**
 * Invalidate the current session; clears tokens from the auth store.
 *
 * Best-effort: tokens are cleared locally even if the server call fails.
 */
export async function logout(): Promise<void> {
  const { refreshToken, accessToken, clearTokens } = useAuthStore.getState()
  clearTokens()
  try {
    await fetch(`${BASE_URL}/api/v1/auth/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      body: JSON.stringify(refreshToken ? { refresh: refreshToken } : {}),
    })
  } catch {
    // Best-effort; tokens already cleared locally
  }
}

/**
 * Register a new user account.
 *
 * If the backend returns tokens on registration, they are stored automatically.
 *
 * @throws Error with the API error message on failure.
 */
export async function register(credentials: RegisterRequest): Promise<RegisterResponse> {
  const resp = await fetch(`${BASE_URL}/api/v1/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  })
  if (!resp.ok) {
    const body = await resp.json().catch(() => null)
    throw new Error(
      (body as { detail?: string })?.detail ?? `Register failed (${resp.status})`,
    )
  }
  const result = (await resp.json()) as RegisterResponse
  // Store tokens if the backend issues them on registration (optional per contract)
  if (result.tokens) {
    useAuthStore.getState().setTokens(result.tokens.access, result.tokens.refresh)
  }
  return result
}
