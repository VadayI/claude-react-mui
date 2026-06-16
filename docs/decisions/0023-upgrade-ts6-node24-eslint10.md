# 0023. Upgrade to TypeScript 6 + Node 24 floor + ESLint 10

Status: accepted · 2026-06-16

## Context

Latest-stable toolchain refresh (part of the staged stack upgrade — see plan `docs/plans/0004-stack-upgrade-latest-versions.md`). Three concurrent EOL / current-stable events make a coordinated toolchain bump necessary:

- **Node 20 reached EOL on 2026-04-30.** The 20.19 floor established by ADR 0019 now sits below several downstream tools' `engines` declarations. Node 24 is the current LTS Active line.
- **ESLint 9 EOL is 2026-08-06.** ESLint 10.x is the current stable major. The flat-config API (introduced in ESLint 9) is unchanged in ESLint 10; the migration path is a version bump, not a config rewrite.
- **TypeScript 6.0 is the current stable release.** TypeScript 7 ("Corsa", native Go port) is in beta only and is not adopted here — the project tracks stable, not beta (upgrade-policy.md: majors are deliberate, human-reviewed events with an ADR).

Per `upgrade-policy.md`, a major bump is a human-reviewed event with an ADR. This ADR covers PR A of the staged stack upgrade; React 18 → 19, MUI 6 → 9, and React Router 6 → 7 are deferred to PRs B–D respectively (ADR 0015 pin is unchanged).

## Decision

Take a deliberate, coordinated upgrade of the toolchain layer (per `upgrade-policy.md`):

- **TypeScript** `^5.6` → `^6.0.3`.
- **ESLint** `^9` → `^10.5.0`, with supporting ecosystem bumps: `@eslint/js ^10`, `typescript-eslint ^8.61.1`, `eslint-plugin-react-hooks ^7.1.1` (flat-config `recommended-latest` API), `eslint-plugin-jsx-a11y ^6.10.2`, `prettier ^3.8.4`.
- **Vitest** `^4.1.8` → `^4.1.9` / `@vitest/coverage-v8 ^4.1.9` / `jsdom ^29.1.1` (patch bumps within the major established by ADR 0019).
- **`engines.node`** `">=20.19.0"` → `">=24"`. CI Node version (`frontend-ci.yml` ×2) updated to Node 24. `scripts/detect-env.mjs` and `scripts/setup-wsl.sh` Node-floor thresholds updated to 24.

### ESLint 10 peer-dependency mechanism

`eslint-plugin-jsx-a11y` (peer `eslint ^9`) and `openapi-typescript` (peer `typescript ^5`) do not yet declare ESLint 10 / TypeScript 6 as supported peers. npm `overrides` cannot _relax_ a declared peer — they can only _substitute_ a transitive dep — so overrides do not solve this. Instead, a committed `.npmrc` with `legacy-peer-deps=true` is used. This works for both `npm install` (local) and `npm ci` (CI), because npm respects `.npmrc` in the project root in both modes.

**Consequence:** peer enforcement is disabled tree-wide for this project. npm no longer auto-installs missing peers, which required adding `@testing-library/dom` and `@eslint/js` as explicit `devDependencies` (previously they were auto-installed as peers). Packages themselves continue to work correctly — peer declarations are advisory metadata, not runtime constraints.

**This is a deliberate, time-boxed tradeoff.** Remove `legacy-peer-deps=true` from `.npmrc` once:
1. `eslint-plugin-jsx-a11y` publishes a release declaring `eslint ^10` as a valid peer, AND
2. `openapi-typescript` publishes a release declaring `typescript ^6` as a valid peer.

Track both at `docs/lessons.md` (openapi-typescript) and as a follow-up chore ticket.

## Consequences

- **Node 20 and Node 22 are no longer the supported floor.** The floor is Node 24+ (ADR 0019's `>=20.19.0` floor is superseded). CI, the `/doctor` gate, `scripts/detect-env.mjs` (`nodeSupported` threshold), `package.json` `engines`, and environment/setup docs are updated.
- `npm audit --audit-level=high` remains clean (2 moderate advisories, no high/critical).
- ESLint 10 flat-config is backward-compatible with the existing `eslint.config.js`; only `reactHooks.configs['recommended-latest']` replaces the ESLint-9-era key.
- TypeScript 6 required no `tsconfig.json` migration — `moduleResolution: bundler` was already set (the main TS-6 deprecation target is `node10`/`node16`/`nodenext` resolutions, which this project did not use).
- The **`legacy-peer-deps` tradeoff** is recorded above and tracked. It does not affect runtime behavior.
- The **React 18.3 / MUI 6 / React Router 6 pins (ADR 0015) are unchanged** — this is a build/test-toolchain upgrade only. Framework bumps land in PRs B–E.

Supersedes: the Node floor portion of ADR 0019 (floor `>=20.19.0` → `>=24`; Node 20/22 are no longer the floor). ADR 0019 itself remains on disk and immutable — its Vite 8 / Vitest 4 decisions are unaffected.

Relates to: `.claude/rules/upgrade-policy.md` (majors need a human + ADR), `.claude/rules/dependencies-and-supply-chain.md` (the `legacy-peer-deps` supply-chain tradeoff), and ADR 0015 (stack pin — unaffected by this ADR).
