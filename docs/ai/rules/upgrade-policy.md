# Dependency upgrade policy (steady, automated, gated)

Dependencies rot whether or not you touch them — security advisories land, transitive trees shift, and a year-long upgrade gap becomes a painful, risky migration. This project upgrades **in a steady rhythm with automation**, lets the **green CI gate** prove safety, and treats a **major/breaking** bump as a deliberate, recorded event — never a silent `npm update`.

## Automation drives the cadence

- **Renovate (or Dependabot)** opens grouped upgrade PRs on a schedule, so upgrades are small and continuous instead of a big-bang once a year. Config is committed.
- **Grouping:** patch/minor across the dev toolchain (eslint/prettier/vitest/types) are batched; runtime libraries (React, MUI, Router, TanStack Query, Zustand) are grouped per-ecosystem so a breaking change is isolated and reviewable.
- **Lockfile-only** maintenance (transitive bumps for advisories) flows through the same mechanism (docs/ai/rules/dependencies-and-supply-chain.md).

## Review and merge authorization

- **Patch & minor** on a **green CI** (tests + typecheck + lint + a11y + bundle budget all pass, docs/ai/rules/performance-budgets.md) still require an explicit user merge command — the gate is the proof.
- **Security advisories** are expedited (high/critical jump the queue) but still go through CI.
- **Major / breaking** bumps are **never auto-merged**: they need a human, a read of the changelog/migration guide, and — for a framework-level change — an **ADR** (e.g. React 18→19 via ADR 0024; MUI 6→9 via ADR 0025). The migration and its tests land in the same/linked PR.

## Stay current, on purpose

- Keep runtime libraries within a small window of the latest stable (don't drift majors behind); schedule the migration rather than letting the gap compound.
- MUI 9 (ADR 0025), React 19 (ADR 0024), React Router 7 (ADR 0026), and the TanStack Query 5 / Zustand 5 sweep (PR E) are the current baselines; future major migrations follow the same pattern. Pinned choices are revisited on a cadence and bumped when the ecosystem catches up — the decision is recorded, not forgotten.
- Node engine and CI runner versions are upgraded deliberately (Node 24+ is the floor, docs/ai/rules/environment.md); a bump is its own reviewed PR.

## Rules

- Upgrades come through automation PRs, not ad-hoc `npm update` on a feature branch.
- Passing the selected CI/local profile is necessary for every upgrade. Every merge needs an explicit user command; framework major changes also require an ADR.
- Security high/critical is expedited but still gated.
- A breaking upgrade carries its migration + tests in the same PR; the contract/types drift gate must stay green (docs/ai/rules/api-contract.md).

## Binds these agents (rule is auto-loaded)

- `ci-cd-engineer` — owns the Renovate/Dependabot config and the checks and user-command merge rules in CI.
- `react-developer` — performs framework/library migrations under green tests; updates code for breaking changes.
- `devops` — bumps Node/runner/base-image versions deliberately in their own PRs.
- `reviewer` — blocks un-ADR'd major bumps, auto-merge of breaking changes, and upgrade PRs that skip the gate.

> Goal: dependencies move forward continuously and safely — automation proposes, the green gate proves, and the user authorizes every merge; framework breaking changes additionally require an ADR — so the project never faces a cliff-edge migration.

D01 supersedes any earlier automatic merge policy: never merge without the user command.
