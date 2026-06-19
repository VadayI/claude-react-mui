---
model: sonnet
argument-hint: "[english | українська | polski]"
---

Change the output language for all agents in this project after bootstrap. Copies `templates/output-language.md` to `.claude/rules/output-language.md` with the chosen native name and appends the import to `CLAUDE.md`.

## Log

```bash
node scripts/log-cmd.mjs /set-language "$ARGUMENTS"
```

## Steps

### 1. Check if already set

If `.claude/rules/output-language.md` already exists, read it and report the current language. Ask the user if they want to change it.

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

### 4. Write the rule file

```bash
cp templates/output-language.md .claude/rules/output-language.md
```

Replace both `{LANGUAGE_NATIVE}` placeholder tokens in the copied file with the chosen native name. Example for Ukrainian:

```
{LANGUAGE_NATIVE} → Українська
```

### 5. Register in CLAUDE.md

Append the import line to the `@` import block at the top of `CLAUDE.md` (after the last existing `@.claude/rules/` line):

```
@.claude/rules/output-language.md
```

Do not duplicate if already present.

### 6. Confirm

Report: "Output language set to **<native name>**. All agents will now respond in that language."

<!-- last reviewed: 2026-06-02 -->
