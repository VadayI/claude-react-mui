/**
 * Application entry point.
 *
 * Mounts the React tree into the `#root` DOM element. The app is wrapped in
 * `AppProviders` (theme, query client) and rendered inside a `RouterProvider`
 * so the entire tree has access to routing, theming, and server-state.
 *
 * When `VITE_MSW_ENABLED=true` (e.g. E2E via Playwright `webServer.env`) the
 * MSW browser worker is started before the first render so the app runs against
 * mocked API responses. In a production build mocking is never enabled, so MSW
 * is dynamically imported and tree-shaken out of the shipped bundle.
 */
import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider } from 'react-router/dom'
import { AppProviders } from './app/providers/AppProviders'
import { router } from './app/router'
import { enableMocking } from './mocks/enableMocking'

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
