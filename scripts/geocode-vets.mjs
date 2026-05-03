#!/usr/bin/env node
// Geocodes the addresses of vet centres using Nominatim (OSM).
// Reads public/data/vets.json, normalizes addresses, geocodes each, and writes
// vets.json back with lat/lng populated for the entries it could resolve.
//
// Nominatim usage policy: max 1 request per second, identifying User-Agent.

import { readFile, writeFile } from 'node:fs/promises'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const VETS_PATH = resolve(__dirname, '..', 'public', 'data', 'vets.json')
const MANIFEST_PATH = resolve(__dirname, '..', 'public', 'data', 'manifest.json')

const USER_AGENT = 'madrono-perruno/0.1 (https://madrono-perruno.vercel.app; hello@celiarozalenm.com)'
const NOMINATIM = 'https://nominatim.openstreetmap.org/search'
const SLEEP_MS = 1100 // 1 req/sec policy + buffer

// Mapping from abbreviation in source data to the full Spanish street type.
const ABBREV = {
  'CL ': 'Calle ',
  'AV ': 'Avenida ',
  'AVDA ': 'Avenida ',
  'PZ ': 'Plaza ',
  'PLZ ': 'Plaza ',
  'PS ': 'Paseo ',
  'PSO ': 'Paseo ',
  'PG ': 'Polígono ',
  'TR ': 'Travesía ',
  'CR ': 'Carretera ',
  'CTRA ': 'Carretera ',
  'GTA ': 'Glorieta ',
  'BV ': 'Bulevar ',
  'CM ': 'Camino ',
}

function normalizeAddress(raw) {
  let s = (raw || '').trim().toUpperCase()
  for (const [abbr, full] of Object.entries(ABBREV)) {
    if (s.startsWith(abbr)) {
      s = full + s.slice(abbr.length)
      break
    }
  }
  return s
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function geocodeOne(direccion, distrito) {
  const query = `${direccion}, ${distrito}, Madrid, Spain`
  const url = `${NOMINATIM}?format=json&limit=1&accept-language=es&q=${encodeURIComponent(query)}`
  const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT } })
  if (!res.ok) return null
  const arr = await res.json()
  const r = arr[0]
  if (!r) return null
  const lat = Number(r.lat)
  const lng = Number(r.lon)
  if (lat < 40.2 || lat > 40.65 || lng < -3.95 || lng < -3.95 || lng > -3.45) {
    // Out of Madrid bbox; ignore.
    return null
  }
  return { lat, lng }
}

async function main() {
  const raw = await readFile(VETS_PATH, 'utf-8')
  const vets = JSON.parse(raw)
  console.log(`Loaded ${vets.length} vet records`)

  // Group by address+distrito to avoid geocoding the same address twice.
  const cache = new Map()
  let resolved = 0
  let failed = 0
  let skipped = 0

  for (let i = 0; i < vets.length; i++) {
    const v = vets[i]
    if (typeof v.lat === 'number' && typeof v.lng === 'number') {
      skipped += 1
      continue
    }
    const direccion = normalizeAddress(v.direccion)
    if (!direccion) continue
    const cacheKey = `${direccion}|${v.distrito}`
    if (cache.has(cacheKey)) {
      const cached = cache.get(cacheKey)
      if (cached) {
        v.lat = cached.lat
        v.lng = cached.lng
        resolved += 1
      } else {
        failed += 1
      }
      continue
    }
    process.stdout.write(`[${i + 1}/${vets.length}] ${direccion} (${v.distrito}) … `)
    try {
      const result = await geocodeOne(direccion, v.distrito)
      cache.set(cacheKey, result)
      if (result) {
        v.lat = result.lat
        v.lng = result.lng
        resolved += 1
        console.log(`OK ${result.lat.toFixed(5)}, ${result.lng.toFixed(5)}`)
      } else {
        failed += 1
        console.log('NOT FOUND')
      }
    } catch (err) {
      failed += 1
      console.log(`ERROR: ${err.message}`)
    }
    await sleep(SLEEP_MS)
  }

  await writeFile(VETS_PATH, JSON.stringify(vets))
  console.log(`\nGeocoded: ${resolved} resolved, ${failed} failed, ${skipped} already had coords. Cache size: ${cache.size}`)

  // Bump manifest timestamp so the browser cache-key changes and the new
  // coords get picked up on next page load.
  if (resolved > 0) {
    try {
      const manifest = JSON.parse(await readFile(MANIFEST_PATH, 'utf-8'))
      manifest.generatedAt = new Date().toISOString()
      await writeFile(MANIFEST_PATH, JSON.stringify(manifest, null, 2))
      console.log(`Bumped manifest.generatedAt to ${manifest.generatedAt}`)
    } catch (err) {
      console.warn('Could not update manifest:', err.message)
    }
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
