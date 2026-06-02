# 0001. TDD: double-loop, outside-in at the UI boundary

Status: accepted · 2026-06-02

## Context

The backend framework (`claude-django`, ADR 0001) runs an outside-in double loop with the outer loop being a DRF `APIClient` feature test, because the backend's user-facing boundary is the HTTP endpoint. For a React SPA the user-facing boundary is the **rendered UI driven through a browser**, so a literal copy of the backend's outer loop would test the wrong boundary.

## Decision

Adapt Harry Percival's *Obey the Testing Goat* double-loop to React:

- **Outer loop** = a failing **Playwright** test that drives the real app as a user (navigate, type, click, assert on screen). The network is stubbed at the boundary (route interception / MSW worker) for determinism.
- **Inner loop** = fast **Vitest + React Testing Library** tests with **MSW** mocking the network, so components and TanStack Query hooks run their production code paths — only the HTTP response is faked.

`Outer RED → inner RED→GREEN→REFACTOR until outer GREEN → refactor.` Tests assert behavior, not implementation (query by role/label). MSW handlers derive from the OpenAPI types so mocks can't drift.

## Consequences

- Real "boundary parity" (MSW ≈ the backend's real test DB) without coupling to fetch internals.
- The four UI states (loading/success/empty/error) and accessibility are testable and mandatory.
- Browser E2E is the *outer* driver here (unlike the backend, where E2E stays a thin top layer), because the rendered UI is the contract.
