# 0028. Support native Windows via Git Bash (amends 0005)

Status: accepted · 2026-06-19

## Context

ADR 0005 dropped native Windows support and mandated WSL2, because at the time the Claude CLI plus the project's bash hooks/gates needed a POSIX shell that native Windows did not reliably provide. That has changed: the Claude Code CLI and the Claude Agent SDK now ship first-class native Windows builds. On native Windows the CLI runs its Bash tool through **Git Bash** (Git for Windows) — the same POSIX bash our SessionStart hook and `scripts/check_*.sh` gates already target. The single-bash-dialect rationale of 0005 therefore no longer requires WSL2; it only requires *a* bash, which Git Bash supplies.

Keeping the WSL2 mandate also carried a self-inflicted cost. The WSL2 `/mnt` (9p) filesystem is the cause of the Edit/Write truncation, blocked `unlink`, and `.git/index` corruption documented in `CLAUDE.md` and `docs/lessons.md`. Native Windows runs on NTFS and has none of those hazards.

## Decision

Admit **native Windows + Git Bash** as a first-class supported runner, alongside Linux, macOS, and WSL2. The single shell dialect stays **bash** — on Windows that bash is Git Bash (Git for Windows is a hard prerequisite). We do **not** port scripts to PowerShell/cmd.

- `scripts/detect-env.mjs` records `platform_supported: true` for `win32` when Git Bash is detected (`MSYSTEM` is exported), and adds two fields: `is_git_bash` and `sandbox_supported`. `win32` without Git Bash stays unsupported.
- `wrong_runner_suspected` is narrowed to its real meaning — a Windows runner launched from *inside* WSL2 (mixing the two environments). Native Windows is not flagged.
- `/doctor` and `/bootstrap` hard-stop on `platform_supported: false` only. `wrong_runner_suspected` becomes a warning ("pick one environment"), not a hard stop.

## Consequences

- Windows users can run the template natively (Git for Windows + Node 24+), avoiding the WSL2 `/mnt` 9p hazards entirely. On native Windows NTFS the Edit/Write tools are safe, so the heredoc-write protocol is a WSL2-`/mnt`-only concern.
- The **sandboxed** Bash tool remains unavailable on native Windows (macOS/Linux/WSL2 only) — recorded in `sandbox_supported`.
- Native-Windows dependency install has a known wrinkle: the committed `package-lock.json` is Linux-flavoured for CI (`ubuntu-latest`), so `npm ci` fails with `EBADPLATFORM` (Rollup's platform binary). Native Windows uses `npm install --legacy-peer-deps` (documented in `docs/guides/developer.md`); a fully cross-platform lockfile is a tracked follow-up.
- WSL2 stays fully supported and is still preferable when a Linux runtime, the sandboxed Bash tool, or host isolation is required.
- One bash dialect is preserved across hooks, gates, and CI; no PowerShell port.

## Supersedes / amends

Amends ADR 0005. Its bash-only principle stands; its WSL2-mandatory clause is lifted in favour of "any bash, including Git Bash on native Windows."
