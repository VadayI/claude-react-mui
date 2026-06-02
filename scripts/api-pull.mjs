/**
 * Pulls the OpenAPI schema from the backend and writes it to src/lib/api/openapi.yml.
 *
 * Usage:
 *   VITE_OPENAPI_URL=http://localhost:8000/api/schema/ node scripts/api-pull.mjs
 *
 * If VITE_OPENAPI_URL is not set, prints a helpful message and exits.
 */

import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname } from 'node:path'

const url = process.env.VITE_OPENAPI_URL

if (!url) {
  console.warn(
    '[api-pull] VITE_OPENAPI_URL is not set.\n' +
      '  Set it in .env or export it before running:\n' +
      '    VITE_OPENAPI_URL=http://localhost:8000/api/schema/ npm run api:pull',
  )
  process.exit(0)
}

const OUTPUT = 'src/lib/api/openapi.yml'

async function main() {
  console.log(`[api-pull] Fetching schema from ${url}`)
  let response
  try {
    response = await fetch(url)
  } catch (err) {
    console.error(`[api-pull] Network error: ${String(err)}`)
    console.error('  Make sure the backend is running and VITE_OPENAPI_URL is correct.')
    process.exit(1)
  }

  if (!response.ok) {
    console.error(`[api-pull] HTTP ${response.status} ${response.statusText}`)
    process.exit(1)
  }

  const body = await response.text()
  mkdirSync(dirname(OUTPUT), { recursive: true })
  writeFileSync(OUTPUT, body, 'utf-8')
  console.log(`[api-pull] Written to ${OUTPUT} (${body.length} bytes)`)
}

main().catch((err) => {
  console.error('[api-pull] Unexpected error:', err)
  process.exit(1)
})
