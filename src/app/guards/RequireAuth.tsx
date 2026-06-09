/**
 * RequireAuth layout route guard.
 *
 * Reads accessToken from the in-memory auth store. If absent, redirects to
 * /login with a ?next= parameter preserving the intended destination.
 * If present, renders the child routes via <Outlet />.
 *
 * @returns <Outlet /> when authenticated; <Navigate /> to /login otherwise.
 */
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../lib/auth/authStore'

export function RequireAuth() {
  const accessToken = useAuthStore((s) => s.accessToken)
  const location = useLocation()

  if (!accessToken) {
    const next = encodeURIComponent(location.pathname + location.search)
    return <Navigate to={`/login?next=${next}`} replace />
  }

  return <Outlet />
}
