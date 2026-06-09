/**
 * Playwright E2E tests for the /articles page.
 *
 * They exercise a realistic user journey:
 * 1. Visit /articles and assert the page loads.
 * 2. Add an article and assert the form clears.
 * 3. Run an axe accessibility check on the page.
 *
 * The backend is mocked by the MSW browser worker (`src/mocks/browser.ts`,
 * started in `main.tsx`, service worker at `public/mockServiceWorker.js`).
 * `playwright.config.ts` runs the dev server with `VITE_MSW_ENABLED=true`, so the
 * app serves mocked API responses — no real backend is needed in CI.
 *
 * Since PR #26 added a RequireAuth guard on /articles, each test logs in via the
 * login form (network intercepted at the Playwright level) before navigating to
 * the protected route.
 */
import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test.describe('Articles page', () => {
  test.beforeEach(async ({ page }) => {
    // Intercept the login API so the auth flow works without a real backend.
    await page.route('**/api/v1/auth/login', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ access: 'e2e-access-token', refresh: 'e2e-refresh-token' }),
      })
    })

    // Navigate to the guarded route — RequireAuth redirects to /login?next=/articles.
    await page.goto('/articles')
    await expect(page).toHaveURL(/\/login/)

    // Log in and let the guard redirect back to /articles.
    await page.getByLabel(/email/i).fill('alice@example.com')
    await page.getByLabel(/password/i).fill('secret123')
    await page.getByRole('button', { name: /sign in/i }).click()

    await expect(page).toHaveURL(/\/articles/)
  })

  test('loads the articles page with the heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /articles/i })).toBeVisible()
  })

  test('shows the AddArticleForm', async ({ page }) => {
    await expect(page.getByLabel(/article title/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /add article/i })).toBeVisible()
  })

  test('add button is disabled when title is empty', async ({ page }) => {
    await expect(page.getByRole('button', { name: /add article/i })).toBeDisabled()
  })

  test('add button is enabled after typing a title', async ({ page }) => {
    await page.getByLabel(/article title/i).fill('My new article')
    await expect(page.getByRole('button', { name: /add article/i })).toBeEnabled()
  })

  test('adding an article clears the title input', async ({ page }) => {
    await page.getByLabel(/article title/i).fill('E2E test article')
    await page.getByRole('button', { name: /add article/i }).click()
    await expect(page.getByLabel(/article title/i)).toHaveValue('')
  })

  test('page has no accessibility violations', async ({ page }) => {
    // Wait for the page to settle
    await page.waitForLoadState('networkidle')

    const accessibilityScanResults = await new AxeBuilder({ page })
      .disableRules(['region'])
      .analyze()

    expect(accessibilityScanResults.violations).toEqual([])
  })
})
