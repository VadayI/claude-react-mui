---
name: api-client-typing
description: openapi-typescript workflow — generate schema types, typed fetch client, DTO mappers, error normalisation, auth injection, drift gate — activate when touching the API layer.
---

# Typed API Client (openapi-typescript)

Reference: `@.claude/rules/api-client.md`

## Core rule: never hand-write a DTO type

All request/response types are derived from the **vendored contract** `src/lib/api/openapi.yml`,
pulled from the external contract repo `VadayI/claude-api-contract` at the pinned tag — **NOT** from
the backend, which is a fellow consumer and generates nothing (@.claude/rules/api-client.md).
Hand-written DTOs drift from the contract — the generator catches renames and removals at build time.

## Workflow

```bash
# 1. Pull the contract from the external contract repo (CONTRACT_REPO + CONTRACT_VERSION in .env)
npm run api:pull          # vendors src/lib/api/openapi.yml at the pinned tag

# 2. Generate TypeScript types
npm run api:types         # openapi-typescript src/lib/api/openapi.yml -o src/lib/api/schema.d.ts

# 3. Drift gate (run in CI): regenerate and diff
bash scripts/check_types_drift.sh
# and the contract-sync gate (vendor file vs pinned tag sha256):
bash scripts/check_contract_sync.sh
```

> Bumping `CONTRACT_VERSION` is a deliberate, reviewed PR — never an automatic drift.
> A missing/ambiguous endpoint is a **contract-repo task**, not a frontend fake (@.claude/rules/no-stubs.md).

## Typed fetch client with openapi-fetch

```ts
// src/lib/api/client.ts
import createClient from 'openapi-fetch'
import type { paths } from './schema.d.ts'

export const apiClient = createClient<paths>({
  baseUrl: import.meta.env.VITE_API_BASE_URL,
})
```

## Auth header injection

```ts
// src/lib/api/client.ts
import { useAuthStore } from '@/lib/auth/authStore'

apiClient.use({
  onRequest({ request }) {
    const token = useAuthStore.getState().accessToken
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
// src/features/articles/api/mappers.ts
import type { paths } from '@/lib/api/schema.d.ts'

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
// src/lib/api/errors.ts
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
import type { paths } from '@/lib/api/schema.d.ts'
type ArticleListResponse =
  paths['/api/v1/articles']['get']['responses']['200']['content']['application/json']

http.get('/api/v1/articles', () =>
  HttpResponse.json<ArticleListResponse>({ results: [], count: 0 }),
)
```

<!-- last reviewed: 2026-06-16 -->
