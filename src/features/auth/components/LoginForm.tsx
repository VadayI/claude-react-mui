/**
 * LoginForm presentational component.
 *
 * Renders email/password fields with RHF + Zod validation.
 * Displays server-side errors in a role="alert" region.
 * Calls onSubmit only when form is valid.
 *
 * @param onSubmit - Called with validated { email, password } on valid submit.
 * @param isSubmitting - When true, disables the submit button and sets aria-busy.
 * @param serverError - Server-side error string; shown in role="alert" when non-null.
 */
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import { createLoginFormSchema, type LoginFormValues } from './LoginForm.schema'

interface LoginFormProps {
  onSubmit: (values: { email: string; password: string }) => void
  isSubmitting: boolean
  serverError: string | null
}

/** Renders translated labels and locale-specific Zod validation. Calls onSubmit with valid credentials, renders serverError and honors isSubmitting; performs no requests itself. */
export function LoginForm({ onSubmit, isSubmitting, serverError }: LoginFormProps) {
  const { t } = useTranslation('auth')
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(createLoginFormSchema(t)),
  })

  function handleValidSubmit(values: LoginFormValues) {
    onSubmit(values)
  }

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(handleValidSubmit)}
      noValidate
      sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
    >
      <Box role="alert" aria-live="assertive" aria-atomic="true">
        {serverError ?? ''}
      </Box>

      <TextField
        label={t('email')}
        type="email"
        autoComplete="email"
        error={Boolean(errors.email)}
        helperText={errors.email?.message}
        {...register('email')}
      />

      <TextField
        label={t('password')}
        type="password"
        autoComplete="current-password"
        error={Boolean(errors.password)}
        helperText={errors.password?.message}
        {...register('password')}
      />

      <Button type="submit" variant="contained" disabled={isSubmitting} aria-busy={isSubmitting}>
        {t('signIn')}
      </Button>
    </Box>
  )
}
