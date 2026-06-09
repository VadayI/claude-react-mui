# Node / dev commands

> **Shell:** bash (Linux / macOS / WSL2 Ubuntu). PowerShell on Windows native is NOT supported — see ADR `docs/decisions/0005-drop-windows-native-shell.md`. Working from a Windows drive (`/mnt/c`/`/mnt/d`) is fully supported (ADR `0009`); only caveat is slightly slower file watching, and git is best run from the host shell.
>
> **Node 20.19+ is a hard requirement** (Node 18 dropped, ADR 0019). It runs the SessionStart env-detection hook, the CI gate helpers, the Vite dev server, Vitest, and Playwright. Install via `nvm` if missing. The `SessionStart` hook writes `.claude/memory/env-detect.json` with the active shell + node version so agents can verify their assumptions.

## Day-to-day (local)

```bash
npm install              # install deps (or `npm ci` for a clean, lockfile-exact install)
npm run dev              # Vite dev server (http://localhost:5173)
npm run build            # production build → dist/
npm run preview          # serve the production build locally
```

## TDD loop

```bash
npm run test             # vitest watch (inner loop)
npm run test:run         # vitest once (CI)
npm run test:cov         # vitest + coverage
npm run e2e              # playwright run (outer loop)
npm run e2e:ui           # playwright UI mode (debug)
```

## Quality gates (run locally before pushing)

```bash
npm run typecheck        # tsc --noEmit
npm run lint             # eslint (incl. jsx-a11y)
npm run format           # prettier --write
npm run api:types        # regenerate src/lib/api/schema.d.ts from openapi.yml
bash scripts/check_types_drift.sh    # types match the committed schema
bash scripts/check_stubs.sh          # every STUB is logged
bash scripts/check_file_size.sh      # no src file over 400 lines
bash scripts/check_feature_readmes.sh # every feature has a README
npm audit --audit-level=high          # no high/critical advisories
npm run build && bash scripts/check_bundle_size.sh  # bundle within .performance-budget.json (gzipped)
```

## Make wrappers (optional shortcuts)

A root `Makefile` wraps the most common commands so they are identical across machines (`make help`, `make dev`, `make test`, `make gates`, `make setup`). Convenience only — the canonical commands are the npm scripts above.

## Contract refresh (deliberate, reviewed)

```bash
npm run api:pull         # pull the contract openapi.yml from VadayI/claude-api-contract (CONTRACT_REPO + CONTRACT_VERSION in .env)
npm run api:types        # regenerate types; review the diff for breaking changes
```

## Staging (VPS, Debian)

The production build is static files served by nginx. Deploy = build + sync `dist/` (or build the Docker image) on the VPS behind a reverse proxy with its own subdomain.

```bash
ssh <user>@<STAGING_HOST>
cd ~/projects/<project>
git pull
docker compose -f docker-compose.staging.yml up -d --build   # builds + serves dist/ via nginx
```

> Mobile testing — open the staging subdomain in the phone's browser.
