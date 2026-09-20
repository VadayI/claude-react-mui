# Node / development commands

Node 24 is the primary runtime. Use PowerShell on native Windows and invoke
Bash scripts with the explicit Git for Windows bash executable. Linux uses its
native Bash. Do not mix Windows and WSL toolchains. Paths with spaces/Unicode
must be passed as arguments, not assembled into unquoted shell commands.

Run environment detection explicitly; hooks are not assumed. On WSL mounted
drives retain Vitest forks: the historical Tinypool Atomics.wait/9p limitation is
not a reason to switch pools blindly. Record WSL/macOS as unverified without runs.

## Day-to-day (local)

```bash
npm ci                   # lockfile-exact install; dependency upgrades are separate
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
npx prettier --check .     # read-only formatting check; fix only task-owned files
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
npm run api:pull         # pull the contract openapi.yml from VadayI/claude-api-contract (approved non-secret contract pin/environment)
npm run api:types        # regenerate types; review the diff for breaking changes
```

## Staging (VPS, Debian)

Deployment is a separate authorized action, never an implicit wrap-up step.

The production build is static files served by nginx. Deploy = build + sync `dist/` (or build the Docker image) on the VPS behind a reverse proxy with its own subdomain.

```bash
ssh <user>@<STAGING_HOST>
cd ~/projects/<project>
git pull
docker compose -f docker-compose.staging.yml up -d --build   # builds + serves dist/ via nginx
```

> Mobile testing — open the staging subdomain in the phone's browser.
