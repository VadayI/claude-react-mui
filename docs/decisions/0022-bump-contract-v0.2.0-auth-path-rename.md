# ADR 0022 — Bump contract pin to v0.2.0: auth endpoint path rename

- **Status:** Accepted
- **Date:** 2026-06-07
- **Deciders:** Vadym
- **Relates to:** ADR 0020 (External API contract, Variant A), ADR 0021 (Bearer/JWT auth)

## Context

The external contract repository `VadayI/claude-api-contract` released v0.2.0 on 2026-06-07 with
a single intentional breaking change (contract-side ADR 0004): all five auth endpoint paths were
renamed from the flat `/auth/*` prefix to the versioned `/api/v1/auth/*` prefix to maintain
consistency with the articles API versioning convention.

Affected paths:

- `POST /auth/login` → `POST /api/v1/auth/login`
- `POST /auth/logout` → `POST /api/v1/auth/logout`
- `POST /auth/refresh` → `POST /api/v1/auth/refresh`
- `POST /auth/register` → `POST /api/v1/auth/register`
- `POST /auth/token` → `POST /api/v1/auth/token`

The consumer impact from the release notes: _"Update hardcoded `/auth/` prefixes to `/api/v1/auth/`."_

Intermediate patch v0.1.1 (non-breaking) was also released: it added a production server URL
(`https://api.example.com`), updated `OAuth2Auth.tokenUrl`, and added `.oasdiff-ignore.txt` and
`.spectral.yaml`. Its changes are inert to this frontend (runtime uses `VITE_API_BASE_URL`, not
the schema `servers` field).

Per `upgrade-policy.md`, a major/breaking contract bump requires a human decision and an ADR;
it must not be auto-merged.

## Decision

Pin the contract to **v0.2.0** and migrate all five hardcoded `/auth/*` path strings in the
frontend to `/api/v1/auth/*`.

Files changed (production code):

- `src/features/auth/authApi.ts` — login, logout, register call URLs (3 strings)
- `src/lib/api/client.ts` — 401-refresh call URL + loop-guard `includes()` check (2 strings)

Config changed:

- `.env` — `CONTRACT_VERSION=v0.2.0` (gitignored, set manually)
- `.env.example` — `CONTRACT_VERSION=v0.2.0`
- `contract.lock.json` — `version: v0.2.0`, updated `sha256`

Regenerated (not hand-edited):

- `src/lib/api/openapi.yml` (via `npm run api:pull`)
- `src/lib/api/schema.d.ts` (via `npm run api:types`)

Tests added/updated:

- `src/lib/api/client.test.ts` — four inline MSW handlers updated from `/auth/refresh` to
  `/api/v1/auth/refresh`
- `src/features/auth/authApi.test.ts` — new file covering login/logout/register paths
  (previously uncovered — gap surfaced by this migration)

Docs updated:

- `.claude/rules/auth.md` — endpoint table and loop-guard description
- `src/features/auth/README.md` — consumed endpoints table
- `docs/decisions/0021-auth-bearer-jwt-default.md` — prose endpoint list
- `docs/api/INDEX.md` — auth section paths updated to `/api/v1/auth/*`

## Consequences

**Positive:**

- Auth and articles paths follow the same `/api/v1/` versioning convention — consistent
  across the API surface.
- The previously untested `authApi.ts` (login/logout/register) now has coverage.
- Both CI drift gates (`check_types_drift.sh`, `check_contract_sync.sh`) remain authoritative
  and green after the bump.

**Negative / trade-offs:**

- Breaking change requires coordinated bump with the backend (`claude-django`) — both sides
  must migrate to the new paths before deployment to a shared environment.
- Five hardcoded path strings required surgical updates; any future auth path changes will
  require a similar migration (mitigated by the typed client generating compile errors on path
  mismatch for `openapi-fetch`-consumed paths).

## Alternatives considered

- **Stay on v0.1.0:** Not viable long-term; the contract repo will continue to evolve and
  accumulating breaking-change debt increases migration cost.
- **Bump only to v0.1.1 (non-breaking):** A valid intermediate step, but since v0.2.0 is
  already stable and intentionally breaking, deferring only increases the gap. Decided to
  migrate in one PR.
