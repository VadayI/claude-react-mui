/**
 * Playwright E2E test for the auth redirect + login flow.
 *
 * Scenario: an anonymous user navigates to /articles, is redirected to the
 * login page (preserving ?next=/articles), logs in with mocked credentials,
 * and is returned to /articles.
 *
 * The MSW browser worker runs in the dev server (VITE_MSW_ENABLED=true).
 * For the login POST we additionally intercept at the Playwright level so the
 * test controls the response without relying on the MSW default handler that
 * ships with the app.
 */
import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test.describe('Auth redirect and login flow', () => {
  test('anonymous user is redirected to login and can return to articles after login', async ({
    page,
  }) => {
    // Intercept the login API call at the network level so we control the response
    await page.route('**/api/v1/auth/login', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ access: 'e2e-access-token', refresh: 'e2e-refresh-token' }),
      })
    })

    // 1. Navigate to /articles as an anonymous user
    await page.goto('/articles')

    // 2. Assert redirected to /login with ?next=%2Farticles
    await expect(page).toHaveURL(/\/login/)
    const url = new URL(page.url())
    expect(url.searchParams.get('next')).toBe('/articles')

    // 3. The login form should be visible
    await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible()

    // 4. Fill in valid credentials
    await page.getByLabel(/email/i).fill('alice@example.com')
    await page.getByLabel(/password/i).fill('secret123')

    // 5. Submit the form
    await page.getByRole('button', { name: /sign in/i }).click()

    // 6. Assert navigated to /articles after successful login
    await expect(page).toHaveURL(/\/articles/)
    await expect(page.getByRole('heading', { name: /articles/i })).toBeVisible()
  })

  test('login page has no accessibility violations', async ({ page }) => {
    await page.goto('/login')
    await page.waitForLoadState('networkidle')

    const results = await new AxeBuilder({ page }).disableRules(['region']).analyze()
    expect(results.violations).toEqual([])
  })
})
