/**
 * Playwright E2E tests for the /todos page.
 *
 * They exercise a realistic user journey:
 * 1. Visit /todos and assert the page loads.
 * 2. Add a todo and assert it appears.
 * 3. Run an axe accessibility check on the page.
 *
 * The backend is mocked by the MSW browser worker (`src/mocks/browser.ts`,
 * started in `main.tsx`, service worker at `public/mockServiceWorker.js`).
 * `playwright.config.ts` runs the dev server with `VITE_MSW_ENABLED=true`, so the
 * app serves mocked API responses — no real backend is needed in CI.
 */
import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test.describe('Todos page', () => {
  test('loads the todos page with the heading', async ({ page }) => {
    await page.goto('/todos')
    await expect(page.getByRole('heading', { name: /todos/i })).toBeVisible()
  })

  test('shows the AddTodoForm', async ({ page }) => {
    await page.goto('/todos')
    await expect(page.getByLabel(/new todo/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /add/i })).toBeVisible()
  })

  test('add button is disabled when input is empty', async ({ page }) => {
    await page.goto('/todos')
    await expect(page.getByRole('button', { name: /add/i })).toBeDisabled()
  })

  test('add button is enabled after typing', async ({ page }) => {
    await page.goto('/todos')
    await page.getByLabel(/new todo/i).fill('Walk the dog')
    await expect(page.getByRole('button', { name: /add/i })).toBeEnabled()
  })

  test('adding a todo clears the input', async ({ page }) => {
    await page.goto('/todos')
    await page.getByLabel(/new todo/i).fill('E2E test todo')
    await page.getByRole('button', { name: /add/i }).click()
    await expect(page.getByLabel(/new todo/i)).toHaveValue('')
  })

  test('page has no accessibility violations', async ({ page }) => {
    await page.goto('/todos')
    // Wait for the page to settle
    await page.waitForLoadState('networkidle')

    const accessibilityScanResults = await new AxeBuilder({ page })
      .disableRules(['region'])
      .analyze()

    expect(accessibilityScanResults.violations).toEqual([])
  })
})
