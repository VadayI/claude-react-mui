/**
 * MSW request handlers — default (happy-path) mocks for the entire app.
 *
 * Rules:
 * - Response shapes MUST match the types generated from src/lib/api/schema.d.ts.
 *   Import and use those types rather than duplicating shapes inline.
 * - This file provides only happy-path defaults. Error and empty scenarios are
 *   added per-test by overriding handlers with server.use(...) inside the test.
 * - Never import real production modules here — handlers are test infrastructure.
 * - Keep handler paths in sync with docs/api/INDEX.md and routes.json.
 */

import { http, HttpResponse } from 'msw';

// ---------------------------------------------------------------------------
// Example: happy-path GET /api/v1/articles/
// Replace with real resource paths and response shapes from schema.d.ts.
// ---------------------------------------------------------------------------

export const handlers = [
  http.get('/api/v1/articles/', () => {
    return HttpResponse.json({
      count: 1,
      next: null,
      previous: null,
      results: [
        {
          id: 1,
          title: 'Example article',
          created_at: '2024-01-01T00:00:00Z',
        },
      ],
    });
  }),

  // Example: POST /api/v1/articles/ — returns 201 with the created object
  http.post('/api/v1/articles/', async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({ id: 2, ...(body as object) }, { status: 201 });
  }),

  // ---------------------------------------------------------------------------
  // Error scenario template — uncomment per-test via server.use(...)
  // ---------------------------------------------------------------------------
  //
  // http.get('/api/v1/articles/', () => {
  //   return HttpResponse.json(
  //     { detail: 'Internal server error.' },
  //     { status: 500 },
  //   );
  // }),

  // ---------------------------------------------------------------------------
  // Empty list scenario template — uncomment per-test via server.use(...)
  // ---------------------------------------------------------------------------
  //
  // http.get('/api/v1/articles/', () => {
  //   return HttpResponse.json({
  //     count: 0,
  //     next: null,
  //     previous: null,
  //     results: [],
  //   });
  // }),
];
