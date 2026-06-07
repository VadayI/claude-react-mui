---
name: mui-theming
description: MUI 6 theming — central theme, sx prop, styled(), responsive values, dark mode — activate for any styling or theming work.
---

# MUI 6 Theming

## Core principles

- All design tokens live in the central theme — never magic values in `sx` or `styled()`
- Use `sx` for one-off per-instance overrides; use `styled()` for reusable styled variants
- No hard-coded colours, spacing numbers, or font sizes outside the theme
- Responsive values via the `sx` array/object syntax; no manual `@media` queries in components

## Central theme shape

```ts
// src/theme/index.ts
import { createTheme } from '@mui/material/styles'

const theme = createTheme({
  palette: {
    primary: { main: '#1976d2' },
    secondary: { main: '#dc004e' },
    mode: 'light', // swap to 'dark' or use ColorModeContext
  },
  typography: {
    fontFamily: '"Inter", sans-serif',
    h1: { fontSize: '2rem', fontWeight: 700 },
  },
  spacing: 8, // 1 unit = 8px
  breakpoints: { values: { xs: 0, sm: 600, md: 900, lg: 1200, xl: 1536 } },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: theme.spacing(1),
          textTransform: 'none',
        }),
      },
      variants: [
        {
          props: { variant: 'soft' },
          style: ({ theme }) => ({
            backgroundColor: theme.palette.primary.light,
            color: theme.palette.primary.dark,
          }),
        },
      ],
    },
  },
})

export default theme
```

## sx prop — instance overrides

```tsx
// Responsive spacing, hiding, colour from theme tokens
<Box
  sx={{
    p: { xs: 1, md: 3 }, // theme.spacing(1) / theme.spacing(3)
    display: { xs: 'none', sm: 'flex' },
    color: 'text.secondary', // palette alias
    bgcolor: 'background.paper',
  }}
/>
```

## styled() — reusable variants

```tsx
import { styled } from '@mui/material/styles'

const CardRoot = styled('div')(({ theme }) => ({
  padding: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[1],
}))
```

## Dark mode with ColorModeContext

```tsx
const ColorModeContext = React.createContext({ toggleColorMode: () => {} })

function App() {
  const [mode, setMode] = useState<'light' | 'dark'>('light')
  const theme = useMemo(() => createTheme({ palette: { mode } }), [mode])
  return (
    <ColorModeContext.Provider
      value={{ toggleColorMode: () => setMode((m) => (m === 'light' ? 'dark' : 'light')) }}
    >
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router />
      </ThemeProvider>
    </ColorModeContext.Provider>
  )
}
```

## Density & RTL

- Use `theme.spacing()` everywhere — density scales automatically
- Set `direction: 'rtl'` in theme + `<CacheProvider>` with RTL emotion cache for RTL support

## Emotion internals

- MUI 6 uses Emotion by default; avoid mixing `@emotion/styled` imports with MUI's `styled` — use MUI's re-export
- `GlobalStyles` component for CSS resets instead of plain `<style>` tags

<!-- last reviewed: 2026-06-02 -->
