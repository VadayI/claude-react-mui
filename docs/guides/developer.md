# Developer guide

## Overview

A **frontend-only** React + MUI SPA (TypeScript, Vite) that consumes the `VadayI/claude-api-contract` REST API schema. Both this frontend and the `claude-django` backend are consumers of that contract — neither generates the canon. Server-state via TanStack Query, client-state via Zustand, tested with Vitest + React Testing Library + MSW (inner loop) and Playwright (outer loop).

## Run it locally

Prerequisites: **Node 20.19+** on WSL2 / Linux / macOS.

```bash
npm ci
cp .env.example .env        # set VITE_API_BASE_URL and CONTRACT_VERSION
npm run api:pull            # pull the contract openapi.yml from VadayI/claude-api-contract
npm run api:types           # generate src/lib/api/schema.d.ts
npm run dev                 # http://localhost:5173
```

Tests & checks:

```bash
npm run test                # vitest watch (inner loop)
npm run test:run            # vitest once
npm run e2e:ui              # Playwright UI mode (outer loop)
npm run typecheck && npm run lint
```

## The API contract

The `VadayI/claude-api-contract` schema is the law. It lives at `src/lib/api/openapi.yml` (vendored at the pinned `CONTRACT_VERSION` tag by `npm run api:pull`); `npm run api:types` regenerates the typed `src/lib/api/schema.d.ts` (via `openapi-typescript`). `scripts/check_types_drift.sh` (in CI) fails if the committed types don't match the schema, so the UI can never silently drift from the API. Refresh with `npm run api:pull && npm run api:types`; a breaking change is an ADR + a coordinated migration. The full contract lives in `VadayI/claude-api-contract`; `claude-django` exposes a Swagger UI at `/api/schema/swagger/` for convenience.

## Architecture

Feature-sliced (`src/features/<feature>/` with `api/`, `hooks/`, `components/`, `store/`, `README.md`). Routing/guards in `src/app/`; the central MUI theme in `src/theme/`; the typed client + query client in `src/lib/`. **Server-state → TanStack Query, client-state → Zustand/local** — never blurred. See `.claude/rules/architecture.md` and `state-management.md`.

## Add a feature

Through the pipeline: `ba` (stories) → `ui-architect` (route/component/props contract + `routes.json`) → `tester` (failing Playwright + Vitest/RTL/MSW) → `react-developer` (GREEN) → Quality Gate (`reviewer` | `security-scanner` | `state-architect`) → `docs-writer` (feature README + `docs/verify/<feature>.md` + PR). Every feature ships a `README.md` and handles the four UI states accessibly.

## Where to go next

`docs/verify/` (manual smoke tests), `docs/decisions/` (ADRs), `VadayI/claude-api-contract` (the API contract source).
