@.claude/rules/workflow.md
@.claude/rules/tdd.md
@.claude/rules/no-stubs.md
@.claude/rules/api-client.md
@.claude/rules/contract-deviations.md
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
@.claude/rules/auth.md
@.claude/rules/api-error-and-pagination.md
@.claude/rules/openapi-conventions.md
@.claude/rules/forms-and-validation.md
@.claude/rules/performance-budgets.md
@.claude/rules/observability-and-errors.md
@.claude/rules/i18n-and-formatting.md
@.claude/rules/dependencies-and-supply-chain.md
@.claude/rules/upgrade-policy.md
@.claude/rules/routing-and-data-loading.md
@.claude/rules/living-plan.md
@.claude/rules/design-reference.md

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

1. **Contract-first, consume the API — never invent it.** This is a **frontend-only** repository. The REST API contract is owned by the **external `VadayI/claude-api-contract` repository** (Variant A multi-repo model) and is the single source of truth. The contract is vendored here as `src/lib/api/openapi.yml` via `npm run api:pull` (which fetches the pinned `CONTRACT_VERSION` tag from GitHub raw). The typed API client and all request/response types are **generated** from that schema (`openapi-typescript`) and locked by two CI gates: a drift gate and a contract-sync gate. The frontend can never silently diverge from the contract. The backend (`claude-django`) is also a consumer of the contract — it does NOT generate the schema. Details — @.claude/rules/api-client.md.
2. **TDD in TypeScript, double-loop, outside-in at the UI boundary.** No production code without a failing test first. Outer loop = a Playwright E2E user journey (the real UI boundary); inner loop = Vitest + React Testing Library component/hook tests with the network mocked by MSW. Red → Green → Refactor. **Test behavior, not implementation** (query by role/label, never by class or internal state). Details — @.claude/rules/tdd.md.
3. **Pull Requests only.** NEVER commit directly to `main`. Branch → PR → review → merge. Details — @.claude/rules/git-operations.md.
4. **Accessibility is mandatory, not optional.** Every interactive component meets WCAG 2.1 AA: reachable by keyboard, correct ARIA roles/labels, visible focus, sufficient contrast. Enforced by `jest-axe`/`@axe-core/playwright` in the test suite and by `eslint-plugin-jsx-a11y`. Details — @.claude/rules/accessibility.md.
5. **The component contract is explicit.** Props are typed; validation/loading/error/empty states are designed up front; MUI theming via the central theme, not inline magic values. Details — @.claude/rules/component-contract.md.
6. **Context in Git.** At the end of every work session, refresh the context files so the work history stays in sync across machines: `docs/HANDOFF.md` (the rolling "where we are / what's next" snapshot — read FIRST when joining the project, updated LAST), `docs/WORKLOG.md` (the append-only "what we did" chronicle), and, if needed, `docs/todo.md` (cross-session backlog), `docs/lessons.md` (learnings), `.claude/memory/`, and ADRs in `docs/decisions/`. `/wrap-up` regenerates `HANDOFF.md` and persists the rest; `/handoff` refreshes `HANDOFF.md` alone.

## Claude-specific behavior

- Use the available Skills for React, MUI, TanStack Query, Vitest/RTL TDD, Playwright, a11y, performance, CI.
- If a Skill applies — prefer it over repeating rules here.
- A few rules are **reference docs loaded on demand**, not auto-imported in the block above: @.claude/rules/architecture.md, @.claude/rules/mcp-stack.md, @.claude/rules/testing.md (plus @.claude/rules/git-operations.md and @.claude/rules/node-commands.md, referenced on demand). Agents `@`-reference them where relevant. For test policy, @.claude/rules/tdd.md is canonical — `testing.md` is only the quick where/how index.
- **Read `.claude/memory/env-detect.json` once per session** (it is rewritten by the `SessionStart` hook, which runs `scripts/session-start.sh` → `node scripts/detect-env.mjs`). Use its `platform_supported` / `shell` / `is_wsl2` / `is_git_bash` / `sandbox_supported` / `node_supported` fields to pick shell-appropriate syntax. Supported runners: Linux, macOS, WSL2, and **native Windows + Git Bash** (ADR 0028, amending 0005). Only `platform_supported: false` (e.g. Windows with no Git Bash) is a STOP — instruct the user to install Git for Windows, or use WSL2. PowerShell/cmd *alone* are not supported (the hooks/gates are bash). **Node.js 24+ is a hard requirement** (Node 20/22 floor raised, ADR 0023) — it runs the env-detection hook, the CI gate helpers, and the app itself; if `env-detect.json` is missing, the SessionStart hook failed and the user must install Node 24+.
- **Editing files on a WSL2 `/mnt` (9p) mount — never via the `Edit`/`Write` tools.** (Scope: WSL2 `/mnt/c`/`/mnt/d` only — on native Windows NTFS and on native Linux/macOS the `Edit`/`Write` tools are safe.) On a 9p/`/mnt` mount these tools can silently truncate the file tail or write NUL bytes; committing such a file lands a 0-byte / corrupt blob on `main`. Safe loop: write via **bash heredoc → scratch in `/dev/shm` → `cp` to destination → verify**, all in **one** bash call (`cmp scratch dest`, `wc -c`, and a no-NUL check `tr -dc '\000' < dest | wc -c` → must be `0`) — scratch dirs do NOT persist between bash calls and `/tmp` can be unavailable during workspace boot. Never trust the write call's return value; read authoritative content via `git show HEAD:<path>` (a working-tree read can be a stale 9p inode cache). Run `git commit`/`push` and final byte-verification from the **host shell**, never the sandbox (9p can corrupt the `.git` index / `multi-pack-index`).

## IMPORTANT

0. **Output language — first interaction in a fresh project.** Before doing ANYTHING else (no audit, no classification, no agent dispatch), check whether `.claude/rules/output-language.md` exists. If it does NOT exist AND this is the user's first turn in the session, ask via `AskUserQuestion` (header `Language`, options: `English` (Recommended), `Українська`, `Polski`; "Other" is added by the harness). On non-English answer: copy `templates/output-language.md` → `.claude/rules/output-language.md` replacing both `{LANGUAGE_NATIVE}` tokens with the chosen native name, then append `@.claude/rules/output-language.md` to the import block at the top of this file (after the last existing `@.claude/rules/…` import line). Skip this step entirely if `templates/output-language.md` is missing. Skip if the file already exists. (Deterministic owners of this check are `/doctor` and `/bootstrap` Step 0 — the path taken when the first action is a slash command; this IMPORTANT 0 rule is the fallback for a free-form first turn.)
1. **First action on any task: classify and delegate.** Do not open project files until an agent has run. If the pipeline in @.claude/rules/workflow.md matches — delegate immediately. If the request is ambiguous — do one round of clarification first.
2. **Plan first for non-trivial work.** Stay in Plan Mode, present the plan (scope, sub-tasks, files, risks), and do not change files until the user approves. Details — @.claude/rules/workflow.md.
3. After finishing the pipeline, list edge cases and suggest additional test cases (loading/error/empty/large-list, keyboard-only, mobile breakpoint). The pipeline also emits a **verification handoff** automatically: `docs-writer` generates `docs/verify/<feature>.md` (a manual click-through + Playwright checklist derived from `.claude/memory/routes.json`) so the user can confirm the feature by hand. Regenerate or run it on demand with `/verify`. Details — @.claude/rules/verification.md.
4. If a task touches more than 3 files — break it into smaller ones, each run through the pipeline separately.
5. If there is a bug — first write a test (RTL or Playwright) that reproduces it, then fix it.
6. Interactive checking happens via the **dev server** (`npm run dev`) and **Storybook** (if enabled), plus **Playwright UI mode** (`npm run e2e:ui`) — there is no mock backend baked into production; MSW mocks the network only in dev/test. During early development the Prism mock (`npm run mock` in `claude-api-contract`) can serve as the API backend.

## Available agents

Core (default pipeline): `ba`, `ui-architect`, `react-developer`, `tester`, `state-architect`, `reviewer`, `security-scanner`, `debugger`, `devops`, `ci-cd-engineer`, `docs-writer`

Optional (activate only when relevant, not used in every project): `auditor` (workflow audit via `/audit`), `brief-synthesizer` (PROJECT.md synthesis via `/synthesize-brief`), `qa` (cross-browser/visual-regression E2E on staging), `a11y-auditor` (deep WCAG audit via `/a11y-audit`), `integration-architect` (OAuth/SSO/webhooks/payment widgets/3rd-party SDKs), `devil` (challenge the plan), `react-refactoring-expert` (re-render perf / hook extraction / decomposition), `domain-architect` (feature-sliced design for complex UIs), `guide-writer` (end-user + developer-integration guides via `/guides`), `code-structure-auditor` (file-size audit + folder-split proposals via `/structure-audit`), `template-sync` (sync a derived project's config to a newer claude-react-mui version via `/update-from-template`)

## Stack

TypeScript 6 · React 19 · Vite 8 · Material UI (MUI) 9 · React Router 7 (data router) · TanStack Query 5 (server-state) · Zustand 5 (client-state) · Vitest 4 + React Testing Library + MSW (unit/component) · Playwright (E2E) · `openapi-typescript` (types from contract repo `VadayI/claude-api-contract`, NOT backend) · ESLint + Prettier · GitHub Actions CI. Environment — Node 24+ on WSL2 / Linux / macOS. Staging — VPS (Debian) serving the static build behind nginx.

> Version note: **React 19** is now adopted (ADR 0024) and **MUI 9** is now adopted (ADR 0025, supersedes the MUI-6 pin in ADR 0015). MUI 9 officially supports React 19 as a peer; the MUI 6→9 codemod migration (slotProps, sx system props) landed in PR C. The TDD/contract discipline is version-agnostic.

## Setup

System requirements, installation, and common commands — see @README.md and @.claude/rules/node-commands.md.

## Environment configurator

This config is also an **environment configurator**. The expected local environment is specified in @.claude/rules/environment.md. When connecting to a project (especially on a fresh machine) or whenever the environment is in doubt, run **`/doctor`**: it audits the live machine against the spec across four scopes (system tools · Claude config & access · project state · git hygiene), reports a checklist, and proposes fixes — applying them **only after you confirm**.

## Project bootstrap & preflight

On a **new project**, the order is: `/doctor` (detects scenario, recommends `/bootstrap`) → `/bootstrap` (Mode A scaffolds the Vite+MUI app from scratch, Mode B PRs missing pieces) → optionally `/synthesize-brief` (PROJECT.md from `docs/**`) → `/preflight` (build-inputs gate, incl. contract availability from `VadayI/claude-api-contract`) → first feature via the pipeline. Spec: @.claude/rules/preflight.md.
