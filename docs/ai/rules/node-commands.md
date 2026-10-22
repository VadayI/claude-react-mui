# Node / development commands

Node 24 is the primary runtime. Use PowerShell on native Windows and invoke
Bash scripts with the explicit Git for Windows bash executable. Linux uses its
native Bash. Do not mix Windows and WSL toolchains. Paths with spaces/Unicode
must be passed as arguments, not assembled into unquoted shell commands.

Run environment detection explicitly; hooks are not assumed. In WSL keep the clone
in ext4 (ADR 0030); agent sessions on a mounted Windows drive are blocked without
`ALLOW_MNT_SESSION=1` (D17). In such an explicitly allowed session retain Vitest
forks: the historical Tinypool Atomics.wait/9p limitation is not a reason to switch
pools blindly. Record WSL/macOS as unverified without runs.

## Day-to-day (local)

```bash
npm ci                   # lockfile-exact install; dependency upgrades are separate
npm run dev              # Vite dev server (http://localhost:5173)
npm run build            # production build → dist/
npm run preview          # serve the production build locally
```

## Full suite vs targeted runs (D12)

- Agents run only targeted subsets: `npx vitest run <changed files or folder>`,
  `npx vitest run -t "<name>"`, `npx playwright test <spec>`. They never start the
  whole Vitest or Playwright suite on their own.
- The full suite (`npm run test:cov` + `npm run e2e`, or the runner candidate check)
  runs at most twice a day and the user starts it — or explicitly confirms the step
  that triggers it (in local CI mode `git_lifecycle.py share` pushes, and pre-push
  runs the runner). The agent gives the exact command and records the result the
  user reports; a full run the agent did not see is NOT_VERIFIED.
- Keep the clone in the WSL filesystem (`~/src/<repo>`, ADR 0030): on a Windows drive
  Vite/Vitest, `node_modules` and `.git` go through the 9P bridge.

## TDD loop

```bash
npm run test             # vitest watch (inner loop)
npx vitest run <path>    # targeted (agents)
npm run test:run         # vitest once — full suite (user, D12)
npm run test:cov         # vitest + coverage — full suite (user, D12)
npm run e2e              # playwright run — full suite (user, D12); agents: npx playwright test <spec>
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
