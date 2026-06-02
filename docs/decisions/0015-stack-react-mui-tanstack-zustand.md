# 0015. Stack: Vite + React 18 + TS + MUI 6 + TanStack Query + Zustand

Status: accepted · 2026-06-02

## Context

Many viable React stacks exist. We needed one that fits an API-first backend, tests cleanly, and is current.

## Decision

- **Vite + React + TypeScript** — fast SPA dev server; the backend is separate, so SSR (Next.js) would add a redundant server tier. TS enables generating types from the OpenAPI contract.
- **MUI 6** — accessible component primitives + a central theme.
- **React Router** (data router) — routing/loaders/guards.
- **TanStack Query** (server-state) + **Zustand** (client-state) — the boundary is explicit (ADR 0017); chosen over Redux Toolkit/RTK Query for less boilerplate and easier MSW testing.
- **React 18.3 pinned** (not 19) for the smoothest MUI 6 + React Testing Library compatibility; revisit when MUI fully tracks React 19. The TDD/contract discipline is version-agnostic.

## Consequences

- Lean, modern, well-testable stack.
- A documented upgrade path to React 19.
