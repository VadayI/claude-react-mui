# Testing policy (quick index)

> **Source of truth:** the TDD loop, the full *what-to-test / what-to-skip* matrix, triangulation, and the tool set are defined in @.claude/rules/tdd.md. This file is the quick index for **where tests live** and **how a test is structured**. If anything here ever conflicts with `tdd.md`, **`tdd.md` wins**.

## Stack & locations

- **Vitest** + **@testing-library/react** + **@testing-library/user-event** + **@testing-library/jest-dom** (matchers) — unit/component (inner loop).
- **MSW** for network mocking; shared server in `src/test/server.ts`, handlers derived from the OpenAPI schema types so mocks can't drift.
- **jest-axe** for component a11y; **@axe-core/playwright** for E2E a11y.
- **Playwright** for E2E user journeys (outer loop); specs in `e2e/`.
- **Typed factories** in `src/test/factories/` instead of duplicated inline fixtures.

## Test structure

- AAA: Arrange / Act / Assert.
- Names: `<subject> <condition> <expectation>` (e.g. `TodoList renders empty state when no todos`).
- Query by role/label/text; interact with `user-event`; await with `findBy*`/`waitFor`.
- Colocate tests next to source (`X.test.tsx`); E2E specs in `e2e/`.

## What to test, the TDD order, and commands

Not duplicated here — see @.claude/rules/tdd.md for the mandatory/skip matrix, triangulation, the outer→inner loop order, and the npm test commands.
