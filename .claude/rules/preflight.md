# Project kickoff preflight (hard gate)

Before agents start work on a (new) project — and before the first feature pipeline — verify that the inputs and access needed to build correctly are present. This is a **hard gate**: if a critical item is missing, agents do NOT start coding; the orchestrator stops and either asks the user or fixes access. Runs automatically at project kickoff and on demand via `/preflight`.

## What to verify (all CRITICAL)

1. **Project brief / description.** A clear statement of what we are building: goals, scope, target users, key screens/flows. Source: `docs/PROJECT.md`, a README brief, or a description the user provided. If absent or vague → STOP and ask — `ba` cannot write meaningful user stories without it.
2. **Tech stack.** Declared (CLAUDE.md / README: React · Vite · TypeScript · MUI · TanStack Query · Zustand · Vitest/RTL/MSW · Playwright) and dependencies resolvable (`package.json` present; versions consistent). If undeclared or contradictory → STOP and confirm.
3. **Contract available.** Both `CONTRACT_REPO` and `CONTRACT_VERSION` are set (in `.env` or environment) and `src/lib/api/openapi.yml` is present. The contract is vendored from the project's own contract repo (`CONTRACT_REPO`, structured like `VadayI/claude-api-contract`) at the pinned tag — run `npm run api:pull` to fetch it, then `npm run api:types` to regenerate types. The contract-sync gate (`scripts/check_contract_sync.sh`) must be GREEN before any feature pipeline starts. If the contract is missing or either variable is unset → STOP: the UI would be coded against an imagined API. (@.claude/rules/api-contract.md.)
4. **Design references (recommended).** A prototype folder in `docs/design/`, a **running design URL** (opened in a browser via the `playwright` MCP), Figma/brand/theme tokens, or at least a description of look & feel — recorded in `docs/PROJECT.md` § Design reference together with the **fidelity level** (L1–L4, default L3), so `ui-architect` and the theme are grounded. If a running design URL is declared, verify it is reachable and the `playwright` plugin is enabled (declared-but-unreachable → ⚠️, fall back to folder/brief). If absent entirely, note that the UI will follow MUI defaults and proceed. (@.claude/rules/design-reference.md)
5. **Library docs access — Context7.** The `context7` MCP is reachable so agents can check current React/MUI/Query APIs before implementing. If down → STOP, or proceed only on explicit user override (noting APIs will be unverified against current docs).
6. **GitHub project access.** `gh auth status` authenticated AND repo reachable (`gh repo view`), so PRs, CI, and history work. `GITHUB_PERSONAL_ACCESS_TOKEN` set. If no access → STOP.

## Gate behavior

- Items 1, 2, 3, 5, 6 are blockers. Item 4 is a strong recommendation (proceed with MUI defaults if absent). If any blocker is ❌ → report the readiness checklist and STOP before dispatching `ba` / the feature pipeline.
- Context7 may be waived only on **explicit** user override; record that implementation relies on training knowledge, not current docs.
- Never start writing components, hooks, or the API client while a CRITICAL item is ❌.

## Who runs it

- The **orchestrator** runs preflight at project kickoff, delegating access checks (Context7, GitHub, contract availability, stack deps) to `devops` and brief/stack comprehension to `ba`.
- `ba` confirms it has a usable brief + an unambiguous declared stack BEFORE producing user stories.
- The `/preflight` command runs the same check on demand.

## Relation to `/doctor`

`/doctor` checks the **environment** (tools, services, git hygiene). Preflight checks the **inputs to build** (brief, stack, contract pin, design refs, docs/GitHub access). On a fresh machine run `/doctor` first, then preflight before the first feature.
