"""Q02 (D18, D25.1, D26): Claude settings follow the family hook standard and work after cd."""

import json
import os
from pathlib import Path
import re
import shutil
import sys
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "scripts/ai"))
import hook_check

SETTINGS = json.loads((ROOT / ".claude/settings.json").read_text(encoding="utf-8"))
GATE = '"${AI_PYTHON:-python3}" "$CLAUDE_PROJECT_DIR/scripts/ai/workdir.py" --hook'
ALLOWED_COLORS = {"red", "blue", "green", "yellow", "purple", "orange", "pink", "cyan"}
PATCH = "apply_patch <<'P'\n*** Begin Patch\n*** Update File: api/openapi.yml\n*** End Patch\nP"


def handlers(event: str) -> list[dict]:
    """Return every hook handler registered for one event.

    Args: event is a Claude hook event name.
    Returns: Handler objects in settings order.
    Side effects: None.
    """
    return [hook for group in SETTINGS["hooks"].get(event, []) for hook in group["hooks"]]


class CommittedSettingsTests(unittest.TestCase):
    """Static checks of `.claude/settings.json` and agent frontmatter; no processes."""

    def test_settings_pass_the_core_style_check(self):
        self.assertEqual([], hook_check.check_settings(SETTINGS))

    def test_policies_are_fail_closed_and_session_start_is_not(self):
        self.assertEqual("Write|Edit|NotebookEdit|Bash|PowerShell", SETTINGS["hooks"]["PreToolUse"][0]["matcher"])
        for event in ("PreToolUse", "UserPromptSubmit"):
            self.assertEqual({"block"}, {hook["onFailure"] for hook in handlers(event)}, event)
            self.assertIn(GATE, [hook["command"] for hook in handlers(event)], event)
        self.assertNotIn("onFailure", handlers("SessionStart")[0])
        self.assertNotIn("Stop", SETTINGS["hooks"])

    def test_secret_rules_are_anchored(self):
        deny = SETTINGS["permissions"]["deny"]
        for rule in ("Read(/.env)", "Read(/**/.env)", "Read(/**/*.pem)", "Read(/**/secrets/**)"):
            self.assertIn(rule, deny)
        self.assertIn("Read(/**/*.example)", SETTINGS["permissions"]["allow"])
        self.assertEqual("1", SETTINGS["env"]["CLAUDE_CODE_DISABLE_1M_CONTEXT"])

    def test_agent_colors_are_from_the_allowed_set(self):
        for path in sorted((ROOT / ".claude/agents").glob("*.md")):
            match = re.search(r"^color:\s*(\S+)\s*$", path.read_text(encoding="utf-8"), re.MULTILINE)
            if match:
                self.assertIn(match.group(1), ALLOWED_COLORS, path.name)


@unittest.skipIf(os.name == "nt", "emulates the POSIX shell form; Windows is accepted manually")
@unittest.skipUnless(shutil.which("bash") and shutil.which("node"), "bash and node are required")
class CommittedHookExecutionTests(unittest.TestCase):
    """§21.2 criterion: the committed hooks run from `src/lib` with no `python` on PATH."""

    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.bin = Path(self.tmp.name)
        (self.bin / "python3").symlink_to(sys.executable)
        (self.bin / "node").symlink_to(shutil.which("node"))
        self.environ = {"PATH": str(self.bin), "ALLOW_MNT_SESSION": "1"}

    def tearDown(self):
        self.tmp.cleanup()

    def run_hook(self, handler: dict, payload: dict) -> str:
        cwd = ROOT / "src/lib"
        return hook_check.run_hook(handler, project_dir=ROOT, cwd=cwd, payload={"cwd": str(cwd), **payload},
                                   environ=self.environ, bash=shutil.which("bash"))

    def test_guard_blocks_contract_edit_from_subdirectory(self):
        self.assertIsNone(shutil.which("python", path=str(self.bin)))
        guard = handlers("PreToolUse")[0]
        self.assertEqual("deny", self.run_hook(guard, {"tool_name": "Bash", "tool_input": {"command": PATCH}}))
        self.assertEqual("deny", self.run_hook(guard, {"tool_name": "PowerShell", "tool_input": {"command": PATCH}}))
        edit = {"tool_name": "Edit", "tool_input": {"file_path": str(ROOT / "src/lib/api/openapi.yml")}}
        self.assertEqual("deny", self.run_hook(guard, edit))
        other = {"tool_name": "Edit", "tool_input": {"file_path": str(ROOT / "src/lib/i18n.ts")}}
        self.assertEqual("allow", self.run_hook(guard, other))

    def test_workdir_gate_runs_through_python3(self):
        gate = next(hook for hook in handlers("UserPromptSubmit") if hook["command"] == GATE)
        self.assertEqual("allow", self.run_hook(gate, {"prompt": "ok"}))


if __name__ == "__main__":
    unittest.main()
