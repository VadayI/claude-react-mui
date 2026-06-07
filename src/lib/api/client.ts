/**
 * Typed OpenAPI client for the Claude API Contract.
 *
 * Built on top of `openapi-fetch` which generates a fully-typed client from the
 * OpenAPI schema at `src/lib/api/openapi.yml`. All HTTP calls go through this
 * client so type-safety and base-URL config are centralised.
 *
 * The client uses a fetch wrapper (`dynamicFetch`) that always delegates to the
 * current `globalThis.fetch` at call time. This ensures that test-time interceptors
 * such as MSW can patch `globalThis.fetch` before the first request without being
 * bypassed by module-load-time capture.
 *
 * Auth: Bearer/JWT (ADR 0021). Access token is injected automatically from the
 * in-memory authStore. On 401, one refresh attempt is made; on failure, tokens
 * are cleared (caller or route guard should redirect to login).
 */
import createClient from 'openapi-fetch'
import type { paths } from './schema.d.ts'
import { useAuthStore } from '../auth/authStore'

/**
 * The base URL read from the Vite env variable.
 * Falls back to the Prism mock address (PR4 / early development cycle).
 */
const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4010'

/**
 * A thin fetch wrapper that always delegates to the current `globalThis.fetch`.
 *
 * This is critical for test environments (MSW) where `globalThis.fetch` is
 * patched after module initialisation. Without this indirection, openapi-fetch
 * would capture the original `fetch` at `createClient()` time and bypass the
 * interceptor.
 */
const dynamicFetch: typeof fetch = (...args) => globalThis.fetch(...args)

/**
 * The central typed HTTP client.
 *
 * Usage example:
 * ```ts
 * const { data, error } = await apiClient.GET('/api/v1/articles')
 * ```
 */
export const apiClient = createClient<paths>({
  baseUrl: BASE_URL,
  fetch: dynamicFetch,
})

// Bearer token injection middleware
apiClient.use({
  onRequest({ request }) {
    const token = useAuthStore.getState().accessToken
    if (token) {
      request.headers.set('Authorization', `Bearer ${token}`)
    }
    return request
  },
})

// 401 → refresh → retry middleware
apiClient.use({
  async onResponse({ request, response }) {
    if (response.status !== 401) return response

    // Avoid infinite refresh loop
    if (request.url.includes('/auth/refresh')) return response

    const { refreshToken, setTokens, setAccessToken, clearTokens } = useAuthStore.getState()
    if (!refreshToken) return response

    let refreshResp: Response
    try {
      refreshResp = await dynamicFetch(
        new Request(`${BASE_URL}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh: refreshToken }),
        }),
      )
    } catch {
      clearTokens()
      return response
    }

    if (!refreshResp.ok) {
      clearTokens()
      return response
    }

    const refreshData = (await refreshResp.json()) as { access: string; refresh?: string }
    if (refreshData.refresh) {
      setTokens(refreshData.access, refreshData.refresh)
    } else {
      setAccessToken(refreshData.access)
    }

    // Retry the original request with the new access token
    const retryHeaders = new Headers(request.headers)
    retryHeaders.set('Authorization', `Bearer ${refreshData.access}`)
    const retryReq = new Request(request.url, {
      method: request.method,
      headers: retryHeaders,
      body: request.body,
      mode: request.mode,
      credentials: request.credentials,
      cache: request.cache,
      redirect: request.redirect,
      referrer: request.referrer,
      referrerPolicy: request.referrerPolicy,
    })
    return dynamicFetch(retryReq)
  },
})

/**
 * Normalises an error from `openapi-fetch` into a plain `Error`.
 *
 * `openapi-fetch` returns `{ data, error }` tuples. The `error` field is the
 * raw API response body on 4xx/5xx. This helper wraps it in a proper `Error`
 * so components and hooks can use a uniform error type.
 *
 * Handles two contract error envelopes:
 * - `{ detail: string }` — simple error (401/403/404/409/429/500)
 * - `{ errors: [{field, code, message}] }` — validation error (400)
 *
 * @param error - The raw error object from an openapi-fetch call.
 * @param fallback - Human-readable message if the error is unrecognised.
 * @returns A normalised `Error` instance.
 */
export function normaliseError(error: unknown, fallback = 'Request failed'): Error {
  if (error instanceof Error) return error
  if (typeof error === 'string') return new Error(error)
  if (error && typeof error === 'object') {
    // Validation errors envelope: { errors: [{ field, code, message }] }
    if ('errors' in error && Array.isArray((error as Record<string, unknown>).errors)) {
      const errs = (error as { errors: Array<{ message?: string }> }).errors
      const msg = errs
        .map((e) => e.message ?? '')
        .filter(Boolean)
        .join('; ')
      return new Error(msg || fallback)
    }
    // Simple detail envelope: { detail: string }
    if ('detail' in error) {
      return new Error(String((error as Record<string, unknown>).detail))
    }
  }
  return new Error(fallback)
}
