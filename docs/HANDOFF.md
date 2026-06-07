# Session Handoff — 2026-06-05

> Rolling snapshot — read FIRST when resuming. Refreshed by `/handoff` & `/wrap-up`.

## Where we are now

Перенесено 4 блоки покращень із новішого `claude-django` у цей шаблон; усе змерджено в `main` (PR #6/#7/#8). Робота над `claude-react-mui` як інструментом-шаблоном.

## Current branch

## Last completed

- **#6** — living-plan система (`.claude/rules/living-plan.md` + `templates/plan.md`), HANDOFF-принцип у CLAUDE.md (read FIRST / update LAST), блок про 9p-mount safety (заборона Edit/Write на /mnt + heredoc→scratch→cp→verify), апгрейд `auditor` (драбина підказок, Bash-проби, читання HANDOFF).
- **#7** — `template-sync` (3 рівні власності файлів, merge-by-hand, templates/-deletion gate, stale-scan, template-sync.json) і `brief-synthesizer` (типізовані рідери, 9-секційний скелет) підтягнуто до версії claude-django.
- **#8** — HANDOFF wiring: узгоджено секції `## Next steps`/`## Open questions` між шаблоном, `/handoff`, `/wrap-up`; `/wrap-up` регенерує `docs/HANDOFF.md`; `/bootstrap` сіє HANDOFF+todo з шаблонів. Засіяно перший живий план `docs/plans/0001-handoff-wiring.md`.

## In progress

Нічого незавершеного — `main` чистий, усі гілки змерджено й видалено.

## Next steps

1. Фікс дрейфу стека в `.claude/commands/bootstrap.md` — деталі в `docs/plans/0002-bootstrap-stack-drift.md`.
2. Orphan-rule дисципліна в CLAUDE.md (django-стиль: rule без import/згадки = orphan, wire або видали).
3. Перейменувати легасі-плани `docs/plans/` (`ci-gates-plan.md`, `fix-file-truncation.md`) під конвенцію `NNNN-*`.
4. Перевірити living-plan binding у executor-агентах (мають `Edit`; чи потрібен явний рядок про Execution log).

## Open questions

- [ ] Чи додавати CI-гейт «план оновлено в тому ж PR» (наразі out of scope, як і в claude-django).
- [ ] Чи скорочувати решту спільних агентів до лаконічного django-стилю (поки навмисно не чіпали — ризик втрати фронт-специфіки).

## Open PRs

| PR  | Branch | Status                   |
| --- | ------ | ------------------------ |
| —   | —      | усі змерджено (#6/#7/#8) |

## Gotchas

- **9p-mount у Cowork-сандбоксі.** Після git-churn гілок на хості 9p-в'ю сандбокса **застаріває** (показує стару гілку без HEAD) і може читати файли **рваними** (хвіст занулено) — хоча хост чистий. Завжди: фінальна звірка байтів (NUL=0) + git commit/push **з host-shell**; після churn **перезапускати воркспейс**, щоб скинути маут. Правило вже в CLAUDE.md.
