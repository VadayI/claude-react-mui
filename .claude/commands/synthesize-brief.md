---
model: sonnet
---

Synthesize or update `docs/PROJECT.md` from all inputs in `docs/` (briefs, design notes, PDFs, meeting notes). Run before `/preflight` and before the first feature. Delegates to `brief-synthesizer`.

> Design reference support: @.claude/rules/design-reference.md

## Log

```bash
node scripts/log-cmd.mjs /synthesize-brief "$ARGUMENTS"
```

## Steps

### 1. Collect inputs

Scan `docs/` for all input documents (excluding generated files):

```
docs/*.md           (brief, design notes, requirements)
docs/*.pdf          (design specs, wireframes, stakeholder docs)
docs/design/        (Figma exports, mockups, style guides, Claude-design prototypes)
docs/decisions/     (ADRs)
```

Also consider any description the user provided in `$ARGUMENTS` or this session.

**Claude-design prototype detection.** Inside `docs/design/`, look for subdirectories containing a prototype signature: any combination of `index.html`, `*.jsx` files (especially `screen-*.jsx` / `ui-kit.jsx`), and/or `api-*.md`. List each candidate folder with a one-line summary (token count, screen count, whether an API spec is present).

Report all found inputs (documents + prototype candidates) to the user before proceeding.

### 1.5. Design reference

Ask the user which design reference (if any) to use as the UI source of truth for this project.

Present any detected prototype candidates from Step 1. Even if none were found, still ask — the user may have a folder in mind that is not yet under `docs/design/`.

Options (adapt based on what was found — one option per detected candidate, plus):

- **Provide a path** — user specifies a folder path to a prototype not detected automatically
- **No design reference** — proceed with MUI defaults and the written brief

If the user **confirms** a design reference:

1. Record the confirmed path (resolve relative to the repo root if needed).
2. Ask whether there are **intentional deviations** from the design: places where the produced UI should deliberately differ from the prototype (e.g. "use a sidebar instead of bottom nav", "different accent colour", "add loading states the prototype lacks").
3. For each stated deviation, immediately save a **project-memory** entry (`type: project`) with the deviation description and reason. Collect all deviations for the `brief-synthesizer` dispatch.

If the user **declines** (or no candidates exist and user confirms none):

- Record that no design reference was chosen; `brief-synthesizer` works from MUI defaults.

### 2. Check for existing PROJECT.md

If `docs/PROJECT.md` exists, read it and note whether this is a synthesis (new) or an update (refresh against new inputs since last run).

### 3. Dispatch brief-synthesizer

Delegate to `brief-synthesizer` with:

- All gathered document inputs.
- **design_folder** — the confirmed design reference path (or `null` if none).
- **design_deviations** — list of deviation strings collected in Step 1.5 (may be empty).

The output `docs/PROJECT.md` must contain:

1. **Project name and one-line description**.
2. **Goals** — what success looks like; primary user outcomes.
3. **Scope** — what is in scope for this project; what is explicitly out of scope.
4. **Domain** — key concepts and entities.
5. **Target users** — who will use this frontend and how.
6. **Key requirements** — functional requirements distilled from the inputs.
7. **Stack** — confirm the declared stack (React 19 · Vite 8 · MUI 9 · etc.).
8. **Backend API** — the OpenAPI schema URL or location; authentication scheme.
9. **Design reference** — path to the confirmed design folder + concise summary of extracted tokens (palette, typography, spacing), component inventory (atoms and variants), screen inventory (screen names and purpose), and API assumptions; note that this is a very strong UI source of truth, React 19 + MUI 9 + TS stack. Write `none` if no design reference was chosen.
10. **Design deviations** — bulleted list of intentional differences from the design reference, each with a reason. Write `none recorded yet` if the list is empty.
11. **Open questions** — unresolved ambiguities that need stakeholder input before implementation.
12. **Input sources** — list of documents this synthesis was derived from, with dates.

### 4. Save and commit

Write the synthesized content to `docs/PROJECT.md`. Then:

```bash
git add docs/PROJECT.md
git commit -m "docs: synthesize project brief from docs/"
```

If on `main` and no branch protection yet (bootstrap phase), this commit is allowed. Otherwise commit on the current feature branch.

### 5. Recommend next step

If this is pre-first-feature: recommend `/preflight` to verify all build inputs are ready.

<!-- last reviewed: 2026-06-10 -->
