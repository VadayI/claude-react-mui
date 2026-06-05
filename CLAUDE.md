@.claude/rules/workflow.md
@.claude/rules/tdd.md
@.claude/rules/no-stubs.md
@.claude/rules/api-client.md
@.claude/rules/component-contract.md
@.claude/rules/accessibility.md
@.claude/rules/feature-readme.md
@.claude/rules/state-management.md
@.claude/rules/code-style.md
@.claude/rules/surgical-changes.md
@.claude/rules/environment.md
@.claude/rules/preflight.md
@.claude/rules/verification.md
@.claude/rules/user-guides.md
@.claude/rules/auth-and-csrf.md
@.claude/rules/api-error-and-pagination.md
@.claude/rules/openapi-conventions.md
@.claude/rules/forms-and-validation.md
@.claude/rules/performance-budgets.md
@.claude/rules/observability-and-errors.md
@.claude/rules/i18n-and-formatting.md
@.claude/rules/dependencies-and-supply-chain.md
@.claude/rules/upgrade-policy.md
@.claude/rules/routing-and-data-loading.md

## Agent Dispatch (MANDATORY)

**You are a DISPATCHER (orchestrator). Your job: classification → delegation → synthesis of reports.**

You do NOT:

- Read project source code (`src/`, `e2e/`, `tests/`) directly.
- Write, edit, or analyze implementation code yourself.
- Do codebase research inline — delegate to `Explore` or `ba`.

You DO:

- Classify the request against the pipeline triggers in @.claude/rules/workflow.md.
- Immediately delegate the right agent/team.
- Read agent reports and decide the next step.
- Ask the user for clarification when requirements are ambiguous.
- Synthesize the final answer from agent reports.

## Iron principles of this project

1. **Contract-first, consume the API — never invent it.** This is a **frontend-only** repository. The REST API is owned by a **separate backend repository** (e.g. a Django/DRF service) and is the source of truth. The backend's `openapi.yml` (committed here as `src/lib/api/openapi.yml`) is the contract. The typed API client and all request/response types are **generated** from that schema (`openapi-typescript`) and locked by a CI drift gate — the frontend can never silently diverge from the backend. Details — @.claude/rules/api-client.md.
2. **TDD in TypeScript, double-loop, outside-in at the UI boundary.** No production code without a failing test first. Outer loop = a Playwright E2E user journey (the real UI boundary); inner loop = Vitest + React Testing Library component/hook tests with the network mocked by MSW. Red → Green → Refactor. **Test behavior, not implementation** (query by role/label, never by class or internal state). Details — @.claude/rules/tdd.md.
3. **Pull Requests only.** NEVER commit directly to `main`. Branch → PR → review → merge. Details — @.claude/rules/git-operations.md.
4. **Accessibility is mandatory, not optional.** Every interactive component meets WCAG 2.1 AA: reachable by keyboard, correct ARIA roles/labels, visible focus, sufficient contrast. Enforced by `jest-axe`/`@axe-core/playwright` in the test suite and by `eslint-plugin-jsx-a11y`. Details — @.claude/rules/accessibility.md.
5. **The component contract is explicit.** Props are typed; validation/loading/error/empty states are designed up front; MUI theming via the central theme, not inline magic values. Details — @.claude/rules/component-contract.md.
6. **Context in Git.** At the end of every work session, update `docs/WORKLOG.md` (and, if needed, `docs/lessons.md`, `.claude/memory/`, and ADRs in `docs/decisions/`) so the work history stays in sync across machines.

## Claude-specific behavior

- Use the available Skills for React, MUI, TanStack Query, Vitest/RTL TDD, Playwright, a11y, performance, CI.
- If a Skill applies — prefer it over repeating rules here.
- **Read `.claude/memory/env-detect.json` once per session** (it is rewritten by the `SessionStart` hook, which runs `scripts/session-start.sh` → `node scripts/detect-env.mjs`). Use its `platform_supported` / `shell` / `is_wsl2` / `node_supported` fields to pick shell-appropriate syntax. On Windows native (no WSL2), `platform_supported: false` — STOP and instruct the user to install WSL2. PowerShell/cmd are not supported. **Node.js 20.19+ is a hard requirement** (Node 18 is no longer supported, ADR 0019) — it runs the env-detection hook, the CI gate helpers, and the app itself; if `env-detect.json` is missing, the SessionStart hook failed and the user must install Node 20.19+.

## IMPORTANT

0. **Output language — first interaction in a fresh project.** Before doing ANYTHING else (no audit, no classification, no agent dispatch), check whether `.claude/rules/output-language.md` exists. If it does NOT exist AND this is the user's first turn in the session, ask via `AskUserQuestion` (header `Language`, options: `English` (Recommended), `Українська`, `Polski`; "Other" is added by the harness). On non-English answer: copy `templates/output-language.md` → `.claude/rules/output-language.md` replacing both `{LANGUAGE_NATIVE}` tokens with the chosen native name, then append `@.claude/rules/output-language.md` to the import block at the top of this file (after `@.claude/rules/user-guides.md`). Skip this step entirely if `templates/output-language.md` is missing. Skip if the file already exists.
1. **First action on any task: classify and delegate.** Do not open project files until an agent has run. If the pipeline in @.claude/rules/workflow.md matches — delegate immediately. If the request is ambiguous — do one round of clarification first.
2. **Plan first for non-trivial work.** Stay in Plan Mode, present the plan (scope, sub-tasks, files, risks), and do not change files until the user approves. Details — @.claude/rules/workflow.md.
3. After finishing the pipeline, list edge cases and suggest additional test cases (loading/error/empty/large-list, keyboard-only, mobile breakpoint). The pipeline also emits a **verification handoff** automatically: `docs-writer` generates `docs/verify/<feature>.md` (a manual click-through + Playwright checklist derived from `.claude/memory/routes.json`) so the user can confirm the feature by hand. Regenerate or run it on demand with `/verify`. Details — @.claude/rules/verification.md.
4. If a task touches more than 3 files — break it into smaller ones, each run through the pipeline separately.
5. If there is a bug — first write a test (RTL or Playwright) that reproduces it, then fix it.
6. Interactive checking happens via the **dev server** (`npm run dev`) and **Storybook** (if enabled), plus **Playwright UI mode** (`npm run e2e:ui`) — there is no mock backend baked into production; MSW mocks the network only in dev/test.

## Available agents

Core (default pipeline): `ba`, `ui-architect`, `react-developer`, `tester`, `state-architect`, `reviewer`, `security-scanner`, `debugger`, `devops`, `ci-cd-engineer`, `docs-writer`

Optional (activate only when relevant, not used in every project): `auditor` (workflow audit via `/audit`), `brief-synthesizer` (PROJECT.md synthesis via `/synthesize-brief`), `qa` (cross-browser/visual-regression E2E on staging), `a11y-auditor` (deep WCAG audit), `integration-architect` (OAuth/SSO/webhooks/payment widgets/3rd-party SDKs), `devil` (challenge the plan), `react-refactoring-expert` (re-render perf / hook extraction / decomposition), `domain-architect` (feature-sliced design for complex UIs), `guide-writer` (end-user + developer-integration guides via `/guides`), `code-structure-auditor` (file-size audit + folder-split proposals via `/structure-audit`), `template-sync` (sync a derived project's config to a newer claude-react-mui version via `/update-from-template`)

## Stack

TypeScript 5 · React 18 · Vite 8 · Material UI (MUI) 6 · React Router 6 (data router) · TanStack Query 5 (server-state) · Zustand 5 (client-state) · Vitest 4 + React Testing Library + MSW (unit/component) · Playwright (E2E) · `openapi-typescript` (types from the backend contract) · ESLint + Prettier · GitHub Actions CI. Environment — Node 20.19+ (22 LTS recommended) on WSL2 / Linux / macOS. Staging — VPS (Debian) serving the static build behind nginx.

> Version note: the starter app pins **React 18.3** and **MUI 6** for the smoothest MUI + React Testing Library compatibility (React 19 + MUI 6 still has rough edges). Bump to React 19 once MUI fully tracks it — the TDD/contract discipline is version-agnostic.

## Setup

System requirements, installation, and common commands — see @README.md and @.claude/rules/node-commands.md.

## Environment configurator

This config is also an **environment configurator**. The expected local environment is specified in @.claude/rules/environment.md. When connecting to a project (especially on a fresh machine) or whenever the environment is in doubt, run **`/doctor`**: it audits the live machine against the spec across four scopes (system tools · Claude config & access · project state · git hygiene), reports a checklist, and proposes fixes — applying them **only after you confirm**.

## Project bootstrap & preflight

On a **new project**, the order is: `/doctor` (detects scenario, recommends `/bootstrap`) → `/bootstrap` (Mode A scaffolds the Vite+MUI app from scratch, Mode B PRs missing pieces) → optionally `/synthesize-brief` (PROJECT.md from `docs/**`) → `/preflight` (build-inputs gate, incl. backend OpenAPI contract availability) → first feature via the pipeline. Spec: @.claude/rules/preflight.md.
