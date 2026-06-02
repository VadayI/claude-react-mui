/**
 * Root provider composition.
 *
 * Wraps the entire application with:
 * - MUI ThemeProvider + CssBaseline (design tokens + CSS reset)
 * - TanStack QueryClientProvider (server-state management)
 *
 * Router is wired at main.tsx level via RouterProvider to keep providers
 * and routing separate and independently testable.
 */
import { ReactNode } from 'react'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { QueryClientProvider } from '@tanstack/react-query'
import { theme } from '../../theme/theme'
import { queryClient } from '../../lib/query/queryClient'

interface AppProvidersProps {
  /** The application tree to wrap. */
  children: ReactNode
}

/**
 * Composes all application-level providers into a single wrapper component.
 *
 * Order matters: ThemeProvider must wrap CssBaseline; QueryClientProvider
 * wraps everything that may fetch data.
 */
export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </ThemeProvider>
  )
}
