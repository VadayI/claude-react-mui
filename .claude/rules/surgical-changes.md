# Surgical changes (minimal, traceable diffs — enforced at the Quality Gate)

A change is correct not only when tests pass, but when the **diff contains nothing the
request didn't ask for**. LLM edits tend to drift: they "improve" adjacent code, reformat
untouched lines, rename things for taste, or delete code they don't fully understand as a
side effect. This rule makes every diff **surgical** — each changed line traces directly to
the user's request. It is the companion to "Simplicity First" (@.claude/rules/code-style.md)
and the "minimal blast radius" principle (@.claude/rules/workflow.md): simplicity governs the
code you write, surgicality governs the lines you touch.

## When editing existing code

- **Don't "improve" what you weren't asked to.** No reformatting, no comment rewrites, no
  style tweaks on lines unrelated to the task — even if you'd write them differently.
- **Match the existing style** of the file/feature, not your personal preference. The local
  convention wins.
- **Don't refactor what isn't broken** as a side effect of an unrelated change. A worthwhile
  refactor is its own task/PR, not a rider on a feature.
- **Every changed line traces to the request.** If you can't explain a hunk by pointing at
  the user's ask (or a test it makes pass), it doesn't belong in the diff.

## Comments & code you don't fully understand

- **Do not change or delete comments/code you don't understand** just because they're near
  your edit. If something looks wrong but is orthogonal to the task, **mention it — don't
  touch it**.
- Pre-existing dead code is **reported, not removed**, unless removing it is the task.

## Cleaning up your own mess

- Remove imports/variables/functions/types that **your** change made unused — leaving orphans
  is not "surgical", it's incomplete.
- This is the one cleanup you own: the orphans your edit created, nothing more.

## Relation to other rules

- **Simplicity First** (@.claude/rules/code-style.md) decides *what code to write*; this rule
  decides *which lines to touch*. Both must hold.
- A deliberately deferred placeholder is still a `// STUB:` with a ledger row
  (@.claude/rules/no-stubs.md) — surgicality is not an excuse to leave silent debt.
- Unrelated improvements you spot go to `docs/lessons.md` or a follow-up task, never into the
  current diff.

## Rules

- The diff changes only what the request requires; no drive-by reformatting or refactoring.
- Match local style; don't rename/restructure for taste.
- Don't alter or delete comments/code you don't understand — flag, don't touch.
- Remove only the orphans your own change created; leave pre-existing dead code (report it).

## Binds these agents (rule is auto-loaded)

- `react-developer` — keeps edits surgical; removes only self-created orphans; flags unrelated
  issues instead of fixing them inline.
- `react-refactoring-expert` — refactors are explicit, scoped tasks under green tests, never a
  side effect of a feature change.
- `reviewer` — blocks drive-by reformatting, unrequested refactors, deletion of un-understood
  code, and any hunk that doesn't trace to the request.
- `debugger` — the fix changes only what reproduces/repairs the bug, nothing adjacent.

> Goal: every diff is minimal and traceable — each touched line earns its place by serving the
> request, so reviews are fast and changes don't carry hidden, unrequested edits.
