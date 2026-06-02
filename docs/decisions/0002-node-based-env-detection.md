# 0002. Environment detection in Node (no Python dependency)

Status: accepted · 2026-06-02

## Context

The backend framework detects the environment with a Python script (`scripts/detect-env.py`) at SessionStart, because Python is already a hard requirement there. A frontend repo has no reason to require Python.

## Decision

Rewrite environment detection and command logging in **Node.js** (`scripts/detect-env.mjs`, `scripts/log-cmd.mjs`), using only Node built-ins. Node 18+ is already the hard requirement (Vite/Vitest/Playwright/CLI), so the SessionStart hook, the gates, and the app all share one runtime.

## Consequences

- One toolchain (Node) — no Python install needed on a frontend machine.
- `.claude/memory/env-detect.json` keeps the same role and integrity rule (never hand-edited; gates `/doctor` and `/bootstrap`).
- Gate scripts remain bash (run on WSL2/Linux/macOS, in CI).
