---
model: sonnet
---
Synthesize or update `docs/PROJECT.md` from all inputs in `docs/` (briefs, design notes, PDFs, meeting notes). Run before `/preflight` and before the first feature. Delegates to `brief-synthesizer`.

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
docs/design/        (Figma exports, mockups, style guides)
docs/decisions/     (ADRs)
```
Also consider any description the user provided in `$ARGUMENTS` or this session.

Report the found inputs to the user before proceeding.

### 2. Check for existing PROJECT.md
If `docs/PROJECT.md` exists, read it and note whether this is a synthesis (new) or an update (refresh against new inputs since last run).

### 3. Dispatch brief-synthesizer
Delegate to `brief-synthesizer` with all gathered inputs. The output `docs/PROJECT.md` must contain:

1. **Project name and one-line description**.
2. **Goals** — what success looks like; primary user outcomes.
3. **Scope** — what is in scope for this project; what is explicitly out of scope.
4. **Domain** — key concepts and entities.
5. **Target users** — who will use this frontend and how.
6. **Key requirements** — functional requirements distilled from the inputs.
7. **Stack** — confirm the declared stack (React 18 · Vite 8 · MUI 6 · etc.).
8. **Backend API** — the OpenAPI schema URL or location; authentication scheme.
9. **Open questions** — unresolved ambiguities that need stakeholder input before implementation.
10. **Input sources** — list of documents this synthesis was derived from, with dates.

### 4. Save and commit
Write the synthesized content to `docs/PROJECT.md`. Then:
```bash
git add docs/PROJECT.md
git commit -m "docs: synthesize project brief from docs/"
```
If on `main` and no branch protection yet (bootstrap phase), this commit is allowed. Otherwise commit on the current feature branch.

### 5. Recommend next step
If this is pre-first-feature: recommend `/preflight` to verify all build inputs are ready.

<!-- last reviewed: 2026-06-02 -->
