---
name: tanstack-query-design
description: TanStack Query 5 patterns — query-key factories, mutations, invalidation, optimistic updates, QueryClient defaults — activate for any data fetching work.
---

# TanStack Query 5

References: `@.claude/rules/state-management.md`, `@.claude/rules/api-client.md`

## Core principle: server state vs client state

- Query = **server state** (remote, async, may be stale): articles, users, comments
- Zustand = **client state** (UI-only, synchronous): sidebar open, selected tab, draft form values
- Never put server data in Zustand; never put UI-only state in Query cache

## Query key factories — centralise, never inline

```ts
// src/api/queryKeys.ts
export const articleKeys = {
  all: () => ['articles'] as const,
  lists: () => [...articleKeys.all(), 'list'] as const,
  list: (filters: Filters) => [...articleKeys.lists(), filters] as const,
  detail: (id: string) => [...articleKeys.all(), 'detail', id] as const,
}
```

## Query hooks

```ts
// src/hooks/useArticles.ts
export function useArticles(filters: Filters) {
  return useQuery({
    queryKey: articleKeys.list(filters),
    queryFn: () => apiClient.GET('/api/v1/articles', { params: { query: filters } }),
    staleTime: 30_000,
  })
}
```

## Mutation + narrowest invalidation

```ts
export function useCreateArticle() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: NewArticle) => apiClient.POST('/api/v1/articles', { body }),
    onSuccess: () => qc.invalidateQueries({ queryKey: articleKeys.lists() }), // lists only, not details
  })
}
```

## Optimistic updates with rollback

```ts
useMutation({
  mutationFn: (patch: Partial<Article>) =>
    apiClient.PATCH(`/api/v1/articles/${patch.id}`, { body: patch }),
  onMutate: async (patch) => {
    await qc.cancelQueries({ queryKey: articleKeys.detail(patch.id) })
    const previous = qc.getQueryData(articleKeys.detail(patch.id))
    qc.setQueryData(articleKeys.detail(patch.id), (old: Article) => ({ ...old, ...patch }))
    return { previous }
  },
  onError: (_err, patch, ctx) => qc.setQueryData(articleKeys.detail(patch.id), ctx?.previous),
  onSettled: (_data, _err, patch) =>
    qc.invalidateQueries({ queryKey: articleKeys.detail(patch.id) }),
})
```

## QueryClient defaults

```ts
// src/main.tsx
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      retry: 1,
      refetchOnWindowFocus: true,
    },
  },
})
```

## Suspense option

```tsx
// Enable per-query for Suspense + ErrorBoundary integration (React 19)
const { data } = useSuspenseQuery({ queryKey: articleKeys.detail(id), queryFn: ... });
// Component suspends while loading; no isLoading check needed
```

## Error handling

- `useQuery` returns `isError` + `error`; surface via `<ErrorBoundary>` with `throwOnError: true` or handle inline
- Normalise API errors in the fetch client, not in every query hook (see `api-client-typing`)

## Devtools

```tsx
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
// Add inside <QueryClientProvider> in dev only
{
  import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />
}
```

<!-- last reviewed: 2026-06-02 -->
