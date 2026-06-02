---
model: sonnet
---
Diagnose failing GitHub Actions runs for the current branch, classify the failure type, and delegate the fix through the appropriate agent. PR-only — never touches `main`.

## Log
```bash
node scripts/log-cmd.mjs /fix-ci "$ARGUMENTS"
```

## Steps

### 1. Branch guard
```bash
git branch --show-current
```
If on `main` → STOP: fixes go on a feature branch, not `main`.

### 2. Identify the failing run
```bash
gh run list --branch "$(git branch --show-current)" --limit 5
gh pr checks
```
Pick the most recent failed run. Read its logs:
```bash
gh run view <run-id> --log-failed
```
If `$ARGUMENTS` contains a run ID, use that run instead.

### 3. Classify the failure
Map the log output to one of these categories:
- **typecheck** — TypeScript errors (`tsc` / `npm run typecheck`).
- **lint** — ESLint or Prettier errors (`npm run lint`).
- **unit-test** — Vitest failures (`npm run test:run`).
- **e2e** — Playwright failures (`npm run e2e`).
- **types-drift** — `check_types_drift.sh` failed; generated types out of sync with OpenAPI schema.
- **stubs** — `check_stubs.sh` found unlogged stubs.
- **file-size** — `check_file_size.sh` file over 400-line limit.
- **feature-readme** — `check_feature_readmes.sh` missing README.

### 4. Delegate the fix

| Classification | Agent | Action |
|---|---|---|
| typecheck | `react-developer` | Fix TS errors, re-run typecheck |
| lint | `react-developer` | Fix lint/format issues |
| unit-test | `tester` + `react-developer` | Root-cause failing test; fix code or test |
| e2e | `qa` + `react-developer` | Root-cause Playwright failure; fix component or selector |
| types-drift | `react-developer` | Run `npm run api:pull && npm run api:types`, commit updated types |
| stubs | `react-developer` | Remove or log stubs per `@.claude/rules/no-stubs.md` |
| file-size | `code-structure-auditor` | Propose split; `react-developer` executes |
| feature-readme | `docs-writer` | Add missing `README.md` to the feature folder |

### 5. Verify fix locally
After delegated fix, run the specific failing check locally and confirm it passes before pushing:
```bash
npm run typecheck && npm run lint && npm run test:run
bash scripts/check_types_drift.sh && bash scripts/check_stubs.sh
```

### 6. Push and re-check
```bash
git push
gh run watch
```
Report final CI status.

<!-- last reviewed: 2026-06-02 -->
