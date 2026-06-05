# Plan 0002 — Fix stack drift in bootstrap.md

> Status: 🟡 PENDING · seeded 2026-06-05 · Driver: out-of-scope finding від plan 0001 (bootstrap Step 1 декларує застарілі версії).
> Type: config-template change (one command file). No production code.

## Status

| Step | State | Owner |
|---|---|---|
| 1. Узгодити версії в bootstrap.md з package.json | pending | orchestrator |
| 2. Верифікація (grep + NUL=0) | pending | orchestrator |

## Goal

`.claude/commands/bootstrap.md` декларує React 19 / Vite 6 / React Router 7, що суперечить пінам у `package.json` і CLAUDE.md (React 18.3 / Vite 8 / MUI 6 / Router 6). Свіжо-забутстрапнутий проект отримав би неузгоджений стек.

## Approach

Джерело істини — `package.json`: react `^18.3.1`, vite `^8.0.16`, @mui/material `^6.1.6`, react-router-dom `^6.28.0`. Хірургічні текстові правки, без коду.

## Steps

1. Рядок ~30: `React 19, Vite 6, MUI 6, React Router 7` → `React 18.3, Vite 8, MUI 6, React Router 6 (data router)`.
2. Рядок ~60: `React Router 7 router definition` → `React Router 6 (data router) router definition`.
3. Рядок ~104: `# ADR: why React 19 + MUI + TanStack Query` → `React 18.3` (ім'я файлу `0001-stack.md` лишити — це перший ADR свіжого проекту).

## Verification

- `grep -nE "React 19|Vite 6|Router 7" .claude/commands/bootstrap.md` → порожньо.
- NUL=0, `cmp` scratch↔dest.

## Open questions

- [ ] Чи звірити також `templates/package.json` (якщо існує) на ті самі версії.

## Execution log

- 2026-06-05 — plan seeded (наступна сесія).

## Amendments

_(none yet)_
