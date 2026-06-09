# Verification Guide — Auth (Login + RequireAuth Guard)

## Scope

- `/login` — public login screen (idle, submitting, error, already-authenticated-redirect states)
- `/articles` — authenticated screen; anonymous access redirects to `/login?next=%2Farticles`

---

## Prerequisites

1. Install dependencies: `npm ci`
2. Start the dev server: `npm run dev` → `http://localhost:5173`
3. MSW is active in dev mode (`src/mocks/browser.ts`) — no real backend is needed.
4. Confirm that the browser's DevTools → Application → Local Storage shows **no tokens**
   (tokens are held in-memory only; a page refresh clears them — that is the intended behavior).
5. MSW test credentials (handled by the default dev MSW handler):
   - Email: `user@example.com`
   - Password: `password123`

---

## Screen 1 — `/login` (idle state)

### Manual step

1. Open a fresh private/incognito window (no tokens in memory).
2. Navigate to `http://localhost:5173/login`.

**Expected:** The login form renders with:

- An **Email** text field (labelled "Email").
- A **Password** text field (labelled "Password").
- A **Sign in** submit button (enabled).
- No error alert visible (the `role="alert"` region is present in the DOM but empty).

### The four states

| State               | How to trigger                                                                                        | Expected                                                                                                                |
| ------------------- | ----------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| **Idle**            | Navigate to `/login` anonymously (see above)                                                          | Form rendered; all fields enabled; Sign in button active; no alert text                                                 |
| **Submitting**      | Fill in credentials and click **Sign in** (observe before MSW responds)                               | Sign in button shows `disabled` + `aria-busy="true"`; fields remain editable                                            |
| **Error**           | Enter any unrecognised email/password (MSW returns 401 for unknown credentials) and click **Sign in** | `role="alert"` region announces the error message ("Invalid credentials." or similar); form stays interactive for retry |
| **Redirect (auth)** | After a successful login, navigate back to `http://localhost:5173/login`                              | Immediate redirect to `/` (or the last `?next` destination); login form is NOT shown                                    |

### Keyboard pass — login form

1. Tab to the **Email** field (should be the first focusable element on page load).
2. Type a valid email address.
3. Tab → **Password** field. Type a valid password.
4. Tab → **Sign in** button. Press **Enter** (or **Space**).
5. **Expected:** form submits; MSW returns tokens; browser navigates to `/` (or `?next` destination).
6. Verify the focus ring is visible on each field/button as you Tab through.
7. Verify no keyboard trap exists.

### Playwright

```bash
npm run e2e -- e2e/auth.spec.ts
```

---

## Screen 2 — `/articles` (anonymous → redirect path)

### Manual step

1. Open a fresh private/incognito window (no tokens in memory).
2. Navigate directly to `http://localhost:5173/articles`.

**Expected:** the browser redirects immediately to `http://localhost:5173/login?next=%2Farticles`.
The login form is displayed. The `?next` param preserves the intended destination.

### State (guard redirect)

| State        | How to trigger                          | Expected                                                  |
| ------------ | --------------------------------------- | --------------------------------------------------------- |
| **Redirect** | Navigate to `/articles` without a token | Redirected to `/login?next=%2Farticles`; login form shown |

> The remaining four states for `/articles` (loading/success/empty/error) are covered by
> `docs/verify/articles.md`. This guide focuses on the auth redirect entry-point.

### Keyboard pass — guard redirect

1. After redirect to `/login`, verify focus lands on (or Tab reaches) the **Email** field first.
2. Tab order: Email → Password → Sign in button.
3. No keyboard trap; Escape does nothing unexpected.

### Playwright

```bash
npm run e2e -- e2e/auth.spec.ts
```

---

## Screen 3 — `/articles` (authenticated path via login flow)

### Manual step

1. From `http://localhost:5173/login?next=%2Farticles`, enter the MSW test credentials:
   - Email: `user@example.com`
   - Password: `password123`
2. Click **Sign in**.

**Expected:** MSW returns a `TokenPair`; tokens stored in `useAuthStore` (in-memory);
browser navigates to `/articles`. The articles list renders (loading → success or empty state).

### Keyboard pass — full round-trip

1. Navigate to `/articles` anonymously → redirected to `/login?next=%2Farticles`.
2. Tab to Email → fill → Tab to Password → fill → Tab to Sign in → press **Enter**.
3. Verify browser navigates to `/articles` after login.
4. Verify focus is logical on the `/articles` page (no focus lost/trapped).

### Playwright

```bash
npm run e2e -- e2e/auth.spec.ts
```

---

## Done When

- [ ] Navigating to `/articles` without a token redirects to `/login?next=%2Farticles`.
- [ ] Logging in with valid MSW credentials (`user@example.com` / `password123`) navigates back to `/articles`.
- [ ] Login form idle state: Email + Password fields + Sign in button rendered, no error shown.
- [ ] Login form submitting state: Sign in button `disabled` + `aria-busy` while in-flight.
- [ ] Login form error state: `role="alert"` region announces error message on invalid credentials; re-announced on repeat submit.
- [ ] Already-authenticated visit to `/login` redirects away immediately (no form shown).
- [ ] Keyboard-only operation works end-to-end (Tab, Enter/Space, visible focus ring).
- [ ] `axe` reports no violations — check in browser DevTools (Accessibility pane) or run:
  ```bash
  npm run e2e -- e2e/auth.spec.ts
  ```
  (the spec includes an `@axe-core/playwright` assertion on `/login`).
- [ ] Playwright E2E green:
  ```bash
  npm run e2e -- e2e/auth.spec.ts
  ```
