/**
 * Root provider composition.
 *
 * Wraps the entire application with:
 * - MUI ThemeProvider + CssBaseline (design tokens + CSS reset)
 * - I18nextProvider (bundled translations)
 * - QueryClientProvider (shared server-state cache)
 *
 * Router is wired at main.tsx level via RouterProvider to keep providers
 * and routing separate and independently testable.
 */
import { I18nextProvider } from 'react-i18next'
import { i18n } from '../../lib/i18n'
import { ReactNode } from 'react'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '../../lib/query/queryClient'
import { theme } from '../../theme/theme'

interface AppProvidersProps {
  /** The application tree to wrap. */
  children: ReactNode
}

/**
 * Composes all application-level providers into a single wrapper component.
 *
 * @param children - Application tree to render with the theme and translations.
 * @returns The wrapped React tree. No requests, storage or database mutations.
 * Order matters: ThemeProvider must wrap CssBaseline.
 */
export function AppProviders({ children }: AppProvidersProps) {
  return (
    <I18nextProvider i18n={i18n}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      </ThemeProvider>
    </I18nextProvider>
  )
}
