# 0024. Upgrade React 18.3 → 19

Status: accepted · 2026-06-16

## Context

Part of the staged stack upgrade (plan `docs/plans/0004-stack-upgrade-latest-versions.md`, PR B). ADR 0015 pinned React at 18.3 "until MUI fully tracks React 19". MUI 6 (≥5.18 / current MUI 6.x series) in fact supports React 19 as a peer — the incompatibility concern that drove the 18.3 pin no longer applies. React 19 is therefore adopted now, while MUI stays at 6 (MUI 9 is deferred to PR C, ADR TBD). The `@testing-library/react` 16.x series declares `react@18||19` as a peer and is the correct companion for React 19.

## Decision

Upgrade the React ecosystem in a coordinated patch:

- **`react` and `react-dom`** `^18.3.x` → `^19.2.6` (locked together; never split).
- **`@types/react`** `^18` → `^19`; **`@types/react-dom`** `^18` → `^19`.
- **`@testing-library/react`** `^14.x` → `^16.3.2` (the React 18‖19 peer-compatible release; `@testing-library/dom ^10` was already present from PR A).

Codemods (`types-react-codemod preset-19`, `react/19` migration recipe) were run — the codebase was already React-19-clean (0 source-file changes required). One test fix applied: `RequireAuth.test.tsx` — Zustand store mutations inside test callbacks wrapped in `act()` to satisfy React 19's stricter act() enforcement.

MUI stays at 6; React Router stays at 6. Those are deferred to PRs C and D respectively.

## Consequences

- **React 19 is the new baseline.** The React-18.3 pin portion of ADR 0015 is superseded by this ADR. The MUI 6 pin of ADR 0015 is unchanged.
- `react`, `react-dom`, `@types/react`, `@types/react-dom`, `@testing-library/react` are all on React-19-compatible releases.
- **Bundle initial-JS gzip budget raised 180 → 188 KB** (React 19 runtime is ~3.5 KB gz heavier than 18.3; route code-splitting is a separate performance task deferred post-upgrade).
- React 19 APIs (`use()`, `useActionState`, `useFormStatus`, `useOptimistic`, `<form action>`, ref-as-prop) are now available without a gate; see `.claude/skills/react-specialist/SKILL.md`.
- Tests: 82/82 green after the act() fix.

Supersedes: the React-18.3 pin portion of ADR 0015 (React 18.3 → 19). ADR 0015 itself remains on disk and immutable — its other stack decisions (MUI, Router, TanStack Query, Zustand) are unaffected by this ADR.

Relates to: ADR 0015 (stack pin — partially superseded), ADR 0023 (tooling layer this builds on), `.claude/rules/performance-budgets.md` (budget raised here).
