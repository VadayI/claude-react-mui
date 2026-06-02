# Observability & runtime errors (no blank screens, no PII)

Tests prove the app is correct at build time; **observability** is how we know it stays correct in front of real users. This project requires that a runtime failure never becomes a blank white screen, that errors are **caught, announced, and recoverable**, and that what we log is **useful without leaking secrets or personal data**.

## Error boundaries (mandatory)

- A **top-level error boundary** wraps the app shell and renders an accessible fallback (a `role="alert"` message + a retry/reload affordance), never a blank page or a raw stack trace.
- **Route-level boundaries** isolate failures to the screen that broke (React Router `errorElement` per route / loader), so one feature crashing does not take down the whole app.
- Async/data errors are the component's **error state** (@.claude/rules/component-contract.md), not the boundary — boundaries catch *render* crashes; expected API errors (`ApiError`, @.claude/rules/api-error-and-pagination.md) are handled in the UI with a retry.
- The boundary reports the error to the logging sink (below) before showing the fallback.

## Logging & monitoring

- **One reporting client**, initialized in `src/lib/observability/`, wraps the chosen sink (e.g. Sentry) behind a thin interface so the vendor is swappable and tests don't hit the network. Errors, unhandled rejections, and boundary catches funnel through it.
- **Environment-gated & consented:** monitoring is enabled per env via `VITE_*` config (DSN/endpoint), off by default in dev/test, and respects the user's consent where required (no tracking before consent).
- **Source maps** are uploaded to the sink at build time (and not served publicly) so stack traces are readable without shipping readable code to users.
- **Release + environment tags** accompany every event so a regression can be traced to a deploy.

## No PII / no secrets in telemetry (hard rule)

- **Never log tokens, passwords, auth headers, cookies, or full request bodies.** Scrub `Authorization`, `Cookie`, and known sensitive fields in a `beforeSend` hook before anything leaves the browser (ties to @.claude/rules/auth-and-csrf.md — tokens never touch web storage *or* logs).
- **Never put PII in event messages or breadcrumbs** (emails, names, addresses). Log stable ids and error codes, not user content.
- Console noise is not telemetry — production builds strip debug `console.*`; real signal goes through the reporting client.

## Rules

- Every app has a top-level boundary + per-route boundaries; a crash shows an accessible, recoverable fallback.
- All error reporting goes through the one observability client; components never call the vendor SDK directly.
- Telemetry is consented, env-gated, and PII/secret-free; sensitive fields are scrubbed in `beforeSend`.
- Expected API errors are UI error-states with retry; only unexpected render crashes hit the boundary.

## Testing (mandatory)

The top-level and a route-level boundary each have a test that throws in a child and asserts the **accessible fallback** renders (queried by role, not class) and that the reporting client was invoked. The `beforeSend` scrubber has unit tests proving `Authorization`/`Cookie`/known-PII fields are stripped. `jest-axe` clean on the fallback.

## Binds these agents (rule is auto-loaded)

- `ui-architect` — declares the boundary placement (app shell + which routes get their own `errorElement`) and the fallback's a11y contract.
- `react-developer` — implements boundaries + the single observability client; wires the `beforeSend` scrubber; never calls the vendor SDK from components.
- `state-architect` — ensures expected `ApiError`s surface as UI error-states, not boundary crashes.
- `security-scanner` — blocks tokens/PII/secrets reaching telemetry, public source maps, and tracking before consent.
- `tester` — boundary-renders-fallback tests + scrubber unit tests + axe on the fallback.
- `reviewer` — flags blank-screen failure modes, direct vendor-SDK calls in components, and unscrubbed logging.

> Goal: a runtime failure is caught, announced accessibly, recoverable, and reported — with telemetry that helps debugging and never leaks a token or a user's data.
