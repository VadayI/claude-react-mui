Scaffold a new Vite+React+TS+MUI project from templates (Mode A) or PR each missing piece into an existing incomplete project (Mode B). Binary command — NOT part of the feature pipeline.

## Execution contract

This is the complete canonical bootstrap procedure for Claude and Codex. Use the
current request as input and supported runtime question/delegation tools; names
from legacy examples are descriptive, not cross-runtime APIs. A coordinator
remains read-only under D02 and delegates scaffolding to workers. If delegation
is unavailable, provide a separate worker invocation with artifact handoff.

P04 integrates delivery; P05 runner and P06 CI materialization are still pending.
Until those exist, bootstrap may prepare local files, but MUST NOT activate
workflows, create/push a remote or configure required hosted checks. Report these
steps NOT_VERIFIED. Keep all check requirements below for the later runner.

## Step 0 — Output language (before anything else)

Respect the language already selected by the user. Check the persisted one with
`python scripts/ai/project_state.py --root . --language`; move a legacy
`.claude/rules/output-language.md` with `--language --apply` (it leaves a
pointer). If a new persisted preference is needed, write only the project-owned
`docs/ai/overrides/output-language.md` from `templates/output-language.md`;
AGENTS.md makes Claude and Codex read it. Never reseed CLAUDE.md or restore
legacy rule imports, and never keep two writable language preferences.

## Pre-flight hard gates

Before doing ANYTHING:

1. Run `node scripts/session-start.mjs` explicitly (shared detector + stack probe), then read the fresh `.ai-runtime/env-detect.json`. If `platform_supported: false` → **HARD STOP: UNSUPPORTED_PLATFORM** — on native Windows install **Git for Windows** (`winget install Git.Git`) so the bash hooks/gates run, or use WSL2. If `wrong_runner_suspected: true` (a Windows runner launched from inside WSL2) → **WARN**, do not hard-stop: ask the user to pick one environment (WSL2-native `claude`, or native Windows from Git Bash), then continue.
2. If `node_supported: false` or Node < 24 → **HARD STOP: NO_NODE**. Instruct `nvm install --lts`.
3. Check GitHub access only when remote work is needed. Missing hosted access does not block local scaffolding. P06 is required before the first remote push.

## Mode detection

- **Mode A (fresh)**: `package.json` does not exist in the project root. Scaffold from scratch.
- **Mode B (resume)**: `package.json` exists but some pieces are missing. PR each missing piece separately.

Present the detected mode. Continue within existing authorization; ask only for missing project choices.

## Mode A — Fresh scaffold

### Step 0: Contract source

Before creating any files, ask how THIS project gets its OpenAPI contract.

> Note: `VadayI/claude-api-contract` and `VadayI/claude-django` are **reference templates** — examples of how to structure a contract repo or a Django/DRF backend. For a real project you point at your **own** repo or backend, structured like those templates.

Use the available runtime question capability:

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
- `check_contract_sync.sh` currently assumes GitHub raw. URL integrity needs the P05 source resolver; record NOT_VERIFIED until equivalent integrity checks exist, never disable a required gate to claim success.
- Create an ADR in `docs/decisions/` noting that the schema source is the live Django backend.

**Variant C — custom URL:**

- `.env.example` gets: `VITE_API_BASE_URL=` + `VITE_OPENAPI_URL=<user-provided URL or {TODO}>`
- Same `api:pull` note as Variant B — use `curl` or adapt `scripts/api-pull.mjs`.
- Keep contract integrity mandatory. P05 must supply an equivalent URL-source integrity check; until then this variant remains NOT_VERIFIED.

### Step 1: Create project skeleton

Author the project config inline (these files are **not** in `templates/` — generate them for the pinned stack):

- `package.json` with all deps: React 19, Vite 8, MUI 9, React Router 7 (data router), TanStack Query 5, Zustand 5, Vitest+RTL+MSW, jest-axe, Playwright, openapi-typescript, openapi-fetch, react-hook-form, zod, i18next 26.4.2, react-i18next 17.0.14, ESLint+Prettier, TypeScript.
- `vite.config.ts`, `tsconfig.json`, `tsconfig.node.json`, `index.html`.
- `.env.example` — configured per `CONTRACT_SOURCE` from Step 0:
  - **Variant A:** `VITE_API_BASE_URL=http://localhost:4010`, `CONTRACT_REPO=<user value or {TODO}>`, `CONTRACT_VERSION=<user tag or {TODO}>`, `VITE_MSW_ENABLED=false`
  - **Variant B:** `VITE_API_BASE_URL=http://localhost:8000`, `VITE_OPENAPI_URL=<user URL or {TODO}>`, `VITE_MSW_ENABLED=false`
  - **Variant C:** `VITE_API_BASE_URL=`, `VITE_OPENAPI_URL=<user URL or {TODO}>`, `VITE_MSW_ENABLED=false`
- Preserve the delivered `.gitignore`; merge missing node/build/coverage and `.ai-runtime/` exclusions. Do not ignore `docs/project-state/` (versioned, project-owned registries); a legacy `.claude/memory/` keeps only its runtime entries ignored until `python scripts/ai/project_state.py --root . --apply` migrates it.
- `eslint.config.js`, `.prettierrc`.
- `README.md` — project README seeded from `templates/PROJECT_README.md` (fill `{PROJECT_NAME}` / backend).

### Step 2: Create src/ shell

```
src/
  main.tsx
  app/
    App.tsx
    router.tsx        # React Router 7 data router (createBrowserRouter)
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

### Step 2b: Install the tested translation seed

Require Python 3.13+ for template tooling. Run `python scripts/seed-i18n.py --target .`
to deliver manifest-verified `src/lib/i18n.ts` and English/Ukrainian namespaces.
A differing project file is a conflict: retain it and prepare a reviewed adaptation,
never overwrite. See `templates/i18n/README.md`. Add i18next 26.4.2 and
react-i18next 17.0.14 to package.json and regenerate the lock with npm.
Wrap the app in I18nextProvider and initialize i18n in test setup. Feature strings,
client validation and accessible labels belong in resources; test two locales with axe.
Copy `templates/.performance-budget.json` for new projects (initial JS 200 KiB,
explicit user decision 2026-09-20); preserve existing projects' budgets on update.

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

Before the first push, run `python scripts/ai/install.py --target . --ci-mode local --apply` (recommended) or choose `github`. The installer saves the choice in `docs/project-state/project.json` and materializes `.github/workflows/frontend-ci.yml` from the inert template. Local mode has only `workflow_dispatch`; GitHub mode adds push, pull request and merge group events. Both invoke `scripts/ai/runner.py` with `templates/ai/checks/react.json`. Review the active workflow and selected project setting before creating the remote. A later explicit `--ci-mode` switches only an unchanged owned workflow; foreign workflows remain untouched and create a conflict.

After `git init`, connect `.githooks` with `python scripts/ai/install_git_hooks.py --target . --apply`. The connector refuses to replace an existing `core.hooksPath` or non-sample default hook; review a manual chain instead. Use `AI_PYTHON` for a Python 3.13+ interpreter. The pre-push hook needs a named remote and current tracking `main` to verify a new branch's fork point; first push with no baseline remains unverified and stops.

For **Variant B or C**: report the missing equivalent URL-source integrity check as NOT_VERIFIED; the existing GitHub-source gate cannot prove integrity for a live URL.

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
    0001-stack.md     # the new project's own first ADR (numbering restarts per project): why React 19 + MUI + TanStack Query
  plans/              # (empty)
```

### Step 8: Preserve the delivered shared runtime

The installer already delivers AGENTS.md, the thin generated CLAUDE.md,
`docs/ai/`, `.agents/skills/`, `.codex/agents/`, schemas and portable launchers.
Do not reseed, replace, personalize or add legacy rule imports to CLAUDE.md.
Project identity and notes belong in project docs; additions to AGENTS.md or
runtime settings require an explicit diff preserving existing content.
Run `python scripts/ai/core_sync.py --target . --check` and
`python scripts/ai/generate_adapters.py --root . --check`. A conflict is a review
item, never a reason to force generation. Keep scripts/templates/runtime sources
for autonomous operation and repeatable updates; do not delete them after bootstrap.

### Step 9: Pull the contract OpenAPI schema

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

If the backend is not yet running, defer this step and report NOT_VERIFIED; do not write an invalid placeholder OpenAPI file or fabricate generated types.

**Variant C (custom)** — same as Variant B but with the user-supplied `VITE_OPENAPI_URL`. Skip if the URL is not yet available.

### Step 10: Prepare the first commit

Inspect staged/unstaged/untracked paths and stage only explicit scaffold-owned
files; never `git add -A`. Exclude secrets and unrelated work. Run available
checks and record missing prerequisites honestly. Preserve the one-shot fresh
bootstrap main exception from `docs/ai/rules/git-operations.md`, but do not use it
until P05 exact-candidate checks and P06 CI choice/materialization are available.
Later Mode B work always uses branches and PRs. Merge still needs a user command.

### Step 11: Branch settings after P06

Do not configure required statuses from guessed names such as `ci`. Local mode
must not require hosted statuses; GitHub mode uses verified actual runner check
contexts. Preserve existing custom branch policy and report inaccessible settings.
No branch-protection writes are part of this P04 scaffold step.

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

<!-- last reviewed: 2026-09-20 -->
