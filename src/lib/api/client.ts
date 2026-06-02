/**
 * Typed OpenAPI client for the Todo API.
 *
 * Built on top of `openapi-fetch` which generates a fully-typed client from the
 * OpenAPI schema at `src/lib/api/openapi.yml`. All HTTP calls go through this
 * client so type-safety and base-URL config are centralised.
 *
 * The client uses a fetch wrapper (`dynamicFetch`) that always delegates to the
 * current `globalThis.fetch` at call time. This ensures that test-time interceptors
 * such as MSW can patch `globalThis.fetch` before the first request without being
 * bypassed by module-load-time capture.
 */
import createClient from 'openapi-fetch'
import type { paths } from './schema.d.ts'

/**
 * The base URL read from the Vite env variable.
 * Falls back to the local Django dev server address.
 */
const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000'

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
 * const { data, error } = await apiClient.GET('/api/v1/todos/')
 * ```
 */
export const apiClient = createClient<paths>({
  baseUrl: BASE_URL,
  fetch: dynamicFetch,
})

/**
 * Injects an Authorization header into all requests when a token is available.
 *
 * Call this once during app bootstrap (e.g. in AppProviders) after reading
 * the stored token. To clear the header on logout, call `injectAuthHeader(null)`.
 *
 * @param token - The raw token string, or null to remove the header.
 */
export function injectAuthHeader(token: string | null): void {
  apiClient.use({
    onRequest({ request }) {
      if (token) {
        request.headers.set('Authorization', `Token ${token}`)
      } else {
        request.headers.delete('Authorization')
      }
      return request
    },
  })
}

/**
 * Normalises an error from `openapi-fetch` into a plain `Error`.
 *
 * `openapi-fetch` returns `{ data, error }` tuples. The `error` field is the
 * raw API response body on 4xx/5xx. This helper wraps it in a proper `Error`
 * so components and hooks can use a uniform error type.
 *
 * @param error - The raw error object from an openapi-fetch call.
 * @param fallback - Human-readable message if the error is unrecognised.
 * @returns A normalised `Error` instance.
 */
export function normaliseError(error: unknown, fallback = 'Request failed'): Error {
  if (error instanceof Error) return error
  if (typeof error === 'string') return new Error(error)
  if (error && typeof error === 'object' && 'detail' in error) {
    return new Error(String((error as Record<string, unknown>).detail))
  }
  return new Error(fallback)
}
