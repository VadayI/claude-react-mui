# Verification Guide — {FEATURE_NAME}

> Manual smoke-test checklist for {FEATURE_NAME}. Derived from `.claude/memory/routes.json` and `src/lib/api/openapi.yml`. Run this after deploying or before signing off a PR to confirm the feature works end to end in a real browser session.

## Scope

Covers the following routes and screens shipped by this feature:

| Route                    | Screen                          | Auth required       |
| ------------------------ | ------------------------------- | ------------------- |
| `{TODO: e.g. /articles}` | `{TODO: e.g. ArticlesListPage}` | {TODO: yes/no/role} |

---

## Prerequisites

1. Start the dev server:
   ```bash
   npm run dev
   ```
   App available at `http://localhost:5173`
2. Ensure the backend is running and `VITE_API_BASE_URL` points to it — OR — confirm MSW is active (check the browser console for `[MSW] Mocking enabled`).
3. {TODO: Obtain auth if required — e.g. "Sign in as a test user." Use placeholders; never put real credentials here.}

---

## Per screen

### {Screen name} — `{/route/path}`

#### Manual step

1. {TODO: Navigate to the route, e.g. "Open `http://localhost:5173/articles` in the browser."}
2. {TODO: Describe what to look for — e.g. "Confirm the article list renders with at least one item."}

#### Four UI states

| State       | How to trigger                                                                                           | Expected                                             |
| ----------- | -------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| **Loading** | {TODO: e.g. "Throttle network to Slow 4G in DevTools and refresh."}                                      | Skeleton / spinner visible; no error shown           |
| **Empty**   | {TODO: e.g. "Use MSW to return an empty array: uncomment `handlers/articles-empty.ts` in `src/mocks/`."} | Empty-state illustration + {TODO: CTA label} visible |
| **Error**   | {TODO: e.g. "Use MSW to return a 500: uncomment `handlers/articles-error.ts`."}                          | Error message displayed; retry button present        |
| **Success** | {TODO: Normal data — default MSW handler or live backend}                                                | {TODO: describe expected data shape on screen}       |

#### Keyboard pass

- [ ] Tab through all interactive elements — confirm visible focus outline on each.
- [ ] {TODO: Feature-specific keyboard check — e.g. "Press Enter on a list item to navigate to its detail page."}
- [ ] {TODO: e.g. "Escape closes the delete-confirmation dialog."}

#### Playwright invocation

```bash
npm run e2e -- {TODO: e.g. e2e/articles.spec.ts}
```

---

## Done when

- [ ] Every success case renders its screen correctly.
- [ ] Loading state shows a skeleton or spinner.
- [ ] Empty state shows the empty-state component (not a blank page).
- [ ] Error state shows a user-facing error message.
- [ ] Keyboard navigation reaches all interactive elements with a visible focus ring.
- [ ] {TODO: Auth check — e.g. "Unauthenticated visit to `/articles` redirects to `/login`."}
- [ ] {TODO: Any feature-specific acceptance criterion from the user stories.}
- [ ] Playwright E2E suite passes: `npm run e2e -- {TODO: spec file}`.
