---
model: sonnet
---
Simplify recent changes without changing behavior, under green tests. Delegates to `react-refactoring-expert` to reduce complexity, remove duplication, and improve readability.

## Log
```bash
node scripts/log-cmd.mjs /simplify "$ARGUMENTS"
```

## Steps

### 1. Confirm tests are green
```bash
npm run test:run
```
If tests are failing → STOP: simplification must happen under a green suite. Fix failing tests first.

### 2. Scope
If `$ARGUMENTS` specifies a file or feature path, scope the simplification there. Otherwise use all files changed since `main`:
```bash
git diff --name-only main..HEAD
```

### 3. Dispatch react-refactoring-expert
Delegate with the scoped file list and these goals (no behavior changes, tests must stay green):

- **Remove duplication** — extract repeated JSX, hooks, or logic into shared utilities or custom hooks.
- **Simplify conditionals** — replace nested ternaries with early returns or helper variables.
- **Reduce component size** — if any component exceeds 150 lines of JSX, propose a split along responsibility seams.
- **Remove dead code** — unused imports, props, variables flagged by TS/ESLint; remove them.
- **Improve naming** — rename unclear variable/component names to better reflect intent.
- **Custom hooks** — extract stateful logic repeated in 2+ components into a `use*.ts` hook.
- **No premature abstraction** — do not introduce new abstractions that are not immediately justified by duplication or complexity.

### 4. Verify after refactor
After `react-refactoring-expert` completes:
```bash
npm run test:run && npm run typecheck && npm run lint
```
All must pass. If any check fails, `react-refactoring-expert` must revert or fix before declaring done.

### 5. Report
List what was simplified (file, what changed, why). Confirm test/lint/typecheck status.

<!-- last reviewed: 2026-06-02 -->
