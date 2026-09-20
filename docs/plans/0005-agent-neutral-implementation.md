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
