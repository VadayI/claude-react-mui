# ADR 0020 — External API contract (Variant A): claude-api-contract is the source of truth

- **Status:** Accepted
- **Date:** 2026-06-07
- **Supersedes:** none (extends 0018 by removing the backend as schema source)

## Context

Previously `api:pull` fetched `openapi.yml` from the running Django backend (`drf-spectacular` endpoint, `VITE_OPENAPI_URL`). This creates a hard dependency: the frontend cannot work without a running backend, and the backend is the de-facto schema owner.

Under Variant A of the multi-repo contract model, the contract lives in a separate dedicated repository (`VadayI/claude-api-contract`) and is pinned by a semver git tag. Both the frontend and the backend are consumers of the contract — neither generates it.

## Decision

- `npm run api:pull` fetches `openapi.yml` from `https://raw.githubusercontent.com/${CONTRACT_REPO}/${CONTRACT_VERSION}/openapi.yml`.
- The vendored `src/lib/api/openapi.yml` is the locked snapshot; it must match the pinned tag (enforced by `scripts/check_contract_sync.sh`).
- `contract.lock.json` records `repo` + `version` + `path` + `sha256` for integrity verification.
- `CONTRACT_VERSION` must be bumped deliberately via a PR when consuming a new contract version.
- The backend (`claude-django`) is no longer the schema source; it is itself a consumer of `VadayI/claude-api-contract`.
- `VITE_OPENAPI_URL` is removed from `.env.example`; `VITE_API_BASE_URL` now defaults to the Prism mock port (`4010`).

## Consequences

- Frontend can run against the Prism mock (`npm run mock` in `claude-api-contract`) with no backend needed.
- Breaking contract changes surface before implementation (contract gate in contract repo CI with oasdiff).
- `api:pull` no longer needs a running backend; works in CI without a live server.
- Bumping `CONTRACT_VERSION` is a deliberate PR with a visible diff.
- Two CI gates protect consistency: types-drift and contract-sync.
- Reference feature migrated from `todos` (ad-hoc) to `articles` (from contract v0.1.0).
