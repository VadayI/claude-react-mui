---
name: api-client-typing
description: openapi-typescript workflow — generate schema types, typed fetch client, DTO mappers, error normalisation, auth injection, drift gate — activate when touching the API layer.
---

# Typed API Client (openapi-typescript)

Reference: `@.claude/rules/api-client.md`

## Core rule: never hand-write a DTO type

All request/response types are derived from the backend's `openapi.yml`.
Hand-written DTOs drift from the contract — the generator catches renames and removals at build time.

## Workflow

```bash
# 1. Pull the backend schema (committed or fetched)
curl -o docs/api/openapi.yml http://localhost:8000/api/schema/

# 2. Generate TypeScript types
npx openapi-typescript docs/api/openapi.yml -o src/api/schema.d.ts

# 3. Drift gate (run in CI): regenerate and diff
npx openapi-typescript docs/api/openapi.yml -o /tmp/schema.d.ts
diff src/api/schema.d.ts /tmp/schema.d.ts || (echo "schema drift!" && exit 1)
```

## Typed fetch client with openapi-fetch

```ts
// src/api/client.ts
import createClient from 'openapi-fetch'
import type { paths } from './schema.d.ts'

export const apiClient = createClient<paths>({
  baseUrl: import.meta.env.VITE_API_BASE_URL,
})
```

## Auth header injection

```ts
// src/api/client.ts
import { useAuthStore } from '@/store/authStore'

apiClient.use({
  onRequest({ request }) {
    const token = useAuthStore.getState().token
    if (token) request.headers.set('Authorization', `Bearer ${token}`)
    return request
  },
})
```

## Typed request/response usage

```ts
// Fully typed — path, method, params, response all inferred from schema
const { data, error } = await apiClient.GET('/api/v1/articles', {
  params: { query: { page: 1, page_size: 20 } },
})

// data is typed as paths['/api/v1/articles']['get']['responses']['200']['content']['application/json']
// error is typed as the error union from the schema
```

## DTO → view-model mappers

Keep mapping logic in a dedicated layer, not scattered across components:

```ts
// src/api/mappers/article.ts
import type { paths } from '../schema.d.ts'

type ArticleDTO =
  paths['/api/v1/articles/{id}']['get']['responses']['200']['content']['application/json']

export interface ArticleViewModel {
  id: string
  title: string
  publishedAt: Date // string → Date conversion here
  authorName: string
}

export function mapArticle(dto: ArticleDTO): ArticleViewModel {
  return {
    id: dto.id,
    title: dto.title,
    publishedAt: new Date(dto.created_at),
    authorName: dto.author.display_name,
  }
}
```

## Error normalisation

```ts
// src/api/errors.ts
export interface ApiError {
  status: number
  message: string
  fieldErrors?: Record<string, string[]>
}

export function normaliseError(error: unknown): ApiError {
  if (error && typeof error === 'object' && 'status' in error) {
    return error as ApiError
  }
  return { status: 0, message: 'Network error' }
}
```

## MSW handler typing (test layer)

```ts
// Handlers use the same generated types
import type { paths } from '@/api/schema.d.ts'
type ArticleListResponse =
  paths['/api/v1/articles']['get']['responses']['200']['content']['application/json']

http.get('/api/v1/articles', () =>
  HttpResponse.json<ArticleListResponse>({ results: [], count: 0 }),
)
```

<!-- last reviewed: 2026-06-02 -->
