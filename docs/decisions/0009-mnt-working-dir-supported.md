# 0009. Working under /mnt is fully supported

Status: accepted · 2026-06-02

## Context

On Windows+WSL2 the project often lives on a Windows drive (`/mnt/c`, `/mnt/d`). The backend framework (ADR 0009) decided this is fully supported, not something to "fix".

## Decision

Projects under `/mnt/...` are fully supported. `/doctor` reports `/mnt` paths as OK, never suggests moving. A WSL2-native `claude` launched from `/mnt/d` reports `platform: linux, is_wsl2: true, platform_supported: true` and passes the gate. The only caveats (informational) are slower Vite file-watching/HMR and running `git` from the host shell to avoid `index.lock` quirks; `~/projects/<slug>` is optional for faster file-watching, never required.

## Consequences

- No forced relocation; one less false alarm.
- `session-start.sh` clears a stale empty `.git/index.lock` defensively.
