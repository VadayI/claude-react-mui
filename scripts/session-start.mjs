/**
 * scripts/session-start.mjs
 *
 * SessionStart: jawna detekcja środowiska bez sprzątania locków, seedowania
 * .env, instalacji pakietów, formatowania, push ani merge.
 *   1. wspólny detektor rodziny  — python scripts/ai/detector.py --write
 *      → .ai-runtime/environment.json (NOT_VERIFIED, gdy brak Pythona 3.13+);
 *   2. probe stacku React        — node scripts/detect-env.mjs
 *      → .ai-runtime/env-detect.json;
 *   3. kontekst sesji            — python scripts/ai/session_context.py
 *      (Git, ustawienia, mapa dokumentacji, ostatni rekord sesji; bez .ai-runtime).
 * Kod wyjścia: 0 tylko gdy wszystkie kroki się powiodły; nieudana sonda jest
 * widoczna, nigdy nie udaje zielonej sesji. Ustalenia ciągłości (np. brak
 * rekordu sesji) nie psują startu — tylko błędna mapa lub ustawienia.
 */

import { spawnSync } from 'node:child_process'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptDir = dirname(fileURLToPath(import.meta.url))
const root = join(scriptDir, '..')
let status = 0
let pythonOk = false

// Wspólny detektor: AI_PYTHON albo python z PATH; wersja < 3.13 = NOT_VERIFIED.
const python = process.env.AI_PYTHON || 'python'
const versionProbe = spawnSync(
  python,
  ['-c', 'import sys; sys.exit(0 if sys.version_info >= (3, 13) else 2)'],
  { stdio: 'ignore', timeout: 20000 },
)
if (versionProbe.error || versionProbe.status !== 0) {
  console.error('[session-start] NOT_VERIFIED: Python 3.13+ (AI_PYTHON) is required for the shared detector.')
  status = 1
} else {
  pythonOk = true
  const detector = spawnSync(
    python,
    [join(root, 'scripts', 'ai', 'detector.py'), '--repository', root, '--write'],
    { stdio: 'inherit', timeout: 60000 },
  )
  if (detector.error || detector.status !== 0) {
    console.error('[session-start] NOT_VERIFIED: shared detector failed; .ai-runtime/environment.json not refreshed.')
    status = 1
  }
}

// Probe stacku React (przenosi swój rekord legacy z .claude/memory sam).
const probe = spawnSync(process.execPath, [join(scriptDir, 'detect-env.mjs')], {
  stdio: 'inherit',
  timeout: 60000,
})
if (probe.error || probe.status !== 0) status = 1

// Kontekst sesji dla każdego agenta (Claude hook; Codex uruchamia to samo z AGENTS.md).
if (pythonOk) {
  const context = spawnSync(
    python,
    [join(root, 'scripts', 'ai', 'session_context.py'), '--root', root],
    { stdio: 'inherit', timeout: 60000 },
  )
  if (context.error || context.status !== 0) {
    console.error('[session-start] NOT_VERIFIED: session context unavailable (invalid documentation map or settings).')
    status = 1
  }
}

process.exit(status)
