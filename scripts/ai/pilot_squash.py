"""Exercise squash-cleanup guards in disposable local repositories only."""
import json
import subprocess
from pathlib import Path
import tempfile


def git(root, *args, check=True):
    """Run argv Git in fixture root; return stdout, raise on checked failures.

    Side effects depend on supplied Git command, confined to a newly created
    fixture. No real project, database, network or credentials are accessed.
    """
    result = subprocess.run(['git', *args], cwd=root, check=check, capture_output=True, text=True)
    return result.stdout.strip() if check else result


def allowed(root, branch, recorded_head, merged_commit, merged):
    """Assess cleanup using immutable fixture PR facts and current Git state.

    Args: root is fixture repo; branch/head/merge identify one task; merged is
    a recorded PR state. Returns bool. Reads Git only; errors reject cleanup.
    Never infer squash integration solely from ordinary branch ancestry.
    """
    if not merged or git(root, 'rev-parse', branch) != recorded_head:
        return False
    if git(root, 'status', '--porcelain'):
        return False
    if f'branch refs/heads/{branch}' in git(root, 'worktree', 'list', '--porcelain'):
        return False
    if git(root, 'merge-base', '--is-ancestor', merged_commit, 'main', check=False).returncode:
        return False
    return git(root, 'rev-parse', f'{merged_commit}^{{tree}}') == git(root, 'rev-parse', f'{recorded_head}^{{tree}}')


def main():
    """Build positive/negative squash cases and emit observed evidence JSON.

    No arguments. Returns nothing; assertions fail on guard regressions.
    Writes only a new temporary fixture and its report; no DB or real remote.
    """
    parent = Path(__file__).resolve().parents[2] / ".ai-runtime/pilot"
    parent.mkdir(parents=True, exist_ok=True)
    (parent / ".gitignore").write_text("*\n", encoding="utf-8")
    root = Path(tempfile.mkdtemp(prefix='squash fixture ', dir=parent))
    git(root, 'init', '-b', 'main')
    git(root, 'config', 'user.name', 'Fixture')
    git(root, 'config', 'user.email', 'fixture@example.invalid')
    (root/'file.txt').write_text('base\n', encoding='utf-8')
    git(root, 'add', '--', 'file.txt'); git(root, 'commit', '-m', 'fixture base')
    git(root, 'branch', 'foreign/keep')
    foreign = git(root, 'rev-parse', 'foreign/keep')
    git(root, 'switch', '-c', 'task')
    (root/'file.txt').write_text('task\n', encoding='utf-8')
    git(root, 'add', '--', 'file.txt'); git(root, 'commit', '-m', 'task')
    head = git(root, 'rev-parse', 'HEAD')
    git(root, 'switch', 'main'); git(root, 'merge', '--squash', 'task'); git(root, 'commit', '-m', 'squashed task')
    squash = git(root, 'rev-parse', 'HEAD')
    assert git(root, 'merge-base', '--is-ancestor', 'task', 'main', check=False).returncode == 1
    assert allowed(root, 'task', head, squash, True)
    assert not allowed(root, 'task', head, squash, False)
    (root/'foreign.txt').write_text('foreign\n', encoding='utf-8')
    assert not allowed(root, 'task', head, squash, True)
    # Preserve this foreign fixture file by committing it on main, not deleting it.
    git(root, 'add', '--', 'foreign.txt'); git(root, 'commit', '-m', 'foreign main work')
    git(root, 'switch', 'task')
    assert not allowed(root, 'task', head, squash, True)
    (root/'extra.txt').write_text('post-PR work\n', encoding='utf-8')
    git(root, 'add', '--', 'extra.txt'); git(root, 'commit', '-m', 'extra task work')
    git(root, 'switch', 'main')
    assert not allowed(root, 'task', head, squash, True)
    # A separate exact-head branch demonstrates guarded squash cleanup.
    git(root, 'branch', 'task-cleanup', head)
    assert allowed(root, 'task-cleanup', head, squash, True)
    git(root, 'branch', '-D', 'task-cleanup')
    assert git(root, 'rev-parse', 'foreign/keep') == foreign
    assert git(root, 'rev-parse', 'task') != head
    report = {'passed': ['squash_not_ancestor', 'known_merged_exact_head', 'pending_pr_refused',
                         'dirty_tree_refused', 'active_worktree_refused', 'extra_commit_refused',
                         'guarded_own_branch_cleanup', 'foreign_ref_preserved'],
              'root': str(root), 'pr_head': head, 'squash_commit': squash,
              'scope': 'local harness fixture; not a production G0-G9 implementation'}
    (parent/'S3-squash-fixture.json').write_text(json.dumps(report, indent=2)+'\n', encoding='utf-8')
    print(json.dumps(report))


if __name__ == '__main__':
    main()
