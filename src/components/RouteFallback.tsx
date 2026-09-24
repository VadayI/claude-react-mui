/**
 * Accessible loading fallback for lazily-loaded route chunks.
 *
 * Rendered inside the app shell's `<Suspense>` boundary while a route's code
 * chunk is being fetched (see {@link App} and the lazy routes in the router).
 * It exposes a live region (`role="status"`) with a visible, accessible
 * "Loading…" label so assistive technology announces the transition, satisfying
 * the component-contract loading state and WCAG 2.1 AA.
 *
 * Presentational only — no props, no data fetching. Spacing and colour come
 * from the central MUI theme via `sx`; there are no magic values.
 *
 * @returns A centered, theme-driven spinner announced as a status region.
 */
import { useTranslation } from 'react-i18next'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Typography from '@mui/material/Typography'

/** Renders translated loading status and spinner; no parameters, requests, mutations or expected exceptions. */
export function RouteFallback() {
  const { t } = useTranslation('common')
  return (
    <Box
      role="status"
      aria-label={t('loading')}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        minHeight: (theme) => theme.spacing(25),
        py: 4,
      }}
    >
      <CircularProgress aria-hidden />
      <Typography variant="body2" color="text.secondary">
        {t('loadingText')}
      </Typography>
    </Box>
  )
}
