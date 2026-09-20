# Orchestration — coordinator scope only

Read this procedure only when explicitly coordinating a multi-role task. It does
not turn workers, reviewers, or separately invoked procedures into coordinators.

The coordinator classifies, delegates, tracks plans and synthesizes reports.
It never implements source, tests or configuration, including trivial edits.
D02 permits read-only verification of exact repo-contained non-secret file paths
and evidence ranges named in role reports. Do not follow other source references,
search broadly, or edit code. Return insufficient evidence to the reporting role.
Read shared rules, role reports, project settings, plans and HANDOFF as needed.
Git status/log/diff and remote/PR status are read-only inspection, not implementation.

Use native delegation when available. Otherwise schedule separate role invocations
with explicit input/output artifacts. Do not call a coordinator implementing code
"fallback" or claim independent review from one session. If separate role execution
is unavailable, report it and give the role entry point for a separate session.
Workers read their own role contract and required rules, then implement within scope.
Reports include revision, exact files/lines, changes, checks, limitations, next action.
Use inherited/user model settings. Merge only after an explicit user command (D01).

## First action: triage (MANDATORY)

Your first action on ANY request is classification, not exploration. Read only the user's message.

Decision tree:

1. Trivial? Delegate a bounded task to the matching worker; the coordinator does not implement config changes.
2. Bug report? → `debugger` pipeline.
3. Infra/CI/Docker/deploy? → `devops` / `ci-cd-engineer` pipeline.
4. Feature / component / screen / "add X" / "change Y"? → feature pipeline, start with `ba`.
5. Requirements ambiguous? → ONE round of the runtime user-question capability, then pipeline.
6. Research question ("how does X work in this codebase?") → `Explore`.

## Project bootstrap & preflight (MANDATORY hard gates)

On a **new project**, the orchestrator's first action depends on detected state (use `/doctor` to find out):

1. `/doctor` — detect scenario (`fresh` / `existing-incomplete` / `active` / `no-config`) and recommend the next command.
2. `/bootstrap` — execute scaffold (Mode A: fresh Vite+MUI app) or PR each missing piece (Mode B: resume). `/bootstrap` is a **binary command, NOT part of the feature pipeline**.
3. `/synthesize-brief` (optional but recommended) — synthesize `docs/PROJECT.md` from `docs/**`. Run AFTER placing brief/design refs/PDFs into `docs/`, BEFORE `/preflight`.
4. `/preflight` — build-inputs gate before the first feature (brief, stack, **OpenAPI contract reachable**, design references, GitHub access).
5. Standard feature pipeline (`ba → ui-architect → ...`).

## Plan Mode (default for non-trivial tasks)

For any non-trivial task (3+ steps, an architectural decision, or touching >2 files): plan before changing anything.

1. Prepare the plan before implementation.
2. Produce a plan: scope, sub-tasks, affected files, risks, open questions.
3. If anything is unclear or the plan breaks — stop and re-plan (clarify via the runtime user-question capability).
4. An explicitly requested implementation of an accepted plan is already authorized; do not ask again. For genuinely unresolved scope, ask once.

Trivial tasks (typo, single config value) skip this.

## Pipeline trigger: REQUIRED if ANY applies

- Creates/changes a React component, page, or route
- Adds/changes a custom hook, a TanStack Query query/mutation, or a Zustand store
- Adds/changes the API client / a generated type / an endpoint the UI consumes
- Adds/changes auth/route-guard logic
- Touches more than 2 files

If none apply (typo, config value) — the pipeline can be skipped.

## Core principles

- **Simplicity First**: every change as simple as possible, minimal blast radius.
- **No Laziness**: find the root cause, no temporary stubs left behind, senior-level standard.
- **Contract-first**: the UI consumes the external `VadayI/claude-api-contract` schema, vendored at the pinned tag; from which the typed client + types are generated and locked by two CI gates. A11y is a first-class requirement, not a nicety.

## Execution model

- **Sequential steps** → the runtime delegation capability with an explicit role (one feeds the next).
- **Parallel phase** → independent role sessions using runtime delegation (2+ with no dependencies between them).

## Standard Feature Pipeline (frontend)

```
ba → ui-architect → tester (RED) → react-developer (GREEN) → tester (REFACTOR-checks)
        → [Quality Gate: reviewer | security-scanner | state-architect] → docs-writer
```

> Phase 6 also emits the **verification handoff** (`docs/verify/<feature>.md`) from `.claude/memory/routes.json` + the component/route contract, per docs/ai/rules/verification.md. Regenerate/run on demand with `/verify`. When a feature changes first-run, auth, a top-level route, or a data-loading flow, `guide-writer` also refreshes `docs/guides/{user,developer}.md` per docs/ai/rules/user-guides.md (regenerate on demand with `/guides`).

| Phase            | Mode         | Agent(s)                                          | Output                                                                                                                                               |
| ---------------- | ------------ | ------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1. Requirements  | sequential   | `ba`                                              | User stories, UX scope, screen/route description, the four UI states                                                                                 |
| 2. UI contract   | sequential   | `ui-architect`                                    | Routes, component tree + props, UI states, consumed endpoints, query keys / store shape, a11y reqs + routes recorded in `.claude/memory/routes.json` |
| 3. RED           | sequential   | `tester`                                          | Failing Playwright journey + failing Vitest/RTL tests with MSW handlers                                                                              |
| 4. GREEN         | sequential   | `react-developer`                                 | Code that greens the tests + eslint/prettier + typecheck                                                                                             |
| 5. Quality Gate  | **parallel** | `reviewer`, `security-scanner`, `state-architect` | Independent reports                                                                                                                                  |
| 6. Documentation | sequential   | `docs-writer` (+ `guide-writer` — optional, when the user/dev surface changed) | feature README, `docs/verify/<feature>.md`, `docs/guides/{user,developer}.md` (when surface changed), WORKLOG, PR description + `gh pr create`       |

**Quality Gate resolution:** all passed → phase 6. Any 🔴 Critical / 🟡 Important → back to `react-developer` → re-run the gate. Max 2 cycles, then escalate to the user.

## Bug Fix Pipeline

```
debugger (root cause) → tester (regression RED) → react-developer (fix GREEN) → reviewer
```

First a test (RTL or Playwright) that reproduces the bug, then the fix. Max 2 fix cycles.

## CI/CD Pipeline

```
ci-cd-engineer / devops → [reviewer | security-scanner]
```

No `tester` for pure infrastructure changes.

## Quick agent routing

| Need                                                   | Agent              |
| ------------------------------------------------------ | ------------------ |
| Business analysis, user stories, UX scope              | `ba`               |
| Routes, component tree, props, UI states contract      | `ui-architect`     |
| React/MUI implementation                               | `react-developer`  |
| Vitest/RTL/MSW + Playwright tests / TDD                | `tester`           |
| TanStack Query keys, cache, Zustand stores, data layer | `state-architect`  |
| Code review before PR                                  | `reviewer`         |
| Security audit (XSS, token handling, deps, CSP)        | `security-scanner` |
| Bug investigation                                      | `debugger`         |
| Docker / nginx / VPS deploy                            | `devops`           |
| GitHub Actions CI                                      | `ci-cd-engineer`   |
| README / component docs / ADR                          | `docs-writer`      |

## Optional agents (opt-in, not every project)

| Need                                                        | Agent                      | Plug into pipeline                                                            |
| ----------------------------------------------------------- | -------------------------- | ----------------------------------------------------------------------------- |
| Cross-browser / visual-regression E2E                       | `qa`                       | post-deploy smoke on staging                                                  |
| Deep WCAG / a11y audit                                      | `a11y-auditor`             | Quality Gate when a feature is interaction-heavy; on demand via `/a11y-audit` |
| OAuth / SSO / webhooks / payment widgets / 3rd-party SDKs   | `integration-architect`    | between `ui-architect` and `react-developer`                                  |
| Challenge the plan / assumptions                            | `devil`                    | planning phase                                                                |
| Re-render perf / hook extraction / decomposition            | `react-refactoring-expert` | standalone, under green tests                                                 |
| User-facing guides (end-user + developer)                   | `guide-writer`             | Documentation phase when surface changed; on demand via `/guides`             |
| File-size audit + folder-split plan                         | `code-structure-auditor`   | standalone, read-only; on demand via `/structure-audit`                       |
| Sync a derived project's config to a newer template version | `template-sync`            | standalone; on demand via `/update-from-template` (PR-only)                   |
| Complex feature-sliced design                               | `domain-architect`         | after `ba`, before `ui-architect`                                             |
