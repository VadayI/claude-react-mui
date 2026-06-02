---
name: playwright-e2e
description: Playwright outer-loop E2E — page-object helpers, role locators, network stubbing, axe-core, keyboard paths, CI config — activate for E2E test work.
---

# Playwright E2E (Outer Loop)

References: `@.claude/rules/tdd.md`, `@.claude/rules/verification.md`

## Role in the double-loop
The Playwright test is the **outer failing test** that drives a feature.
It goes RED first; the inner Vitest/RTL/MSW loop runs until the outer test goes GREEN.
Keep E2E tests coarse — happy paths, auth flows, critical journeys — not exhaustive edge-case coverage.

## Role-based locators (no CSS selectors or test-ids)

```ts
// Good
page.getByRole('button', { name: /submit/i })
page.getByLabel('Email address')
page.getByRole('heading', { name: /articles/i })

// Avoid
page.locator('#submit-btn')
page.locator('[data-testid="submit"]')
```

## Page-object-ish helpers

```ts
// tests/helpers/ArticleListPage.ts
export class ArticleListPage {
  constructor(private page: Page) {}

  async goto() { await this.page.goto('/articles'); }

  async waitForArticles() {
    await this.page.getByRole('list', { name: /articles/i }).waitFor();
  }

  articleHeadings() {
    return this.page.getByRole('heading', { level: 2 });
  }
}
```

## Network stubbing for determinism

```ts
// Option A: route interception (no MSW worker needed)
await page.route('**/api/v1/articles', (route) =>
  route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ results: [{ id: '1', title: 'Stubbed Article' }], count: 1 }),
  })
);

// Option B: MSW service worker — start in playwright.config.ts via baseURL
// and use server.use() per-test via page.evaluate if the worker is injected
```

## Axe accessibility in E2E

```ts
import AxeBuilder from '@axe-core/playwright';

it('articles page has no axe violations', async ({ page }) => {
  await page.goto('/articles');
  await page.getByRole('list', { name: /articles/i }).waitFor();
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});
```

## Keyboard-only path (mandatory for interactive features)

```ts
it('can submit form with keyboard only', async ({ page }) => {
  await page.goto('/articles/new');
  await page.keyboard.press('Tab'); // focus title
  await page.keyboard.type('My Article');
  await page.keyboard.press('Tab'); // focus body
  await page.keyboard.type('Body text');
  await page.keyboard.press('Tab'); // focus submit
  await page.keyboard.press('Enter');
  await expect(page.getByRole('alert', { name: /created/i })).toBeVisible();
});
```

## Playwright config

```ts
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox',  use: { ...devices['Desktop Firefox'] } },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
});
```

## Debugging
- `npx playwright test --ui` for interactive trace mode
- `npx playwright show-trace trace.zip` to inspect failures
- `--debug` flag launches headed browser with inspector

<!-- last reviewed: 2026-06-02 -->
