/**
 * Container component for the /articles route.
 *
 * Wires data-fetching hooks (`useArticles`, `useCreateArticle`) to the
 * presentational components (`AddArticleForm`, `ArticleList`). Handles all
 * four UI states: loading, error, empty, and success.
 */
import { useTranslation } from 'react-i18next'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Skeleton from '@mui/material/Skeleton'
import { useArticles } from '../hooks/useArticles'
import { useCreateArticle } from '../hooks/useCreateArticle'
import { AddArticleForm } from './AddArticleForm'
import { ArticleList } from './ArticleList'

/**
 * The Articles page container.
 *
 * UI states:
 * - Loading: skeleton list + spinner role=status
 * - Error:   MUI Alert with a retry button
 * - Empty:   empty state via ArticleList
 * - Success: ArticleList + AddArticleForm
 */
/** Renders translated articles UI; no parameters. Hooks fetch API data and invalidate the shared cache after creation; errors render in the alert. */
export function ArticlesPage() {
  const { t } = useTranslation(['articles', 'common'])
  const { articles, isLoading, isError, error, refetch } = useArticles()
  const { mutate: addArticle, isPending, error: createError } = useCreateArticle()

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        {t('title')}
      </Typography>

      <AddArticleForm onAdd={addArticle} error={createError?.message} disabled={isPending} />

      {isLoading && (
        <Box role="status" aria-label={t('loading')} sx={{ mt: 1 }}>
          <CircularProgress size={20} aria-label={t('loading')} sx={{ mr: 1 }} />
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} variant="rectangular" height={72} sx={{ mb: 1 }} />
          ))}
        </Box>
      )}

      {isError && !isLoading && (
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={refetch}>
              {t('retry', { ns: 'common' })}
            </Button>
          }
        >
          {error?.message ?? t('loadError')}
        </Alert>
      )}

      {!isLoading && !isError && <ArticleList items={articles} />}
    </Box>
  )
}
