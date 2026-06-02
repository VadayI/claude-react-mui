# Verify: todos

## Scope

Route `/todos` → `TodosPage` (list + create todos).

## Prerequisites

- `npm run dev` → app at `http://localhost:5173`.
- The starter uses the dev API at `VITE_API_BASE_URL`; for deterministic local checks the MSW worker / Playwright route stubbing supplies the responses.

## Per screen

### `/todos` → TodosPage

- **Manual step:** navigate to `/todos`. You should see the page heading and, after a brief loading indicator, the list of todos plus the "New todo" field and **Add** button.
- **The four states:**
  - *Loading* — on first load a `role="status"` indicator appears before the list.
  - *Success* — todos render as an accessible list; each row has a checkbox.
  - *Empty* — when the API returns `[]`, a friendly empty message renders (not a blank area). Trigger via the empty MSW scenario.
  - *Error* — when the API returns 500, an error message + **Retry** button render. Trigger via the error MSW scenario.
- **Keyboard pass:** Tab to the field, type a title, Tab to **Add** (disabled while empty), press Enter to submit; Tab through rows and press Space to toggle a checkbox. Focus is always visible.
- **Playwright:** `npm run e2e -- todos.spec.ts`

## Done when

- [ ] Success renders the list.
- [ ] Loading, empty, and error states each verified.
- [ ] Keyboard-only add + toggle works; focus visible.
- [ ] `jest-axe` / axe clean.
- [ ] `npm run e2e -- todos.spec.ts` green.
