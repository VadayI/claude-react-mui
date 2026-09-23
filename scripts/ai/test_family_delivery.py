"""Verify real React AI payloads operate autonomously after fresh installation."""

import importlib.util
import json
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
        """Run installed core, generator, schema, and detector without source imports.

        No arguments or return value. The fixture writes only below the temporary
        target and executes delivered Python tooling without network or database
        access. Assertions cover the development receipt, P05 payload, catalog
        schema, sanitized detector output, and an empty repeat delivery plan.
        """
        self.install()
        for script, args in (("core_sync.py", ["--target", str(self.target), "--check"]),
                             ("generate_adapters.py", ["--root", str(self.target), "--check"]),
                             ("generate.py", ["--check"])):
            result = subprocess.run([sys.executable, str(self.target / "scripts/ai" / script), *args],
                                    cwd=self.target, capture_output=True, text=True, encoding="utf-8", check=False)
            self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        catalog_check = subprocess.run(
            [sys.executable, "-c",
             "import json,sys; from pathlib import Path; "
             "sys.path.insert(0, sys.argv[1]); import runner; "
             "runner.validate_catalog(json.loads(Path(sys.argv[2]).read_text(encoding='utf-8')))",
             str(self.target / "scripts/ai"), str(self.target / "templates/ai/checks/react.json")],
            cwd=self.target, capture_output=True, text=True, encoding="utf-8", check=False)
        self.assertEqual(catalog_check.returncode, 0, catalog_check.stdout + catalog_check.stderr)
        detector = subprocess.run(
            [sys.executable, str(self.target / "scripts/ai/detector.py"), "--repository", str(self.target)],
            cwd=self.target, capture_output=True, text=True, encoding="utf-8", check=False)
        self.assertEqual(detector.returncode, 0, detector.stdout + detector.stderr)
        report = json.loads(detector.stdout)
        self.assertEqual(report["repository"]["status"], "NOT_VERIFIED")
        receipt = json.loads((self.target / "docs/ai/core-source.json").read_text(encoding="utf-8"))
        self.assertEqual(receipt["source_commit"], "83018a14142807430c987500f8dc33604b493598")
        self.assertEqual(receipt["pin_status"], "development")
        self.assertNotIn("observed_upstream_main", receipt)
        for name in ("scripts/ai/launch.ps1", "scripts/ai/launch.sh", "templates/ai/schemas/catalog.schema.json",
                     "scripts/ai/detector.py", "scripts/ai/runner.py", "docs/ai/runner.md",
                     "templates/ai/schemas/check-catalog.schema.json",
                     "templates/ai/schemas/check-result.schema.json", "templates/ai/checks/react.json"):
            self.assertTrue((self.target / name).is_file())
        self.assertEqual(delivery.plan(ROOT, self.target), ({}, []))

    def test_customized_runner_catalog_conflicts_without_writes(self):
        """Preserve a customized installed catalog and block the complete update.

        No arguments or return value. Writes a synthetic customization under the
        temporary target, reads the ownership manifest, and performs no database
        or network operations. Assertions prove conflict-before-write behavior.
        """
        self.install()
        catalog = self.target / "templates/ai/checks/react.json"
        catalog.write_text('{"custom": true}\n', encoding="utf-8")
        before = {path.relative_to(self.target): path.read_bytes()
                  for path in self.target.rglob("*") if path.is_file()}
        _, conflicts = delivery.plan(ROOT, self.target)
        self.assertEqual(conflicts, ["templates/ai/checks/react.json"])
        after = {path.relative_to(self.target): path.read_bytes()
                 for path in self.target.rglob("*") if path.is_file()}
        self.assertEqual(after, before)

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

    def test_custom_legacy_wrapper_is_preserved(self):
        """Keep an unknown wrapper outside the exact legacy-hash migration.

        No arguments/return value. Writes fixture files only; no network/DB.
        Assertions fail if migration silently claims a customized launcher.
        """
        custom = self.target / "scripts/claude.sh"
        custom.parent.mkdir(parents=True)
        custom.write_text("# custom wrapper\n", encoding="utf-8")
        _, conflicts = delivery.plan(ROOT, self.target)
        self.assertEqual(conflicts, ["scripts/claude.sh"])
        self.assertEqual(custom.read_text(encoding="utf-8"), "# custom wrapper\n")

    def test_complete_seed_preserves_runtime_and_inert_workflows(self):
        """Deliver both runtimes and legacy functions without activating CI.

        Args: None. Returns: None. Writes temporary payload files only; no DB or
        network. AssertionError exposes missing adapters or unintended state.
        """
        self.install()
        for name in ("AGENTS.md", "CLAUDE.md", ".codex/agents/react-developer.toml",
                     ".agents/skills/bootstrap/SKILL.md", ".claude/commands/bootstrap.md",
                     ".agents/skills/update-from-template/SKILL.md",
                     "docs/ai/workflows/bootstrap.md", "scripts/seed-i18n.py",
                     ".claude/agents/ba.md", ".claude/skills/react-specialist/SKILL.md",
                     "templates/.github/workflows/frontend-ci.yml", "templates/.env.example"):
            self.assertTrue((self.target / name).is_file(), name)
        self.assertEqual((self.target / "Makefile").read_bytes(), (ROOT / "templates/Makefile").read_bytes())
        for name in (".github/workflows", ".env", ".claude/memory", "docs/HANDOFF.md", "src", "package.json"):
            self.assertFalse((self.target / name).exists(), name)

    def test_custom_entrypoint_blocks_apply_before_any_other_writes(self):
        """Keep custom CLAUDE text and the complete target unchanged on conflict.

        Args: None. Returns: None. Runs the trusted installer subprocess against
        a temporary directory; no network/DB. AssertionError reports lost data.
        """
        custom = self.target / "CLAUDE.md"
        custom.write_text("Project custom instructions\n", encoding="utf-8")
        result = subprocess.run([sys.executable, str(ROOT / "scripts/ai/install.py"),
                                 "--target", str(self.target), "--apply"],
                                capture_output=True, text=True, check=False)
        self.assertEqual(result.returncode, 1, result.stdout + result.stderr)
        self.assertEqual(list(self.target.iterdir()), [custom])
        self.assertEqual(custom.read_text(encoding="utf-8"), "Project custom instructions\n")

    def test_project_preferences_and_unknown_files_survive_reinstall(self):
        """Preserve project-only registries, language, notes, env and overrides.

        Args: None. Returns: None. Writes synthetic temporary fixture text (no
        credentials); no DB/network. AssertionError reports changed project data.
        """
        self.install()
        names = (".claude/memory/routes.json", ".claude/rules/output-language.md",
                 "docs/ai/overrides/custom.md", "docs/HANDOFF.md", ".env",
                 ".claude/settings.local.json", ".github/workflows/custom.yml")
        for name in names:
            path = self.target / name
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_text("project-only fixture\n", encoding="utf-8")
        self.assertEqual(delivery.plan(ROOT, self.target), ({}, []))
        for name in names:
            self.assertEqual((self.target / name).read_text(encoding="utf-8"), "project-only fixture\n")


if __name__ == "__main__":
    unittest.main()
