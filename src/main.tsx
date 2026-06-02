/**
 * Application entry point.
 *
 * Mounts the React tree into the `#root` DOM element. The app is wrapped in
 * `AppProviders` (theme, query client) and rendered inside a `RouterProvider`
 * so the entire tree has access to routing, theming, and server-state.
 */
import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { AppProviders } from './app/providers/AppProviders'
import { router } from './app/router'

const rootElement = document.getElementById('root')
if (!rootElement) throw new Error('Root element #root not found in the document.')

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>
  </React.StrictMode>,
)
