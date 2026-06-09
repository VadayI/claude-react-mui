/**
 * MSW browser worker startup guard.
 *
 * Starts the MSW browser worker ONLY when `VITE_MSW_ENABLED === 'true'`.
 * Unlike the previous implementation this guard is NOT tied to
 * `import.meta.env.DEV` — the flag alone controls mocking, so the same
 * binary can run against a real backend (flag absent) or MSW (flag set),
 * regardless of how Vite built it.
 *
 * Playwright sets `VITE_MSW_ENABLED=true` via `webServer.env` so E2E tests
 * continue to work without change.
 *
 * @returns A promise that resolves once the worker has started (or immediately
 *   if mocking is disabled).
 */
export async function enableMocking(): Promise<void> {
  if (import.meta.env.VITE_MSW_ENABLED !== 'true') return
  const { worker } = await import('./browser')
  await worker.start({ onUnhandledRequest: 'bypass' })
}
