/**
 * Pulls the OpenAPI contract from the pinned contract repo tag.
 *
 * Usage:
 *   CONTRACT_VERSION=v0.1.0 node scripts/api-pull.mjs
 *   CONTRACT_REPO=VadayI/claude-api-contract CONTRACT_VERSION=v0.1.0 node scripts/api-pull.mjs
 */
import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname } from 'node:path'

const repo = process.env.CONTRACT_REPO ?? 'VadayI/claude-api-contract'
const version = process.env.CONTRACT_VERSION
const OUTPUT = 'src/lib/api/openapi.yml'

if (!version) {
  console.error('[api-pull] CONTRACT_VERSION is required. Set it in .env or export it.')
  process.exit(1)
}

const url = `https://raw.githubusercontent.com/${repo}/${version}/openapi.yml`

async function main() {
  console.log(`[api-pull] Fetching contract from ${url}`)
  let response
  try {
    response = await fetch(url)
  } catch (err) {
    console.error(`[api-pull] Network error: ${String(err)}`)
    process.exit(1)
  }
  if (!response.ok) {
    console.error(`[api-pull] HTTP ${response.status} ${response.statusText}`)
    process.exit(1)
  }
  const body = await response.text()
  if (!body.startsWith('openapi:')) {
    console.error('[api-pull] Response does not look like an OpenAPI spec')
    process.exit(1)
  }
  mkdirSync(dirname(OUTPUT), { recursive: true })
  writeFileSync(OUTPUT, body, 'utf-8')
  console.log(`[api-pull] Written to ${OUTPUT} (${body.length} bytes, tag ${version})`)
}

main().catch((err) => {
  console.error('[api-pull] Unexpected error:', err)
  process.exit(1)
})
