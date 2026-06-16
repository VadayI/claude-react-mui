---
name: performance-optimization
description: Frontend render performance, code splitting, bundle analysis, Web Vitals — activate for performance investigation or optimisation work.
---

# Performance Optimisation

## Render performance — the right tool

| Primitive   | Use when                                                                      | Avoid when             |
| ----------- | ----------------------------------------------------------------------------- | ---------------------- |
| React.memo  | component re-renders with same props from a parent that re-renders frequently | always — measure first |
| useMemo     | expensive pure computation; referentially stable value for a dep array        | trivial calculations   |
| useCallback | stable callback reference for a memo-wrapped child                            | wrapping every handler |

Default: write clear code first, measure with Profiler or React DevTools, then apply memoisation.

## Context splitting — avoid broad re-renders

```tsx
// Bad: one fat context re-renders all consumers on any change
const AppContext = createContext({ user, theme, cart })

// Good: split by update frequency
const UserContext = createContext(user)
const ThemeContext = createContext(theme)
const CartContext = createContext(cart)
```

## List virtualisation for long lists

```tsx
// Use @tanstack/react-virtual for lists > ~100 items
import { useVirtualizer } from '@tanstack/react-virtual'

function VirtualList({ items }: { items: Article[] }) {
  const parentRef = useRef<HTMLDivElement>(null)
  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 72,
  })
  return (
    <div ref={parentRef} style={{ height: 600, overflow: 'auto' }}>
      <div style={{ height: virtualizer.getTotalSize() }}>
        {virtualizer.getVirtualItems().map((row) => (
          <div key={row.key} style={{ transform: `translateY(${row.start}px)` }}>
            <ArticleRow article={items[row.index]} />
          </div>
        ))}
      </div>
    </div>
  )
}
```

## Code splitting — lazy routes

```tsx
// src/app/router.tsx — split every route-level component
const ArticleList = lazy(() => import('@/features/articles/components/ArticleListPage'))
const ArticleDetail = lazy(() => import('@/features/articles/components/ArticleDetailPage'))

// Wrap in Suspense with a skeleton fallback
;<Suspense fallback={<PageSkeleton />}>
  <Route path="/articles" element={<ArticleList />} />
</Suspense>
```

## Bundle analysis

```bash
npx vite-bundle-visualizer
# outputs stats.html — open in browser
# look for: duplicate packages, large un-split vendor chunks, accidentally bundled dev deps
```

## Web Vitals targets (LCP / CLS / INP)

| Metric                          | Target  | Common causes                                          |
| ------------------------------- | ------- | ------------------------------------------------------ |
| LCP (Largest Contentful Paint)  | < 2.5s  | unoptimised images, render-blocking fonts              |
| CLS (Cumulative Layout Shift)   | < 0.1   | missing size on images/iframes, late-injected content  |
| INP (Interaction to Next Paint) | < 200ms | heavy synchronous JS on main thread during interaction |

```tsx
// Reserve space for async content to avoid CLS
<Box sx={{ minHeight: 400 }}>
  <Suspense fallback={<Skeleton height={400} />}>
    <HeroImage />
  </Suspense>
</Box>
```

## Image / asset strategy

- Use width + height on img elements to reserve space (prevents CLS)
- loading="lazy" for below-fold images
- Serve WebP/AVIF via Vite image plugin or CDN transforms
- Inline SVG icons used everywhere; do not import large icon bundles wholesale

<!-- last reviewed: 2026-06-02 -->
