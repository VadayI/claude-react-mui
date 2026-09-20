# Agent-neutral template implementation — 2026-09-20

Authoritative family scope: IMPLEMENTATION-PLAN-2026-09-20 in the parent workspace.
This document tracks the React slice; completion is evidence-based, not implied
by file creation. Merge requires a user command.

| Phase | State | Evidence / next action |
|---|---|---|
| P00 | In progress | Host Git baseline, two authenticated CLIs, root/nested probes; custom role/hook probes pending |
| P01 Windows | Implemented | Separate Rollup fix 1ee8d60; clean Windows/Linux Node 24 installs and baseline checks |
| P01 i18n | In progress | Two locale resources, 15 behavioral tests; final checks and delivery fixtures pending |
| P02–P03 | Pending | Catalog, 4 role adapters, 3 workflows, behavioral comparisons |
| P04–P13 | Pending | Must follow family dependencies and acceptance criteria |

## Execution log

- 2026-09-20: reproduced EBADPLATFORM in a separate ordinary clone with a space
  in its path; removed direct Linux-only Rollup dependency without unrelated upgrades.
- 2026-09-20: Windows Node 26 and Linux Node 24 baseline checks passed (84 tests).
- 2026-09-20: i18n regression tests introduced before implementation; initial import
  failure recorded as infrastructure RED, not a behavioral assertion proof.
  Ukrainian/English forms, validation, plural cases, locale formatting, axe and fallback
  now pass. Final full suite pending after final edits.
- 2026-09-20: user explicitly selected a 200 KiB initial-JS budget; ADR 0029
  records cost and scope. Other budgets unchanged. No merge/deploy executed.

## Separate baseline security remediation

Current audit found 7 high/4 moderate findings in the inherited lock. Updated only
identified vulnerable dependency families within compatible ranges, plus React Router
7.18.0 → 7.18.2. No broad framework upgrade or audit exception. Final audit: zero
high/critical, two moderate Vitest/mocker advisories retained for a separate update.

| Package path | Before | After |
|---|---|---|
| `node_modules/@eslint/config-array/node_modules/brace-expansion` | 5.0.6 | 5.0.12 |
| `node_modules/@redocly/openapi-core` | 1.34.15 | 1.34.20 |
| `node_modules/@redocly/openapi-core/node_modules/brace-expansion` | 2.1.1 | 2.1.7 |
| `node_modules/@typescript-eslint/typescript-estree/node_modules/brace-expansion` | 5.0.6 | 5.0.12 |
| `node_modules/baseline-browser-mapping` | 2.10.37 | 2.11.25 |
| `node_modules/brace-expansion` | 1.1.15 | 1.1.21 |
| `node_modules/browserslist` | 4.28.2 | 4.29.0 |
| `node_modules/caniuse-lite` | 1.0.30001799 | 1.0.30001810 |
| `node_modules/electron-to-chromium` | 1.5.373 | 1.5.433 |
| `node_modules/eslint/node_modules/brace-expansion` | 5.0.6 | 5.0.12 |
| `node_modules/js-yaml` | 4.1.1 | 4.3.2 |
| `node_modules/nanoid` | 3.3.12 | 3.3.19 |
| `node_modules/node-releases` | 2.0.47 | 2.0.56 |
| `node_modules/postcss` | 8.5.15 | 8.5.28 |
| `node_modules/react-router` | 7.18.0 | 7.18.2 |
| `node_modules/undici` | 7.28.0 | 7.29.1 |
| `node_modules/update-browserslist-db` | 1.2.3 | 1.3.3 |

## P03 measured adapter corrections — 2026-09-20

P01 PR #68 passed hosted quality and Linux E2E at 9581f9c; merge pending.
P02 candidate 212036d now has explicit separate-role launch tooling without trust
or model overrides. Pilot findings require full-pack/read-completeness evidence,
seed synchronization after locale edits, and real-index reconciliation after
plumbing commits. See docs/ai/pilot-report.md for successes, failures and pending
runtime permissions; neither P03 nor the full implementation plan is complete.
