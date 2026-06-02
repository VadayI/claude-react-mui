/**
 * Application router definition.
 *
 * Uses React Router v6 data router (createBrowserRouter) which enables
 * loaders, actions, and the `<RouterProvider>` pattern. Routes are defined
 * centrally here so the entire route tree is visible in one place.
 */
import { createBrowserRouter } from 'react-router-dom'
import { App } from './App'
import { TodosPage } from '../features/todos/components/TodosPage'

/**
 * The root data router.
 *
 * Routes:
 * - `/`        Home (displayed via App layout)
 * - `/todos`   Todos feature page
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
            <p>Navigate to <a href="/todos">/todos</a> to see the Todos feature.</p>
          </div>
        ),
      },
      {
        path: 'todos',
        element: <TodosPage />,
      },
    ],
  },
])
