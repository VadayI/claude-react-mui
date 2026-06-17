/**
 * Application router definition.
 *
 * Uses React Router v7 data router (createBrowserRouter) which enables
 * loaders, actions, and the `<RouterProvider>` pattern. Routes are defined
 * centrally here so the entire route tree is visible in one place.
 *
 * Feature route components are code-split at the route boundary via
 * `React.lazy` (module-scope, required for v7 `startTransition` compatibility);
 * the app shell renders them inside a `<Suspense>` boundary with an accessible
 * {@link RouteFallback}. The app shell and the auth guard stay synchronous.
 */
import { lazy } from 'react'
import { createBrowserRouter } from 'react-router'
import { App } from './App'
import { RequireAuth } from './guards/RequireAuth'

const ArticlesPage = lazy(() =>
  import('../features/articles/components/ArticlesPage').then((m) => ({
    default: m.ArticlesPage,
  })),
)
const LoginPage = lazy(() =>
  import('../features/auth/components/LoginPage').then((m) => ({ default: m.LoginPage })),
)

/**
 * The root data router.
 *
 * Routes:
 * - `/`          Home (displayed via App layout)
 * - `/login`     Login page (public)
 * - `/articles`  Articles feature page (protected by RequireAuth)
 */
export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: (
          <div style={{ padding: '2rem' }}>
            <h2>Welcome</h2>
            <p>
              Navigate to <a href="/articles">/articles</a> to see the Articles feature.
            </p>
          </div>
        ),
      },

      // Protected routes — wrapped in RequireAuth layout route
      {
        element: <RequireAuth />,
        children: [{ path: 'articles', element: <ArticlesPage /> }],
      },

      // Auth routes (public)
      { path: 'login', element: <LoginPage /> },
    ],
  },
])
