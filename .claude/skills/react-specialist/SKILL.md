---
name: react-specialist
description: Modern React 19 patterns — function components, hooks, composition, Suspense, effects — activate when implementing React components or custom hooks.
---

# React 19 Patterns

## Core principles

- Function components only; no class components
- Composition over inheritance — small, focused components composed together
- Presentational / container (smart / dumb) split: presentational receives props and renders, container fetches data and manages state
- Lift state to the lowest common ancestor; pass callbacks down
- One responsibility per component/hook

## Hooks done right

```tsx
// Good: derive state instead of syncing with useEffect
function UserLabel({ user }: { user: User }) {
  const displayName = user.nickname ?? user.email // derived, no effect
  return <span>{displayName}</span>
}

// Bad: unnecessary sync
useEffect(() => {
  setDisplayName(user.nickname ?? user.email)
}, [user])
```

**When NOT to useEffect:**

- Deriving state from props → compute during render
- Responding to a user event → put logic in the handler
- Transforming data for rendering → memo or inline compute
- Fetching data → use TanStack Query (see `tanstack-query-design`)

**Legitimate useEffect uses:** subscriptions to external systems, DOM measurements, third-party library sync.

## Controlled inputs

```tsx
function SearchBox({ onSearch }: { onSearch: (q: string) => void }) {
  const [query, setQuery] = useState('')
  return (
    <input
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      onKeyDown={(e) => e.key === 'Enter' && onSearch(query)}
      aria-label="Search"
    />
  )
}
```

## Suspense + Error Boundaries

```tsx
// Wrap async subtrees; keep boundaries coarse (route level or section level)
<ErrorBoundary fallback={<ErrorMessage />}>
  <Suspense fallback={<Skeleton />}>
    <ArticleList />
  </Suspense>
</ErrorBoundary>
```

- Suspense for data is driven by the data layer (TanStack Query's `useSuspenseQuery`); `use(promise)` auto-suspends (React 19, ADR 0024)
- Always pair `<Suspense>` with an `<ErrorBoundary>`

## Refs

- `useRef` for DOM access or stable mutable values that must not trigger re-renders
- Never read refs during render (snapshot timing is undefined)

## Keys

- Use stable, unique domain IDs as keys, not array indices
- Wrong key = lost component state and degraded diffing

## Custom hooks

- Extract repeated stateful logic into `use<Name>` hooks
- Return an object (named values) not a tuple when returning 3+ values
- Hooks compose; keep them single-purpose

## React 19 additions

React 19 is the current baseline (ADR 0024). The following APIs are available now:

- **`use(promise)`** — read a promise or context inside render; auto-suspends; replaces most `useEffect`-based async patterns
- **`useActionState`** — manage form/action state (pending, result, error) tied to an async action function
- **`useFormStatus`** — read the pending state of the nearest parent `<form>` submission; use inside form child components
- **`useOptimistic`** — apply an optimistic update during an async transition, auto-reverts on error (prefer over manual state tricks)
- **`<form action>`** — pass an async function directly as the `action` prop; React manages the pending/error lifecycle
- **Ref as prop** — function components can now accept `ref` as a regular prop (no `forwardRef` wrapper needed in most cases)
- **`React.FC` no longer includes implicit `children`** — declare `children: React.ReactNode` explicitly when needed
- **`useEffectEvent`** (19.2) — stable callback identity without stale-closure bugs; replaces `useCallback` + ref tricks for event handlers
- **`<Activity>`** (19.2) — keep a subtree mounted but hidden/deferred; useful for preloading background routes

<!-- last reviewed: 2026-06-16 -->
