---
name: vitest-rtl-tdd
description: Core TDD skill — double-loop, RTL queries, MSW handlers, four-states triangulation, jest-axe — activate for any test writing or TDD cycle.
---

# Vitest + RTL + MSW TDD

References: `@.claude/rules/tdd.md`, `@.claude/rules/testing.md`

## Double-loop

- **Outer loop (Playwright):** failing E2E that describes user-visible behaviour
- **Inner loop (Vitest + RTL + MSW):** RED → GREEN → REFACTOR on components/hooks until the outer test goes green
- Write the failing test first; never write production code before a red test

## RTL query priority (in order)
1. `getByRole` with accessible name — primary; mirrors what assistive tech sees
2. `getByLabelText` — for form inputs
3. `getByText` — static text content
4. `getByPlaceholderText` — last resort for unlabelled inputs
5. **Never** `getByTestId` except as a last resort for non-semantic elements

```tsx
// Prefer role queries
const button = screen.getByRole('button', { name: /submit/i });
const input  = screen.getByLabelText(/email address/i);
const alert  = screen.getByRole('alert');
```

## Async assertions

```tsx
// findBy* = waitFor + getBy; use for async renders
const item = await screen.findByRole('listitem', { name: /article title/i });

// waitFor for non-element assertions
await waitFor(() => expect(mockFn).toHaveBeenCalledTimes(1));
```

## MSW setup

```ts
// src/mocks/server.ts
import { setupServer } from 'msw/node';
import { handlers } from './handlers';
export const server = setupServer(...handlers);

// vitest.setup.ts
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

```ts
// src/mocks/handlers.ts — typed from generated schema
import { http, HttpResponse } from 'msw';
import type { paths } from '@/api/schema.d.ts'; // openapi-typescript output

export const handlers = [
  http.get('/api/v1/articles', () =>
    HttpResponse.json<paths['/api/v1/articles']['get']['responses']['200']['content']['application/json']>(
      { results: [], count: 0 }
    )
  ),
];
```

## Four-states triangulation (mandatory for data components)

Test all four UI states so no hardcoded return can stay green:

| State | Trigger | Assertion |
|-------|---------|-----------|
| Loading | MSW delays response | skeleton/spinner visible |
| Empty | MSW returns `{ results: [] }` | empty-state message visible |
| Populated | MSW returns items | item list rendered |
| Error | `server.use(http.get(..., () => HttpResponse.error()))` | error message visible |

## RED → GREEN micro-example

```tsx
// RED: test written first
it('shows article titles after load', async () => {
  render(<ArticleList />, { wrapper: AppProviders });
  // Loading state
  expect(screen.getByRole('progressbar')).toBeInTheDocument();
  // Populated state
  await screen.findByRole('heading', { name: /first article/i });
  expect(screen.getAllByRole('article')).toHaveLength(2);
});

// GREEN: minimal ArticleList that queries /api/v1/articles and renders titles
```

## jest-axe (mandatory accessibility assertion)

```tsx
import { axe, toHaveNoViolations } from 'jest-axe';
expect.extend(toHaveNoViolations);

it('has no axe violations', async () => {
  const { container } = render(<ArticleList />, { wrapper: AppProviders });
  await screen.findByRole('list');
  expect(await axe(container)).toHaveNoViolations();
});
```

## Factories

Use `factory-boy`-style helpers (or plain builder functions) — never `Model.objects.create` patterns inline in tests:

```ts
// src/mocks/factories.ts
export const articleFactory = (overrides = {}) => ({
  id: crypto.randomUUID(),
  title: 'Test Article',
  body: 'Body text',
  createdAt: new Date().toISOString(),
  ...overrides,
});
```

<!-- last reviewed: 2026-06-02 -->
