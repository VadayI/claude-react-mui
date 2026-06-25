# Node / dev commands

> **Shell:** bash — Linux / macOS / WSL2 Ubuntu, or **native Windows via Git Bash** (Git for Windows; ADR `0028`, amending `0005`). PowerShell/cmd alone are not supported. Working from a Windows drive under **WSL2** (`/mnt/c`/`/mnt/d`) is fully supported (ADR `0009`); the only caveats are slightly slower file watching, running git from the host shell, and the 9p note below. (Native Windows runs on NTFS and has none of the 9p caveats.) Vitest keeps its default `forks` pool on `/mnt` — do not switch to `pool: 'threads'` there, as Tinypool's `Atomics.wait()` can hang on the 9p filesystem (native-Linux CI and native Windows are unaffected).
>
> **Node 24+ is a hard requirement** (Node 20/22 floor raised, ADR 0023). It runs the SessionStart env-detection hook, the CI gate helpers, the Vite dev server, Vitest, and Playwright. Install via `nvm` if missing. The `SessionStart` hook writes `.claude/memory/env-detect.json` with the active shell + node version so agents can verify their assumptions.

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
bash scripts/check_file_size.sh      # no src file over 800 lines
bash scripts/check_feature_readmes.sh # every feature has a README
bash scripts/check_contract_sync.sh  # vendored openapi.yml matches the pinned tag
bash scripts/check_plan_sync.sh       # non-trivial PR has an updated living plan
bash scripts/check_routes_registry.sh # router change reconciled with routes.json + docs/verify
bash scripts/check_guides_sync.sh     # route/auth change updates docs/guides
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
