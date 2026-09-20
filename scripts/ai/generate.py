"""Generate pilot runtime adapters and role packs from the neutral catalog."""

import argparse
import hashlib
import json
from pathlib import Path
import sys
import tomllib


def read_source(root: Path, name: str) -> str:
    """Read a repo-contained UTF-8 source, rejecting escapes and symlinks.

    Args: root is the checkout; name is a relative catalog path.
    Returns: Full normalized text, never a truncated read.
    Raises: ValueError for unsafe paths; OSError or UnicodeError for invalid files.
    Side effects: File reads only; no database/network access.
    """
    path = root / name
    if Path(name).is_absolute() or ".." in Path(name).parts or not path.resolve().is_relative_to(root.resolve()):
        raise ValueError(f"Unsafe source path: {name}")
    if path.is_symlink():
        raise ValueError(f"Symlink source not allowed: {name}")
    return path.read_text(encoding="utf-8")


def outputs(root: Path) -> dict[str, str]:
    """Resolve catalog dependencies and render deterministic runtime entry points.

    Args: root is the template checkout containing docs/ai/catalog.json.
    Returns: Relative output paths mapped to complete UTF-8 file contents.
    Raises: ValueError/KeyError on invalid catalogs, missing rules or unsafe paths.
    Side effects: Reads sources; no writes, subprocesses, network or DB operations.
    Business rules: Coordinator-only rules never enter worker packs; inherited
        model choices remain untouched; every pack ends with a completeness marker.
    """
    catalog = json.loads(read_source(root, "docs/ai/catalog.json"))
    if catalog["schema_version"] != 1:
        raise ValueError("Unsupported catalog version")
    rules = {rule["id"]: rule for rule in catalog["rules"]}
    if len(rules) != len(catalog["rules"]):
        raise ValueError("Duplicate rule IDs")
    generated = {
        "CLAUDE.md": "@AGENTS.md\n\n# Claude adapter\n\nUse docs/ai/catalog.json and neutral procedures. Role models inherit user/runtime\nsettings. Claude import syntax applies only to this wrapper. Tool names in examples\nare not cross-runtime contracts. Do not install optional plugins or change trust.\n",
    }
    for rule in rules.values():
        read_source(root, rule["path"])
        for dependency in rule["dependencies"]:
            if dependency not in rules:
                raise ValueError(f"Unknown dependency: {dependency}")
        generated[rule["legacy_path"]] = (
            "# Generated rule entry point — do not edit\n\n"
            f"Canonical rule: `{rule['path']}`. Read the full source when its catalog\n"
            "scope applies. Worker rule lists are explicit in docs/ai/catalog.json.\n"
            "The workflow rule is coordinator-only; workers are not coordinators.\n"
        )
    for role, metadata in catalog["roles"].items():
        required = set(metadata["rules"])
        missing = required - rules.keys()
        if missing:
            raise ValueError(f"Unknown role rules: {missing}")
        for rule_id in required:
            if rules[rule_id]["scope"] == "coordinator":
                raise ValueError(f"Coordinator rule leaked to worker: {role}")
            dependencies = set(rules[rule_id]["dependencies"]) - {"workflow"}
            if not dependencies.issubset(required):
                raise ValueError(f"Missing transitive rules for {role}: {dependencies - required}")
        role_text = read_source(root, metadata["path"])
        rule_list = "\n".join(f"- `{rules[name]['path']}`" for name in metadata["rules"])
        instructions = (
            f"Read AGENTS.md, then {metadata['path']}. You are the {role} role, not the coordinator.\n"
            "Read every required rule below completely before design, implementation or review.\n"
            "Use bounded reads and verify file endings; do not treat truncated output as read.\n"
            + rule_list
            + "\nAlternatively read the complete generated role pack and verify its END marker.\n"
            + f"Pack: docs/ai/generated/role-packs/{role}.md\n"
            + "Report revision, exact file paths/lines, changed files, checks and limitations.\n"
        )
        if role == "reviewer":
            instructions += "Read-only: never modify code, notes, plans or settings. Return findings only.\n"
        generated[f".codex/agents/{role}.toml"] = (
            f"name = {json.dumps(role)}\n"
            f"description = {json.dumps('Project ' + role + ' role; follows the neutral contract.')}\n"
            + ('sandbox_mode = "read-only"\n' if role == "reviewer" else "")
            + f"developer_instructions = {json.dumps(instructions)}\n"
        )
        tools = "Read, Glob, Grep" if role == "reviewer" else "Read, Glob, Grep, Write, Edit, Bash"
        generated[f".claude/agents/{role}.md"] = (
            f"---\nname: {role}\ndescription: Project {role} role following the neutral contract.\ntools: [{tools}]\n---\n\n"
            + instructions
        )
        pack = [f"# Generated role pack: {role}\n\nDo not edit; generated from full canonical sources.\n", role_text]
        for name in metadata["rules"]:
            path = rules[name]["path"]
            body = read_source(root, path)
            digest = hashlib.sha256(body.encode("utf-8")).hexdigest()
            pack.append(f"\n<!-- SOURCE {path} SHA256 {digest} -->\n\n{body}\n<!-- END SOURCE {path} -->\n")
        pack.append(f"\n<!-- END ROLE PACK {role} -->\n")
        generated[f"docs/ai/generated/role-packs/{role}.md"] = "\n".join(pack)
    for name in ("doctor", "verify", "wrap-up"):
        path = catalog["workflows"][name]
        read_source(root, path)
        description = {
            "doctor": "Inspect this template project environment and report missing capabilities without repairs.",
            "verify": "Verify a project feature and maintain its real route-based manual verification guide.",
            "wrap-up": "Finalize an authorized project work session with checks, shared memory, commit, push and PR; merge requires a user command.",
        }[name]
        generated[f".agents/skills/{name}/SKILL.md"] = (
            f"---\nname: {name}\ndescription: {description}\n---\n\n"
            f"Read repository AGENTS.md and [{name} procedure](../../../{path}).\n"
            "Execute the full neutral procedure using available runtime capabilities.\n"
            "User choices and authorization persist; do not invent missing tools or evidence.\n"
        )
        generated[f".claude/commands/{name}.md"] = (
            f"# Generated {name} entry point\n\nRead AGENTS.md and `{path}`.\n"
            "Use the current request arguments as procedure input. Follow every step with\n"
            "actual available capabilities; do not interpret Codex tools as Claude tools.\n"
        )
    for path, text in generated.items():
        if path.endswith(".toml"):
            tomllib.loads(text)
    return generated


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
    generated = outputs(root)
    if len(read_source(root, "AGENTS.md").encode("utf-8")) > 16384:
        raise ValueError("AGENTS.md exceeds the 16 KiB pilot budget")
    sources = ["AGENTS.md", ".claude/settings.json", ".codex/config.toml"]
    sources += [p.relative_to(root).as_posix() for p in sorted((root / "scripts/ai").glob("*.py"))]
    sources += [p.relative_to(root).as_posix() for p in sorted((root / "docs/ai").rglob("*"))
                if p.is_file() and "generated" not in p.parts and "overrides" not in p.parts
                and p.name != "delivery-manifest.json"]
    manifest = {"schema_version": 1, "phase": "P02", "files": {}}
    for path in sources:
        text = read_source(root, path)
        manifest["files"][path] = {"sha256": hashlib.sha256(text.encode("utf-8")).hexdigest(), "ownership": "template"}
    for path, text in generated.items():
        manifest["files"][path] = {"sha256": hashlib.sha256(text.encode("utf-8")).hexdigest(), "ownership": "mixed" if path == "CLAUDE.md" else "template"}
    manifest["files"]["AGENTS.md"]["ownership"] = "mixed"
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
