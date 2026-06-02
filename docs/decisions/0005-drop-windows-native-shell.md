# 0005. Drop Windows-native shell support (bash only)

Status: accepted · 2026-06-02

## Context

Supporting PowerShell/cmd alongside bash doubles the surface of every script and gate. The real environments are WSL2 (Windows), Linux, and macOS — all bash/zsh.

## Decision

Support **bash only** (Linux / macOS / WSL2 Ubuntu). On Windows, WSL2 is mandatory; run `node`, `npm`, `git`, `gh`, and the WSL2-native `claude` from inside WSL2. `scripts/detect-env.mjs` records `platform_supported`; `/doctor` hard-stops with `UNSUPPORTED_PLATFORM` on Windows-native (including the common trap of launching `claude.exe` instead of the WSL2-native CLI — `wrong_runner_suspected`).

## Consequences

- One shell dialect across hooks, gates, and CI.
- Clear, early failure with a fix path when someone runs the wrong runner.
