---
model: sonnet
---
Deep WCAG 2.1 AA accessibility audit over the current feature/flow via `a11y-auditor`. Goes beyond the per-component `jest-axe` checks `tester` runs: keyboard-only navigation, screen-reader announcements, focus management, color contrast, and reduced motion. Takes an optional scope (a route, feature folder, or flow name) as `$ARGUMENTS`.

## Log
```bash
node scripts/log-cmd.mjs /a11y-audit "$ARGUMENTS"
```

## Steps

### 1. Determine scope
If `$ARGUMENTS` names a route, feature folder, or flow, scope the audit to it. Otherwise audit the feature on the current branch (infer from `git diff main --name-only`).

### 2. Gather context
- `.claude/memory/routes.json` — routes, guards, and the four states for the screens in scope.
- The component tree and interactive controls in the scoped feature.
- The a11y contract from `@.claude/rules/accessibility.md`.

### 3. Dispatch a11y-auditor
Delegate to `a11y-auditor` with the gathered context. Audit dimensions:
- **Keyboard**: every action reachable and operable with Tab/Shift-Tab/Enter/Space/Escape/Arrows; logical focus order; no traps; visible `:focus-visible`.
- **Names, roles, values**: every control has an accessible name; semantic elements/roles; icon-only buttons have `aria-label`.
- **Focus management**: dialogs/menus/drawers trap focus and restore on close; route changes move focus to the main heading/announced region.
- **Live regions**: async results, toasts, and validation errors announced (`role="status"`/`role="alert"`/`aria-live`); loading sets `aria-busy`.
- **Contrast & motion**: text/icon contrast ≥ 4.5:1 (3:1 large); meaning never by color alone; `prefers-reduced-motion` respected; layout survives 200% zoom / 320px.

### 4. Report
Print a prioritized findings list:
- 🔴 Blocks a core flow (e.g. a primary action unreachable by keyboard) — must fix before PR.
- 🟡 Important WCAG AA gap (missing label, unassociated error, contrast under threshold).
- 🟢 Enhancement (focus order polish, redundant announcements).

This is an audit. Fixes go through the feature pipeline (`react-developer` under `tester`'s failing a11y tests). For routine pre-PR review, `a11y-auditor` also runs as part of `/review-pr`.

<!-- last reviewed: 2026-06-05 -->
