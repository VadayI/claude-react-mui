---
model: sonnet
argument-hint: "[english | українська | polski]"
---

Change the output language for all agents in this project after bootstrap. Writes the shared, project-owned `docs/ai/overrides/output-language.md` from `templates/output-language.md`; AGENTS.md makes Claude and Codex read it. `CLAUDE.md` is not edited.

## Log

```bash
node scripts/log-cmd.mjs /set-language "$ARGUMENTS"
```

## Steps

### 1. Check the current preference

Run `python scripts/ai/project_state.py --root . --language` and report `language` / `status`.

- `legacy` / `identical`: move the Claude-only `.claude/rules/output-language.md` first with `python scripts/ai/project_state.py --root . --language --apply` (it leaves a pointer at the old path).
- `conflict`: nothing is written; show both files — the user's choice in step 3 decides.
- Otherwise ask whether the user wants to change the reported language.

### 2. Check template exists

If `templates/output-language.md` does NOT exist, the Quick Start was not completed. Report:

> `templates/output-language.md` is missing — run `/bootstrap` first, or copy the template manually. Proceeding in English.
> Stop here.

### 3. Language selection

If `$ARGUMENTS` contains a language code or name, use it. Otherwise ask:

> What language should all agents respond in?
>
> - `en` — English (default)
> - `uk` — Українська
> - `pl` — Polski

Map the input to the native name:
| Code / input | Native name token |
|---|---|
| `en` / `english` | `English` |
| `uk` / `ua` / `ukrainian` / `українська` | `Українська` |
| `pl` / `polish` / `polski` | `Polski` |

If unrecognized, ask the user to type the native name of their language directly.

### 4. Write the shared preference

Copy `templates/output-language.md` to `docs/ai/overrides/output-language.md` and replace both `{LANGUAGE_NATIVE}` placeholder tokens with the chosen native name, e.g. `{LANGUAGE_NATIVE} → Українська`. On a `conflict`, then run `python scripts/ai/project_state.py --root . --language --apply --keep-shared` so the legacy file becomes the pointer. Never create `.claude/rules/output-language.md` or add imports to `CLAUDE.md`.

### 5. Confirm

`python scripts/ai/project_state.py --root . --language` must report `status: canonical` and the chosen `language`. Report: "Output language set to **<native name>**. All agents will now respond in that language."

<!-- last reviewed: 2026-09-25 (P07: shared docs/ai/overrides preference, legacy migration, no CLAUDE.md edits) -->
