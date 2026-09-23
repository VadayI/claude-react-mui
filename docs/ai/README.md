# Shared instruction delivery

`catalog.json` routes the full canonical rules and four pilot roles. Root
`AGENTS.md` is the shared entry point; `CLAUDE.md`, runtime roles, command wrappers,
skills and role packs are generated. Edit canonical files and then run:

```text
python scripts/ai/generate.py
python scripts/ai/generate.py --check
python -m unittest discover -s scripts/ai -p "test_*.py"
```

Python 3.13+ is required; there are no third-party tooling dependencies.
Generation does not prove runtime loading. See `compatibility.md` for evidence.
K0 uses the original settings from the prepared app commit. The K1/K2 pilot
removes implicit formatting/repair hooks, optional plugin activation and a forced
model selection. User/global settings remain untouched. Read-only reviewers
cannot inherit project Stop hooks that modify code. Explicit checks remain in
the verification procedure; executable replacement hooks are a later P06 step.

## Delivery and updates

After generation, preview the self-contained instruction payload for a target:

```text
python scripts/ai/install.py --target "../derived project" --ci-mode local
python scripts/ai/install.py --target "../derived project" --ci-mode local --apply
```

The first command never writes. The second preflights every source digest and
destination before writing. Fresh or identical files are safe; an unchanged
previously installed template file can update. Local customizations and changed
mixed-ownership entry points produce conflicts without any writes. Resolve those
explicitly after reviewing the diff. Arbitrary local files are preserved.
`delivery-manifest.json` records normalized UTF-8 hashes and ownership; it is
installation metadata, not a substitute for an authenticated upstream revision.
No deletion, shell execution, dependency installation, credentials, trust
changes or Git mutations occur during this delivery. A fresh install requires
`--ci-mode local` or `--ci-mode github`; the choice is saved in project-owned
`docs/project-state/project.json` before the first push. Local mode materializes
only a `workflow_dispatch` active workflow. GitHub mode adds automatic events.
Both call the same exact-candidate runner catalog. An existing project reuses
its saved choice unless an explicit switch is requested. Edited or foreign
active workflows conflict before any file is written. A fresh project starts at
the conservative `experiment` maturity until onboarding records a reviewed
stage; the contract artifact path matches the checked-in React template. An
initial GitHub push with a zero-OID previous commit cannot prove an exact base
and fails the runner honestly; use a reviewed manual run with an explicit base
once one exists.

After `git init`, run `python scripts/ai/install_git_hooks.py --target . --apply`
to connect the lightweight `.githooks` scripts. Existing `core.hooksPath` or
default hook files cause a reviewable conflict, preserving foreign hooks. Set
`AI_PYTHON` to a Python 3.13+ executable when PATH points to an older Python.
The short pre-commit guard reads only staged diff; pre-push checks every branch
ref with the exact runner. New branches require a current tracking ref for
remote `main`; release tags use a separate procedure. Local hooks are
bypassable and do not replace remote policy.

Claude `SessionStart` runs the explicit `detect-env.mjs` probe through
`scripts/session-start.sh` and exposes failure. It does not remove Git locks,
seed `.env`, install dependencies, or start services. There is no automatic
Stop/SessionEnd formatter, push, or merge; close with an explicit handoff.
An interrupted session may not run an end hook. Codex has no verified trusted
tool-hook equivalent in this pilot. Runtime tool hooks provide early policy
feedback only and do not cover arbitrary shell writes.

This command now installs the complete manifest payload, including legacy roles,
commands, skills and scaffold inputs, plus the derived Makefile. The Bash
`scripts/install.sh` launcher uses this same preflight and accepts `--ci-mode`;
`--force` cannot bypass conflicts. Memory, project notes, application code and
real env files are not seeded. The complete bootstrap/update procedures have generated
Claude and Codex entry points; see [migration.md](migration.md). Existing
custom instructions require a reviewable reconciliation. Full transactional
rollback and full role migration remain later phases.

## Separate role sessions

When native Codex role selection is unavailable, invoke a separate role session:

```text
python scripts/ai/run_role.py codex react-developer --task-file docs/task.md --dry-run
python scripts/ai/run_role.py codex react-developer --task-file docs/task.md --delivery role-pack
```

The task file must be a repository-contained non-secret file. Claude uses the
native generated role; Codex receives the same explicit role contract in a fresh
session. Models inherit runtime settings. Reviewers use read-only tools/sandbox.
No trust bypass, global permissions or automatic approval policy is enabled.
Denied Git operations remain blocked; do not interpret a transcript as success.
Raw transcripts/metadata go only to gitignored `.ai-runtime/sessions`; commit
sanitized evidence summaries to shared docs separately. CLI print-mode should
only be used in reviewed project directories, never untrusted foreign code.

This launcher implements the measured fallback, not independent review or a
claim that Codex native custom roles work. File-list versus pack acceptance is
still being measured in P03. Use `--dry-run` to inspect argv without execution.
