import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  define: {
    'import.meta.env.VITE_API_BASE_URL': JSON.stringify('http://localhost:8000'),
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: true,
    // Unit/component tests live under src/; Playwright E2E specs in e2e/ run via `npm run e2e`.
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    env: {
      VITE_API_BASE_URL: 'http://localhost:8000',
    },
  },
})
