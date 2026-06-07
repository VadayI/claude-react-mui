/**
 * Container component for the /articles route.
 *
 * Wires data-fetching hooks (`useArticles`, `useCreateArticle`) to the
 * presentational components (`AddArticleForm`, `ArticleList`). Handles all
 * four UI states: loading, error, empty, and success.
 */
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
export function ArticlesPage() {
  const { articles, isLoading, isError, error, refetch } = useArticles()
  const { mutate: addArticle, isPending, error: createError } = useCreateArticle()

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Articles
      </Typography>

      <AddArticleForm onAdd={addArticle} error={createError?.message} disabled={isPending} />

      {isLoading && (
        <Box role="status" aria-label="Loading articles" sx={{ mt: 1 }}>
          <CircularProgress size={20} sx={{ mr: 1 }} />
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
              Retry
            </Button>
          }
        >
          {error?.message ?? 'Failed to load articles.'}
        </Alert>
      )}

      {!isLoading && !isError && <ArticleList items={articles} />}
    </Box>
  )
}
