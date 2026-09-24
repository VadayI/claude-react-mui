"""Deliver the tested i18n seed without overwriting project-owned translations."""

import argparse
import hashlib
import json
from pathlib import Path


def seed_files(root: Path) -> list[Path]:
    """List canonical app files delivered by this seed.

    Args:
        root: Template checkout with src/lib/i18n.ts and src/locales.
    Returns:
        Sorted paths relative to root.
    Side effects: Reads directory names only; no database access.
    Raises:
        OSError: If the source cannot be inspected.
    """
    return [Path("src/lib/i18n.ts"), *sorted(p.relative_to(root) for p in (root / "src/locales").rglob("*.json"))]


def main() -> int:
    """Check, regenerate, or install the i18n delivery manifest.

    Args: CLI --sync, --check, or --target DIRECTORY (mutually exclusive).
    Returns: Zero on success; one on drift or an existing project-file conflict.
    Side effects: --sync writes only template mirrors and manifest. --target
        creates absent managed seed files after validating every destination.
        --check never writes. No network, database, env files, or Git changes.
    Raises:
        OSError, ValueError: On invalid input, unsafe paths, or filesystem errors.
    Business rules: Never overwrite different project translations or follow
        destination symlinks outside the target; byte equality is idempotent.
    """
    parser = argparse.ArgumentParser(description=__doc__)
    modes = parser.add_mutually_exclusive_group(required=True)
    modes.add_argument("--sync", action="store_true")
    modes.add_argument("--check", action="store_true")
    modes.add_argument("--target", type=Path)
    args = parser.parse_args()
    root = Path(__file__).resolve().parent.parent
    mirror = root / "templates/i18n"
    manifest_path = mirror / "manifest.json"
    if args.sync or args.check:
        expected = {p.as_posix(): hashlib.sha256((root / p).read_bytes()).hexdigest() for p in seed_files(root)}
        manifest = {"schema_version": 1, "ownership": "project-owned-after-install", "files": expected}
        if args.sync:
            for name in expected:
                target = mirror / name
                target.parent.mkdir(parents=True, exist_ok=True)
                target.write_bytes((root / name).read_bytes())
            manifest_path.write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")
            return 0
        if not manifest_path.exists() or json.loads(manifest_path.read_text()) != manifest:
            print("FAIL: i18n manifest drift; run --sync deliberately")
            return 1
    else:
        manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
        expected = manifest["files"]
    pending = []
    target_root = args.target.resolve() if args.target else mirror.resolve()
    for name, digest in expected.items():
        relative = Path(name)
        if relative.is_absolute() or ".." in relative.parts:
            raise ValueError(f"Unsafe manifest path: {name}")
        source = (mirror / relative).resolve()
        if not source.is_relative_to(mirror.resolve()):
            raise ValueError(f"Unsafe source: {name}")
        if not source.is_file() or hashlib.sha256(source.read_bytes()).hexdigest() != digest:
            print(f"FAIL: seed artifact drift: {name}")
            return 1
        target = target_root / relative
        if not target.resolve().is_relative_to(target_root):
            raise ValueError(f"Destination escapes target: {name}")
        if target.exists() and (not target.is_file() or target.read_bytes() != source.read_bytes()):
            print(f"CONFLICT: preserved project file: {name}")
            return 1
        pending.append((source, target))
    if args.target:
        for source, target in pending:
            if not target.exists():
                target.parent.mkdir(parents=True, exist_ok=True)
                target.write_bytes(source.read_bytes())
    print("PASS: i18n delivery verified" if args.check else "PASS: i18n seed installed")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
