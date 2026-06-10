# HANDOFF — claude-react-mui

> Read this first when joining the project. Updated by `/wrap-up` at end of each session.
> Last updated: 2026-06-09 (session e — contract-compatibility-audit)

## Current state

**Branch:** `main` (wrap-up PR in flight)
**Last PR merged:** #29 — `fix(docs): align api-error-and-pagination rule with actual contract envelopes`

The app is a fully working React + MUI frontend with:

- JWT auth (login/logout with QueryCache flush, RequireAuth guard)
- Articles CRUD (list + protected routes)
- Full test suite: 82 Vitest tests (13 files) + Playwright E2E (6 tests)
- All CI gates passing

## What was done this session

1. **Merged PR #28** (docs/wrap-up-2026-06-09d) — previous session wrap-up.
2. **Contract compatibility audit** — checked `claude-api-contract` v0.3.0/v0.4.0:
   - Both are template-only releases; no `openapi.yml` in the tags → `api:pull` cannot pin to v0.3.0+.
   - API shape unchanged from v0.2.0 — current pin is correct.
   - New Prism Docker/VPS mock supported via `VITE_API_BASE_URL`.
3. **Merged PR #29** — fixed `api-error-and-pagination.md`: removed incorrect RFC-9457/drf-standardized-errors references, documented real contract envelopes (`ErrorDetail`, `ValidationErrors`).
4. **Regenerated schema.d.ts** — aligned with openapi-typescript 7.13.0 output format; `check_types_drift.sh` now passes stably.

## Next steps

- Next feature → standard pipeline (`ba → ui-architect → tester → react-developer → ...`)
- Consider adding a note in `.claude/rules/api-client.md` about v0.3.0+/v0.4.0+ tags not containing `openapi.yml`
- Clean up dead `page.route()` code in `e2e/articles.spec.ts` (MSW handles first; separate small PR)
- Resolve `check_contract_sync.sh` local pass: requires `CONTRACT_VERSION=v0.2.0` in `.env`

## Open questions

- Should we add a `contract-tags-without-schema` note to `api-client.md` as a guard for future maintainers?
- When will `claude-api-contract` publish a tag with a changed openapi.yml (triggering an actual frontend pin bump)?

## Gate status (last run)

| Gate            | Status       |
| --------------- | ------------ |
| typecheck       | ✅           |
| lint            | ✅           |
| tests           | ✅ 82 passed |
| types-drift     | ✅           |
| stubs           | ✅           |
| file-size       | ✅           |
| feature-readmes | ✅           |

## Key files

- `src/lib/api/` — typed client, openapi.yml (pinned v0.2.0), schema.d.ts
- `src/features/auth/` — login, logout, RequireAuth guard, authStore
- `src/features/articles/` — articles list, API hooks
- `e2e/` — Playwright specs (auth + articles)
- `.claude/rules/` — project rules (updated: `api-error-and-pagination.md`)
- `docs/verify/auth.md` — manual verification checklist for auth feature
