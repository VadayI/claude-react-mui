# Plan 0001 — HANDOFF wiring

> Status: ✅ DONE · seeded 2026-06-05 · Driver: closes a forward-reference opened by the HANDOFF/auditor port (CLAUDE.md #6 and `auditor` already reference `docs/HANDOFF.md` and `/wrap-up regenerates HANDOFF.md`, but the command chain did not deliver it).
> Type: config-template change (commands + templates). No production code — feature pipeline does not apply.
>
> **Living plan** — discipline in `.claude/rules/living-plan.md`. First live exercise of the mechanism ported in plan-less block 2.

## Status

| Step | State | Owner |
|---|---|---|
| 1. Align section names (`## Next steps`, `## Open questions`) across template + /handoff | done | orchestrator |
| 2. `/wrap-up` regenerates `docs/HANDOFF.md` + commits it | done | orchestrator |
| 3. `/bootstrap` seeds `docs/HANDOFF.md` + `docs/todo.md` from templates | done | orchestrator |
| 4. Verify consistency (greps) | done | orchestrator |

> States: `pending` · `in_progress` · `done` · `blocked`.

## Goal

The HANDOFF/auditor work (PR #6) made `CLAUDE.md` principle #6 and the `auditor` agent depend on `docs/HANDOFF.md` with `## Next steps` / `## Open questions` headings, and on `/wrap-up` regenerating that file. None of that was wired: `/handoff` emitted `## Recommended next steps` (wrong heading) with no Open questions, `/wrap-up` never touched HANDOFF, and `/bootstrap` left it a `{TODO}` stub. This plan makes the documentation promises real.

## Approach

Surgical, additive edits to three commands + one template — no code. Canonical headings the `auditor` awk-probes read: `## Next steps` and `## Open questions`. Every generated/seeded HANDOFF must carry both.

## Steps

1. `templates/HANDOFF.md` — add `## Open questions`; fix stale `django-developer` example → `react-developer`.
2. `.claude/commands/handoff.md` — `## Recommended next steps` → `## Next steps`; add `## Open questions` to the generated structure.
3. `.claude/commands/bootstrap.md` — seed `docs/HANDOFF.md` from `templates/HANDOFF.md` (not a `{TODO}` stub) and add `docs/todo.md` from `templates/todo.md`.
4. `.claude/commands/wrap-up.md` — new step 6.5 regenerates `docs/HANDOFF.md`; include it in the wrap-up commit `git add`.

## Verification

- `grep -c "## Next steps"` and `"## Open questions"` agree across `templates/HANDOFF.md`, `handoff.md`, `wrap-up.md`.
- No `django-developer` left in `templates/HANDOFF.md`.
- File integrity: NUL=0, `cmp` scratch↔dest for every edited file.

## Open questions

- [ ] Stack drift discovered out-of-scope: `bootstrap.md` Step 1 says React 19 / Vite 6 / Router 7, but `CLAUDE.md` pins React 18.3 / Vite 8 / Router 6 (ADR 0019 / version note). Separate fix.
- [ ] `docs/plans/` carries non-`NNNN` legacy files (`ci-gates-plan.md`, `fix-file-truncation.md`); decide whether to renumber to the living-plan `NNNN-*` convention.

## Execution log

> Append-only. Distinct from `docs/WORKLOG.md`.

- 2026-06-05 — plan seeded (retroactively; this step ran plan-less then captured here as the first living-plan exercise).
- 2026-06-05 — steps 1–4 applied via heredoc→scratch→cp→verify; all four files NUL=0, `cmp` OK.
- 2026-06-05 — consistency greps green: `## Next steps`/`## Open questions` aligned across template + /handoff + /wrap-up; no `django-developer` residue.

## Amendments

_(none yet)_
