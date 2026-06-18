# 0027. Design reference: fidelity levels, live-URL inspection, and the stack-translation mandate

Status: accepted · 2026-06-18

## Context

`.claude/rules/design-reference.md` originally treated a single design source — a static Claude-design
prototype folder (`docs/design/<name>/` of in-browser-Babel `.jsx` files) — as the UI source of truth,
and bound only `brief-synthesizer`, `ui-architect`, `react-developer`, and `reviewer`. Two gaps surfaced:

1. A design is often **served live** (locally or on the web, e.g. `http://localhost:8331/`); agents had
   no way to open it and read the real rendered tokens, only the declared CSS variables in a folder.
2. The rule fixed one stance ("very strong, not pixel-perfect") with no per-project control over how
   exactly the design is reproduced, and the translate-to-our-stack discipline bound only a subset of
   agents — leaving room for other agents to leak prototype implementation.

## Decision

Extend `design-reference.md` (no new rule file) with three additions:

- **Two design sources, often both.** A static prototype folder and/or a **running design at a URL**.
  When a URL is recorded, design-touching agents open it via the **Playwright MCP** (`browser_navigate`
  → `browser_snapshot`/`browser_take_screenshot`; `browser_evaluate` for `getComputedStyle`) to inspect
  the real render. Inspection is read-only. The already-enabled `playwright@claude-plugins-official`
  plugin provides these tools — no new dependency.
- **Fidelity / transfer levels (L1–L4), per project, default L3.** L1 browser-measured pixel-perfect
  (needs a running URL), L2 pixel-perfect from tokens/spec, L3 close MUI adaptation (default), L4
  inspiration. Asked at `/synthesize-brief` Step 1.5, recorded in `docs/PROJECT.md` § Design reference,
  and scaled by `ui-architect`/`react-developer`/`reviewer`.
- **Translation mandate binding every design-touching agent.** The design is always realized through the
  project stack (central MUI theme + components, TypeScript, TanStack Query/Zustand, feature-sliced) —
  never ported verbatim (no inline styles, Babel JSX, raw CSS variables, copied markup, or off-theme
  magic values). The fidelity level controls how exactly values match, not whether the design is
  translated. Bound across `brief-synthesizer`, `ui-architect`, `react-developer`, `domain-architect`,
  `react-refactoring-expert`, `integration-architect`, `a11y-auditor`, `qa`, `reviewer`, and
  `docs-writer`/`guide-writer`.

`/synthesize-brief`, `/preflight` (+ rule), `/doctor`, and `/audit` (+ `auditor`) gain a design-reachability
check: if a running design URL is declared, probe that it is up and the `playwright` plugin is enabled;
declared-but-unreachable → ⚠️ and agents fall back to the folder/brief (L1 downgrades to L2 with a
recorded deviation).

## Consequences

- A provided design is reproduced at an agreed, recorded fidelity, opened live when available, and always
  expressed in MUI + TypeScript — never as a copy of the prototype. The priority order is unchanged:
  recorded deviations → accessibility → component-contract four states → the design (at its level) →
  MUI defaults.
- The default (L3) preserves the rule's previous behaviour, so existing projects are unaffected unless
  they opt into L1/L2/L4.
- No new plugin, dependency, or `tools:` change for browser access: live inspection rides on the
  already-enabled Playwright MCP, referenced in prose like `github`/`context7` (the repo does not
  enumerate MCP tools in agent frontmatter).
- Delivered as three PRs: rule + template (levels, mandate), agent bindings (11 agents), and command
  checks (`synthesize-brief`/`preflight`/`doctor`/`audit`).

## Relates

- `.claude/rules/design-reference.md` — extended here (sources, levels, mandate, browser inspection).
- `.claude/rules/mcp-stack.md` — documents the Playwright MCP for opening a running design.
- `.claude/rules/preflight.md`, `.claude/commands/{synthesize-brief,preflight,doctor,audit}.md`,
  `.claude/agents/auditor.md` — design-reachability + start-time questions.
- ADR 0016 — accessibility stays above the design reference in the priority order.
