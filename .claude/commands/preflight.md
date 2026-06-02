---
model: sonnet
---
Build-inputs gate per `@.claude/rules/preflight.md` — verify that all inputs needed to build correctly are present before the first feature pipeline runs. Hard gate: if any critical item is missing, do NOT start coding.

## Log
```bash
node scripts/log-cmd.mjs /preflight "$ARGUMENTS"
```

## Steps

Delegate access checks (Context7, GitHub, OpenAPI schema) to `devops` and brief/stack comprehension to `ba`. All four items are CRITICAL blockers.

### 1. Project brief
Confirm a clear statement of what we are building exists: goals, scope, domain, key requirements. Check `docs/PROJECT.md`, any design docs/PDFs in `docs/`, or a description the user provided in this session.
- ✅ Present and clear → proceed.
- ❌ Absent or vague → STOP and ask the user for a brief before dispatching `ba`. Without it `ba` cannot write meaningful user stories or component contracts.

### 2. Tech stack declared
Confirm the stack is declared in `CLAUDE.md` and `package.json` with consistent versions: React 19 · Vite 6 · MUI 6 · TypeScript · React Router 7 · TanStack Query 5 · Zustand 5 · Vitest+RTL+MSW · Playwright. If undeclared or contradictory → STOP and confirm with the user.

### 3. Backend OpenAPI contract reachable
This frontend consumes a backend API. The OpenAPI contract is the primary design input.
- Check `VITE_OPENAPI_URL` is set in `.env`.
- Run `npm run api:pull` (dry-run or real) to confirm the schema URL is reachable.
- If reachable: run `npm run api:types` and confirm `src/lib/api/types.ts` is in sync (`bash scripts/check_types_drift.sh`).
- If unreachable: STOP — OR proceed only on explicit user override (noting that API types will be unverified against the current backend contract). Record the override in `docs/WORKLOG.md`.
- ⚠️ Recommended: design tokens / Figma references in `docs/design/`. Not a hard blocker, but note if absent.

### 4. GitHub project access
- `gh auth status` authenticated.
- `gh repo view` (infer from `git remote get-url origin`) reachable.
- `GITHUB_PERSONAL_ACCESS_TOKEN` env var set (for MCP and `gh` CLI).
- If no access → STOP.

### Report
Print a readiness table: Item → Status (✅/❌/⚠️) → Action. If all ✅ → recommend dispatching `ba` to start the first feature. If any ❌ → STOP with the specific blocker and what the user must provide.

<!-- last reviewed: 2026-06-02 -->
