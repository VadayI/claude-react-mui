"""Verify reviewed source inventory and linked-root ownership boundaries."""

import json
from pathlib import Path
import tempfile
import unittest

import generate
import install


class SeedBoundaryTests(unittest.TestCase):
    """Exercise trusted tooling against temporary paths without network or DB."""

    def test_unknown_files_are_not_discovered(self):
        """Keep unlisted ordinary and private files out of the seed source list.

        Args: None. Returns: None. Writes temporary fixtures; no DB/network.
        AssertionError reports implicit discovery; filesystem errors propagate.
        """
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            (root / "templates/ai").mkdir(parents=True)
            (root / "templates/ai/seed-inputs.json").write_text(
                json.dumps({"schema_version": 1, "files": ["reviewed.md"]}), encoding="utf-8")
            (root / "reviewed.md").write_text("reviewed fixture", encoding="utf-8")
            (root / "private.key").write_text("synthetic fixture", encoding="utf-8")
            (root / "unknown.md").write_text("not in inventory", encoding="utf-8")
            self.assertEqual(generate.seed_sources(root), ["reviewed.md"])

    def test_secret_and_project_inputs_rejected_before_open(self):
        """Reject listed private/project paths without opening the candidate file.

        Args: None. Returns: None. Writes only inventory fixtures; no DB/network.
        AssertionError reports a missing boundary; invalid inventory raises ValueError.
        """
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            (root / "templates/ai").mkdir(parents=True)
            for name in ("templates/private.key", "scripts/credentials", ".env",
                         ".claude/settings.local.json", "docs/ai/overrides/local.md",
                         ".claude/memory/routes.json", "../outside.md"):
                with self.subTest(name=name):
                    (root / "templates/ai/seed-inputs.json").write_text(
                        json.dumps({"schema_version": 1, "files": [name]}), encoding="utf-8")
                    with self.assertRaises(ValueError):
                        generate.seed_sources(root)

    def test_linked_parent_blocks_existing_and_missing_target(self):
        """Reject both target shapes beneath a linked ancestor before any writes.

        Args: None. Returns: None. Creates a temporary symlink when permitted;
        otherwise explicitly skips. No DB/network. AssertionError exposes escape.
        """
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            outside = root / "outside"
            outside.mkdir()
            (outside / "existing").mkdir()
            link = root / "linked"
            try:
                link.symlink_to(outside, target_is_directory=True)
            except OSError as error:
                self.skipTest(f"Host cannot create fixture symlink: {error}")
            for suffix in ("existing", "missing"):
                with self.subTest(suffix=suffix), self.assertRaisesRegex(ValueError, "Linked"):
                    install.plan(root, link / suffix)
            self.assertFalse((outside / "missing").exists())
            self.assertEqual(list((outside / "existing").iterdir()), [])


if __name__ == "__main__":
    unittest.main()
