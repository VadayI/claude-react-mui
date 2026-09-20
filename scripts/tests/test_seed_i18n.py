"""Behavioral delivery fixtures: fresh install, repeat, conflict, and drift."""

import hashlib
import json
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile
import unittest


class SeedDeliveryTests(unittest.TestCase):
    """Exercise the actual seed CLI against temporary project-owned files."""

    def setUp(self):
        """Create a disposable template; returns None, writes temp files, raises OSError; no DB."""
        self.temp = tempfile.TemporaryDirectory(prefix="i18n Україна ")
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        self.template = self.root / "template"
        (self.template / "scripts").mkdir(parents=True)
        shutil.copy2(Path(__file__).parents[1] / "seed-i18n.py", self.template / "scripts/seed-i18n.py")
        source = self.template / "src/lib/i18n.ts"
        source.parent.mkdir(parents=True)
        source.write_text("export const fixture = 1\n")
        self.run_cli("--sync", expected=0)

    def run_cli(self, *args, expected):
        """Run argv in the temp template; assert expected exit, return result; no DB or network."""
        result = subprocess.run([sys.executable, str(self.template / "scripts/seed-i18n.py"), *map(str, args)], capture_output=True, text=True)
        self.assertEqual(result.returncode, expected, result.stdout + result.stderr)
        return result

    def test_fresh_and_repeat_preserve_existing_files(self):
        """Verify fresh/repeated delivery preserves custom files; returns None; temp writes only."""
        project = self.root / "project"
        project.mkdir()
        note = project / "NOTES.md"
        note.write_text("project owned")
        self.run_cli("--target", project, expected=0)
        copied = project / "src/lib/i18n.ts"
        original_time = copied.stat().st_mtime_ns
        self.run_cli("--target", project, expected=0)
        self.assertEqual(copied.stat().st_mtime_ns, original_time)
        self.assertEqual(note.read_text(), "project owned")

    def test_conflict_does_not_overwrite_or_partially_install(self):
        """Verify conflict detection before writes; no DB; only modifies temporary fixtures."""
        project = self.root / "project"
        conflicting = project / "src/lib/i18n.ts"
        conflicting.parent.mkdir(parents=True)
        conflicting.write_text("custom translations")
        self.run_cli("--target", project, expected=1)
        self.assertEqual(conflicting.read_text(), "custom translations")
        self.assertEqual([p.name for p in project.rglob("*") if p.is_file()], ["i18n.ts"])

    def test_check_detects_drift_without_repair(self):
        """Corrupt the mirror and require nonzero/no repair; temporary writes, no DB, returns None."""
        mirror = self.template / "templates/i18n/src/lib/i18n.ts"
        mirror.write_text("drift")
        self.run_cli("--check", expected=1)
        self.assertEqual(mirror.read_text(), "drift")

    def test_manifest_cannot_escape_target(self):
        """Reject parent traversal before target writes; returns None, no network or database."""
        manifest = self.template / "templates/i18n/manifest.json"
        manifest.write_text(json.dumps({"files": {"../escape": hashlib.sha256(b"x").hexdigest()}}))
        self.run_cli("--target", self.root / "project", expected=1)
        self.assertFalse((self.root / "escape").exists())


if __name__ == "__main__":
    unittest.main()
