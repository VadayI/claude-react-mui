/**
 * Test render helper that wraps the component under test with all required
 * application providers.
 *
 * Uses a fresh `QueryClient` per render with retries disabled so error states
 * surface immediately without waiting for retry delays.
 */
import { ReactNode } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { ThemeProvider } from '@mui/material/styles'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router'
import { theme } from '../theme/theme'

interface RenderWithProvidersOptions extends Omit<RenderOptions, 'wrapper'> {
  /**
   * Initial URL for the MemoryRouter. Defaults to `'/'`.
   */
  initialPath?: string
}

/**
 * Renders `ui` wrapped in ThemeProvider, a fresh QueryClientProvider, and a
 * MemoryRouter. Returns the standard RTL result plus the QueryClient instance.
 *
 * Retries are disabled so error states surface without artificial delays.
 *
 * @param ui - The React element to render.
 * @param options - Render options; `initialPath` sets the MemoryRouter URL.
 * @returns RTL render result extended with the `queryClient` instance.
 */
export function renderWithProviders(
  ui: ReactNode,
  { initialPath = '/', ...options }: RenderWithProvidersOptions = {},
) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
      mutations: { retry: false },
    },
  })

  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <ThemeProvider theme={theme}>
        <QueryClientProvider client={queryClient}>
          <MemoryRouter initialEntries={[initialPath]}>
            {children}
          </MemoryRouter>
        </QueryClientProvider>
      </ThemeProvider>
    )
  }

  return {
    ...render(ui, { wrapper: Wrapper, ...options }),
    queryClient,
  }
}
