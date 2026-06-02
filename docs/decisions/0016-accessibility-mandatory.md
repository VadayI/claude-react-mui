# 0016. Accessibility (WCAG 2.1 AA) is mandatory and gated

Status: accepted · 2026-06-02

## Context

Accessibility is usually bolted on late and regresses silently. MUI gives accessible primitives for free; the risk is breaking them.

## Decision

WCAG 2.1 AA is a hard requirement on par with passing tests. Enforced by `eslint-plugin-jsx-a11y` (lint), `jest-axe` on every interactive component test + at least one keyboard-only interaction, and `@axe-core/playwright` on main E2E journeys. The Quality Gate (`reviewer`, `a11y-auditor`) blocks inaccessible controls.

## Consequences

- A feature that isn't keyboard- and AT-operable is not "done".
- Accessibility requirements are part of the component contract, designed up front.
