/**
 * LoginPage container.
 *
 * Reads ?next from search params; if already authenticated, redirects immediately.
 * On successful login, stores tokens and navigates to next ?? '/'.
 * On 401 error, surfaces the detail message to LoginForm's serverError prop.
 *
 * `sanitizeNext` prevents open-redirect attacks by only allowing same-origin
 * relative paths (starts with `/` but not `//`).
 */
import { useState } from 'react'
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuthStore } from '../../../lib/auth/authStore'
import { useLogin } from '../hooks/useLogin'
import { LoginForm } from './LoginForm'

function sanitizeNext(next: string | null): string {
  if (!next) return '/'
  return next.startsWith('/') && !next.startsWith('//') ? next : '/'
}

export function LoginPage() {
  const accessToken = useAuthStore((s) => s.accessToken)
  const [searchParams] = useSearchParams()
  const next = searchParams.get('next')
  const navigate = useNavigate()
  const { mutate: login, isPending } = useLogin()
  const [serverError, setServerError] = useState<string | null>(null)

  if (accessToken) {
    return <Navigate to={sanitizeNext(next)} replace />
  }

  function handleSubmit(values: { email: string; password: string }) {
    setServerError(null)
    login(values, {
      onSuccess(data) {
        useAuthStore.getState().setTokens(data.access, data.refresh)
        void navigate(sanitizeNext(next))
      },
      onError(err) {
        setServerError(err.message ?? 'Invalid credentials.')
      },
    })
  }

  return <LoginForm onSubmit={handleSubmit} isSubmitting={isPending} serverError={serverError} />
}
