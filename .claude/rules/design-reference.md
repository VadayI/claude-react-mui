# Design reference — the design is the UI source of truth, translated to our stack

When a project has a **design** to follow — a Claude-design prototype folder, a running design served at a URL, Figma exports, or a style spec — it is the **strongest available UI source of truth**, and every agent that touches the UI works from it. This rule defines what a design can be, how it is discovered and opened, the **fidelity level** that scales how exactly it is reproduced, the non-negotiable **translation mandate** (the design is always realized through the project stack), and how deviations are recorded.

## Design sources (two shapes, often both)

A project's design reaches the agents in one or both of these shapes:

1. **Static prototype folder** — a Claude-design prototype under `docs/design/<name>/`, typically containing:
   - **Design tokens** — CSS custom properties (e.g. `--c-accent`, `--c-bg`, `--font-body`) defining the colour palette, typography scale, spacing, radius, and shadow values.
   - **UI-kit primitives** — a `ui-kit.jsx` (or similar) assembling buttons, inputs, cards, badges, and other atoms from the tokens.
   - **Screens** — `screen-*.jsx` files (or named equivalents) each representing a distinct application screen: layout, content hierarchy, component placement, interactive states.
   - **Data models** — an `app-data.jsx` (or similar) declaring the shape of entities the UI consumes.
   - **API spec** — one or more `api-*.md` files describing the backend endpoints the prototype assumes.
2. **Running design at a URL** — a live design served locally or on the web (e.g. `http://localhost:8331/`). Agents **open it in a browser** to inspect the _rendered_ result: real colours, type sizes, spacing, radii, density, and interaction states as they actually paint. This is the most faithful source because it shows computed values, not just declared tokens.

The two are complementary: the folder gives declared tokens and structure; the running design gives the ground-truth render. A project may provide either or both; all of them are recorded in `docs/PROJECT.md` § **Design reference**.

## Detection and discovery

`/synthesize-brief` scans `docs/design/` for static prototype signatures (`index.html` + `*.jsx` / `screen-*` / `ui-kit`, and/or `api-*.md`) and, in Step 1.5, asks the user three things: which folder (if any) to use, **whether a design is running and at what URL**, and the desired **fidelity level**. The confirmed source(s), URL, and level are recorded in `docs/PROJECT.md` § **Design reference** and passed to `brief-synthesizer`. If no design is found and the user declines, agents work from MUI defaults and the written brief alone.

## Opening a running design (browser inspection)

When a design URL is provided, design-touching agents open and read it through the **Playwright MCP** (the enabled `playwright` plugin — see `@.claude/rules/mcp-stack.md`):

- `browser_navigate` → open the design URL.
- `browser_snapshot` / `browser_take_screenshot` → capture each screen's layout and visual state.
- `browser_evaluate` → read **computed** styles (`getComputedStyle`) for exact colour / size / spacing / radius values when the fidelity level demands measured tokens.

Inspection is **read-only** — agents observe the running design, never edit it. If the URL is unreachable, the agent records that and falls back to the static folder / written brief; `/doctor`, `/preflight`, and `/audit` surface a declared-but-unreachable design URL.

## The translation mandate (binds every design-touching agent)

**The design is always realized through the project stack — never ported verbatim.** Every agent that reads or acts on the design (synthesis, UI contract, implementation, refactor, review, a11y, QA, docs) must express it as:

- tokens → the **central MUI theme** (`src/theme/`: `palette`, `typography`, `spacing`, `shape`, `components`);
- ui-kit atoms → **MUI components** composed via `styleOverrides` / `sx`;
- screens → **routes + a typed component tree** under `src/features/<feature>/` (React 19 + TypeScript, TanStack Query for server-state, Zustand for client-state, feature-sliced per `@.claude/rules/architecture.md`).

It is **forbidden to emit or approve the prototype's implementation**: inline styles, in-browser Babel JSX, raw CSS custom properties in components, copied HTML/markup, or magic colour/spacing literals outside the theme. The theme is the single source of design-token truth in production.

The **fidelity level controls how exactly values match — not whether the design is translated to the stack.** Even at the highest fidelity the output is idiomatic MUI + TypeScript, not a copy of the prototype.

## Fidelity / transfer levels (per project, default L3)

How strictly the design is reproduced is a **per-project decision**, asked at the start (`/synthesize-brief` Step 1.5) and recorded in `docs/PROJECT.md` § **Design reference** as `Fidelity level: L1 | L2 | L3 | L4`. If unspecified, the default is **L3**.

| Level  | Name                            | What it means                                                                                                                                                                                         | Needs                  |
| ------ | ------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- |
| **L1** | Browser-measured pixel-perfect  | Agent opens the **running design**, measures computed tokens (`getComputedStyle`) and reproduces colours, type scale, spacing, radii, and layout **1:1** in the MUI theme. Deviations only for a11y/contract, all recorded. | a running design URL   |
| **L2** | Pixel-perfect from spec/tokens   | Exact 1:1 reproduction from the static tokens / style spec, without live measurement. Deviations only for a11y/contract.                                                                              | folder or style spec   |
| **L3** | Close MUI adaptation (default)   | Palette, typography scale, layout, and component inventory preserved; realized through idiomatic MUI and the spacing scale; minor visual differences acceptable.                                       | any                    |
| **L4** | Inspiration                      | Design as brand/tone; carry palette + key brand elements; MUI defaults dominate.                                                                                                                      | any                    |

The level scales each agent's work: `ui-architect` maps to the theme / component tree at the chosen strictness; `react-developer` matches values to that tolerance (L1/L2 → measured/exact, L3 → close, L4 → loose); `reviewer` judges divergence against the level. A level that needs a running design (L1) but has no reachable URL is downgraded to L2 with a recorded deviation.

## Authority and priority order (when conflicts arise)

The design reference is a **very strong source of truth**, but accessibility and the component contract outrank it:

1. Recorded deviations (explicit user overrides).
2. Accessibility requirements (`@.claude/rules/accessibility.md`).
3. Component-contract requirements (four states, `@.claude/rules/component-contract.md`).
4. The design reference, reproduced at the chosen **fidelity level**.
5. MUI defaults.

When a conflict between items 2/3 and item 4 is resolved, the resolution is appended to the deviation list with the reason (e.g. "prototype lacked loading state — added skeleton per component-contract").

## Deviations — recorded, respected over the design

Any intentional difference between the produced UI and the design reference is a **deviation**. Deviations arise from:

- Explicit user instruction ("use a sidebar instead of bottom nav").
- Accessibility requirements (`@.claude/rules/accessibility.md`) — where the design would fail WCAG 2.1 AA, the accessible version wins and the departure is recorded.
- Component-contract requirements (`@.claude/rules/component-contract.md`) — the four mandatory states (loading/success/empty/error) win over a design that only shows the happy path.
- Technical constraints (e.g. an animation that conflicts with `prefers-reduced-motion`).

Every deviation is recorded in **two places**:

1. **Project memory** (type `project`) — one entry per deviation, with the reason.
2. **`docs/PROJECT.md` § "Design deviations"** — a human-readable list that survives context resets and is visible in the PR diff.

Agents read recorded deviations **before** consulting the design; deviations override the design reference.

## Binds these agents (rule is auto-loaded)

The translation mandate and the fidelity level bind **every design-touching agent**:

- `brief-synthesizer` — reads the static folder and/or opens the running design URL; extracts token summary, component inventory, screen list, and API assumptions **as MUI-theme / stack intent**; records the design source(s), URL, fidelity level, and the **Design reference** + **Design deviations** sections in `docs/PROJECT.md`.
- `ui-architect` — maps tokens → MUI theme entries and screens → route/component tree at the chosen fidelity; opens the running design to inspect screens when a URL is set; records routes and any new conflict-resolution deviation.
- `react-developer` — implements through the MUI theme + components, never copying prototype styles; at L1/L2 matches measured/exact values (opening the running design to compare), at L3/L4 reproduces close/loose; flags new deviations.
- `domain-architect` — designs the feature-sliced structure for complex UIs from the design, in-stack.
- `react-refactoring-expert` — keeps the design realized in-stack (theme + components) under green tests; no off-theme literals introduced by a refactor.
- `integration-architect` — styles third-party / SSO / payment widgets to the central MUI theme so they match the design.
- `a11y-auditor` — ensures the accessible realization (which wins over the design) stays in-stack; records the deviation.
- `qa` — visual-regression checks run against the **built MUI app**, not the prototype; the design is the intent, the app is the artifact.
- `reviewer` — blocks UI code that diverges from the design without a recorded deviation, ports prototype implementation verbatim, or uses magic values outside the theme. A visual gap not in the deviation list is 🟡 Important.
- `docs-writer` / `guide-writer` — describe screens in terms of real routes/components and the theme, not prototype files.

> Goal: the design is a first-class input — opened (folder and/or live URL), reproduced at the agreed fidelity level, and always **translated into MUI + TypeScript + the project stack** — transparently deviated from when accessibility, contract, or user intent demands, and never silently ignored or ported verbatim.
