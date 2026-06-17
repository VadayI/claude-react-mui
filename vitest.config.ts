import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  define: {
    'import.meta.env.VITE_API_BASE_URL': JSON.stringify('http://test.local'),
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: true,
    // Unit/component tests live under src/; Playwright E2E specs in e2e/ run via `npm run e2e`.
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    env: {
      VITE_API_BASE_URL: 'http://test.local',
    },
    // MUI 9 ships ESM internals (e.g. Transition.mjs) that import react-transition-group
    // via an extensionless subpath; Node's strict ESM resolver rejects it. Inlining MUI
    // (and react-transition-group) lets Vite/esbuild resolve those imports. (PR C, MUI 6→9.)
    server: {
      deps: {
        inline: [/@mui\//, 'react-transition-group'],
      },
    },
  },
})
