# 0025. Upgrade Material UI 6 → 9

Status: accepted · 2026-06-17

## Context

Part of the staged stack upgrade (plan `docs/plans/0004-stack-upgrade-latest-versions.md`, PR C).
ADR 0015 pinned MUI at 6 "until MUI fully tracks React 19". React 19 was adopted in ADR 0024 (PR B),
which removed the final blocker for the MUI upgrade: MUI 9 officially lists React 19 as a peer.

Material UI's versioning jumped from v6 → v7 → v9 — there is no "v8" in the Core library (v8 is
the MUI X namespace). The migration therefore spans two major bumps (6→7→9) in a single deliberate
PR, because both interim versions are published and the breaking-change surface between 6 and 9 is
well-documented via codemods.

## Decision

Upgrade the MUI ecosystem in a single coordinated patch:

- **`@mui/material`** `^6.1.6` → `^9.1.1` (latest 9.x stable).
- **`@mui/icons-material`** `^6.1.6` → `^9.1.1`.
- **Emotion unchanged** — `@emotion/react ^11.13.3` and `@emotion/styled ^11.13.0` continue to
  satisfy MUI 9's peer requirements (`^11.5` / `^11.3`); no bump needed.

Codemod-driven source migrations applied (3 real changes, rest no-ops):

1. `src/features/articles/components/AddArticleForm.tsx` — `inputProps` → `slotProps.htmlInput`
   (MUI v6→v7 slots API).
2. `src/features/articles/components/ArticleList.tsx` — system `color` prop moved to
   `sx={{ color: … }}` (MUI v9 removes color from system props on non-Chip components).
3. `src/features/articles/components/ArticleList.tsx` — `secondaryTypographyProps` →
   `slotProps.secondary` (ListItemText slots API).

`vitest.config.ts` — added `server.deps.inline: [/@mui\//, 'react-transition-group']` to resolve
MUI 9 ESM-internal imports at test time. MUI 9 ships ESM entry points (e.g. `Transition.mjs`) that
import `react-transition-group/TransitionGroupContext` without a file extension. The
`react-transition-group@4.4.5` package has no `exports` map, so Vitest's strict ESM resolver fails
to resolve the bare subpath. Inlining both packages into Vitest's transform pipeline resolves the
module without changing any test assertion.

Bundle budget ratcheted: `initialJsGzipKb` 188 → **190 KB** (MUI 9 single-bundle initial JS
measured at 188.38 KB gzipped on this codebase; budget gives 1.62 KB headroom). Route
code-splitting is deferred as a dedicated structural performance task whose target is to return the
initial JS to < 180 KB — the ratchet here is a conscious interim step, symmetric to the 180→188
ratchet for React 19 in ADR 0024.

## Consequences

- **MUI 9 is the new baseline.** The MUI-6 pin portion of ADR 0015 is superseded by this ADR. ADR
  0015 itself remains on disk and immutable — its other stack decisions (Router, TanStack Query,
  Zustand) are unaffected.
- Blast radius was low: no deep `@mui/material/*/internal` imports, no deprecated Grid v1, no
  `@mui/lab` usage, and no inline-style overrides that the slot API changes would break outside the
  three files patched by the codemod.
- **Emotion stays the default styling engine.** Pigment CSS (MUI 9's new opt-in zero-runtime
  engine) is not adopted; it requires a Vite plugin and build-pipeline changes beyond the scope of
  this PR. Pigment adoption is a separate future decision.
- The `.npmrc` `legacy-peer-deps=true` introduced in ADR 0023 remains in place. Removal is tracked
  as a cleanup task for PR E (once `eslint-plugin-jsx-a11y` and `openapi-typescript` publish
  up-to-date peer declarations).
- 82/82 tests green after the vitest ESM inline fix; no test assertion changes required.

## Supersedes

The MUI-6 pin portion of ADR 0015 (MUI 6 → 9). ADR 0015 itself stays immutable on disk.

## Relates

- ADR 0015 — stack pin (partially superseded by this ADR for the MUI portion).
- ADR 0024 — React 19 adoption; the React 19 peer support in MUI 9 is what unblocked this upgrade.
- ADR 0023 — tooling layer (TS 6 / Node 24 / ESLint 10) and the `.npmrc` `legacy-peer-deps` this
  ADR depends on.
- `.claude/rules/performance-budgets.md` — bundle budget ratcheted here (188 → 190 KB gz).
