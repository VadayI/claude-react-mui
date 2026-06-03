# Dependency upgrade policy (steady, automated, gated)

Dependencies rot whether or not you touch them — security advisories land, transitive trees shift, and a year-long upgrade gap becomes a painful, risky migration. This project upgrades **in a steady rhythm with automation**, lets the **green CI gate** prove safety, and treats a **major/breaking** bump as a deliberate, recorded event — never a silent `npm update`.

## Automation drives the cadence

- **Renovate (or Dependabot)** opens grouped upgrade PRs on a schedule, so upgrades are small and continuous instead of a big-bang once a year. Config is committed.
- **Grouping:** patch/minor across the dev toolchain (eslint/prettier/vitest/types) are batched; runtime libraries (React, MUI, Router, TanStack Query, Zustand) are grouped per-ecosystem so a breaking change is isolated and reviewable.
- **Lockfile-only** maintenance (transitive bumps for advisories) flows through the same mechanism (@.claude/rules/dependencies-and-supply-chain.md).

## What may auto-merge vs what needs a human

- **Patch & minor** on a **green CI** (tests + typecheck + lint + a11y + bundle budget all pass, @.claude/rules/performance-budgets.md) may auto-merge — the gate is the proof.
- **Security advisories** are expedited (high/critical jump the queue) but still go through CI.
- **Major / breaking** bumps are **never auto-merged**: they need a human, a read of the changelog/migration guide, and — for a framework-level change — an **ADR** (e.g. React 18→19, MUI 6→7 track ADR `0015`). The migration and its tests land in the same/linked PR.

## Stay current, on purpose

- Keep runtime libraries within a small window of the latest stable (don't drift majors behind); schedule the migration rather than letting the gap compound.
- Pinned-for-compatibility choices (React 18.3 + MUI 6, ADR `0015`) are revisited on a cadence and bumped when the ecosystem catches up — the decision is recorded, not forgotten.
- Node engine and CI runner versions are upgraded deliberately (Node 20.19+ is the floor, @.claude/rules/environment.md); a bump is its own reviewed PR.

## Rules

- Upgrades come through automation PRs, not ad-hoc `npm update` on a feature branch.
- The green CI gate is the merge criterion for patch/minor; majors require a human + (for frameworks) an ADR.
- Security high/critical is expedited but still gated.
- A breaking upgrade carries its migration + tests in the same PR; the contract/types drift gate must stay green (@.claude/rules/api-client.md).

## Binds these agents (rule is auto-loaded)

- `ci-cd-engineer` — owns the Renovate/Dependabot config and the auto-merge-on-green rules in CI.
- `react-developer` — performs framework/library migrations under green tests; updates code for breaking changes.
- `devops` — bumps Node/runner/base-image versions deliberately in their own PRs.
- `reviewer` — blocks un-ADR'd major bumps, auto-merge of breaking changes, and upgrade PRs that skip the gate.

> Goal: dependencies move forward continuously and safely — automation proposes, the green gate proves, and only breaking changes pull in a human and an ADR — so the project never faces a cliff-edge migration.
