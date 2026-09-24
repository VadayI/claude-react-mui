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
import { useTranslation } from 'react-i18next'
import { useState } from 'react'
import { Navigate, useNavigate, useSearchParams } from 'react-router'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { useAuthStore } from '../../../lib/auth/authStore'
import { useLogin } from '../hooks/useLogin'
import { LoginForm } from './LoginForm'

function sanitizeNext(next: string | null): string {
  if (!next) return '/'
  return next.startsWith('/') && !next.startsWith('//') ? next : '/'
}

/** Renders translated login UI; no parameters. Login performs an API request, sets in-memory tokens and navigates on success; errors render through LoginForm. */
export function LoginPage() {
  const { t } = useTranslation('auth')
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
        setServerError(err.message ?? t('invalidCredentials'))
      },
    })
  }

  return (
    <Box sx={{ maxWidth: 400, mx: 'auto', mt: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        {t('title')}
      </Typography>
      <LoginForm onSubmit={handleSubmit} isSubmitting={isPending} serverError={serverError} />
    </Box>
  )
}
