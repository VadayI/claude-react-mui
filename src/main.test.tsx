/**
 * Unit tests for the MSW env-gated startup guard.
 *
 * RED phase: verifies that `enableMocking()` starts the MSW browser worker
 * ONLY when `VITE_MSW_ENABLED === 'true'`, regardless of whether the build
 * is a dev or production build.
 *
 * Current behaviour (broken):
 *   `if (!import.meta.env.DEV && import.meta.env.VITE_MSW_ENABLED !== 'true') return`
 *   → MSW is ALWAYS started in dev mode (DEV=true), ignoring VITE_MSW_ENABLED.
 *
 * Target behaviour (after fix):
 *   `if (import.meta.env.VITE_MSW_ENABLED !== 'true') return`
 *   → MSW starts ONLY when the flag is explicitly set to 'true'.
 *
 * These tests FAIL on the current implementation and go GREEN once main.tsx
 * (or a dedicated src/mocks/enableMocking.ts helper) exports `enableMocking`
 * with the corrected guard.
 */
import { vi, describe, it, expect, beforeEach } from 'vitest'

// ---------------------------------------------------------------------------
// Mock the browser worker so we never touch service-worker APIs in jsdom.
// ---------------------------------------------------------------------------
const mockWorkerStart = vi.fn().mockResolvedValue(undefined)

vi.mock('./mocks/browser', () => ({
  worker: { start: mockWorkerStart },
}))

// ---------------------------------------------------------------------------
// The function under test.
//
// GREEN phase must export `enableMocking` from `src/mocks/enableMocking.ts`
// (or from `src/main.tsx` directly — but extracting it is the idiomatic fix).
// Until the file exists this import throws → test file fails to load (RED).
// ---------------------------------------------------------------------------
import { enableMocking } from './mocks/enableMocking'

describe('enableMocking()', () => {
  beforeEach(() => {
    mockWorkerStart.mockClear()
  })

  it('starts the MSW worker when VITE_MSW_ENABLED is "true"', async () => {
    vi.stubEnv('VITE_MSW_ENABLED', 'true')

    await enableMocking()

    expect(mockWorkerStart).toHaveBeenCalledOnce()
    expect(mockWorkerStart).toHaveBeenCalledWith({ onUnhandledRequest: 'bypass' })

    vi.unstubAllEnvs()
  })

  it('does NOT start the MSW worker when VITE_MSW_ENABLED is "false"', async () => {
    vi.stubEnv('VITE_MSW_ENABLED', 'false')

    await enableMocking()

    expect(mockWorkerStart).not.toHaveBeenCalled()

    vi.unstubAllEnvs()
  })

  it('does NOT start the MSW worker when VITE_MSW_ENABLED is absent', async () => {
    // Remove the env variable entirely.
    vi.stubEnv('VITE_MSW_ENABLED', '')

    await enableMocking()

    expect(mockWorkerStart).not.toHaveBeenCalled()

    vi.unstubAllEnvs()
  })

  it('does NOT start MSW even in a dev-like env when VITE_MSW_ENABLED is not "true"', async () => {
    // This is the core regression test: the old code always started MSW when
    // import.meta.env.DEV was true.  After the fix, DEV is irrelevant — only
    // the explicit flag controls the worker.
    vi.stubEnv('VITE_MSW_ENABLED', 'false')
    // Note: we cannot override import.meta.env.DEV directly in Vitest (it is
    // set by the build tool), but the assertion below captures the intent:
    // even if we are running in a "dev" context the worker must NOT start.
    await enableMocking()

    expect(mockWorkerStart).not.toHaveBeenCalled()

    vi.unstubAllEnvs()
  })
})
