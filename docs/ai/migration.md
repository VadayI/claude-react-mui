# Production structure and migration boundaries

P04 uses the integrated family core pinned in `core-source.json`; the core's
immutable files are not edited by the React generator. `catalog.json` owns full
neutral rules, four migrated roles and doctor/verify/wrap-up/bootstrap/update
procedures. The shared renderer produces both runtime adapters and full packs.
`generate.py --check`, `generate_adapters.py --check` and `core_sync.py --check`
verify separate delivery, adapter and pinned-core invariants.

## Complete installation ownership

`templates/ai/seed-inputs.json` is the explicit reviewed per-file input list;
unknown/untracked files are never discovered or read into a payload. Secret-like
and project-state paths are rejected before opening. `delivery-manifest.json`
names every seed path, normalized digest, ownership and
optional source alias. `scripts/ai/install.py` rejects linked root ancestors (including missing children), preflights the whole payload before
writing and records the receipt last. `scripts/install.sh` clones the source and
calls that same entry point. The alias `Makefile <- templates/Makefile` delivers
derived targets without the upstream application's root Makefile assumptions.

| Paths | Policy |
| --- | --- |
| Canonical docs/ai, generated adapters, managed scripts/templates and legacy roles/commands/skills | Update only absent, equal or receipt-proven unchanged template files |
| AGENTS, CLAUDE, runtime settings, MCP config, ignore/attributes and root Makefile | Seed absent; accept equal; differing content requires a reviewed diff |
| Legacy bootstrap/update/template-sync/install and launcher files | Exact explicit old hashes permit migration; customized variants conflict |
| Notes, source, registries, output-language, overrides, local settings, env, arbitrary unknown files | Preserve; never import upstream project/session state |
| Active workflows | Preserve existing files; the template stays inert until the project's explicit CI mode choice materializes it (`install.py --ci-mode local\|github`) |

No directory is blanket template-owned. A conflict means no payload write,
including no new ownership receipt. Preview does not create the target. A
repeat install is empty. No automatic deletion, stash, reset or forced copy.
Interrupted writes can be replayed when already-equal files match; transaction
backups and full rollback acceptance are P13 work, not provided here.

## Legacy migration sequence

1. Existing integrated P04 AI receipts authorize unchanged managed-file updates.
   Newly included identical legacy files are adopted as identical, never by their
   directory name. Changed known entry points require their exact recorded hash.
2. Projects made by older copy-only installers have no receipt for many paths.
   Exact matches are accepted; unknown differences block and require comparison
   with the recorded old template revision. Do not invent a base hash from local
   content. Keep project additions when reconciling mixed files.
3. Bootstrap never reseeds CLAUDE or restores global rule imports. Preserve the
   installed runtime and write identity/notes to project docs. Existing language
   preferences remain authoritative; do not create a second writable registry.
4. P05 supplies the exact-candidate runner; P06 supplies CI choice/materialization
   before activation/push; P07 migrates shared state and language resolvers;
   P08 implements complete Git recovery; P10/P11 add onboarding/readiness roles.
5. P12 migrates the remaining 18 legacy roles, remaining commands and skills into
   full neutral contracts without truncating their functions. Inventory them from
   the checked-in `.claude/` paths and catalog legacy counts, retain each legacy
   adapter until its canonical source and generated entry points are verified,
   then update the ownership manifest and install/update tests in the same change.
   Existing legacy references are compatibility paths, not proof of Codex support.
6. P13 proves family install/update/rollback and runnable derived-app acceptance.

Fresh delivery is autonomous without a marketplace or sibling checkout. Delivery
tests and CLI version probes do not establish model-session loading, a runnable
derived application, full CI, deployment readiness or completion of P12/P13.
