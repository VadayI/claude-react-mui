# Architecture Decision Records (index)

ADRs are immutable, numbered decisions. Numbers are never reused; a superseded ADR stays on disk and
its successor references it.

## Reserved / skipped numbers

Some early numbers were reserved during planning and never published; they are intentionally absent
(not lost): **0004, 0006, 0010, 0012**. Do not reuse them — a new ADR takes the next free number after
the highest existing one.

## Index

| ADR | Title |
|-----|-------|
| 0001 | TDD double-loop at the UI boundary |
| 0002 | Node-based env detection |
| 0003 | Bootstrap command + resume mode |
| 0005 | Drop Windows-native shell (WSL2 required) |
| 0007 | Frontend as a separate repo |
| 0008 | Manual repo + fine-grained PAT |
| 0009 | `/mnt` working dir supported |
| 0011 | Config baseline (plugins / MCP) |
| 0013 | File-size limit 400 |
| 0014 | Update-from-template |
| 0015 | Stack: React + MUI + TanStack Query + Zustand |
| 0016 | Accessibility mandatory |
| 0017 | Server- vs client-state |
| 0018 | Auth mode session/CSRF (superseded by 0021) |
| 0019 | Upgrade Vite 8 / Vitest 4 / Node 20 floor (Node floor superseded by 0023) |
| 0020 | External OpenAPI contract (Variant A) |
| 0021 | Auth Bearer/JWT default (supersedes 0018) |
| 0022 | Bump contract pin to v0.2.0 (auth path rename) |
| 0023 | Upgrade TS 6 / Node 24 floor / ESLint 10 |

> Index added in the 2026-06-16 template audit. Keep in sync when adding an ADR.
