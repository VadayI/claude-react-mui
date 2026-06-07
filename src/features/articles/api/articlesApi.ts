/**
 * Articles API wrappers.
 *
 * The only layer that communicates with the backend for the articles feature.
 * All functions return view-model types (not raw DTOs) so higher layers are
 * insulated from schema changes.
 */
import { apiClient, normaliseError } from '../../../lib/api/client'
import type { components } from '../../../lib/api/schema.d.ts'

/** Raw DTO from the API schema. */
type ArticleDto = components['schemas']['Article']

/** Article status as defined by the contract. */
export type ArticleStatus = components['schemas']['ArticleStatus']

/**
 * View-model for a single article.
 *
 * Flattens the DTO into a UI-friendly shape. The indirection allows
 * UI-friendly transformations without touching the schema.
 */
export interface ArticleViewModel {
  id: string
  title: string
  body: string
  slug: string
  status: ArticleStatus
  author_id: string
  tags: string[]
  created_at: string
  updated_at: string
}

/**
 * Maps a raw Article DTO to the view-model used by the UI.
 */
function toViewModel(dto: ArticleDto): ArticleViewModel {
  return {
    id: dto.id,
    title: dto.title,
    body: dto.body,
    slug: dto.slug,
    status: dto.status,
    author_id: dto.author_id,
    tags: dto.tags,
    created_at: dto.created_at,
    updated_at: dto.updated_at,
  }
}

/**
 * Fetches a paginated list of articles.
 *
 * @returns An array of `ArticleViewModel` instances from the first page.
 * @throws `Error` on network failure or non-2xx status.
 */
export async function getArticles(): Promise<ArticleViewModel[]> {
  const { data, error } = await apiClient.GET('/api/v1/articles')
  if (error) throw normaliseError(error, 'Failed to fetch articles')
  return (data?.results ?? []).map(toViewModel)
}

/**
 * Creates a new article.
 *
 * @param title - The title of the new article.
 * @param body  - The body content of the new article.
 * @returns The newly created `ArticleViewModel`.
 * @throws `Error` on network failure, validation error (400), or auth failure (401).
 */
export async function createArticle(title: string, body: string): Promise<ArticleViewModel> {
  const { data, error } = await apiClient.POST('/api/v1/articles', {
    body: {
      title,
      body,
      // status and tags have contract defaults (draft, []) but openapi-typescript
      // marks them as required since they appear in required[] — supply them explicitly.
      status: 'draft' as ArticleStatus,
      tags: [],
    },
  })
  if (error) throw normaliseError(error, 'Failed to create article')
  if (!data) throw new Error('No data returned from create article')
  return toViewModel(data)
}
