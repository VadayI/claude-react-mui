"""Generate the React delivery manifest using the pinned family-core renderer."""

import argparse
import hashlib
import json
from pathlib import Path
import sys


from adapters import outputs, read_source
from generate_adapters import plan, MANIFEST
from core_sync import verify
from install import contained


def seed_sources(root: Path) -> list[str]:
    """Load the explicit reviewed inventory without discovering project files.

    Args: root contains templates/ai/seed-inputs.json with per-file paths.
    Returns: Unique validated source names to hash and deliver.
    Raises: ValueError for unsupported/duplicate/unsafe or secret-like paths;
        JSON/OSError exceptions for invalid inventory. No DB/network or writes.
    Business rule: Adding an untracked file never adds it to a release payload;
        new files require an explicit inventory change reviewed with their code.
    """
    inventory = json.loads(read_source(root, "templates/ai/seed-inputs.json"))
    sources = inventory.get("files")
    if inventory.get("schema_version") != 1 or not isinstance(sources, list):
        raise ValueError("Unsupported seed inventory")
    if not all(isinstance(name, str) for name in sources):
        raise ValueError("Seed inventory paths must be strings")
    if len({name.casefold() for name in sources}) != len(sources):
        raise ValueError("Duplicate seed input path")
    for name in sources:
        path = contained(root, name)
        parts = [part.casefold() for part in Path(name).parts]
        if (any(part.startswith(".env") and part != ".env.example" for part in parts)
                or any(part in {"credentials", "secrets", "settings.local.json", "id_rsa", "id_ed25519"} for part in parts)
                or path.suffix.casefold() in {".pem", ".key", ".p12", ".pfx"}
                or "memory" in parts or "overrides" in parts
                or "project-state" in parts or ".ai-runtime" in parts):
            raise ValueError(f"Project/secret path cannot be a seed input: {name}")
    return sources


def main() -> int:
    """Generate or check adapters and their ownership manifest.

    Args: CLI --check chooses read-only drift verification; no args regenerates.
    Returns: 0 for consistency, 1 for drift. Invalid sources raise explicit errors.
    Side effects: Generation writes only managed outputs/manifest, preserving other
        files. --check performs no writes. No database or network interaction.
    """
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()
    if sys.version_info < (3, 13):
        parser.error("Python 3.13+ is required")
    root = Path(__file__).resolve().parents[2]
    drift = verify(root)
    if drift:
        raise ValueError(f"Vendored core drift: {drift}")
    pending, conflicts = plan(root)
    if conflicts:
        print("FAIL: customized adapters: " + ", ".join(conflicts))
        return 1
    generated = outputs(root)
    generated[MANIFEST] = pending[MANIFEST] if MANIFEST in pending else read_source(root, MANIFEST)
    if len(read_source(root, "AGENTS.md").encode("utf-8")) > 16384:
        raise ValueError("AGENTS.md exceeds the 16 KiB pilot budget")
    sources = seed_sources(root)
    manifest = {"schema_version": 1, "phase": "P04-production-structure", "files": {}}
    legacy = json.loads(read_source(root, "templates/ai/legacy-launchers.json"))
    legacy.update(json.loads(read_source(root, "templates/ai/legacy-entrypoints.json")))
    for path in sorted(set(sources) - generated.keys()):
        text = contained(root, path).read_text(encoding="utf-8")
        manifest["files"][path] = {"sha256": hashlib.sha256(text.encode("utf-8")).hexdigest(), "ownership": "template"}
        if path in legacy:
            manifest["files"][path]["legacy_sha256"] = legacy[path]
    for path, text in generated.items():
        manifest["files"][path] = {"sha256": hashlib.sha256(text.encode("utf-8")).hexdigest(), "ownership": "mixed" if path == "CLAUDE.md" else "template"}
        if path in legacy:
            manifest["files"][path]["legacy_sha256"] = legacy[path]
    manifest["files"]["Makefile"] = {"source": "templates/Makefile", "ownership": "mixed",
                                     "sha256": hashlib.sha256(read_source(root, "templates/Makefile").encode("utf-8")).hexdigest()}
    for path in ("AGENTS.md", ".claude/settings.json", ".codex/config.toml", ".mcp.json", ".gitignore", ".gitattributes"):
        manifest["files"][path]["ownership"] = "mixed"
    generated["docs/ai/delivery-manifest.json"] = json.dumps(manifest, indent=2, sort_keys=True) + "\n"
    drift = []
    for name, content in generated.items():
        target = root / name
        if target.is_symlink() or not target.resolve().is_relative_to(root):
            raise ValueError(f"Unsafe generated destination: {name}")
        if not target.is_file() or target.read_text(encoding="utf-8") != content:
            drift.append(name)
            if not args.check:
                target.parent.mkdir(parents=True, exist_ok=True)
                target.write_text(content, encoding="utf-8", newline="\n")
    if args.check and drift:
        print("FAIL: generated drift\n" + "\n".join(drift))
        return 1
    print(f"PASS: {len(generated)} adapters/packs/manifest {'checked' if args.check else 'generated'}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
