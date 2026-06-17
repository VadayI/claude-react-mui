---
model: sonnet
---

Scaffold a new Vite+React+TS+MUI project from templates (Mode A) or PR each missing piece into an existing incomplete project (Mode B). Binary command — NOT part of the feature pipeline.

## Log

```bash
node scripts/log-cmd.mjs /bootstrap "$ARGUMENTS"
```

## Pre-flight hard gates

Before doing ANYTHING:

1. Read `.claude/memory/env-detect.json`. If `platform_supported: false` or `wrong_runner_suspected: true` → **HARD STOP: UNSUPPORTED_PLATFORM**. Instruct the user to run WSL2-native Claude CLI.
2. If `node_supported: false` or Node < 24 → **HARD STOP: NO_NODE**. Instruct `nvm install --lts`.
3. Run `gh repo view` to confirm GitHub access. If it fails → HARD STOP and ask the user to fix credentials.

## Mode detection

- **Mode A (fresh)**: `package.json` does not exist in the project root. Scaffold from scratch.
- **Mode B (resume)**: `package.json` exists but some pieces are missing. PR each missing piece separately.

Present the detected mode and ask the user to confirm before proceeding.

## Mode A — Fresh scaffold

### Step 0: Contract source

Before creating any files, ask how THIS project gets its OpenAPI contract.

> Note: `VadayI/claude-api-contract` and `VadayI/claude-django` are **reference templates** — examples of how to structure a contract repo or a Django/DRF backend. For a real project you point at your **own** repo or backend, structured like those templates.

Use `AskUserQuestion`:

- header: `"Contract source"`
- question: `"How does THIS project get its OpenAPI contract? (claude-api-contract and claude-django are reference templates — for a real project, provide your OWN contract repo or backend URL structured like them.)"`
- options:
  - **Own contract repo (like `claude-api-contract`) (Recommended)** — Your own versioned OpenAPI repo (structured like `VadayI/claude-api-contract`). Enables the drift gate + contract-sync CI gates out of the box. You'll provide `OWNER/REPO` + a pinned tag.
  - **Own Django/DRF backend (like `claude-django`)** — Your own Django/DRF backend (structured like `VadayI/claude-django`) serving the schema at `/api/schema/`. You'll provide the OpenAPI URL.
  - **Custom OpenAPI URL** — Any other OpenAPI schema accessible by URL.

Record the answer as `CONTRACT_SOURCE` (A / B / C) for use in Steps 1 and 9.

**After the choice, collect the real values:**

- **Variant A:** Ask for `CONTRACT_REPO` (format: `OWNER/REPO`, e.g. `your-org/your-api-contract`) and `CONTRACT_VERSION` (a pinned tag, e.g. `v0.1.0`). If the contract repo does not exist yet — record both as `{TODO}` and defer `api:pull`/`api:types` to Step 9.
- **Variant B:** Ask for `VITE_OPENAPI_URL` (the Django `/api/schema/` endpoint). If the backend is not yet running — record as `{TODO}`.
- **Variant C:** Ask for the full OpenAPI schema URL. If not yet available — record as `{TODO}`.

**Variant A — own contract repo:**

- `.env.example` gets: `CONTRACT_REPO=<user-provided OWNER/REPO or {TODO}>` + `CONTRACT_VERSION=<user-provided tag or {TODO}>` + `VITE_API_BASE_URL=http://localhost:4010`
- `npm run api:pull` works as-is once `CONTRACT_REPO`/`CONTRACT_VERSION` are filled in (fetches GitHub raw at the pinned tag).
- Both CI gates (`check_types_drift.sh` + `check_contract_sync.sh`) apply.

**Variant B — own Django/DRF backend:**

- `.env.example` gets: `VITE_API_BASE_URL=http://localhost:8000` + `VITE_OPENAPI_URL=<user-provided URL or {TODO}>`
- `npm run api:pull` does **not** support arbitrary URLs. Use instead:
  `curl -fsSL "$VITE_OPENAPI_URL" -o src/lib/api/openapi.yml && npm run api:types`
- `check_contract_sync.sh` assumes a GitHub raw source — disable it in CI for this variant or leave as advisory.
- Create an ADR in `docs/decisions/` noting that the schema source is the live Django backend.

**Variant C — custom URL:**

- `.env.example` gets: `VITE_API_BASE_URL=` + `VITE_OPENAPI_URL=<user-provided URL or {TODO}>`
- Same `api:pull` note as Variant B — use `curl` or adapt `scripts/api-pull.mjs`.
- Disable or adapt `check_contract_sync.sh` in CI.

### Step 1: Create project skeleton

Author the project config inline (these files are **not** in `templates/` — generate them for the pinned stack):

- `package.json` with all deps: React 19, Vite 8, MUI 6, React Router 6 (data router), TanStack Query 5, Zustand 5, Vitest+RTL+MSW, jest-axe, Playwright, openapi-typescript, openapi-fetch, react-hook-form, zod, ESLint+Prettier, TypeScript.
- `vite.config.ts`, `tsconfig.json`, `tsconfig.node.json`, `index.html`.
- `.env.example` — configured per `CONTRACT_SOURCE` from Step 0:
  - **Variant A:** `VITE_API_BASE_URL=http://localhost:4010`, `CONTRACT_REPO=<user value or {TODO}>`, `CONTRACT_VERSION=<user tag or {TODO}>`, `VITE_MSW_ENABLED=false`
  - **Variant B:** `VITE_API_BASE_URL=http://localhost:8000`, `VITE_OPENAPI_URL=<user URL or {TODO}>`, `VITE_MSW_ENABLED=false`
  - **Variant C:** `VITE_API_BASE_URL=`, `VITE_OPENAPI_URL=<user URL or {TODO}>`, `VITE_MSW_ENABLED=false`
- `.gitignore` (node_modules, dist, .env, coverage, playwright-report, .claude/memory/).
- `eslint.config.js`, `.prettierrc`.
- `README.md` — project README seeded from `templates/PROJECT_README.md` (fill `{PROJECT_NAME}` / backend).

### Step 2: Create src/ shell

```
src/
  main.tsx
  app/
    App.tsx
    router.tsx        # React Router 6 data router (createBrowserRouter)
    providers/        # QueryClientProvider, ThemeProvider, etc.
    guards/           # route guards (auth/role)
  theme/
    theme.ts          # MUI createTheme
  lib/
    api/
      client.ts       # openapi-fetch client, base URL from env, auth injection
      schema.d.ts     # generated TypeScript types from openapi-typescript
    query/
      queryClient.ts  # TanStack QueryClient singleton + defaults
    auth/
      authStore.ts    # Zustand auth store (in-memory tokens)
  components/         # shared, generic presentational components
  features/
    example/
      ExamplePage.tsx
      ExamplePage.test.tsx  # RED test first
      index.ts
  mocks/
    handlers.ts       # MSW handlers
    browser.ts        # MSW browser worker
  test/
    server.ts         # MSW node server (Vitest)
    setup.ts          # test setup
```

### Step 3: Write the example feature RED→GREEN

Delegate to `tester` to write a failing test for `ExamplePage` (renders heading, accessibility pass with jest-axe), then to `react-developer` to implement the component to green.

### Step 4: Playwright e2e skeleton

```
e2e/
  example.spec.ts    # basic smoke: page loads, heading visible
playwright.config.ts
```

### Step 5: Gate scripts

Copy the gate + helper scripts from the template root `scripts/` (the template ships them there; `scripts/install.sh` seeds the full set into a new project):

- `scripts/check_types_drift.sh`
- `scripts/check_contract_sync.sh`
- `scripts/check_stubs.sh`
- `scripts/check_file_size.sh`
- `scripts/check_feature_readmes.sh`
- `scripts/check_bundle_size.sh`
- `scripts/check_plan_sync.sh`
- `scripts/check_routes_registry.sh`
- `scripts/check_guides_sync.sh`
- `scripts/detect-env.mjs`
- `scripts/log-cmd.mjs`
- `scripts/session-start.sh`
- `scripts/api-pull.mjs`

### Step 6: CI workflow

Copy `templates/.github/workflows/frontend-ci.yml` → `.github/workflows/frontend-ci.yml`. Must run: npm audit (high), typecheck, lint, check_file_size, check_stubs, check_feature_readmes, check_types_drift, check_contract_sync, check_plan_sync, check_routes_registry, check_guides_sync, test:cov, build, check_bundle_size, then Playwright e2e.

For **Variant B or C**: note in the PR that `check_contract_sync.sh` should be disabled or adapted — it validates a GitHub raw source, which does not apply when the schema comes from a running backend.

### Step 7: docs/ skeleton

```
docs/
  PROJECT.md          # {TODO: fill via /synthesize-brief}
  WORKLOG.md          # session log skeleton
  STUBS.md            # empty ledger (header row only, no example rows)
  HANDOFF.md          # copied from templates/HANDOFF.md (seed snapshot; refreshed by /handoff & /wrap-up)
  todo.md             # copied from templates/todo.md (cross-session backlog)
  api/
    INDEX.md          # endpoint index, seeded from templates/api_INDEX.md (empty until first feature)
    CONTRACT_ISSUES.md # contract bug/proposal ledger (empty until needed)
  verify/             # (empty until first feature)
  guides/
    user.md           # copied from templates/guides_user.md with {TODO} markers
    developer.md      # copied from templates/guides_developer.md with {TODO} markers
  decisions/
    0001-stack.md     # ADR: why React 19 + MUI + TanStack Query
  plans/              # (empty)
```

### Step 8: CLAUDE.md

Seed `CLAUDE.md` from the template root (`scripts/install.sh` copies it), filling in the project name and repo URL. Ensure all rule imports are present.

### Step 9: Pull backend OpenAPI schema

Behaviour depends on `CONTRACT_SOURCE` from Step 0.

**Variant A (own contract repo)** — if `CONTRACT_REPO` and `CONTRACT_VERSION` are filled in (not `{TODO}`):

```bash
npm install
npm run api:pull      # fetches GitHub raw at CONTRACT_VERSION tag
npm run api:types
```

Commit the generated `src/lib/api/openapi.yml` + `src/lib/api/schema.d.ts`.

If either value is still `{TODO}`, skip this step — run `api:pull`/`api:types` once the contract repo exists and both values are filled in `.env`.

**Variant B (own Django/DRF backend)** — if `VITE_OPENAPI_URL` is set and the backend is running:

```bash
npm install
curl -fsSL "$VITE_OPENAPI_URL" -o src/lib/api/openapi.yml
npm run api:types
```

If the backend is not yet running, skip this step and leave `src/lib/api/openapi.yml` as a `{TODO}` placeholder; types cannot be generated until the schema is available.

**Variant C (custom)** — same as Variant B but with the user-supplied `VITE_OPENAPI_URL`. Skip if the URL is not yet available.

### Step 10: The ONE allowed bootstrap commit

```bash
git add -A
git commit -m "chore: bootstrap claude-react-mui scaffold"
git push -u origin main
```

This is the documented exception in `@.claude/rules/git-operations.md`. After this commit, branch protection is enabled and all future work goes through PRs.

### Step 11: Enable branch protection

```bash
gh api repos/{owner}/{repo}/branches/main/protection \
  --method PUT \
  --input - <<JSON
{
  "required_status_checks": {"strict": true, "contexts": ["ci"]},
  "enforce_admins": false,
  "required_pull_request_reviews": {"required_approving_review_count": 1},
  "restrictions": null
}
JSON
```

Note: on free+private repos the API returns 403 — that is EXPECTED. Keep PR-only by discipline.

### Step 12: Report

Summarize what was created, including the chosen contract variant (A / B / C) and any manual steps remaining. For Variant A with `{TODO}` placeholders: fill `CONTRACT_REPO` and `CONTRACT_VERSION` in `.env`, then run `npm run api:pull && npm run api:types`. For Variant B / C, note the manual schema-pull command and the CI gate advisory. Recommend: `/synthesize-brief` (if a brief doc exists in `docs/`) → `/preflight` → first feature via the pipeline.

## Mode B — Resume / existing-incomplete

1. Audit what exists vs what the scaffold requires (Scope 3 of `/doctor`).
2. For each missing piece, open a separate PR:
   - Branch: `chore/add-<piece>` (e.g., `chore/add-gate-scripts`, `chore/add-ci`).
   - PR per missing artifact — never bundle unrelated missing pieces.
3. Never push to `main` in Mode B.

## Constraints

- Never commit secrets or `.env`.
- Never run `npm run dev` or start a dev server — write files only.
- Never invent endpoints or components beyond the minimal scaffold.

<!-- last reviewed: 2026-06-10 -->
