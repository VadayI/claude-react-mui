"""Exercise React Claude PreToolUse payload parsing as early policy feedback."""

import json
from pathlib import Path
import subprocess
import unittest

ROOT = Path(__file__).resolve().parents[2]
GUARD = ROOT / "scripts/policy/claude_edit_guard.mjs"
PROTECTED = "src/lib/api/openapi.yml"


class ClaudeEditGuardTests(unittest.TestCase):
    """Check reviewed payload shapes without claiming arbitrary shell coverage."""

    def probe(self, payload: dict | str) -> subprocess.CompletedProcess[str]:
        """Run the React Node hook against one synthetic Claude payload.

        Args: payload is a JSON object or malformed raw text.
        Returns: Completed Node process with exit code and diagnostics.
        Raises: OSError when Node cannot start.
        Side effects: One local subprocess; no DB, network, or file writes.
        Business rule: Exit two blocks a recognized protected edit early.
        """
        data = payload if isinstance(payload, str) else json.dumps(payload)
        return subprocess.run(["node", str(GUARD)], input=data, capture_output=True,
                              text=True, encoding="utf-8", check=False)

    def test_write_and_windows_paths(self):
        """Block direct artifact writes across POSIX and Windows path syntax.

        Args: None; synthetic Write and Edit payloads.
        Returns: None after protected and ordinary path assertions.
        Raises: AssertionError for a missed or unrelated path.
        Side effects: Local Node subprocesses only; no DB/network/writes.
        """
        for name in (PROTECTED, f"C:\\work\\react\\{PROTECTED.replace('/', chr(92))}",
                     "./src/lib/api/../api/openapi.yml"):
            self.assertEqual(self.probe({"tool_name": "Write", "tool_input": {"file_path": name}}).returncode, 2)
        self.assertEqual(self.probe({"tool_name": "Edit", "tool_input":
                                     {"file_path": "docs/openapi.yml"}}).returncode, 0)

    def test_patch_rename_delete_and_multiple_files(self):
        """Inspect patch headers, rename destinations, and nested file lists.

        Args: None; synthetic Bash apply_patch and MultiEdit payloads.
        Returns: None after every protected path blocks.
        Raises: AssertionError if one changed file escapes feedback.
        Side effects: Local Node subprocesses only; no DB/network/writes.
        """
        patches = (
            f"apply_patch <<'PATCH'\n*** Begin Patch\n*** Delete File: {PROTECTED}\n*** End Patch\nPATCH",
            f"apply_patch <<'PATCH'\n*** Begin Patch\n*** Update File: src/app.tsx\n*** Move to: {PROTECTED}\n*** End Patch\nPATCH",
            f"apply_patch <<'PATCH'\n*** Begin Patch\n*** Update File: src/app.tsx\n*** Update File: {PROTECTED}\n*** End Patch\nPATCH",
            f"apply_patch <<'PATCH'\ndiff --git a/src/app.tsx b/{PROTECTED}\nrename to {PROTECTED}\nPATCH",
        )
        for command in patches:
            self.assertEqual(self.probe({"tool_name": "Bash", "tool_input": {"command": command}}).returncode, 2)
        multi = {"tool_name": "MultiEdit", "tool_input": {"files": [
            {"file_path": "src/app.tsx"}, {"new_path": PROTECTED}]}}
        self.assertEqual(self.probe(multi).returncode, 2)

    def test_malformed_and_shell_scope(self):
        """Fail malformed edit payloads and record arbitrary shell limitation.

        Args: None; malformed JSON, absent path and shell overwrite fixtures.
        Returns: None after parser behavior assertions.
        Raises: AssertionError if malformed edits pass silently.
        Side effects: Local Node subprocesses only; no DB/network/writes.
        Business rule: Arbitrary Bash writes require Git/CI drift detection.
        """
        self.assertEqual(self.probe("{").returncode, 2)
        self.assertEqual(self.probe({"tool_name": "Write", "tool_input": {}}).returncode, 2)
        shell = {"tool_name": "Bash", "tool_input": {"command": f"printf x > {PROTECTED}"}}
        self.assertEqual(self.probe(shell).returncode, 0)


if __name__ == "__main__":
    unittest.main()
