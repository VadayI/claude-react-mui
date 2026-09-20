"""Verify real React AI payloads operate autonomously after fresh installation."""

import importlib.util
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[2]
SPEC = importlib.util.spec_from_file_location("family_delivery", Path(__file__).with_name("install.py"))
delivery = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(delivery)


class FamilyDeliveryTests(unittest.TestCase):
    """Exercise complete checked-in manifests in temporary projects without DB/network."""

    def setUp(self):
        """Create an empty Unicode/space target; return None, temporary writes only."""
        self.temp = tempfile.TemporaryDirectory(prefix="family delivery ")
        self.addCleanup(self.temp.cleanup)
        self.target = Path(self.temp.name) / "project unicode проба"
        self.target.mkdir()

    def install(self):
        """Apply an entirely preflighted fixture payload; assert no conflicts, no DB."""
        pending, conflicts = delivery.plan(ROOT, self.target)
        self.assertEqual(conflicts, [])
        for name, text in pending.items():
            path = self.target / name
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_text(text, encoding="utf-8", newline="\n")

    def test_fresh_autonomous_checks_and_repeat(self):
        """Installed core/generator execute from the target with no source imports."""
        self.install()
        for script, args in (("core_sync.py", ["--target", str(self.target), "--check"]),
                             ("generate_adapters.py", ["--root", str(self.target), "--check"]),
                             ("generate.py", ["--check"])):
            result = subprocess.run([sys.executable, str(self.target / "scripts/ai" / script), *args],
                                    cwd=self.target, capture_output=True, text=True, encoding="utf-8", check=False)
            self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        for name in ("scripts/ai/launch.ps1", "scripts/ai/launch.sh", "templates/ai/schemas/catalog.schema.json"):
            self.assertTrue((self.target / name).is_file())
        self.assertEqual(delivery.plan(ROOT, self.target), ({}, []))

    def test_customized_core_and_project_notes_survive(self):
        """Modified vendored code conflicts while unrelated project notes stay intact."""
        self.install()
        custom = self.target / "scripts/ai/launch.py"
        custom.write_text("# Local customization\n", encoding="utf-8")
        notes = self.target / "docs/HANDOFF.md"
        notes.write_text("Project-owned notes\n", encoding="utf-8")
        pending, conflicts = delivery.plan(ROOT, self.target)
        self.assertIn("scripts/ai/launch.py", conflicts)
        self.assertNotIn("docs/HANDOFF.md", pending)
        self.assertEqual(notes.read_text(encoding="utf-8"), "Project-owned notes\n")
        self.assertEqual(custom.read_text(encoding="utf-8"), "# Local customization\n")


if __name__ == "__main__":
    unittest.main()
