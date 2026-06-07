---
name: github-actions-frontend
description: GitHub Actions CI for the React+MUI stack — install, typecheck, lint, vitest, build, Playwright, gate scripts — activate for CI work.
---

# GitHub Actions Frontend CI

Reference: `@.claude/rules/node-commands.md`

## Job overview

| Job         | Runs                               | Blocks merge |
| ----------- | ---------------------------------- | ------------ |
| `install`   | npm ci + cache                     | all others   |
| `typecheck` | tsc --noEmit                       | yes          |
| `lint`      | eslint (incl. jsx-a11y) + prettier | yes          |
| `test`      | vitest --coverage + gate scripts   | yes          |
| `build`     | vite build                         | yes          |
| `e2e`       | playwright (all browser projects)  | yes          |

## Representative workflow

```yaml
# .github/workflows/frontend-ci.yml
name: Frontend CI

on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

jobs:
  install:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci

  typecheck:
    needs: install
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20', cache: 'npm' }
      - run: npm ci
      - run: npx tsc --noEmit

  lint:
    needs: install
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20', cache: 'npm' }
      - run: npm ci
      - run: npx eslint . --max-warnings=0
      - run: npx prettier --check .

  test:
    needs: install
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20', cache: 'npm' }
      - run: npm ci
      - run: npx vitest run --coverage
      - run: bash scripts/check_stubs.sh
      - run: bash scripts/check_file_size.sh
      - run: bash scripts/check_feature_readmes.sh
      - run: bash scripts/check_types_drift.sh
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: coverage
          path: coverage/

  build:
    needs: install
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20', cache: 'npm' }
      - run: npm ci
      - run: npm run build

  e2e:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20', cache: 'npm' }
      - run: npm ci
      - run: npx playwright install --with-deps chromium firefox
      - run: npx playwright test
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

## Gate scripts (check before pushing)

```bash
bash scripts/check_stubs.sh          # no STUB: markers in src/ outside tests
bash scripts/check_file_size.sh      # no src/ .ts/.tsx file over 800 lines
bash scripts/check_feature_readmes.sh # every src/features/<name>/ has README.md
bash scripts/check_types_drift.sh    # regenerate schema.d.ts and diff — fail on drift
```

## Local commands

```bash
npm run typecheck       # tsc --noEmit
npm run lint            # eslint + prettier check
npm run test            # vitest run
npm run test:watch      # vitest watch
npm run test:coverage   # vitest run --coverage
npm run e2e             # playwright test
npm run e2e:ui          # playwright test --ui
npm run build           # vite build
```

## Coverage thresholds (vitest.config.ts)

```ts
coverage: {
  provider: 'v8',
  thresholds: { lines: 80, functions: 80, branches: 70, statements: 80 },
  exclude: ['src/api/schema.d.ts', '**/*.stories.*', 'src/mocks/**'],
}
```

<!-- last reviewed: 2026-06-02 -->
