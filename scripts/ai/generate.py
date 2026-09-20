"""Generate the React delivery manifest using the pinned family-core renderer."""

import argparse
import hashlib
import json
from pathlib import Path
import sys
import tomllib


from adapters import outputs, read_source
from generate_adapters import plan, MANIFEST
from core_sync import verify

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
    sources = ["AGENTS.md", ".claude/settings.json", ".codex/config.toml",
               "scripts/claude.sh", "scripts/claude.ps1"]
    sources += [p.relative_to(root).as_posix() for p in sorted((root / "scripts/ai").glob("*")) if p.is_file() and p.suffix in (".py", ".sh", ".ps1")]
    sources += [p.relative_to(root).as_posix() for p in sorted((root / "docs/ai").rglob("*"))
                if p.is_file() and "generated" not in p.parts and "overrides" not in p.parts
                and p.name != "delivery-manifest.json"]
    sources += [p.relative_to(root).as_posix() for p in sorted((root / "templates/ai").rglob("*")) if p.is_file()]
    manifest = {"schema_version": 1, "phase": "P04-development-pin", "files": {}}
    legacy = json.loads(read_source(root, "templates/ai/legacy-launchers.json"))
    for path in sources:
        text = read_source(root, path)
        manifest["files"][path] = {"sha256": hashlib.sha256(text.encode("utf-8")).hexdigest(), "ownership": "template"}
        if path in legacy:
            manifest["files"][path]["legacy_sha256"] = legacy[path]
    for path, text in generated.items():
        manifest["files"][path] = {"sha256": hashlib.sha256(text.encode("utf-8")).hexdigest(), "ownership": "mixed" if path == "CLAUDE.md" else "template"}
    for path in ("AGENTS.md", ".claude/settings.json", ".codex/config.toml"):
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
