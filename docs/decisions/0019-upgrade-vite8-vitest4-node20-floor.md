# 0019. Upgrade Vite 8 + Vitest 4 + raise the Node floor to 20.19+

Status: accepted · 2026-06-02

## Context

The dependencies-and-supply-chain rule mandates `npm audit` high/critical advisories block the PR; the CI gate now runs `npm audit --audit-level=high`. The existing dev toolchain (Vite 5 / Vitest 2 / `@vitejs/plugin-react` 4 / jsdom 25) carried **1 critical + 4 moderate** advisories — the Vitest UI server allowed arbitrary file read/exec, and the bundled esbuild dev server had a known CORS/request issue. These are dev-toolchain only (not shipped in `dist/`), but they fail the new gate, and the fixes only land in current majors.

## Decision

Take a deliberate, coordinated major upgrade of the dev toolchain (per upgrade-policy.md: a major bump is a human-reviewed event with an ADR):

- **Vite** `^5` → `^8.0.16` (rolldown-based build).
- **Vitest** `^2` → `^4.1.8`.
- **@vitejs/plugin-react** `^4` → `^6`.
- **jsdom** `^25` → `^29`.

Vite 8 (engines `^20.19.0 || >=22.12.0`) and Vitest 4 (engines `^20.0.0 || ^22.0.0 || >=24.0.0`) raise the runtime floor. The project's supported **Node floor moves from 18+ to 20.19+ (or 22.12+)**. CI runs Node 22 (LTS); the env-detection threshold, `engines`, and all docs are updated to match.

After the upgrade `npm audit` reports **0 vulnerabilities** and the full suite is green (43 tests, typecheck/lint/build and all gate scripts pass). One config change was required: `vitest.config.ts` gained `test.include: ['src/**/*.{test,spec}.{ts,tsx}']` so Vitest 4 no longer picks up the Playwright e2e spec.

## Consequences

- **Node 18 is no longer supported.** The floor is Node 20.19+ (22.12+ recommended); CI, the `/doctor` gate, `scripts/detect-env.mjs` (`nodeSupported` threshold), `package.json` `engines`, and the environment/setup docs are updated.
- `npm audit --audit-level=high` is clean — the new supply-chain gate passes.
- `vitest.config.ts` scopes `test.include` to `src/` so Vitest and Playwright own their own specs.
- Vite's build is now rolldown-based (faster); behavior is unchanged for this app.
- The **React 18.3 / MUI 6 pin (ADR 0015) is unchanged** — this is a build/test-toolchain upgrade only, not a framework bump.

Relates to: `.claude/rules/upgrade-policy.md` (majors need a human + ADR), `.claude/rules/dependencies-and-supply-chain.md` (the `npm audit` gate that forced it), and ADR 0015 (stack pin — unaffected).
