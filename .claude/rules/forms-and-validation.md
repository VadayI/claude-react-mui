# Forms & validation (schema-first, accessible, enforced)

Forms are where most UX and accessibility bugs live, and where the frontend meets the backend's validation contract. This project keeps validation in **one schema per form**, renders errors **accessibly and associated to their field**, and maps the backend's **400 field errors** back onto the right inputs — never a toast, never scattered `onChange` checks. This is the companion to @.claude/rules/component-contract.md (the *Forms & validation* clause) and @.claude/rules/api-error-and-pagination.md (where field errors come from).

## The stack — react-hook-form + Zod

- Forms use **react-hook-form** (RHF) for state/submission and **Zod** for the schema, wired with `@hookform/resolvers/zod`. Inputs are **controlled** through RHF (`register` / `Controller` for MUI fields); controlled-vs-uncontrolled is a deliberate decision, not an accident (@.claude/rules/component-contract.md).
- The Zod schema is the **single source of validation truth**, colocated with the form at `src/features/<feature>/components/<Form>.schema.ts`. It is **unit-tested** (valid input passes; each invalid case produces the expected issue) so validation is provable in isolation.
- Type the form values from the schema (`z.infer<typeof schema>`) — never hand-maintain a parallel `FormValues` type.

## Accessible errors (mandatory)

- Every field has a programmatic label (visible `<label>` / MUI `label`), and on error sets `aria-invalid` and links the message via `aria-describedby` (MUI `TextField` does this when given `error` + `helperText`). An error the user can see but assistive tech can't is a defect.
- **Required is not conveyed by color or `*` alone** — pair it with text and the accessible name (@.claude/rules/accessibility.md).
- The first invalid field receives focus on a failed submit (RHF `shouldFocusError`), and the error summary (if any) is an announced region (`role="alert"`).
- Submit affordance reflects validity/in-flight state: disabled + `aria-busy` while submitting; do not leave the user guessing whether the click registered.

## Server (400) errors map onto fields

- A backend **400** carries `fieldErrors` (normalized once by the API client into `ApiError`, @.claude/rules/api-error-and-pagination.md). The submit handler routes each field error to RHF via `setError(field, …)`, and any non-field error to a form-level `role="alert"` region. **Field errors are never shown as a toast** and never swallowed.
- Field-name mapping (DRF snake_case ↔ form camelCase) lives in the feature's mapper next to the form, not inline in the component.

## Rules

- One Zod schema per form, colocated and unit-tested; values typed via `z.infer`.
- Validation lives in the schema, not in `onChange`/`onBlur` handlers.
- Errors are visible **and** associated (`aria-describedby` + `aria-invalid`); required state is not color-only.
- Server 400s map back to fields via `setError`; non-field errors go to an announced form-level region.
- Components depend on view models and the typed client — a form never calls `fetch` directly (@.claude/rules/api-client.md, @.claude/rules/state-management.md).

## Testing (mandatory)

Per form: schema unit tests (valid / each invalid case); RTL tests that submit invalid input and assert the **visible, associated** error (queried by role/label, not class); a successful submit asserting the mutation fires with the **correct payload**; a server-400 case asserting the error lands on the right field; `jest-axe` clean; at least one keyboard-only pass (tab order, submit via Enter). Triangulate so a hardcoded "valid" path can't stay green (@.claude/rules/tdd.md, @.claude/rules/no-stubs.md).

## Binds these agents (rule is auto-loaded)

- `ui-architect` — the form contract is incomplete until its schema, fields, required/optional, and error placement (where each message renders) are declared.
- `react-developer` — implements with RHF + Zod resolver and MUI `error`/`helperText`; wires `setError` for 400s; never validates in ad-hoc handlers.
- `state-architect` — owns the mutation hook and how its `ApiError` field errors reach the form.
- `tester` — schema unit tests + RTL invalid/valid/server-400 + axe + keyboard pass.
- `reviewer` — blocks toasted field errors, color-only required state, validation scattered outside the schema, and unassociated error text.

> Goal: every form validates from one tested schema, surfaces errors accessibly on the right field, and speaks the backend's 400 contract — never a toast, never a stray handler check.
