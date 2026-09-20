# Neutral instruction pilot

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
python scripts/ai/install.py --target "../derived project"
python scripts/ai/install.py --target "../derived project" --apply
```

The first command never writes. The second preflights every source digest and
destination before writing. Fresh or identical files are safe; an unchanged
previously installed template file can update. Local customizations and changed
mixed-ownership entry points produce conflicts without any writes. Resolve those
explicitly after reviewing the diff. Arbitrary local files are preserved.
`delivery-manifest.json` records normalized UTF-8 hashes and ownership; it is
installation metadata, not a substitute for an authenticated upstream revision.
No deletion, shell execution, dependency installation, workflow activation,
credentials, trust changes or Git mutations occur during this delivery.

This command installs the **pilot instruction payload**. The legacy full-project
installer remains separate until the P06/P12 migration; do not use its `--force`
as a conflict-resolution mechanism. Full transactional rollback and production
core pinning are not claimed by this pilot.
