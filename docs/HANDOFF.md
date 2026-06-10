# HANDOFF — claude-react-mui

> Read this first when joining the project. Updated by `/wrap-up` at end of each session.
> Last updated: 2026-06-10 (session — bootstrap-contract-source-and-design-reference)

## Current state

**Branch:** `main`
**Last PR merged:** #31 — `chore(config): bootstrap contract-source fix + design-reference rule`

The app is a fully working React + MUI frontend with:

- JWT auth (login/logout with QueryCache flush, RequireAuth guard)
- Articles CRUD (list + protected routes)
- Full test suite: 82 Vitest tests (13 files) + Playwright E2E (6 tests)
- All CI gates passing
- Claude Code config: design-reference rule wired into /synthesize-brief and UI agents

## What was done this session

1. **PR #31 merged** — two config improvements to the Claude Code orchestration layer:
   - `/bootstrap` no longer silently defaults to `VadayI/claude-api-contract`; asks for the real `OWNER/REPO`, uses `{TODO}` when none exists; `.env.example` blanked with guidance comments
   - New `.claude/rules/design-reference.md`: Claude-design prototypes as first-class UI source of truth; `/synthesize-brief` Step 1.5 + `brief-synthesizer` + `ui-architect` + `react-developer` all wired
2. `schema.d.ts` regenerated to stable openapi-typescript 7.13.0 format (double-quotes + semicolons)

## Next steps

- Next feature → standard pipeline (`ba → ui-architect → tester → react-developer → ...`)
- Consider adding a note in `.claude/rules/api-client.md` about v0.3.0+/v0.4.0+ tags not containing `openapi.yml`
- Clean up dead `page.route()` code in `e2e/articles.spec.ts` (small PR)

## Open questions

- Should we add a `contract-tags-without-schema` note to `api-client.md` as a guard for future maintainers?
- When will `claude-api-contract` publish a tag with a changed openapi.yml (triggering an actual frontend pin bump)?

## Gate status (last run)

| Gate            | Status        |
| --------------- | ------------- |
| typecheck       | ✅            |
| lint            | ✅            |
| tests           | ✅ 82 passed  |
| types-drift     | ✅            |
| contract-sync   | ✅            |
| stubs           | ✅            |
| file-size       | ✅            |
| feature-readmes | ✅            |

## Key files

- `src/lib/api/` — typed client, openapi.yml (pinned v0.2.0), schema.d.ts
- `src/features/auth/` — login, logout, RequireAuth guard, authStore
- `src/features/articles/` — articles list, API hooks
- `e2e/` — Playwright specs (auth + articles)
- `.claude/rules/design-reference.md` — NEW: Claude-design prototype as UI source of truth
- `.claude/commands/synthesize-brief.md` — updated: scans docs/design/, Step 1.5, design_folder dispatch
- `docs/verify/auth.md` — manual verification checklist for auth feature
