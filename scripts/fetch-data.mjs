#!/usr/bin/env node
// Pre-fetches Madrid Open Data CSVs at build time and writes parsed JSON to public/data/.
// Avoids CORS: the portal returns 302 redirects to a CDN that lacks Access-Control-Allow-Origin.
// We fetch server-side (no CORS) and ship clean JSON.

import { writeFile, mkdir } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import Papa from 'papaparse'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT_DIR = resolve(__dirname, '..', 'public', 'data')

const SOURCES = {
  papeleras: 'https://datos.madrid.es/egob/catalogo/300081-0-papeleras-bolsas-excrementos.csv',
  areas: 'https://datos.madrid.es/egob/catalogo/300094-0-areas-caninas.csv',
  parques: 'https://datos.madrid.es/egob/catalogo/200761-0-parques-jardines.csv',
  vets: 'https://datos.madrid.es/egob/catalogo/300281-0-inspecciones-veterinarios.csv',
}

function num(v) {
  if (typeof v === 'number') return v
  if (!v) return NaN
  const s = String(v).trim().replace(',', '.')
  const n = Number(s)
  return Number.isFinite(n) ? n : NaN
}
function clean(v) {
  return String(v ?? '').trim()
}
function inMadridBounds(lat, lng) {
  return lat > 40.2 && lat < 40.65 && lng > -3.95 && lng < -3.45
}

async function fetchCsvLatin1(url) {
  const res = await fetch(url, { redirect: 'follow' })
  if (!res.ok) throw new Error(`HTTP ${res.status} fetching ${url}`)
  const buf = Buffer.from(await res.arrayBuffer())
  return new TextDecoder('iso-8859-1').decode(buf)
}
function parseCsv(csv) {
  return Papa.parse(csv, {
    header: true,
    skipEmptyLines: true,
    delimiter: ';',
    transformHeader: (h) => h.trim(),
  }).data
}

function parsePapeleras(csv) {
  const rows = parseCsv(csv)
  const out = []
  for (const r of rows) {
    const lat = num(r['LATITUD'])
    const lng = num(r['LONGITUD'])
    if (!inMadridBounds(lat, lng)) continue
    out.push({
      id: clean(r['IDENTIFICADOR_MINT']) || clean(r['COD_NDP']) || `p-${out.length}`,
      lat,
      lng,
      direccion: clean(r['DIRECCION_COMPLETA']),
      distrito: clean(r['DISTRITO']),
      barrio: clean(r['BARRIO']),
      modelo: clean(r['MODELO']),
    })
  }
  return out
}
function parseAreas(csv) {
  const rows = parseCsv(csv)
  const out = []
  for (const r of rows) {
    const lat = num(r['Latitud'])
    const lng = num(r['Longitud'])
    if (!inMadridBounds(lat, lng)) continue
    const sup = num(r['SUPERFICIE (M2)'])
    out.push({
      id: clean(r['Código']) || `a-${out.length}`,
      lat,
      lng,
      direccion: clean(r['UBICACION']),
      distrito: clean(r['DISTRITO']),
      superficieM2: Number.isFinite(sup) ? sup : 0,
      juegos: /^s[ií]/i.test(clean(r['JUEGOS'])),
    })
  }
  return out
}
function parseParques(csv) {
  const rows = parseCsv(csv)
  const out = []
  for (const r of rows) {
    const lat = num(r['LATITUD'])
    const lng = num(r['LONGITUD'])
    if (!inMadridBounds(lat, lng)) continue
    const street = clean(r['NOMBRE-VIA'])
    const numStr = clean(r['NUM'])
    const cls = clean(r['CLASE-VIAL'])
    const direccion = [cls, street, numStr].filter(Boolean).join(' ')
    out.push({
      id: clean(r['PK']) || `pk-${out.length}`,
      lat,
      lng,
      nombre: clean(r['NOMBRE']),
      direccion,
      distrito: clean(r['DISTRITO']),
      barrio: clean(r['BARRIO']),
      url: clean(r['CONTENT-URL']) || undefined,
      email: clean(r['EMAIL']) || undefined,
    })
  }
  return out
}
function parseVets(csv) {
  const rows = parseCsv(csv)
  const out = []
  for (const r of rows) {
    out.push({
      id: `v-${out.length}`,
      direccion: clean(r['DIRECCIÓN']) || clean(r['DIRECCION']),
      distrito: clean(r['DISTRITO']),
      epigrafe: clean(r['EPÍGRAFE']) || clean(r['EPIGRAFE']),
      fechaInspeccion: clean(r['FECHA DE INSPECCIÓN']) || clean(r['FECHA DE INSPECCION']),
    })
  }
  return out
}

const PARSERS = {
  papeleras: parsePapeleras,
  areas: parseAreas,
  parques: parseParques,
  vets: parseVets,
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true })
  const summary = {}
  for (const [key, url] of Object.entries(SOURCES)) {
    process.stdout.write(`Fetching ${key}…`)
    try {
      const csv = await fetchCsvLatin1(url)
      const rows = PARSERS[key](csv)
      const filePath = resolve(OUT_DIR, `${key}.json`)
      await writeFile(filePath, JSON.stringify(rows))
      summary[key] = rows.length
      console.log(` ${rows.length} records → ${filePath.split('/madrono-perruno/')[1]}`)
    } catch (err) {
      console.log(` FAILED: ${err.message}`)
      summary[key] = `ERROR: ${err.message}`
    }
  }
  await writeFile(
    resolve(OUT_DIR, 'manifest.json'),
    JSON.stringify({ generatedAt: new Date().toISOString(), counts: summary }, null, 2),
  )
  console.log('\nManifest written to public/data/manifest.json')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
