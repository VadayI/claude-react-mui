# 0007. Frontend is a separate repository that consumes the backend contract

Status: accepted · 2026-06-02

## Context

The backend framework (a Django/DRF service) is API-first and backend-only; its ADR 0007 chose to keep the production frontend in a **separate** `claude-react-mui` repository rather than a monorepo or an embedded mini-frontend. This repo is that counterpart.

## Decision

`claude-react-mui` is an independent repository with its own CI and release cycle. It treats the backend's **OpenAPI schema as the single source of truth**: the schema is committed at `src/lib/api/openapi.yml`, types are generated (`openapi-typescript`), and a drift gate (`scripts/check_types_drift.sh`) prevents the UI from coding against an imagined API. A missing endpoint is a backend task, never a frontend fake.

## Consequences

- Backend and frontend evolve and deploy independently; the contract couples them, not a shared build.
- Breaking contract changes are versioned, coordinated events (ADR-worthy), not silent edits.
- Mirror gate to the backend's OpenAPI drift gate — symmetry on both sides of the contract.
