# Verification Guide — Articles + Auth Guard

## Scope

- `/articles` — authenticated screen (protected by `RequireAuth`)
- `/login` — public login screen (redirects here from protected routes)

## Prerequisites

1. Install dependencies: `npm ci`
2. Start the dev server: `npm run dev` → `http://localhost:5173`
3. MSW is active in dev mode (see `src/mocks/browser.ts`) — no real backend needed.
4. The browser's dev-tools Application → Local Storage should show **no tokens** (tokens
   are in-memory only; a page refresh clears them — that is the intended behavior).
5. **Route-level loading (PR D):** `ArticlesPage` and `LoginPage` are lazy-loaded via `React.lazy`.
   On the **very first navigation** to `/articles` or `/login`, the browser must download the lazy
   chunk; during that moment `RouteFallback` renders (a `CircularProgress` with `role="status"` and
   `aria-label="Loading"`). This is distinct from the in-page "Loading articles" spinner; it appears
   before the screen component mounts. On repeat visits the chunk is cached — no fallback shown.

---

## Screen 1 — `/articles` (anonymous path)

### Manual steps

1. Open a fresh private/incognito window (no tokens in memory).
2. Navigate directly to `http://localhost:5173/articles`.

**Expected:** browser redirects immediately to `http://localhost:5173/login?next=%2Farticles`.
The login form is displayed. The `?next` param preserves the destination.

### Triggering the four states (guard path)

| State                                                                 | How to trigger                                      | Expected                                |
| --------------------------------------------------------------------- | --------------------------------------------------- | --------------------------------------- |
| Redirect                                                              | Navigate to `/articles` without a token (see above) | Redirected to `/login?next=%2Farticles` |
| (guarded — the remaining states only apply after login, see Screen 2) |                                                     |                                         |

### Keyboard pass (guard)

1. After redirect, focus lands on the first focusable element on `/login` (Email input).
2. Verify Tab order: Email → Password → Sign in button.
3. No keyboard trap; Escape does nothing unexpected.

---

## Screen 2 — `/articles` (authenticated path)

### Manual steps

1. From `/login?next=%2Farticles`, enter the MSW test credentials:
   - Email: `user@example.com`
   - Password: `password123`
2. Click **Sign in**.

**Expected:** form submits, MSW returns a `TokenPair`, tokens stored in `useAuthStore`,
browser navigates to `/articles`. The articles list renders (loading → success or empty state).

### Triggering the four states

| State   | How to trigger                                                                        | Expected                                                                             |
| ------- | ------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| Loading | Any slow-network condition or add a `delay` to the MSW `GET /api/v1/articles` handler | `CircularProgress` with `aria-label="Loading articles"` visible; `role="status"` box |
| Success | MSW returns articles (default dev handler)                                            | List of articles rendered; `AddArticleForm` visible                                  |
| Empty   | Modify MSW handler to return `{ count: 0, results: [] }`                              | Empty-state message in the article list                                              |
| Error   | Modify MSW handler to return `{ status: 500 }`                                        | MUI Alert with error message + Retry button                                          |

### Keyboard pass (articles)

1. After login redirect, Tab to the article list and through `AddArticleForm` fields.
2. Fill in Title and Body; press Enter or Tab to the Submit button and press Space/Enter.
3. Verify the new article appears in the list.
4. Focus should remain logical throughout; no keyboard traps.

---

## Screen 3 — `/login` (idle + error states)

### Manual steps — idle

1. Navigate to `http://localhost:5173/login` (anonymous).
2. Verify the form renders: Email field, Password field, Sign in button.

### Manual steps — validation errors

1. Click **Sign in** without filling in any fields.
2. **Expected:** inline validation errors appear on Email ("Required") and
   Password ("Required"). Submit button remains enabled.

### Manual steps — server error

1. Enter any invalid email/password combination (MSW returns 401 for unknown credentials).
2. Click **Sign in**.
3. **Expected:** the `role="alert"` region above the form announces an error message
   ("Invalid credentials." or similar). Fields remain editable for retry.
4. Submit again with invalid credentials — the alert re-announces (re-announcement
   works because the region is always mounted, only its text changes).

### Manual steps — already authenticated redirect

1. After a successful login, navigate back to `http://localhost:5173/login`.
2. **Expected:** immediate redirect to `/` (or the last `?next` destination).
   The login form is not shown.

### Keyboard pass (login)

1. Tab to Email → fill in → Tab to Password → fill in → Tab to Sign in → press Enter.
2. Verify focus moves to Email on page load (or the first field receives focus naturally).
3. On error: screen reader (or Accessibility pane) announces the error in the alert region.

---

## Done When

- [ ] Navigating to `/articles` without a token redirects to `/login?next=%2Farticles`.
- [ ] Logging in with valid MSW credentials navigates back to `/articles`.
- [ ] All four UI states (loading / success / empty / error) visible on `/articles`.
- [ ] Login form validation errors appear inline on empty submit.
- [ ] Server error announced via `role="alert"` region; re-announced on repeat submit.
- [ ] Already-authenticated visit to `/login` redirects away immediately.
- [ ] Keyboard-only operation works end-to-end (Tab, Enter, Space).
- [ ] `axe` reports no violations (run in browser devtools or via `@axe-core/playwright`).
- [ ] Playwright E2E green:
  ```bash
  npm run e2e -- e2e/auth.spec.ts
  ```
