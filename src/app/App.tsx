/**
 * Application shell component.
 *
 * Renders the top-level layout: an AppBar with navigation links and an Outlet
 * for the active child route. The AppBar is thin and delegates rendering to
 * MUI components; it owns no data fetching.
 */
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import { Outlet, Link as RouterLink } from 'react-router-dom'

/**
 * Root application layout with navigation.
 *
 * Child routes are rendered via `<Outlet />`.
 */
export function App() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Claude React MUI
          </Typography>
          <Button color="inherit" component={RouterLink} to="/">
            Home
          </Button>
          <Button color="inherit" component={RouterLink} to="/todos">
            Todos
          </Button>
        </Toolbar>
      </AppBar>
      <Container component="main" sx={{ mt: 3, mb: 3, flex: 1 }}>
        <Outlet />
      </Container>
    </Box>
  )
}
