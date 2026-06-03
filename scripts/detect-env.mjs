/**
 * scripts/detect-env.mjs
 *
 * Detects the local environment and writes .claude/memory/env-detect.json.
 *
 * Run: node scripts/detect-env.mjs
 *
 * IMPORTANT: Do NOT hand-edit the output file. It is regenerated on every
 * session start by the SessionStart hook (scripts/session-start.sh) and
 * is used as the source of truth by /doctor and /bootstrap to gate unsafe
 * operations. Fabricated values silently bypass safety checks.
 *
 * NOTE: This script stores NO secrets. It records only the *kind* of a
 * GitHub PAT (fine-grained vs classic) — never the token value itself.
 */

import { execSync, spawnSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { platform, homedir } from 'node:os';
import { argv, cwd, env, execPath, version } from 'node:process';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Run a shell command, return trimmed stdout or null on any error. */
function run(cmd) {
  try {
    return execSync(cmd, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'], timeout: 8000 })
      .split('\n')[0]
      .trim();
  } catch {
    return null;
  }
}

/** Check whether a binary exists on PATH (cross-platform via `command -v`). */
function hasBin(name) {
  try {
    const r = spawnSync('sh', ['-c', `command -v ${name}`], { timeout: 5000 });
    return r.status === 0;
  } catch {
    return false;
  }
}

/** Get the first line of `<bin> --version`, trimmed, or null. */
function binVersion(bin, flag = '--version') {
  try {
    const r = spawnSync(bin, [flag], { encoding: 'utf8', timeout: 8000 });
    if (r.status === 0 && r.stdout) return r.stdout.split('\n')[0].trim();
    return null;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Platform detection
// ---------------------------------------------------------------------------

const rawPlatform = platform(); // 'linux' | 'darwin' | 'win32' | ...
let detectedPlatform;
if (rawPlatform === 'win32') {
  detectedPlatform = 'windows';
} else if (rawPlatform === 'darwin') {
  detectedPlatform = 'darwin';
} else {
  detectedPlatform = 'linux';
}

// WSL2: /proc/version contains "microsoft" (case-insensitive)
let isWsl2 = false;
try {
  if (existsSync('/proc/version')) {
    const pv = readFileSync('/proc/version', 'utf8').toLowerCase();
    isWsl2 = pv.includes('microsoft');
  }
} catch { /* ignore */ }

const platformSupported = detectedPlatform === 'linux' || detectedPlatform === 'darwin';

// ---------------------------------------------------------------------------
// Wrong-runner heuristic
//
// Scenario: the user is in WSL2 but launched the Windows claude.exe via PATH
// interop. Signs:
//   - process.platform === 'win32'  (Node resolves as Windows)
//   - AND /proc/version exists and says microsoft (we're inside WSL2 but
//     the process was started by the Windows binary)
// OR: execPath contains a Windows-style drive letter path while /proc/version
//     says microsoft (e.g. execPath = "C:\\Program Files\\nodejs\\node.exe").
// We keep the heuristic simple: just two conditions, well documented.
// ---------------------------------------------------------------------------
let wrongRunnerSuspected = false;
try {
  const execPathLower = execPath.toLowerCase();
  const windowsPathLike =
    /^[a-z]:[\\\/]/.test(execPathLower) ||   // C:\ or C:/
    execPathLower.startsWith('/mnt/c/') ||    // WSL2 interop path
    execPathLower.startsWith('/mnt/d/');
  if (detectedPlatform === 'windows' && isWsl2) {
    wrongRunnerSuspected = true;
  } else if (isWsl2 && windowsPathLike) {
    wrongRunnerSuspected = true;
  }
} catch { /* ignore */ }

// ---------------------------------------------------------------------------
// Shell
// ---------------------------------------------------------------------------
const shellEnv = env['SHELL'] || '';
const shell = shellEnv ? shellEnv.split('/').pop() : 'unknown';

// ---------------------------------------------------------------------------
// Node info
// ---------------------------------------------------------------------------
const nodeParts = version.replace('v', '').split('.');
const nodeMajor = parseInt(nodeParts[0], 10);
const nodeMinor = parseInt(nodeParts[1] || '0', 10);
// Floor: Node 20.19+ (or any 22+) — required by Vite 8 / Vitest 4 (ADR 0019).
const nodeSupported =
  nodeMajor > 20 || (nodeMajor === 20 && nodeMinor >= 19);

// ---------------------------------------------------------------------------
// Tool presence + versions
// ---------------------------------------------------------------------------
const tools = {};
const toolVersions = {};

const toolList = ['git', 'gh', 'node', 'npm', 'npx', 'docker'];
for (const t of toolList) {
  tools[t] = hasBin(t);
  toolVersions[t] = null;
}

// Best-effort versions (only if bin exists)
if (tools.git)    toolVersions.git    = binVersion('git');
if (tools.gh)     toolVersions.gh     = binVersion('gh');
if (tools.node)   toolVersions.node   = version; // already known
if (tools.npm)    toolVersions.npm    = binVersion('npm');
if (tools.docker) toolVersions.docker = binVersion('docker');
// npx doesn't have a useful --version in all versions; skip version string
if (tools.npx)    toolVersions.npx    = binVersion('npx');

// ---------------------------------------------------------------------------
// GitHub auth info
// ---------------------------------------------------------------------------
let ghAuthenticated = false;
let ghPatKind = null;

try {
  if (tools.gh) {
    const authStatus = spawnSync('gh', ['auth', 'status'], { timeout: 10000 });
    ghAuthenticated = authStatus.status === 0;

    // Determine PAT kind from token prefix — NEVER store the token itself.
    // fine-grained tokens start with "github_pat_"
    // classic tokens start with "ghp_"
    // We read GITHUB_PERSONAL_ACCESS_TOKEN from env (if set) to check prefix.
    // Fallback: try `gh auth token` output prefix (piped to a check, not stored).
    const tokenFromEnv = env['GITHUB_PERSONAL_ACCESS_TOKEN'] || env['GITHUB_TOKEN'] || '';
    if (tokenFromEnv.startsWith('github_pat_')) {
      ghPatKind = 'fine-grained';
    } else if (tokenFromEnv.startsWith('ghp_')) {
      ghPatKind = 'classic';
    } else {
      // Try gh auth token — read only the first 12 chars to check prefix
      try {
        const tokenOut = execSync('gh auth token', {
          encoding: 'utf8',
          stdio: ['pipe', 'pipe', 'pipe'],
          timeout: 8000,
        }).trim();
        const prefix = tokenOut.slice(0, 12);
        if (prefix.startsWith('github_pat_')) {
          ghPatKind = 'fine-grained';
        } else if (prefix.startsWith('ghp_')) {
          ghPatKind = 'classic';
        } else if (tokenOut.length > 0) {
          ghPatKind = 'unknown';
        } else {
          ghPatKind = null;
        }
      } catch {
        ghPatKind = ghAuthenticated ? 'unknown' : null;
      }
    }
  }
} catch { /* ignore */ }

// ---------------------------------------------------------------------------
// Assemble output
// ---------------------------------------------------------------------------
const result = {
  schema_version: 1,
  generated_at: new Date().toISOString(),
  platform: detectedPlatform,
  is_wsl2: isWsl2,
  platform_supported: platformSupported,
  shell,
  node: {
    version,
    major: nodeMajor,
    execPath,
  },
  node_supported: nodeSupported,
  wrong_runner_suspected: wrongRunnerSuspected,
  cwd: cwd(),
  tools,
  tool_versions: toolVersions,
  gh: {
    authenticated: ghAuthenticated,
    pat_kind: ghPatKind,
  },
};

// ---------------------------------------------------------------------------
// Write output
// ---------------------------------------------------------------------------
const outDir = '.claude/memory';
const outFile = `${outDir}/env-detect.json`;

try {
  mkdirSync(outDir, { recursive: true });
  writeFileSync(outFile, JSON.stringify(result, null, 2) + '\n', 'utf8');
} catch (err) {
  console.error(`[detect-env] ERROR: could not write ${outFile}: ${err.message}`);
}

// ---------------------------------------------------------------------------
// Human summary (one line)
// ---------------------------------------------------------------------------
const supportedStr = platformSupported ? 'SUPPORTED' : 'NOT SUPPORTED (install WSL2)';
const nodeStr = nodeSupported ? `Node ${version} OK` : `Node ${version} TOO OLD (need 20.19+)`;
const wslStr = isWsl2 ? ' [WSL2]' : '';
const wrongStr = wrongRunnerSuspected ? ' ⚠ WRONG RUNNER SUSPECTED' : '';
console.log(
  `[detect-env] platform=${detectedPlatform}${wslStr} ${supportedStr} | ${nodeStr}${wrongStr} | written ${outFile}`
);
