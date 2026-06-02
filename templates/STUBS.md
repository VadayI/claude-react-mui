# Stub Ledger — {PROJECT_NAME}

Every `// STUB:` comment or `throw new Error('STUB: ...')` in `src/` (excluding tests) MUST have a matching row in this table. The CI gate (`scripts/check_stubs.sh`) greps `src/` for `STUB` markers, excludes `*.test.*` and `*.spec.*` files, and exits non-zero for any stub whose file is not listed here.

**This ledger is initialized empty.** No example rows — a row referencing a file that does not exist signals the ledger was never adopted.

Rules:
- Add a row the moment you write a `// STUB:` marker (inner TDD loop is fine; the row must exist before the PR opens).
- Remove the row when the stub is replaced with real logic in REFACTOR.
- The test column names the test that will force the real implementation once the stub is removed.

| File:line | Reason | Test that must force the real impl | Owner | Date |
|---|---|---|---|---|
