# Testing policy

## Stack

- **Vitest** + **@testing-library/react** + **@testing-library/user-event** + **@testing-library/jest-dom** (matchers) — unit/component (inner loop).
- **MSW** for network mocking; shared server in `src/test/server.ts`, handlers derived from the OpenAPI schema types so mocks can't drift.
- **jest-axe** for component a11y; **@axe-core/playwright** for E2E a11y.
- **Playwright** for E2E user journeys (outer loop).
- **Typed factories** in `src/test/factories/` instead of duplicated inline fixtures.

## Structure

- AAA: Arrange / Act / Assert.
- Names: `<subject> <condition> <expectation>` (e.g. `TodoList renders empty state when no todos`).
- Query by role/label/text; interact with `user-event`; await with `findBy*`/`waitFor`.
- Colocate tests next to source (`X.test.tsx`); E2E specs in `e2e/`.

## What is MANDATORY to test

- the four UI states (loading / success / empty / error) of any data component;
- form validation (invalid → visible associated error) and successful submit (correct payload);
- custom hooks and Zustand store transitions;
- route guards — allowed and denied paths;
- API mappers and error normalization;
- a11y: `jest-axe` clean + at least one keyboard-only interaction per interactive component;
- a Playwright happy path + primary error path per feature.

## What can be skipped

- purely presentational, branch-free styled wrappers (an axe smoke test is still encouraged);
- third-party library internals (test *your* usage);
- exact pixel/visual layout (visual regression is `qa`'s job).

## Order (TDD)

Outer Playwright test RED → inner Vitest/RTL loop (RED → GREEN → REFACTOR) → refactor. Details — @.claude/rules/tdd.md.

## Commands

```bash
npm run test:run        # vitest once
npm run test:cov        # vitest with coverage
npm run e2e             # playwright run
npm run lint            # eslint (incl. jsx-a11y)
npm run typecheck       # tsc --noEmit
```
