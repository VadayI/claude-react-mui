# React shared-core integration

The Python standard-library family core is vendored from an exact contract Git
commit. `docs/ai/core-source.json` contains the pin and per-file digests: on `main`
the integrated contract main `db342b78ee8d085b6f5b854cabd217d69176d99c`; this P08
review branch uses the development pin `7d0571de2f36fa4f7e74864f35353a199ac3d69a`.
Runtime commands require no adjacent checkout, marketplace or source repository
access. A development pin on an unmerged core PR is temporary; after that PR
merges, redeliver with `core_sync.py --integrated-pin` and verify digest/ancestry.

```text
python scripts/ai/core_sync.py --target . --check
python scripts/ai/generate_adapters.py --root . --check
python scripts/ai/generate.py --check
python scripts/ai/install.py --target "../derived project" --apply
python scripts/ai/launch.py codex --probe
python scripts/ai/launch.py claude --probe
```

`generate.py` now delegates rendering to the pinned `adapters.py`, preflights
ownership through `generate_adapters.py`, checks core drift, and builds the React
delivery manifest. The manifest includes core Python files, PowerShell/Bash
wrappers, JSON schemas, inert MCP template, canonical sources and generated role
receipt. Full role packs are the default for `run_role.py`; explicit file-list
delivery remains available. No rules or role responsibilities were removed.

Fresh/repeat AI delivery is independent of application bootstrap. It preserves
existing project-owned configuration and customized files through explicit
conflicts. Update the canonical rules/catalog first, then run generation; do not
edit vendored core scripts. The runtime pin validates content, not successful
application checks or native custom-role support.

`make ai-claude` and `make codex` call the new launcher. For Windows, use
`pwsh -NoProfile -File scripts/ai/launch.ps1 codex --probe` or explicit Git Bash
with `scripts/ai/launch.sh`. See `launchers.md` for task input and explicit optional
environment names. Existing `make cc`/`scripts/claude.sh` retain legacy behavior
pending the dedicated bootstrap/config migration; they still source `.env` and
are not the portable launch path.

The explicit CI choice and owned workflow materialization are delivered through
`scripts/ai/install.py --ci-mode`; P13 full delivery acceptance is still open.
This integration does not certify the legacy installer or a complete runnable
derived application. No merge/deploy is implied.
