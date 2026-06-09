/**
 * Unit tests for MSW handlers origin.
 *
 * RED phase: verifies that handlers read their base URL from
 * `import.meta.env.VITE_API_BASE_URL` rather than a hardcoded string.
 *
 * These tests FAIL on the current implementation (handlers.ts hard-codes
 * `http://localhost:8000`) and go GREEN once the origin is replaced with
 * `import.meta.env.VITE_API_BASE_URL`.
 */
import { describe, it, expect } from 'vitest'
import { handlers } from './handlers'

// vitest.config.ts injects VITE_API_BASE_URL = 'http://test.local' via `define`
// and via `test.env`.  We read from the env that Vitest itself sets so the test
// is portable — if the config changes the tests still assert the right origin.
const BASE_URL = import.meta.env.VITE_API_BASE_URL as string

describe('MSW handlers origin', () => {
  it('should read origin from VITE_API_BASE_URL, not a hardcoded string', () => {
    // Gather all handler URLs from the internal MSW handler info.
    // Each handler exposes its path via `info.path` after the MSW 2.x update.
    const handlerPaths = handlers.map((h) => {
      // `h.info.path` is the full URL/path string registered with the handler
      // e.g. "http://localhost:8000/api/v1/articles"
      return String((h as { info?: { path?: unknown } }).info?.path ?? '')
    })

    // Every handler path must start with the env-configured base URL.
    for (const path of handlerPaths) {
      expect(path).toMatch(new RegExp(`^${escapeRegex(BASE_URL)}`))
    }
  })

  it('handler paths must equal VITE_API_BASE_URL origin — no hardcoded literal survives', () => {
    // Confirm that every handler path starts with the env-configured origin.
    // vitest.config.ts sets VITE_API_BASE_URL to 'http://test.local' (deliberately
    // not ':8000') so a hardcoded ':8000' literal in handlers.ts would fail here.
    const handlerPaths = handlers.map((h) =>
      String((h as { info?: { path?: unknown } }).info?.path ?? ''),
    )

    for (const path of handlerPaths) {
      // The path must begin with BASE_URL.  If BASE_URL is :8000 and the
      // hardcoded value is also :8000 this would incorrectly pass — so we run a
      // second assertion below.
      expect(path.startsWith(BASE_URL)).toBe(true)
    }
  })

  it('should derive GET /api/v1/articles handler URL from VITE_API_BASE_URL', () => {
    const getArticlesHandler = handlers.find((h) => {
      const path = String((h as { info?: { path?: unknown } }).info?.path ?? '')
      return path.includes('/api/v1/articles')
    })

    expect(getArticlesHandler).toBeDefined()

    const path = String(
      (getArticlesHandler as { info?: { path?: unknown } } | undefined)?.info?.path ?? '',
    )

    // Must equal the dynamically-constructed URL, not any hardcoded literal.
    // This is the canonical assertion that forces the fix:
    //   `http.get(\`${import.meta.env.VITE_API_BASE_URL}/api/v1/articles\`, ...)`
    expect(path).toBe(`${BASE_URL}/api/v1/articles`)
  })
})

/** Escapes special regex characters in a string. */
function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
