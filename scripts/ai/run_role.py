"""Run a separate project role session without model or trust overrides."""

import argparse
import hashlib
import json
from pathlib import Path
import shutil
import subprocess
import sys
import time
import uuid

from generate import outputs, read_source


def prepare(root: Path, runtime: str, role: str, task: str, delivery: str) -> tuple[list[str], str]:
    """Prepare argv and explicit role/rule delivery for an isolated CLI session.

    Args: root is a reviewed project; runtime is claude/codex; role is a catalog
        role; task is authorized user text; delivery selects file-list/role-pack.
    Returns: CLI arguments without executable and the stdin prompt.
    Raises: ValueError/KeyError for invalid roles, delivery or source paths.
    Side effects: Reads local non-secret instructions only; no DB/network/write.
    Business rules: Models inherit runtime settings. Reviewer tools/sandbox are
        read-only; workers are not coordinators. No trust/approval bypass flags.
    """
    catalog = json.loads(read_source(root, "docs/ai/catalog.json"))
    if role not in catalog["roles"] or runtime not in ("claude", "codex"):
        raise ValueError("Unknown role or runtime")
    metadata = catalog["roles"][role]
    read_source(root, metadata["path"])
    if delivery == "role-pack":
        pack = f"docs/ai/generated/role-packs/{role}.md"
        text = read_source(root, pack)
        if not text.rstrip().endswith(f"<!-- END ROLE PACK {role} -->"):
            raise ValueError("Incomplete role pack")
        if text != outputs(root)[pack]:
            raise ValueError("Stale role pack; regenerate and review it first")
        required = f"Read {pack} completely in bounded chunks; verify every source ending and the final END ROLE PACK marker."
    elif delivery == "file-list":
        rules = {item["id"]: item for item in catalog["rules"]}
        paths = [rules[name]["path"] for name in metadata["rules"]]
        for path in paths:
            read_source(root, path)
        required = "Read every full rule below in bounded batches, without truncation or selective omission:\n" + "\n".join(paths)
    else:
        raise ValueError("Unknown delivery mode")
    prompt = (f"You are a separate {role} role session, not the coordinator. Read AGENTS.md and {metadata['path']}.\n"
              + required + "\nBefore source analysis or edits, report completion of the required instruction reads.\n"
              "Use only available capabilities. Do not infer native custom-agent support from files.\n"
              "Models and trust inherit user/runtime settings. Do not bypass denied permissions.\n"
              "Report revision, exact evidence files/lines, checks and limitations.\n\nAuthorized task:\n" + task)
    if runtime == "codex":
        args = ["exec", "--sandbox", "read-only" if role == "reviewer" else "workspace-write", "--ephemeral", "--json", "-"]
    else:
        args = ["-p", "--agent", role, "--output-format", "stream-json", "--verbose", "--no-session-persistence"]
        if role == "reviewer":
            args += ["--tools", "Read,Glob,Grep"]
    return args, prompt


def main() -> int:
    """Preview or execute a fresh CLI role and record bounded session metadata.

    Args: CLI runtime, role, --task-file, optional --delivery/--dry-run;
        complete role-pack delivery is the default selected by ADR 0001.
    Returns: Runtime exit code; invalid configuration/missing executable returns 2.
    Side effects: Reads a non-secret task file; execution invokes the selected CLI
        and writes raw output plus metadata under gitignored .ai-runtime/sessions.
        The CLI may perform authorized task actions under its normal permissions.
        No database interaction by this launcher; preview does not write/run CLI.
    Errors: Source/runtime errors are explicit; no failed action is called PASS.
    """
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("runtime", choices=("claude", "codex"))
    parser.add_argument("role")
    parser.add_argument("--task-file", required=True)
    parser.add_argument("--delivery", choices=("file-list", "role-pack"), default="role-pack")
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()
    if sys.version_info < (3, 13):
        parser.error("Python 3.13+ is required")
    root = Path(__file__).resolve().parents[2]
    try:
        parts = Path(args.task_file).parts
        if any(part.startswith(".env") or part.lower() in ("secrets", "credentials") for part in parts):
            raise ValueError("Task file must be non-secret")
        task = read_source(root, args.task_file)
        argv, prompt = prepare(root, args.runtime, args.role, task, args.delivery)
        executable = shutil.which(args.runtime)
        if not executable:
            raise ValueError(f"Missing executable: {args.runtime}")
        metadata = {"schema_version": 1, "runtime": args.runtime, "role": args.role,
                    "delivery": args.delivery, "argv": [executable, *argv],
                    "prompt_sha256": hashlib.sha256(prompt.encode("utf-8")).hexdigest(),
                    "model": "runtime-default; inspect transcript for observed model",
                    "native_custom_role": args.runtime == "claude"}
        if args.dry_run:
            print(json.dumps(metadata, indent=2))
            return 0
        directory = root / ".ai-runtime/sessions"
        if any(path.is_symlink() or path.is_junction() for path in (root / ".ai-runtime", directory)):
            raise ValueError("Linked runtime output directory")
        directory.mkdir(parents=True, exist_ok=True)
        identifier = uuid.uuid4().hex
        directory = directory / identifier
        directory.mkdir()
        (directory / ".gitignore").write_text("*\n", encoding="utf-8")
        metadata["started_at"] = time.time()
        started = time.monotonic()
        with (directory / f"{identifier}.jsonl").open("w", encoding="utf-8", newline="\n") as output:
            result = subprocess.run([executable, *argv], input=prompt, text=True,
                                    encoding="utf-8", cwd=root, stdout=output, stderr=subprocess.STDOUT,
                                    shell=False, check=False)
        metadata.update(finished_at=time.time(), duration_seconds=time.monotonic() - started,
                        exit_code=result.returncode,
                        transcript=f".ai-runtime/sessions/{identifier}/{identifier}.jsonl")
        (directory / f"{identifier}.metadata.json").write_text(json.dumps(metadata, indent=2) + "\n", encoding="utf-8")
        print(json.dumps(metadata, indent=2))
        return result.returncode
    except (ValueError, KeyError, OSError) as error:
        print(f"Role launch error: {error}", file=sys.stderr)
        return 2


if __name__ == "__main__":
    raise SystemExit(main())
