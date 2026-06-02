/**
 * Vitest global test setup.
 *
 * Imported via `setupFiles` in vitest.config.ts. Runs before every test file.
 * Responsibilities:
 * - Extend `expect` with `@testing-library/jest-dom` matchers.
 * - Extend `expect` with jest-axe accessibility matchers.
 * - Start the MSW server before all tests and clean up after.
 */
import '@testing-library/jest-dom'
import { expect, afterAll, afterEach, beforeAll } from 'vitest'
import { configureAxe, toHaveNoViolations } from 'jest-axe'
import { cleanup } from '@testing-library/react'
import { server } from './server'

// Extend vitest expect with jest-axe matchers
expect.extend(toHaveNoViolations)

// Make configureAxe available globally in tests
export const axe = configureAxe({
  rules: {
    // Disable region rule for unit tests — full-page regions are integration concerns
    region: { enabled: false },
  },
})

// MSW server lifecycle
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => {
  server.resetHandlers()
  cleanup()
})
afterAll(() => server.close())
