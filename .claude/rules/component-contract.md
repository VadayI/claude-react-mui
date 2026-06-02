# Component & route contract (the UI equivalent of the API contract)

In a DRF backend the contract is the endpoint (method, path, body, codes, permissions). In this frontend the contract is the **component and route surface**: what a screen renders, the props each component accepts, the states it must handle, and the routes/guards that reach it. Validation lives in **forms/schemas**, authorization lives in **route guards**, and presentation is driven by the **central MUI theme** — components stay focused on rendering.

## The four states are mandatory

Any component that fetches or mutates data MUST design and test all four states up front:

1. **Loading** — skeletons or a spinner with an accessible label (`role="status"` / `aria-busy`), never a blank flash.
2. **Success (with data)** — the happy path, plus the **large/edge** variant (long text, many rows, pagination).
3. **Empty** — a deliberate empty state with guidance, not a zero-height void.
4. **Error** — a user-readable error with a retry affordance; technical detail goes to the console/log, not the UI.

A feature is not "done" until all four are implemented and tested.

## Props contract

- **Typed props, no `any`.** Props interfaces are explicit; optional props have sane defaults. Booleans read positively (`disabled`, not `notEnabled`).
- **Controlled vs uncontrolled is a decision, not an accident.** Inputs are controlled when their value is owned by state/form; document which.
- **No prop drilling past 2 levels** — lift to context, a store, or composition (children/slots) instead.
- **Presentational vs container split:** presentational components take data via props and emit events via callbacks (easy to test in isolation); containers wire data (hooks/queries) and pass it down.
- **Never expose secrets or tokens through props** or render them into the DOM.

## Forms & validation

- Validation lives in a **schema** (e.g. Zod) colocated with the form, not scattered in `onChange` handlers — the schema is the single source of validation truth and is unit-tested.
- Invalid input → a **visible, associated** error message (`aria-describedby`), and the submit affordance reflects validity.
- Server-side validation errors (400 from the API) are mapped back onto the right fields, not dumped as a toast.

## Route guards (authorization)

- Authorization is separate, testable guard components / loaders in `src/app/guards/` — not `if (user) return ...` sprinkled in pages.
- Anonymous hitting a protected route → redirect to login (preserving the intended destination). Authenticated-but-forbidden → a 403 screen, not a blank page.
- Guards are tested for both the allowed and denied paths (the IDOR-equivalent: user A must not see user B's protected screen/data).

## MUI theming (no magic values)

- Colors, spacing, typography, breakpoints come from the **central theme** (`src/theme/`), accessed via `theme`/`sx`/styled — never hardcoded hex or pixel literals in components.
- Spacing uses the theme scale (`theme.spacing(n)` / `sx={{ p: 2 }}`), not raw `px`.
- Component-level style overrides go through `styleOverrides`/`sx`, and shared variants through the theme's `components` slot — so restyling is centralized.
- Dark mode / density / RTL are theme concerns; components must not assume a single mode.

## Rules

- Every screen declares its route, its guard (if any), and its four states.
- Loading/error/empty are first-class, not afterthoughts.
- Components depend on **view models** (mapped) not raw API DTOs (@.claude/rules/api-client.md).
- Accessibility attributes are part of the contract, not a later pass (@.claude/rules/accessibility.md).

## Testing (mandatory)

Per component: render in each of the four states; assert by role/label; drive interaction with `user-event`; assert the mutation/callback fires with the right payload; `jest-axe` clean. Per route: allowed and denied guard paths. See @.claude/rules/testing.md.
