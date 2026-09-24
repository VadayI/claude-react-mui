# Verify — executable evidence and user-facing checks

Read AGENTS.md, verification, API-contract, TDD and user-guides rules. Resolve the
requested feature or branch scope; use registry, real router, feature README and
OpenAPI together. Reconcile stale routes through the assigned docs/implementation
role; a coordinator may only inspect the reported exact paths.

Generate/update `docs/verify/<feature>.md` with scope, prerequisites, real routes,
manual steps, loading/success/empty/error states, keyboard pass, actual Playwright
specs, accessibility checks and done criteria. Do not invent UI or API behavior.
When execution is requested, run the relevant real checks and include exit codes.

The React full baseline includes `npm ci`, `npm audit --audit-level=high`, typecheck,
lint, format checking without writes, file-size, stubs, feature READMEs, API types,
pinned contract sync, plan/routes/guides sync with explicit GATE_BASE, test:cov,
build/bundle budget, and Playwright E2E/a11y. The new pilot adds
`python scripts/ai/generate.py --check`, `python scripts/seed-i18n.py --check`
and Python delivery fixtures. Invoke Bash gates through explicit Git Bash on Windows.
Formatting is a separate action before final verification, never a Stop side effect.

Distinguish developer working-tree results from exact candidate/base results.
Until P05 exact-candidate runner is delivered, use an independent checkout of the
candidate for final checks and save commands/results explicitly. Missing network,
browser, dependency or full result is NOT_VERIFIED; a nonzero gate is FAIL.
Commit only task-owned changes through wrap-up; the verify procedure does not merge.
