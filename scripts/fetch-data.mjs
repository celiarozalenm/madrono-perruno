#!/usr/bin/env node
// Pre-fetches Madrid Open Data CSVs at build time and writes parsed JSON to public/data/.
// Avoids CORS: the portal returns 302 redirects to a CDN that lacks Access-Control-Allow-Origin.
// We fetch server-side (no CORS) and ship clean JSON.

import { writeFile, mkdir } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import Papa from 'papaparse'
import * as XLSX from 'xlsx'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT_DIR = resolve(__dirname, '..', 'public', 'data')

const SOURCES = {
  papeleras: 'https://datos.madrid.es/egob/catalogo/300081-0-papeleras-bolsas-excrementos.csv',
  areas: 'https://datos.madrid.es/egob/catalogo/300094-0-areas-caninas.csv',
  parques: 'https://datos.madrid.es/egob/catalogo/200761-0-parques-jardines.csv',
  vets: 'https://datos.madrid.es/egob/catalogo/300281-0-inspecciones-veterinarios.csv',
  // Annual pet census per district (RIAC, Colegio de Veterinarios). UTF-8 with BOM.
  perros:
    'https://datos.madrid.es/dataset/207118-0-censo-animales/resource/207118-0-censo-animales-csv/download/207118-0-censo-animales-csv.csv',
  // Madrid Salud — Centro de Protección Animal yearly stats (intakes, adoptions).
  // Wide pivot XLSX: years as columns, indicator sections in column A.
  proteccionAnimal:
    'https://datos.madrid.es/dataset/211899-0-estadisticas-animales/resource/211899-0-estadisticas-animales-xlsx/download/centroproteccionanimal_2_s_2025.xlsx',
  // Air quality: stations metadata (lat/lng + which magnitudes each station measures)
  // and real-time hourly readings per station + magnitude.
  airStations:
    'https://datos.madrid.es/dataset/212629-0-estaciones-control-aire/resource/212629-0-estaciones-control-aire-csv/download/212629-0-estaciones-control-aire-csv.csv',
  airRealtime:
    'https://ciudadesabiertas.madrid.es/dynamicAPI/API/query/calair_tiemporeal.csv?pageSize=5000',
}

// Madrid air quality magnitude codes we care about for citizen-facing display.
const AIR_MAGNITUDES = {
  8: { key: 'no2', label: 'NO₂', units: 'µg/m³' },
  9: { key: 'pm25', label: 'PM2.5', units: 'µg/m³' },
  10: { key: 'pm10', label: 'PM10', units: 'µg/m³' },
  14: { key: 'o3', label: 'O₃', units: 'µg/m³' },
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

async function fetchCsv(url, encoding = 'iso-8859-1') {
  const res = await fetch(url, { redirect: 'follow' })
  if (!res.ok) throw new Error(`HTTP ${res.status} fetching ${url}`)
  const buf = Buffer.from(await res.arrayBuffer())
  return new TextDecoder(encoding).decode(buf)
}
async function fetchCsvLatin1(url) {
  return fetchCsv(url, 'iso-8859-1')
}
async function fetchCsvUtf8(url) {
  // BOM is fine; Papa.parse strips it.
  return fetchCsv(url, 'utf-8')
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

// The pet census labels the 21st district as "SAN BLAS"; every other Madrid
// dataset uses the official compound name "SAN BLAS-CANILLEJAS". Align so
// district matching works out-of-the-box downstream.
const PERROS_DISTRITO_ALIAS = {
  'SAN BLAS': 'SAN BLAS-CANILLEJAS',
}

// Strip thousand-separator commas before parsing. The protección animal XLSX
// uses English number formatting (1,751 = 1751); the comma-to-dot replacement
// in num() would otherwise turn "1,751" into 1.751.
function numEn(v) {
  if (typeof v === 'number') return v
  if (v === null || v === undefined || v === '') return NaN
  const s = String(v).trim().replace(/%$/, '').replace(/,/g, '')
  const n = Number(s)
  return Number.isFinite(n) ? n : NaN
}

function parseProteccionAnimal(buf) {
  const wb = XLSX.read(buf, { type: 'buffer' })
  const ws = wb.Sheets[wb.SheetNames[0]]
  const rows = XLSX.utils.sheet_to_json(ws, { header: 1, raw: false, defval: null })
  const yearRow = rows[0] ?? []
  const subYearRow = rows[1] ?? []

  // Year columns come in two layouts:
  //   2004–2014: one column per year, sub-header empty.
  //   2015+:     three columns per year (1º semestre / 2º semestre / Global).
  // For each year we pick the "Global YYYY" column when present, otherwise the
  // single column. 1º/2º semestre cells are ignored.
  const yearToCol = {}
  let activeYear = null
  let firstColOfYear = -1
  const len = Math.max(yearRow.length, subYearRow.length)
  for (let c = 1; c < len; c++) {
    const y = num(yearRow[c])
    if (Number.isFinite(y)) {
      activeYear = y
      firstColOfYear = c
    }
    if (!activeYear) continue
    const sub = clean(subYearRow[c]).toLowerCase()
    if (!sub && firstColOfYear === c) {
      yearToCol[activeYear] = c
    } else if (sub.startsWith('global')) {
      yearToCol[activeYear] = c
    }
  }

  function findRow(predicate, startAfter = 0) {
    for (let i = startAfter; i < rows.length; i++) {
      const a = clean(rows[i] && rows[i][0]).toLowerCase()
      if (predicate(a)) return i
    }
    return -1
  }
  const intakeHeader = findRow((a) => a === 'evolución de ingresos')
  const intakeDogs = findRow((a) => a === 'perros', intakeHeader + 1)
  const intakeCats = findRow((a) => a === 'gatos', intakeHeader + 1)
  const adoptHeader = findRow((a) => a === 'animales adoptados')
  const adoptDogs = findRow((a) => a === 'perros', adoptHeader + 1)
  const adoptCats = findRow((a) => a === 'gatos', adoptHeader + 1)

  function readVal(rowIdx, col) {
    if (rowIdx < 0) return null
    const raw = rows[rowIdx]?.[col]
    if (raw === null || raw === undefined || raw === '') return null
    const n = numEn(raw)
    return Number.isFinite(n) ? n : null
  }

  const out = []
  for (const [yStr, c] of Object.entries(yearToCol)) {
    const year = Number(yStr)
    const dogIntakes = readVal(intakeDogs, c)
    const catIntakes = readVal(intakeCats, c)
    const dogAdoptions = readVal(adoptDogs, c)
    const catAdoptions = readVal(adoptCats, c)
    if (
      dogIntakes === null &&
      catIntakes === null &&
      dogAdoptions === null &&
      catAdoptions === null
    )
      continue
    out.push({
      id: `pa-${year}`,
      year,
      dogIntakes: dogIntakes ?? 0,
      catIntakes: catIntakes ?? 0,
      dogAdoptions: dogAdoptions ?? 0,
      catAdoptions: catAdoptions ?? 0,
    })
  }
  return out.sort((a, b) => a.year - b.year)
}

function parsePerros(csv) {
  // Header: AÑO;DISTRITO;ESPECIE CANINA;ESPECIE FELINA + trailing empty cols.
  // Each row is one (year, district). Emit the full history plus the latest
  // year as a snapshot (back-compat with consumers that don't filter by year).
  const rows = parseCsv(csv)
  const entries = []
  const yearSet = new Set()
  let latestYear = -Infinity
  for (const r of rows) {
    const year = num(r['AÑO'])
    if (!Number.isFinite(year)) continue
    let distrito = clean(r['DISTRITO'])
    if (!distrito) continue
    const upper = distrito.toUpperCase()
    if (PERROS_DISTRITO_ALIAS[upper]) distrito = PERROS_DISTRITO_ALIAS[upper]
    const perros = num(r['ESPECIE CANINA'])
    const gatos = num(r['ESPECIE FELINA'])
    entries.push({
      year,
      distrito,
      perros: Number.isFinite(perros) ? perros : 0,
      gatos: Number.isFinite(gatos) ? gatos : 0,
    })
    yearSet.add(year)
    if (year > latestYear) latestYear = year
  }
  const distritos = entries
    .filter((e) => e.year === latestYear)
    .map(({ distrito, perros, gatos }) => ({ distrito, perros, gatos }))
  return {
    year: Number.isFinite(latestYear) ? latestYear : null,
    distritos,
    years: Array.from(yearSet).sort((a, b) => a - b),
    entries,
  }
}

function parseAirStations(csv) {
  const rows = parseCsv(csv)
  const out = new Map()
  for (const r of rows) {
    const lat = num(r['LATITUD'])
    const lng = num(r['LONGITUD'])
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) continue
    if (!inMadridBounds(lat, lng)) continue
    const codigoCorto = String(num(r['CODIGO_CORTO']))
    out.set(codigoCorto, {
      id: codigoCorto,
      name: clean(r['ESTACION']),
      address: clean(r['DIRECCION']),
      lat,
      lng,
      readings: {}, // filled in by realtime parser
      lastUpdate: null,
    })
  }
  return out
}

function parseAirRealtime(csv, stations) {
  // CSV uses ; separator with PROVINCIA;MUNICIPIO;ESTACION;MAGNITUD;...;H01;V01;...;H24;V24
  const rows = parseCsv(csv)
  for (const r of rows) {
    const stationId = String(num(r['ESTACION']))
    const magCode = num(r['MAGNITUD'])
    const magInfo = AIR_MAGNITUDES[magCode]
    if (!magInfo) continue
    const station = stations.get(stationId)
    if (!station) continue

    // Walk hourly columns from H24 backwards looking for the last valid reading
    let lastValid = null
    let lastHour = null
    for (let h = 24; h >= 1; h--) {
      const key = `H${String(h).padStart(2, '0')}`
      const vKey = `V${String(h).padStart(2, '0')}`
      if (clean(r[vKey]) === 'V') {
        const val = num(r[key])
        if (Number.isFinite(val)) {
          lastValid = val
          lastHour = h
          break
        }
      }
    }
    if (lastValid === null) continue
    station.readings[magInfo.key] = {
      value: Number(lastValid.toFixed(1)),
      hour: lastHour,
      label: magInfo.label,
      units: magInfo.units,
    }
    const ts = `${r['ANO']}-${String(r['MES']).padStart(2, '0')}-${String(r['DIA']).padStart(2, '0')}T${String(lastHour).padStart(2, '0')}:00:00`
    if (!station.lastUpdate || ts > station.lastUpdate) station.lastUpdate = ts
  }
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

  // The four classic Latin-1 datasets.
  for (const key of ['papeleras', 'areas', 'parques', 'vets']) {
    const url = SOURCES[key]
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

  // Annual pet census per district (UTF-8 with BOM, semicolon-separated).
  process.stdout.write('Fetching perros (censo animales)…')
  try {
    const csv = await fetchCsvUtf8(SOURCES.perros)
    const parsed = parsePerros(csv)
    await writeFile(resolve(OUT_DIR, 'perros.json'), JSON.stringify(parsed))
    summary.perros = parsed.distritos.length
    summary.perrosYear = parsed.year
    console.log(
      ` ${parsed.distritos.length} districts (year ${parsed.year}) → public/data/perros.json`,
    )
  } catch (err) {
    console.log(` FAILED: ${err.message}`)
    summary.perros = `ERROR: ${err.message}`
  }

  // Madrid Salud — Centro de Protección Animal (XLSX, wide pivot).
  process.stdout.write('Fetching proteccionAnimal…')
  try {
    const res = await fetch(SOURCES.proteccionAnimal, { redirect: 'follow' })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const buf = Buffer.from(await res.arrayBuffer())
    const rows = parseProteccionAnimal(buf)
    await writeFile(resolve(OUT_DIR, 'proteccionAnimal.json'), JSON.stringify(rows))
    summary.proteccionAnimal = rows.length
    summary.proteccionAnimalLatestYear = rows.length ? rows[rows.length - 1].year : null
    console.log(
      ` ${rows.length} years (${rows[0]?.year}–${rows[rows.length - 1]?.year}) → public/data/proteccionAnimal.json`,
    )
  } catch (err) {
    console.log(` FAILED: ${err.message}`)
    summary.proteccionAnimal = `ERROR: ${err.message}`
  }

  // Distritos boundaries (TopoJSON → GeoJSON for choropleth maps).
  process.stdout.write('Fetching distritos boundaries…')
  try {
    const topo = await fetch(
      'https://geoportal.madrid.es/fsdescargas/IDEAM_WBGEOPORTAL/LIMITES_ADMINISTRATIVOS/Distritos/TopoJSON/Distritos.json',
    )
    if (!topo.ok) throw new Error(`HTTP ${topo.status}`)
    const topoJson = await topo.json()
    const { feature } = await import('topojson-client')
    const objKey = Object.keys(topoJson.objects)[0]
    const geo = feature(topoJson, topoJson.objects[objKey])
    await writeFile(resolve(OUT_DIR, 'distritos.geojson'), JSON.stringify(geo))
    summary.distritos = geo.features?.length ?? 0
    console.log(` ${summary.distritos} polygons → public/data/distritos.geojson`)
  } catch (err) {
    console.log(` FAILED: ${err.message}`)
    summary.distritos = `ERROR: ${err.message}`
  }

  // Barrios boundaries (same source, finer granularity).
  process.stdout.write('Fetching barrios boundaries…')
  try {
    const topo = await fetch(
      'https://geoportal.madrid.es/fsdescargas/IDEAM_WBGEOPORTAL/LIMITES_ADMINISTRATIVOS/Barrios/TopoJSON/Barrios.json',
    )
    if (!topo.ok) throw new Error(`HTTP ${topo.status}`)
    const topoJson = await topo.json()
    const { feature } = await import('topojson-client')
    const objKey = Object.keys(topoJson.objects)[0]
    const geo = feature(topoJson, topoJson.objects[objKey])
    await writeFile(resolve(OUT_DIR, 'barrios.geojson'), JSON.stringify(geo))
    summary.barrios = geo.features?.length ?? 0
    console.log(` ${summary.barrios} polygons → public/data/barrios.geojson`)
  } catch (err) {
    console.log(` FAILED: ${err.message}`)
    summary.barrios = `ERROR: ${err.message}`
  }

  // Air quality: stations CSV (UTF-8, with BOM) + real-time hourly readings (UTF-8 BOM).
  process.stdout.write('Fetching airStations + airRealtime…')
  try {
    const stationsCsv = await fetchCsvUtf8(SOURCES.airStations)
    const stations = parseAirStations(stationsCsv)
    const realtimeCsv = await fetchCsvUtf8(SOURCES.airRealtime)
    parseAirRealtime(realtimeCsv, stations)
    const arr = Array.from(stations.values())
    const withReadings = arr.filter((s) => Object.keys(s.readings).length > 0).length
    await writeFile(resolve(OUT_DIR, 'air.json'), JSON.stringify(arr))
    summary.airStations = arr.length
    summary.airReadings = withReadings
    console.log(
      ` ${arr.length} stations, ${withReadings} with current readings → public/data/air.json`,
    )
  } catch (err) {
    console.log(` FAILED: ${err.message}`)
    summary.airStations = `ERROR: ${err.message}`
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
