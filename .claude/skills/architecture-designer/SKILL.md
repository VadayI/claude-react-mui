---
name: architecture-designer
description: Feature-sliced frontend architecture — layer boundaries, feature folder structure, store vs context vs query decisions, ADRs — activate for architecture or design decisions.
---

# Frontend Architecture

References: `@.claude/rules/architecture.md`, `@.claude/rules/component-contract.md`

## Layer boundaries (strict, top-to-bottom imports only)

```
pages/          — route-level containers; compose features; no direct API calls
features/       — self-contained feature slices (see below)
  <feature>/
    components/ — presentational UI for this feature
    hooks/      — feature-specific hooks (query wrappers, local logic)
    store/      — feature-scoped Zustand slice (if needed)
    api/        — query key factory + typed query/mutation hooks
    mappers/    — DTO → view-model
    index.ts    — public surface (re-exports only what pages need)
shared/
  components/   — truly reusable UI (Button wrappers, Layout, etc.)
  hooks/        — shared custom hooks
  store/        — global UI state (sidebar, notifications, auth)
  api/          — generated schema + base client
  theme/        — MUI theme
```

- Pages import from features; features do NOT import from other features (no horizontal coupling)
- Features import from shared; shared does NOT import from features
- Circular imports are a design smell — refactor to shared or extract a new feature

## Feature folder example

```
features/articles/
  components/
    ArticleCard.tsx
    ArticleList.tsx
  hooks/
    useArticles.ts        # wraps useQuery(articleKeys.list(filters))
    useCreateArticle.ts   # wraps useMutation + invalidation
  api/
    queryKeys.ts
  mappers/
    article.ts
  index.ts                # export { ArticleList } from './components/ArticleList'
```

## When to use what for state

| Scenario                                               | Solution                                                |
| ------------------------------------------------------ | ------------------------------------------------------- |
| Server data (fetched, async, stale)                    | TanStack Query — never Zustand                          |
| UI-only global state (sidebar, dialogs, notifications) | Zustand store in shared/store/                          |
| Feature-scoped ephemeral UI state                      | useState / useReducer in the component/hook             |
| Theme / i18n / auth user                               | React Context (changes infrequently; broad consumption) |
| Form state                                             | react-hook-form (local to the form component)           |

## Component contract (props as API)

- Props are the component's public API; treat them like a REST contract
- Document non-obvious props with JSDoc
- Prefer discriminated unions over boolean flags for variant props

```tsx
// Good: discriminated union
type ButtonProps =
  | { variant: 'primary'; loading?: boolean }
  | { variant: 'danger'; confirmLabel: string }

// Avoid: flag soup
type ButtonProps = {
  isPrimary?: boolean
  isDanger?: boolean
  hasConfirm?: boolean
  confirmLabel?: string
}
```

## ADRs — record architectural decisions

- Use `docs/decisions/NNNN-<slug>.md` for any decision that affects the whole codebase
- Decisions worth recording: state management library choice, auth strategy, folder structure changes, CSP approach, API client library
- ADR template: Context / Decision / Consequences

## File size limit (800 lines)

- Same rule as the Django backend: no source file over 800 lines
- A large component file = multiple responsibilities — split into feature folder
- CI gate: `scripts/check_file_size.sh`

<!-- last reviewed: 2026-06-02 -->
