# 0029 — Portable Windows baseline and seed internationalization

Date: 2026-09-20. Status: accepted for the implementation branch; not merged.

## Context

IMPLEMENTATION-PLAN-2026-09-20 requires one equivalent app snapshot for Claude
and Codex experiments. The original clean Windows install failed with
EBADPLATFORM because @rollup/rollup-linux-x64-gnu was a direct dev dependency.
The seed UI also violated the existing react-i18next rule.

## Decision

Remove the direct Linux-only dependency and regenerate the lock without other
version upgrades. Vite 8 uses Rolldown; no direct replacement Rollup binary is
needed. Clean Windows install and Linux Node 24 checks confirm this.

Add i18next 26.4.2 and react-i18next 17.0.14, locked exactly, as application
dependencies for the pre-existing i18n requirement. Bundle English/Ukrainian
common/auth/articles namespaces, initialize synchronously, translate accessible
labels and client validation, and format values through Intl with explicit locale.
No language detector, network backend, storage, or additional production service.
API-provided error messages remain external content rather than translation keys.

The user explicitly requested an initial-JS gzip budget of **200 KiB** during
implementation. This supersedes the 145 KiB limit from ADR 0026, including for
fresh template projects. Initial-transfer 350 KiB and lazy-chunk 120 KiB remain.
The i18n baseline initially measured about 154 KiB (GNU gzip gate), compared with
about 137 KiB before i18n. The budget change is an explicit product decision, not
a hidden passing check or a claim of improved runtime performance. CWV remain
unverified until measured. Keep the existing provider architecture; discarded
experimental splitting is not part of the final change.

## Verification

Windows Node 26 baseline: clean install, typecheck, lint, 84 tests, build passed.
Linux Node 24.21.0 baseline: clean install, typecheck, lint, 84 tests, build passed
in node:24.21.0-bookworm-slim at image digest
sha256:0e0ff40c39bc087845bfb27465a0df4ea419520094bc35842ff83dd8cbe6f9b6.
i18n Node 24: 15 added tests passed (two languages, validation, plurals,
formatting, axe, fallback); final aggregate results live in the implementation plan.
These checks do not establish Claude/Codex behavioral-pilot acceptance.
