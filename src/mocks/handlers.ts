/**
 * MSW request handlers for the test suite.
 *
 * These are the DEFAULT success-scenario handlers. Individual tests can override
 * specific routes with `server.use(...)` to exercise error / empty states.
 */
import { http, HttpResponse } from 'msw'
import type { ArticleViewModel } from '../features/articles/api/articlesApi'

/** API origin, read from VITE_API_BASE_URL. */
const BASE_URL = import.meta.env.VITE_API_BASE_URL

/** Default articles returned by GET /api/v1/articles in tests. */
export const DEFAULT_ARTICLES: ArticleViewModel[] = [
  {
    id: '1',
    title: 'Getting Started with TypeSpec',
    body: 'TypeSpec is a language for describing APIs.',
    slug: 'getting-started-with-typespec',
    status: 'published',
    author_id: 'author-1',
    tags: ['typespec', 'api'],
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
  {
    id: '2',
    title: 'OpenAPI 3.1 Deep Dive',
    body: 'OpenAPI 3.1 brings many improvements over 3.0.',
    slug: 'openapi-3-1-deep-dive',
    status: 'draft',
    author_id: 'author-1',
    tags: ['openapi'],
    created_at: '2026-01-02T00:00:00Z',
    updated_at: '2026-01-02T00:00:00Z',
  },
]

/**
 * Default MSW handlers.
 *
 * - `GET /api/v1/articles`   → 200 with paginated DEFAULT_ARTICLES
 * - `POST /api/v1/articles`  → 201 with a new article
 */
export const handlers = [
  http.get(`${BASE_URL}/api/v1/articles`, () => {
    return HttpResponse.json({
      count: DEFAULT_ARTICLES.length,
      next: null,
      previous: null,
      results: DEFAULT_ARTICLES,
    })
  }),

  http.post(`${BASE_URL}/api/v1/articles`, async ({ request }) => {
    const body = (await request.json()) as { title?: string; body?: string }
    const newArticle: ArticleViewModel = {
      id: '99',
      title: body.title ?? 'New article',
      body: body.body ?? '',
      slug: 'new-article',
      status: 'draft',
      author_id: 'author-1',
      tags: [],
      created_at: '2026-06-07T00:00:00Z',
      updated_at: '2026-06-07T00:00:00Z',
    }
    return HttpResponse.json(newArticle, { status: 201 })
  }),
]
