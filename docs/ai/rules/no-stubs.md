# No stubs / no fake data in production code (enforced)

TDD's GREEN phase ("minimal code to pass") legitimately produces **temporary stubs** — hardcoded return values, empty handlers, fake datasets that satisfy a test without real logic. That is fine **inside the inner loop on a feature branch**. The risk is a stub surviving into a merged PR. This rule makes every stub **visible, tracked, and gated** so none reaches `main` unnoticed.

## Canonical marker (one greppable token)

- Any intentional placeholder in non-test code is marked with **`// STUB:`** plus a reason, e.g. `// STUB: returns fixed list until /todos pagination lands (#142)`.
- For unimplemented branches, prefer `throw new Error("STUB: <reason>")` — it is self-flagging (tests covering it fail).
- One token only (`STUB`) so `grep`/CI can find every one of them.

## Mock / fake data — tests and MSW only

Mock objects, fixtures, and fake datasets live in **tests** and the **MSW handlers** (`src/test/`, `src/mocks/`) or in explicit Storybook stories / dev-only fixtures. **Production code (`src/`, excluding test and mock files) must never** contain inline fake data, hardcoded sample payloads, or imports of test factories. A hardcoded "example" component response is a `// STUB:`.

## The ledger — `docs/STUBS.md`

Every `// STUB:` / `throw new Error("STUB: …")` in `src/` (excluding `*.test.*`, `*.spec.*`, `src/test/**`, `src/mocks/**`, `*.stories.*`) MUST have a matching entry in `docs/STUBS.md`:

```
| File:line | Reason | Test that must force the real impl | Owner | Date |
|---|---|---|---|---|
| src/features/todos/hooks/useTodos.ts:42 | fixed list until pagination lands | useTodos paginates | @your-handle | 2026-06-02 |
```

CI fails if a STUB exists in `src/` whose file is not listed in `docs/STUBS.md`. This is what _forces_ recording it — unlogged stubs do not merge.

> **Ledger initialization.** On `/bootstrap`, `docs/STUBS.md` is initialized as an **empty ledger for this project** — the header row + column definitions, with the example/template row removed.

## Lifecycle

1. **GREEN (inner loop):** a stub is allowed only to get the current test green quickly. Mark it `// STUB:` immediately and add a `docs/STUBS.md` row.
2. **REFACTOR:** replace the stub with real logic, or — if deferred deliberately — keep it marked + logged and add the test that will later force the implementation.
3. **Quality Gate / PR:** `reviewer` and `security-scanner` explicitly flag any stub or hardcoded/fake data; unlogged stubs are 🔴. No `// STUB:` reaches `main` without a ledger entry; ideally none reaches `main` at all.

## Triangulation (prevent stubs from passing)

Defeat naive hardcoded returns by asserting behavior from **at least 2–3 distinct cases** (empty / one / many / error), not a single example. `tester` writes triangulating cases so "render one hardcoded row" cannot stay green. This is the strongest guard.

## Enforcement (the gate)

- **ESLint** `no-warning-comments` (configured for `TODO`/`FIXME`/`XXX`/`HACK`) flags generic leftover markers as errors in CI — secondary net.
- **`scripts/check_stubs.sh`** (run in `frontend-ci.yml` and locally): greps `src/` for `STUB` / `throw new Error("STUB`, excludes test/mock/story files, and **exits non-zero** for any stub whose file is not recorded in `docs/STUBS.md`. Run it locally before pushing.
- **`/wrap-up`** reports residual STUBs at end of session.
- **Reviewer/security gate:** a stub in production logic (especially anything returning auth/permission/financial values, or faking an API response) is a blocker, not a nit.

## Binds these agents (rule is auto-loaded)

- `react-developer` — when stubbing to go GREEN, immediately add the `// STUB:` marker and a `docs/STUBS.md` row; remove in REFACTOR when possible.
- `tester` — triangulate so hardcoded returns fail; add the test named in the ledger that will force the real implementation.
- `reviewer` / `security-scanner` — at the Quality Gate, flag every stub / fake-data / unlogged marker.

> Goal: stubs are a _visible, temporary_ TDD tool — never silent technical debt that ships.
