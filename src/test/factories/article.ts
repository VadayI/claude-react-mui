/**
 * Test factory for ArticleViewModel.
 *
 * Provides a typed helper to create article fixtures with sensible defaults
 * that can be overridden per-test. Using a factory rather than inline
 * object literals keeps tests readable and DRY.
 */
import type { ArticleViewModel } from '../../features/articles/api/articlesApi'

let _nextId = 1

/**
 * Creates an `ArticleViewModel` test fixture.
 *
 * @param overrides - Partial fields to override the defaults.
 * @returns A valid `ArticleViewModel` with auto-incrementing id.
 *
 * @example
 * ```ts
 * const article = makeArticle({ title: 'My article', status: 'published' })
 * ```
 */
export function makeArticle(overrides: Partial<ArticleViewModel> = {}): ArticleViewModel {
  const id = _nextId++
  return {
    id: String(id),
    title: `Article ${id}`,
    body: `Body content for article ${id}`,
    slug: `article-${id}`,
    status: 'draft',
    author_id: 'author-1',
    tags: [],
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
    ...overrides,
  }
}

/**
 * Resets the auto-increment counter.
 * Call in `beforeEach` when deterministic ids are important.
 */
export function resetArticleFactory(): void {
  _nextId = 1
}
