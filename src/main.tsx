/**
 * Application entry point.
 *
 * Mounts the React tree into the `#root` DOM element. The app is wrapped in
 * `AppProviders` (theme, query client) and rendered inside a `RouterProvider`
 * so the entire tree has access to routing, theming, and server-state.
 *
 * In development (and in E2E, where `VITE_MSW_ENABLED=true`) the MSW browser
 * worker is started before the first render so the app runs against mocked API
 * responses. In a production build mocking is never enabled, so MSW is
 * dynamically imported and tree-shaken out of the shipped bundle.
 */
import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { AppProviders } from './app/providers/AppProviders'
import { router } from './app/router'

/**
 * Starts the MSW browser worker when mocking is enabled, otherwise a no-op.
 *
 * Enabled in dev, or when `VITE_MSW_ENABLED === 'true'` (E2E). Unhandled requests
 * pass through (`bypass`) so a real backend, if present, still works.
 */
async function enableMocking(): Promise<void> {
  if (!import.meta.env.DEV && import.meta.env.VITE_MSW_ENABLED !== 'true') return
  const { worker } = await import('./mocks/browser')
  await worker.start({ onUnhandledRequest: 'bypass' })
}

const rootElement = document.getElementById('root')
if (!rootElement) throw new Error('Root element #root not found in the document.')

void enableMocking().then(() => {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <AppProviders>
        <RouterProvider router={router} />
      </AppProviders>
    </React.StrictMode>,
  )
})
