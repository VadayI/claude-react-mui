/**
 * Central MUI theme for the application.
 *
 * Centralising the theme here means that design token changes (palette, typography,
 * component overrides) propagate everywhere without touching individual components.
 */
import { createTheme } from '@mui/material/styles'

/**
 * Application MUI theme.
 *
 * Palette: light mode with a blue primary and pink accent.
 * Typography: uses the system font stack for fast rendering.
 * Components: MUI Button is set to `disableElevation` by default so cards/toolbars
 * stay visually flat without per-use props.
 */
export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1565c0',
    },
    secondary: {
      main: '#c2185b',
    },
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
  },
  components: {
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
        size: 'small',
      },
    },
  },
})
