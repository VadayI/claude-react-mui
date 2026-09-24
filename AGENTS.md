# Shared project instructions

This React/MUI frontend consumes the external pinned OpenAPI contract. Read
`docs/HANDOFF.md`, Git status/branch/HEAD and the relevant plan before work;
reconcile a stale handoff with Git rather than assuming it is current.
Respect the user's chosen language and existing authorization.

## Roles and rule loading

`docs/ai/catalog.json` is the routing map. The full normative stack rules live in
`docs/ai/rules/`; role contracts in `docs/ai/roles/`. Read the assigned role and
**every required rule** in its catalog list before design, implementation or review,
including transitive dependencies. Use bounded reads and check the end of each
file. `docs/ai/generated/role-packs/` is an alternative generated delivery under
pilot evaluation, not a separate editable source. Imports and tool names in
legacy examples are references: use the actual runtime's supported operations.

Only a session explicitly coordinating a multi-role pipeline reads and follows
`docs/ai/workflows/orchestrate.md`. Workers execute their assigned role and may
implement; reviewers remain read-only. Shared instructions do not make every
session a coordinator. A coordinator verifies only exact non-secret files/ranges
named in role reports (D02), never implements, and returns insufficient evidence
to the role. Without native delegation, use separate role invocations with saved
reports; never claim independent review from a single session.

## Invariants

- Contract-first: never hand-edit vendored OpenAPI or generated types. Refresh
  the pinned source, regenerate, and run both integrity gates. Missing endpoints
  are contract tasks; no invented DTOs, endpoints or production mocks.
- Follow existing architecture, typed props/client, RHF+Zod, Query/server-state,
  Zustand/client-state, MUI theme, accessible UI and translated resources.
- Behavioral application changes use tests before implementation; documentation
  and config use relevant verification. Update feature README and changed guides.
- Preserve foreign staged/unstaged/untracked work, stash, refs and worktrees.
  Stage explicit task-owned files/hunks. Never blanket stage, force-push, delete
  locks, or reset/clean a project to make checks pass.
- Commit/push/PR are part of authorized finalize. **Merge requires an explicit
  user command** (D01), including dependency PRs. Pending PR means MERGE_PENDING.
  No release tags or deploy as an implicit part of wrap-up.
- Report PASS/FAIL/NOT_VERIFIED/NOT_APPLICABLE honestly. Missing prerequisites or
  skipped checks never constitute a passed full profile. Bind final evidence to
  candidate/base revisions; dirty-tree checks are developer feedback only.
- Never read/copy/log real env files, credentials, private keys or secret values.
  Project config cannot grant itself trust; do not modify global permissions or
  install optional plugins to bypass missing capabilities.

## Runtime and procedures

Python 3.13+ is required for template tooling; Node 24 is the primary app target.
Native Windows uses PowerShell orchestration and explicit
`C:/Program Files/Git/bin/bash.exe` for Bash scripts. Do not select WSL's `bash`
implicitly. Preserve models from user/runtime defaults rather than translating
Claude model names into Codex names.

Read `docs/ai/workflows/doctor.md` for environment inspection, `verify.md` for
checks/manual guides, and `wrap-up.md` for finalization. Shared project memory is
`docs/HANDOFF.md`, `docs/WORKLOG.md`, plans and versioned registries; private chat
history/auto-memory is not synchronized. Persistent legacy paths remain in use
until the explicit P07 migration; never create competing writable registries.

Delivered so far: canonical rules and generated adapters (P02), the vendored
family core with schemas and launchers (P04), the exact-candidate detector/runner
(P05), explicit CI mode, owned workflow materialization and Git/tool hooks (P06).
Not delivered yet: shared project state migration (P07), the G0–G9 Git lifecycle
(P08), onboarding and readiness roles (P10/P11) and family acceptance (P13).
`docs/ai/compatibility.md` and `docs/ai/pilot-report.md` record the measured
pilot; existence or parsing of an adapter is not runtime proof.
