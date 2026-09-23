"""Verify real React AI payloads operate autonomously after fresh installation."""

import importlib.util
import json
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest
from ci_mode import workflow

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
        """Apply the preflighted fixture with an explicit local CI selection.

        Args: None; uses the temporary target created in setUp.
        Returns: None after asserting conflict-free delivery.
        Side effects: Writes only fixture files below the temporary target;
            no database or network access. Installer errors fail the test.
        """
        pending, conflicts = delivery.plan(ROOT, self.target, "local")
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
        schema, integrated receipt, sanitized detector output, and an empty
        repeat delivery plan.
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
        self.assertEqual(receipt["source_commit"], "2e985eeb4883ccb79151c6c5834d6f82186d46a1")
        self.assertEqual(receipt["pin_status"], "integrated")
        self.assertEqual(receipt["observed_upstream_main"], receipt["source_commit"])
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
        _, conflicts = delivery.plan(ROOT, self.target, "local")
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
        _, conflicts = delivery.plan(ROOT, self.target, "local")
        self.assertEqual(conflicts, ["scripts/claude.sh"])
        self.assertEqual(custom.read_text(encoding="utf-8"), "# custom wrapper\n")

    def test_complete_seed_preserves_runtime_and_inert_workflows(self):
        """Deliver both runtimes and only a manual active workflow.

        Args: None. Returns: None. Writes temporary payload files only; no DB or
        network. AssertionError exposes missing adapters or unintended state.
        """
        self.install()
        for name in ("AGENTS.md", "CLAUDE.md", ".codex/agents/react-developer.toml",
                     ".agents/skills/bootstrap/SKILL.md", ".claude/commands/bootstrap.md",
                     ".agents/skills/update-from-template/SKILL.md",
                     "docs/ai/workflows/bootstrap.md", "scripts/seed-i18n.py",
                     ".claude/agents/ba.md", ".claude/skills/react-specialist/SKILL.md",
                     "templates/.github/workflows/frontend-ci.yml", "templates/.env.example",
                     ".githooks/pre-commit", ".githooks/pre-push",
                     "scripts/ai/git_hooks.py", "scripts/ai/install_git_hooks.py"):
            self.assertTrue((self.target / name).is_file(), name)
        self.assertEqual((self.target / "Makefile").read_bytes(), (ROOT / "templates/Makefile").read_bytes())
        active = (self.target / ".github/workflows/frontend-ci.yml").read_text(encoding="utf-8")
        self.assertIn("workflow_dispatch:", active)
        self.assertNotIn("  push:", active)
        self.assertNotIn("  pull_request:", active)
        for name in (".env", ".claude/memory", "docs/HANDOFF.md", "src", "package.json"):
            self.assertFalse((self.target / name).exists(), name)

    def test_custom_entrypoint_blocks_apply_before_any_other_writes(self):
        """Keep custom CLAUDE text and the complete target unchanged on conflict.

        Args: None. Returns: None. Runs the trusted installer subprocess against
        a temporary directory; no network/DB. AssertionError reports lost data.
        """
        custom = self.target / "CLAUDE.md"
        custom.write_text("Project custom instructions\n", encoding="utf-8")
        result = subprocess.run([sys.executable, str(ROOT / "scripts/ai/install.py"),
                                 "--target", str(self.target), "--ci-mode", "local", "--apply"],
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

    def test_ci_mode_choice_switch_and_custom_workflow(self):
        """Require an initial choice, switch owned workflow, and preserve edits.

        Args: None; uses a temporary derived project.
        Returns: None after assertions on local/GitHub rendering and receipts.
        Raises: AssertionError if selection, repeat, or ownership is incorrect.
        Side effects: Writes only temporary fixture files; no database or network.
        Business rule: A custom active workflow blocks the whole update before
            writing a new CI receipt or changing project-owned preferences.
        """
        with self.assertRaisesRegex(ValueError, "requires --ci-mode"):
            delivery.plan(ROOT, self.target)
        self.install()
        project_path = self.target / "docs/project-state/project.json"
        project = json.loads(project_path.read_text(encoding="utf-8"))
        project["extensions"] = {"owner": "fixture"}
        project_path.write_text(json.dumps(project, indent=2, sort_keys=True) + "\n", encoding="utf-8")
        pending, conflicts = delivery.plan(ROOT, self.target, "github")
        self.assertEqual(conflicts, [])
        self.assertEqual(set(pending), {".github/workflows/frontend-ci.yml",
                                        "docs/ai/ci-workflow-receipt.json",
                                        "docs/project-state/project.json"})
        for name, content in pending.items():
            (self.target / name).write_text(content, encoding="utf-8", newline="\n")
        active = (self.target / ".github/workflows/frontend-ci.yml").read_text(encoding="utf-8")
        self.assertIn("  push:", active)
        self.assertIn("  pull_request:", active)
        self.assertIn("scripts/ai/runner.py --repository .", active)
        self.assertIn('--candidate "$CI_CANDIDATE" --base "$base" --event "$event"', active)
        local = workflow(ROOT, "local")
        github = workflow(ROOT, "github")
        self.assertEqual(local.split("\njobs:\n", 1)[1], github.split("\njobs:\n", 1)[1])
        self.assertEqual(delivery.plan(ROOT, self.target), ({}, []))
        self.assertEqual(json.loads(project_path.read_text(encoding="utf-8"))["extensions"],
                         {"owner": "fixture"})
        active_path = self.target / ".github/workflows/frontend-ci.yml"
        active_path.write_text(active + "# project customization\n", encoding="utf-8")
        snapshot = {path.relative_to(self.target).as_posix(): path.read_bytes()
                    for path in self.target.rglob("*") if path.is_file()}
        pending, conflicts = delivery.plan(ROOT, self.target, "local")
        self.assertIn(".github/workflows/frontend-ci.yml", conflicts)
        result = subprocess.run([sys.executable, str(ROOT / "scripts/ai/install.py"),
                                 "--target", str(self.target), "--ci-mode", "local", "--apply"],
                                capture_output=True, text=True, check=False)
        self.assertEqual(result.returncode, 1, result.stdout + result.stderr)
        self.assertEqual(snapshot, {path.relative_to(self.target).as_posix(): path.read_bytes()
                                    for path in self.target.rglob("*") if path.is_file()})
        self.assertEqual(json.loads(project_path.read_text(encoding="utf-8"))["ci"]["execution"], "github")
        self.assertNotEqual(pending.get("docs/project-state/project.json"), project_path.read_text(encoding="utf-8"))

    def test_ci_workflow_rejects_unreviewed_trigger_template(self):
        """Fail closed if the source workflow event structure changes.

        Args: None; uses a temporary source fixture.
        Returns: None after asserting rejection of an unreviewed schedule.
        Raises: AssertionError if an automatic trigger is accepted silently.
        Side effects: Writes one temporary YAML fixture; no database or network.
        """
        source = self.target / "source"
        template = source / "templates/.github/workflows/frontend-ci.yml"
        template.parent.mkdir(parents=True)
        reviewed = (ROOT / "templates/.github/workflows/frontend-ci.yml").read_text(encoding="utf-8")
        template.write_text(reviewed.replace("  merge_group:\n", "  schedule:\n    - cron: '0 6 * * 1'\n"),
                            encoding="utf-8")
        with self.assertRaisesRegex(ValueError, "Unexpected canonical"):
            workflow(source, "local")


if __name__ == "__main__":
    unittest.main()
