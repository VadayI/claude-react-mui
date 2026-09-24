# Seed translation verification

Scope: `/`, `/login`, `/articles`; URLs, payloads and authentication remain unchanged.
Run `npm run dev` with an explicitly configured test backend, or run
`npm run e2e` (starts its own MSW-enabled dev server).

- `/`: Welcome heading and Open Articles link navigate to protected articles.
- Anonymous `/articles`: redirects to login; sign in returns to articles.
- Login: empty submission shows Required beside both fields; invalid email is associated
  with its input. Submit valid credentials using Tab/Enter; errors remain in the alert.
- Articles: title/body/Add Article labels, loading status, empty state, retry and list
  accessible names come from resources. Existing MSW scenarios cover loading/error/empty.
- Locale checks: `npm run test:run -- src/test/i18n.test.tsx` renders English/Ukrainian,
  checks translated names and validation, plural 0/1/2/5, Intl locale formatting and axe.
  A language-picker UI is not provided; the app defaults to English.
- Browser journeys: `npm run e2e -- e2e/auth.spec.ts e2e/articles.spec.ts`.

Done when: both locale fixtures, login/return/add journeys, keyboard submission and
axe checks pass. No real backend deployment is claimed by these mock-based tests.
