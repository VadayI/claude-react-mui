# Feature: {FEATURE_NAME}

> Per-feature README. Kept in sync with the feature's code by `docs-writer` in the same PR as any public-surface change. The CI gate (`scripts/check_feature_readmes.sh`) enforces that every directory under `src/features/` has a non-empty `README.md`.

## Purpose

{TODO: One paragraph — what this feature owns in the domain, what it does NOT own (boundaries with other features).}

## Routes

| Path | Component (page) | Auth required | Notes |
|---|---|---|---|
| `{TODO}` | `{TODO}` | {TODO: yes/no/role} | |

## Components

### Container components (connected to query/store)

| Component | Responsibility |
|---|---|
| `{TODO}` | {TODO} |

### Presentational components (props-only)

| Component | Responsibility |
|---|---|
| `{TODO}` | {TODO} |

## Hooks & state

### TanStack Query — query keys and invalidation

```ts
// {TODO: example query key factory for this feature}
export const {featureName}Keys = {
  all: ['{featureName}'] as const,
  list: (filters?: unknown) => [{featureName}Keys.all[0], 'list', filters] as const,
  detail: (id: string | number) => [{featureName}Keys.all[0], 'detail', id] as const,
};
```

Invalidation triggers:
- {TODO: e.g. After POST /api/v1/resource/ → invalidate `{featureName}Keys.list()`}

### Zustand store (client state only)

{TODO: Describe any slices from the global store this feature reads or writes. If none, write "No client state beyond server cache."}

## Consumed endpoints

The canonical contract is `src/lib/api/openapi.yml`. This table is the human index.

| Method | Path | Purpose | Auth | Key statuses |
|---|---|---|---|---|
| {TODO} | {TODO} | {TODO} | {TODO} | {TODO} |

## UI states

| State | How triggered | How handled |
|---|---|---|
| Loading | Query `isLoading` | Skeleton / spinner |
| Empty | Query returns `[]` or `null` | Empty-state illustration + CTA |
| Error | Query `isError` | Error boundary or inline error message |
| Success | Query `data` populated | Normal render |

{TODO: Add feature-specific states (e.g. optimistic update pending, form submitting).}

## Accessibility notes

{TODO: Specific a11y requirements for this feature — ARIA roles used, keyboard navigation map, focus management on modal/drawer open/close, color-contrast exceptions if any.}

- WCAG target: {TODO: AA / AAA}
- Keyboard navigation: {TODO}
- Screen reader tested with: {TODO: e.g. NVDA + Chrome, VoiceOver + Safari}

## Cross-feature dependencies

{TODO: Which other features does this one read state from or navigate to, and why?}

| Depends on | Why |
|---|---|
| `{TODO}` | {TODO} |

## Decisions

Links to ADRs in `docs/decisions/` that affect this feature.

- {TODO: e.g. [ADR-0003 — optimistic updates strategy](../../docs/decisions/0003-optimistic-updates.md)}
