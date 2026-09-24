import { useTranslation } from 'react-i18next'
import { Link as RouterLink } from 'react-router'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'

/** Renders the translated home route; no arguments, I/O, state mutations, or errors. */
export function HomePage() {
  const { t } = useTranslation('common')
  return (
    <>
      <Typography variant="h4" component="h1">
        {t('welcome')}
      </Typography>
      <Button component={RouterLink} to="/articles">
        {t('articlesLink')}
      </Button>
    </>
  )
}
