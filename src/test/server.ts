/**
 * MSW test server singleton.
 *
 * Import `server` in test setup to start/stop it. Import `handlers` from
 * `src/mocks/handlers.ts` as the default scenario.
 */
import { setupServer } from 'msw/node'
import { handlers } from '../mocks/handlers'

/** The MSW node server pre-loaded with the default success handlers. */
export const server = setupServer(...handlers)
