# Accessibility (mandatory, enforced)

Accessibility (a11y) is a **hard requirement** in this project, on the same footing as tests passing. A feature that is not operable by keyboard and not understandable to assistive technology is **not done**, regardless of how it looks. MUI gives accessible primitives for free — the job is to not break them and to wire labels/roles correctly.

## Baseline: WCAG 2.1 AA

Every interactive feature must meet WCAG 2.1 AA. In practice:

1. **Keyboard operable** — every action reachable and performable with Tab/Shift-Tab/Enter/Space/Escape/Arrows. No keyboard traps. Logical focus order. Visible focus ring (do not remove `:focus-visible`).
2. **Names, roles, values** — every control has an accessible name (visible `<label>`, `aria-label`, or `aria-labelledby`). Use semantic elements/roles (a button is a `<button>`, not a clickable `<div>`). MUI components already expose roles — pass the labels.
3. **Focus management** — dialogs/menus/drawers trap focus while open and restore it on close (MUI handles this — don't fight it). Route changes move focus to the main heading or an announced region.
4. **Live regions** — async results, toasts, and validation errors are announced (`role="status"`/`role="alert"`/`aria-live`). Loading states set `aria-busy`.
5. **Forms** — inputs are labelled and errors are associated via `aria-describedby`; required fields are marked accessibly, not by color alone.
6. **Color & contrast** — text/icon contrast ≥ 4.5:1 (3:1 for large text); never convey meaning by color alone (pair with text/icon). Driven by the theme palette, checked in design.
7. **Images & icons** — meaningful images have `alt`; decorative ones have empty `alt`/`aria-hidden`. Icon-only buttons have an `aria-label`.
8. **Motion & zoom** — respect `prefers-reduced-motion`; layout survives 200% zoom and 320px width.

## Enforcement

- **Lint:** `eslint-plugin-jsx-a11y` (recommended ruleset) runs in `npm run lint` and CI — catches missing alt, label-less controls, bad roles, etc.
- **Unit/component:** every component test asserts `expect(await axe(container)).toHaveNoViolations()` via `jest-axe`. Key interactions are exercised **keyboard-only** with `user-event` (`tab()`, `keyboard()`).
- **E2E:** Playwright journeys run `@axe-core/playwright` on the main screens and include at least one keyboard-only path.
- **Quality Gate:** `reviewer` flags any new interactive element without a name/role; `a11y-auditor` does a deeper WCAG pass for interaction-heavy features. An inaccessible control is 🟡 Important at minimum, 🔴 if it blocks a core flow.

## Binds these agents (rule is auto-loaded)

- `ui-architect` — a component contract is incomplete until its a11y requirements (roles, labels, focus, live regions) are stated.
- `react-developer` — implements with semantic elements/MUI roles and labels; runs `jest-axe` and the lint a11y rules locally.
- `tester` — every component test includes an axe assertion and at least one keyboard interaction; E2E includes an axe + keyboard path.
- `a11y-auditor` — deep WCAG audit on demand or for complex features.
- `reviewer` — blocks PRs that introduce inaccessible controls.

> Goal: the app is fully usable by keyboard and assistive technology at every commit — accessibility is designed in, tested, and gated, never bolted on.
