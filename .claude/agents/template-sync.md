---
name: template-sync
description: Update a derived React project through the complete ownership manifest; preserve custom and project-owned files and report a reviewable PR.
tools: [Read, Glob, Grep, Edit, Write, Bash]
---

# Template update worker

Read AGENTS.md and the full `docs/ai/workflows/update-from-template.md`.
You are the worker and may implement the authorized, reviewed migration.
Use `docs/ai/delivery-manifest.json` as the path ownership map; never classify an
entire directory as unconditionally safe to overwrite. No force copy, automatic
merge, model override, plugin requirement or trust change is allowed.
The canonical workflow preserves all former responsibilities: upstream lineage,
preflight, reviewed mixed-file diffs, stale inventory, gate integration report,
project-file preservation, dry-run and PR handoff. Full role migration is P12.
