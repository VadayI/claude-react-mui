/**
 * Presentational component for the articles list.
 *
 * Pure: receives `items` via props; emits no side effects.
 * Handles the EMPTY state (no items) inline with a helpful message.
 * Easy to unit-test because it has no data-fetching or global-state dependencies.
 */
import { useTranslation } from 'react-i18next'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import Chip from '@mui/material/Chip'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import type { ArticleViewModel } from '../api/articlesApi'

interface ArticleListProps {
  /** The articles to display. An empty array renders the empty state. */
  items: ArticleViewModel[]
}

/**
 * Renders an accessible MUI list of articles.
 *
 * When `items` is empty, shows a friendly empty-state message.
 */
/** Renders translated empty/list/status labels for items; no I/O or mutations. Article content remains server-provided text. */
export function ArticleList({ items }: ArticleListProps) {
  const { t } = useTranslation('articles')
  if (items.length === 0) {
    return (
      <Typography
        variant="body2"
        sx={{ color: 'text.secondary', py: 4, textAlign: 'center' }}
        data-testid="article-empty-message"
      >
        {t('empty')}
      </Typography>
    )
  }

  return (
    <List aria-label={t('listLabel')}>
      {items.map((article) => (
        <ListItem key={article.id} divider alignItems="flex-start">
          <ListItemText
            primary={article.title}
            slotProps={{ secondary: { component: 'div' } }}
            secondary={
              <Box>
                <Typography
                  component="div"
                  variant="body2"
                  sx={{
                    color: 'text.secondary',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    mb: 0.5,
                  }}
                >
                  {article.body}
                </Typography>
                <Chip
                  label={t(`status.${article.status}`)}
                  size="small"
                  variant="outlined"
                  sx={{ mt: 0.5 }}
                />
              </Box>
            }
          />
        </ListItem>
      ))}
    </List>
  )
}
