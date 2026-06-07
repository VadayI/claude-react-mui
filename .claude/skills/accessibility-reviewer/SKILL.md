---
name: accessibility-reviewer
description: WCAG 2.1 AA practical checklist — keyboard, ARIA, focus management, live regions, jest-axe, eslint-plugin-jsx-a11y — activate for a11y review or audit.
---

# Accessibility (WCAG 2.1 AA)

Reference: `@.claude/rules/accessibility.md`

## Keyboard operability

- Every interactive element reachable and operable via Tab / Shift+Tab / Enter / Space / arrow keys
- No keyboard traps (unless intentional modal — see focus management)
- Visible focus indicator — never `outline: none` without a replacement
- Logical tab order follows visual order; use `tabIndex={0}` sparingly, never positive values

## Names, roles, and values

- Every interactive element has an accessible name: visible label, `aria-label`, or `aria-labelledby`
- Use semantic HTML first (`<button>`, `<nav>`, `<main>`, `<header>`); ARIA only when HTML falls short
- Icons without visible text need `aria-label` or `aria-hidden` + a visually-hidden sibling

```tsx
// Button with icon only
<IconButton aria-label="Delete article">
  <DeleteIcon aria-hidden />
</IconButton>
```

## Focus management

- **Dialogs:** on open, move focus to first focusable element; trap focus inside; on close, return focus to trigger
- **Route changes:** move focus to the page `<h1>` or a skip-nav target after navigation
- **Toast/alerts:** use `role="status"` (polite) or `role="alert"` (assertive) — screen reader announces without focus move

```tsx
// MUI Dialog handles focus trap automatically; verify with axe
<Dialog open={open} aria-labelledby="dialog-title">
  <DialogTitle id="dialog-title">Confirm Delete</DialogTitle>
  ...
</Dialog>
```

## Live regions

```tsx
// Announce async results without focus move
<div role="status" aria-live="polite" aria-atomic>
  {isSuccess && 'Article saved'}
</div>
```

## Labelled forms with error association

```tsx
<TextField
  id="email"
  label="Email address"
  error={!!errors.email}
  helperText={errors.email?.message}
  inputProps={{ 'aria-describedby': errors.email ? 'email-error' : undefined }}
/>
// MUI TextField wires label ↔ input automatically; helperText gets aria-describedby via FormHelperText
```

## Contrast & visual

- Text contrast ≥ 4.5:1 (normal) / 3:1 (large, 18px+)
- UI component contrast ≥ 3:1 against adjacent colours
- Never convey information by colour alone; pair with icon or text

## Images

- Informative images: `alt="descriptive text"`
- Decorative images: `alt=""` (empty, not omitted)
- Complex images (charts): provide a text alternative or `aria-describedby`

## Motion

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

## Zoom

- Page must be usable at 200% zoom without horizontal scroll (reflow)
- Use relative units (`rem`, `em`, `%`) not `px` for text sizes

## Tooling

- **jest-axe:** run `expect(await axe(container)).toHaveNoViolations()` in every component test
- **eslint-plugin-jsx-a11y:** enable all recommended rules; fix before committing
- **@axe-core/playwright:** run on every E2E happy path (see `playwright-e2e` skill)
- **Manual checks:** keyboard-only navigation, macOS VoiceOver, Windows Narrator spot check

<!-- last reviewed: 2026-06-02 -->
