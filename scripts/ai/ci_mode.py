"""Materialize an ownership-aware React workflow after an explicit CI choice."""

import hashlib
import json
from pathlib import Path

WORKFLOW = ".github/workflows/frontend-ci.yml"
TEMPLATE = "templates/.github/workflows/frontend-ci.yml"
RECEIPT = "docs/ai/ci-workflow-receipt.json"
PROJECT = "docs/project-state/project.json"


def sha256(content: str) -> str:
    """Hash workflow text for ownership comparison.

    Args: content is normalized UTF-8 workflow text.
    Returns: Lowercase SHA-256 hex digest.
    Raises: None for a valid string input.
    Side effects: None; no database, network, or filesystem access.
    """
    return hashlib.sha256(content.encode("utf-8")).hexdigest()


def workflow(source: Path, mode: str) -> str:
    """Render the canonical exact-candidate runner workflow for one CI mode.

    Args: source is the reviewed template root; mode is local or github.
    Returns: Workflow text with only the selected event triggers.
    Raises: ValueError for invalid mode or an unexpected canonical template.
    Side effects: Reads one template file; no writes, DB, or network access.
    Business rule: Local mode permits manual dispatch only; both modes execute
        the same runner job and catalog with identical candidate/base arguments.
    """
    if mode not in {"local", "github"}:
        raise ValueError("CI mode must be local or github")
    content = (source / TEMPLATE).read_text(encoding="utf-8")
    marker = "\npermissions:\n"
    prefix, separator, remainder = content.partition(marker)
    expected = ("name: React exact runner\non:\n"
                "  push:\n    branches: [main]\n"
                "  pull_request:\n    branches: [main]\n"
                "  merge_group:\n  workflow_dispatch:\n    inputs:\n"
                "      base:\n        description: Exact ancestor commit for manual verification\n"
                "        required: true\n        type: string\n")
    if not separator or prefix != expected or "\njobs:\n" not in remainder:
        raise ValueError("Unexpected canonical workflow structure")
    events = ("on:\n  workflow_dispatch:\n    inputs:\n      base:\n"
              "        description: Exact ancestor commit for manual verification\n"
              "        required: true\n        type: string\n")
    if mode == "github":
        events = ("on:\n  push:\n    branches: [main]\n  pull_request:\n"
                  "    branches: [main]\n  merge_group:\n" + events.removeprefix("on:\n"))
    return "name: React exact runner\n" + events + marker + remainder


def project_config(target: Path, mode: str) -> tuple[str, bool]:
    """Prepare project-owned CI choice without discarding other settings.

    Args: target is a derived project; mode is the explicit requested choice.
    Returns: Serialized project.json and whether an existing choice differs.
    Raises: ValueError for malformed existing configuration or invalid mode.
    Side effects: Reads project.json if present; no writes, DB, or network.
    Business rule: An existing CI choice changes only with an explicit mode.
    """
    if mode not in {"local", "github"}:
        raise ValueError("CI mode must be local or github")
    path = target / PROJECT
    if path.exists():
        config = json.loads(path.read_text(encoding="utf-8"))
        if config.get("schema_version") != 1 or not isinstance(config.get("ci"), dict):
            raise ValueError("Existing project configuration needs manual migration")
        changed = config["ci"].get("execution") not in (None, mode)
    else:
        config = {"schema_version": 1, "template": {"kind": "react", "is_scaffold": False},
                  "ci": {}, "git": {"merge_policy": "user_command"},
                  "orchestration": {"coordinator_read": "reported_files_only"},
                  "maturity": {"stage": "experiment"},
                  "contract": {"source": "repo_pin", "artifact": "src/lib/api/openapi.yml"},
                  "documentation": {}, "features": [], "deployment": {}}
        changed = False
    config["ci"]["execution"] = mode
    return json.dumps(config, indent=2, sort_keys=True) + "\n", changed


def plan(source: Path, target: Path, mode: str) -> tuple[dict[str, str], list[str]]:
    """Preflight workflow and project choice before any install writes.

    Args: source is template root, target is a derived project, mode is explicit.
    Returns: Pending path/text writes and sorted ownership conflicts.
    Raises: ValueError for invalid metadata, unsafe linked paths or mode.
    Side effects: Reads source/target files only; no writes, DB, or network.
    Business rule: Unknown or edited active workflows are never overwritten;
        existing project fields survive a requested CI mode switch.
    """
    from install import contained, validate_root

    source, target = validate_root(source), validate_root(target)
    rendered = workflow(source, mode)
    current_path = contained(target, WORKFLOW)
    receipt_path = contained(target, RECEIPT)
    previous = json.loads(receipt_path.read_text(encoding="utf-8")) if receipt_path.exists() else {}
    if previous and (previous.get("schema_version") != 1 or
                     previous.get("path") != WORKFLOW or
                     not isinstance(previous.get("sha256"), str)):
        raise ValueError("Invalid CI workflow ownership receipt")
    conflicts = []
    pending = {}
    if current_path.exists():
        current = current_path.read_text(encoding="utf-8")
        if current != rendered and sha256(current) != previous.get("sha256"):
            conflicts.append(WORKFLOW)
    if not current_path.exists() or current_path.read_text(encoding="utf-8") != rendered:
        pending[WORKFLOW] = rendered
    receipt = json.dumps({"schema_version": 1, "path": WORKFLOW, "sha256": sha256(rendered),
                          "mode": mode}, indent=2, sort_keys=True) + "\n"
    if not receipt_path.exists() or receipt_path.read_text(encoding="utf-8") != receipt:
        pending[RECEIPT] = receipt
    project, _ = project_config(target, mode)
    project_path = contained(target, PROJECT)
    if not project_path.exists() or project_path.read_text(encoding="utf-8") != project:
        pending[PROJECT] = project
    return pending, sorted(conflicts)
