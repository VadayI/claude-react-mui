# Project brief — claude-react-mui (starter)

## Overview

This repository is the **`claude-react-mui` framework** itself: a ready-made Claude Code configuration for building React + Material UI frontends with TDD discipline, a contract-first relationship to a separate backend, mandatory accessibility, and a PR-only workflow. It ships a working **starter app** (the `todos` feature) that demonstrates the conventions end to end.

A _derived_ project replaces this brief with its own (via `templates/PROJECT.md` + `/synthesize-brief`).

## Goals

- Turn Claude Code into an orchestrated frontend team (the agent pipeline).
- Make the frontend TDD double-loop (Playwright outer + Vitest/RTL/MSW inner) the default way of working.
- Guarantee the UI never drifts from the backend contract (generated types + CI drift gate).
- Make accessibility and the four UI states non-negotiable, enforced by gates and the Quality Gate.

## Target users

Developers (and Claude) building MUI SPAs that consume a Django/DRF (or any OpenAPI) backend.

## Key screens / flows (starter)

- `/` — home.
- `/todos` — list + create todos; demonstrates loading / success / empty / error states, a Zustand UI filter, a typed query + mutation, and keyboard accessibility.

## Non-goals

- Owning the REST API contract (that lives in `VadayI/claude-api-contract` — both teams consume it, neither generates it).
- Server-side rendering (this is a Vite SPA; SSR would be a separate decision).

## Constraints

- Node 24+ on WSL2 / Linux / macOS. PR-only. Files in `src/` ≤ 800 lines.

## Backend API

The contract is the `VadayI/claude-api-contract` schema, vendored at `src/lib/api/openapi.yml` by `npm run api:pull` using `CONTRACT_REPO` + `CONTRACT_VERSION` from `.env`. See `docs/api/INDEX.md`.
