"""Behavioral regression tests for portable, non-destructive instruction delivery."""

import importlib.util
import json
from pathlib import Path
import tempfile
import unittest

SPEC = importlib.util.spec_from_file_location("delivery", Path(__file__).with_name("install.py"))
delivery = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(delivery)


class DeliveryTests(unittest.TestCase):
    """Exercise ownership and hostile payloads without subprocesses or a database."""

    def setUp(self):
        """Create temporary source/target trees; no parameters, return or DB use."""
        self.temporary = tempfile.TemporaryDirectory()
        self.addCleanup(self.temporary.cleanup)
        self.source = Path(self.temporary.name) / "source"
        self.target = Path(self.temporary.name) / "target"
        self.source.mkdir()
        self.target.mkdir()
        self.publish({"rule.md": ("original\n", "template"), "AGENTS.md": ("shared\n", "mixed")})

    def publish(self, files):
        """Write fixture text/ownership pairs and their manifest; returns nothing.

        Args: files maps relative names to (text, ownership) tuples.
        Side effects: Temporary file writes only; I/O errors propagate; no DB use.
        """
        manifest = {"schema_version": 1, "files": {}}
        for name, (text, ownership) in files.items():
            destination = self.source / name
            destination.parent.mkdir(parents=True, exist_ok=True)
            destination.write_text(text, encoding="utf-8")
            manifest["files"][name] = {"sha256": delivery.digest(text), "ownership": ownership}
        directory = self.source / "docs/ai"
        directory.mkdir(parents=True, exist_ok=True)
        (directory / "delivery-manifest.json").write_text(json.dumps(manifest), encoding="utf-8")

    def apply_fixture(self):
        """Apply a conflict-free fixture plan; writes temp files, returns nothing.

        Raises: AssertionError for conflicts; filesystem errors propagate. No DB.
        """
        pending, conflicts = delivery.plan(self.source, self.target)
        self.assertEqual(conflicts, [])
        for name, content in pending.items():
            path = self.target / name
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_text(content, encoding="utf-8")

    def test_fresh_preview_is_read_only_and_repeat_is_empty(self):
        """Assert preview leaves no files and replay is empty; temp I/O only, no DB."""
        pending, conflicts = delivery.plan(self.source, self.target)
        self.assertEqual(conflicts, [])
        self.assertIn("AGENTS.md", pending)
        self.assertEqual(list(self.target.iterdir()), [])
        self.apply_fixture()
        self.assertEqual(delivery.plan(self.source, self.target), ({}, []))

    def test_modified_local_file_blocks_without_writes(self):
        """Assert custom instructions survive conflicting delivery; temp I/O, no DB."""
        (self.target / "rule.md").write_text("local", encoding="utf-8")
        _, conflicts = delivery.plan(self.source, self.target)
        self.assertEqual(conflicts, ["rule.md"])
        self.assertFalse((self.target / "AGENTS.md").exists())
        self.assertEqual((self.target / "rule.md").read_text(), "local")

    def test_clean_template_updates_but_mixed_file_requires_review(self):
        """Assert ownership controls updates; temporary filesystem effects, no DB."""
        self.apply_fixture()
        self.publish({"rule.md": ("new rule", "template"), "AGENTS.md": ("new shared", "mixed")})
        pending, conflicts = delivery.plan(self.source, self.target)
        self.assertEqual(conflicts, ["AGENTS.md"])
        self.assertEqual(pending["rule.md"], "new rule")

    def test_corrupt_source_digest_rejected(self):
        """Assert tampered source fails before writes; temporary file I/O, no DB."""
        (self.source / "rule.md").write_text("tampered", encoding="utf-8")
        with self.assertRaisesRegex(ValueError, "digest mismatch"):
            delivery.plan(self.source, self.target)
        self.assertEqual(list(self.target.iterdir()), [])

    def test_traversal_rejected(self):
        """Assert traversal and absolute names fail; no side effects or DB access."""
        for name in ("../outside", str(self.target.resolve() / "absolute")):
            with self.subTest(name=name), self.assertRaises(ValueError):
                delivery.contained(self.target, name)


if __name__ == "__main__":
    unittest.main()
