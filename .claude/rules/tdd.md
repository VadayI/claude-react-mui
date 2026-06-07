# TDD in TypeScript / React (mandatory)

## Iron rule

**No line of production component, hook, or store code without a failing test first.**

Cycle for each unit of functionality:

1. **RED** — write a test describing the expected user-visible behavior. Run it — it must fail for the expected reason (the behavior is missing), not because of an import/type error.
2. **GREEN** — write the MINIMAL code to make the test pass. No premature generalization, no props/states nobody tests yet.
3. **REFACTOR** — clean up component, hook, and test, tests stay green.

Repeat in small steps. One test → a bit of code → green → refactor.

> GREEN may use a temporary stub / hardcoded return to go green fast — but every stub must be marked `// STUB:` and recorded in `docs/STUBS.md`, and must never reach `main` unlogged. Rules and the CI gate: @.claude/rules/no-stubs.md.

## Double-loop TDD — outside-in at the UI boundary

This is our adaptation of Harry Percival's _Obey the Testing Goat_ double-loop to a React SPA. We keep his discipline — test-first, Red-Green-Refactor, minimal code, **test behavior not implementation** — and we keep his **outer loop as a real user-facing functional test**. For a React app the user-facing boundary is the **rendered UI driven through the browser**, so:

- **Outer loop (acceptance / functional / E2E):** a failing **Playwright** test that drives the real app in a browser as a user would — navigates a route, types, clicks, and asserts on what the user sees. The network is stubbed at the boundary (Playwright route interception or a running MSW worker) so the test is deterministic and does not need the live backend. It goes green only when the whole vertical slice works end to end: routing, data fetching, rendering, the success state, and the error/empty states.
- **Inner loop (unit / component):** fast RED → GREEN → REFACTOR cycles with **Vitest + React Testing Library**, mocking the network with **MSW** (Mock Service Worker). These cover a single component's states, a custom hook's behavior, a Zustand store's transitions, a mapper in the API layer, and validation logic — the small steps that make the outer Playwright test pass.

Flow per feature: **outer Playwright test RED → run the inner Vitest/RTL loop (RED→GREEN→REFACTOR) until the outer test is GREEN → refactor.** This maps onto the pipeline: `ui-architect` fixes the component/route contract → `tester` writes the failing outer Playwright test and the first failing RTL test → `react-developer` greens them via inner loops.

Why MSW and not hand-rolled mocks: MSW intercepts at the network layer (`fetch`/`XHR`), so components and TanStack Query hooks run **exactly the code path they run in production** — only the HTTP response is faked. This gives the same "real boundary" parity that a real test database gives a backend, without coupling tests to implementation details of the fetch layer. The MSW handlers are derived from the backend OpenAPI contract (@.claude/rules/api-client.md), so the mocked shapes cannot drift from the real API.

## Test behavior, not implementation (RTL discipline)

React Testing Library exists to make you test what the user experiences, not how the component is built. This is the single most important habit for durable frontend tests.

- **Query the way a user (or assistive tech) finds things:** `getByRole`, `getByLabelText`, `getByText`, `getByPlaceholderText`. Reserve `getByTestId` for the rare case with no accessible handle.
- **Never assert on:** component internal state, a hook's variable names, CSS class names, the number of renders, or which child component was called. These are implementation; they change on refactor and give false failures.
- **Interact like a user:** drive events with `@testing-library/user-event` (real focus/keyboard/click sequencing), not by calling handlers directly.
- **Async UI:** wait for the _result the user sees_ with `findBy*` / `waitFor` — never `setTimeout`. Assert the spinner appears, then the data row appears, then the spinner is gone.
- A test that has to import internals to work is testing the wrong thing — rewrite it against the rendered output.

## What to test / what to skip

**Always test:**

- every interactive component: its loading, success, **empty**, and **error** states (the four states are mandatory for anything that fetches);
- form validation (invalid input → visible error, submit disabled/enabled), and successful submit (the mutation fires with the right payload);
- custom hooks (`use*`) and Zustand stores — their transitions and edge cases;
- routing/guards (authenticated vs anonymous redirects), and URL/query-param-driven state;
- the API layer mappers (DTO → view model) and error normalization;
- **accessibility**: each component passes `jest-axe` with no violations; key flows are keyboard-only operable (@.claude/rules/accessibility.md);
- a Playwright happy-path journey per feature, plus the primary error path.

**Can skip:**

- purely presentational components with no logic and no branching (a styled wrapper) — though an a11y smoke test is cheap and encouraged;
- third-party library internals (MUI, Router, Query) — test _your_ usage, not their code;
- exact pixel layout (that is visual-regression territory for `qa`, not unit tests).

## Triangulation

Assert behavior from at least 2–3 distinct cases (different inputs → different rendered output) so a hardcoded/stub return cannot stay green. E.g. a list component is tested with an empty list (empty state), one item, and many items (and a fetch error) — `return null` or a hardcoded row cannot pass all four. See @.claude/rules/no-stubs.md.

## Order for a frontend feature

1. `ui-architect` fixes the contract: route(s), the component tree and each component's props, the four UI states, which API endpoints (from the OpenAPI contract) the feature consumes, the TanStack Query keys and any Zustand store shape, and the a11y requirements.
2. `tester` writes:
   - a **Playwright** outer test for the user journey (RED — the route/screen does not exist yet);
   - the first failing **Vitest + RTL** component test (states + interaction) with **MSW** handlers for the endpoints.
3. `react-developer` adds the component / hook / store / API client code — just enough to green the tests, via inner loops. Any stub used to go green is marked + logged per @.claude/rules/no-stubs.md.
4. Refactor + `eslint --fix` + `prettier`. Outer + inner tests stay green.

## Tools

- `vitest` + `@testing-library/react` + `@testing-library/user-event` + `@testing-library/jest-dom` (matchers).
- `msw` for network mocking (a shared `src/test/server.ts` for Node tests, `src/test/browser.ts` worker for dev/Playwright).
- `jest-axe` (component a11y) and `@axe-core/playwright` (E2E a11y).
- `@playwright/test` for the outer loop.
- Test data via small typed factories in `src/test/factories/` (no inline fixtures duplicated across tests).

## Commands

```bash
npm run test            # vitest watch (inner loop)
npm run test:run        # vitest once (CI)
npm run test:cov        # vitest with coverage
npm run e2e             # playwright run (outer loop)
npm run e2e:ui          # playwright UI mode (debug the journey)
npm run lint            # eslint
npm run typecheck       # tsc --noEmit
```
