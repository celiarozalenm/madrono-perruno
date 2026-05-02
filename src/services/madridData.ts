import Papa from 'papaparse'
import type { AreaCanina, Datasets, Papelera, Parque, Veterinario } from '../types'

const CACHE_PREFIX = 'mp-cache-v1:'
const CACHE_TTL_MS = 24 * 60 * 60 * 1000

export const DATASETS = {
  papeleras: {
    url: 'https://datos.madrid.es/egob/catalogo/300081-0-papeleras-bolsas-excrementos.csv',
    label: 'Papeleras con dispensador de bolsas para excrementos caninos',
    portalUrl: 'https://datos.madrid.es/portal/site/egob/menuitem.c05c1f754a33a9fbe4b2e4b284f1a5a0/?vgnextoid=cad9b9d2c1dde410VgnVCM2000000c205a0aRCRD',
  },
  areas: {
    url: 'https://datos.madrid.es/egob/catalogo/300094-0-areas-caninas.csv',
    label: 'Áreas caninas',
    portalUrl: 'https://datos.madrid.es/portal/site/egob/menuitem.c05c1f754a33a9fbe4b2e4b284f1a5a0/?vgnextoid=49e83d5e3af7a510VgnVCM1000001d4a900aRCRD',
  },
  parques: {
    url: 'https://datos.madrid.es/egob/catalogo/200761-0-parques-jardines.csv',
    label: 'Principales parques y jardines',
    portalUrl: 'https://datos.madrid.es/portal/site/egob/menuitem.754ccd5cc40f9510VgnVCM1000008a4a900aRCRD',
  },
  vets: {
    url: 'https://datos.madrid.es/egob/catalogo/300281-0-inspecciones-veterinarios.csv',
    label: 'Inspecciones a centros de animales de compañía',
    portalUrl: 'https://datos.madrid.es/portal/site/egob/menuitem.c05c1f754a33a9fbe4b2e4b284f1a5a0/?vgnextoid=46b55cc016f49510VgnVCM1000008a4a900aRCRD',
  },
} as const

async function fetchCsvLatin1(url: string): Promise<string> {
  const res = await fetch(url, { mode: 'cors' })
  if (!res.ok) throw new Error(`HTTP ${res.status} fetching ${url}`)
  const buf = await res.arrayBuffer()
  return new TextDecoder('iso-8859-1').decode(buf)
}

function parseCsv<T extends object>(csv: string): T[] {
  const result = Papa.parse<T>(csv, {
    header: true,
    skipEmptyLines: true,
    delimiter: ';',
    dynamicTyping: false,
    transformHeader: (h) => h.trim(),
  })
  return result.data
}

function num(v: unknown): number {
  if (typeof v === 'number') return v
  if (!v) return NaN
  const s = String(v).trim().replace(',', '.')
  const n = Number(s)
  return Number.isFinite(n) ? n : NaN
}

function clean(v: unknown): string {
  return String(v ?? '').trim()
}

function inMadridBounds(lat: number, lng: number): boolean {
  return lat > 40.2 && lat < 40.65 && lng > -3.95 && lng < -3.45
}

function parsePapeleras(csv: string): Papelera[] {
  type Row = Record<string, string>
  const rows = parseCsv<Row>(csv)
  const out: Papelera[] = []
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

function parseAreas(csv: string): AreaCanina[] {
  type Row = Record<string, string>
  const rows = parseCsv<Row>(csv)
  const out: AreaCanina[] = []
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

function parseParques(csv: string): Parque[] {
  type Row = Record<string, string>
  const rows = parseCsv<Row>(csv)
  const out: Parque[] = []
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

function parseVets(csv: string): Veterinario[] {
  type Row = Record<string, string>
  const rows = parseCsv<Row>(csv)
  const out: Veterinario[] = []
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

interface CachedDataset<T> {
  ts: number
  rows: T[]
}

function readCache<T>(key: string): T[] | null {
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + key)
    if (!raw) return null
    const parsed = JSON.parse(raw) as CachedDataset<T>
    if (Date.now() - parsed.ts > CACHE_TTL_MS) return null
    return parsed.rows
  } catch {
    return null
  }
}

function writeCache<T>(key: string, rows: T[]): void {
  try {
    const payload: CachedDataset<T> = { ts: Date.now(), rows }
    localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(payload))
  } catch {
    // Quota exceeded or private mode — silently skip.
  }
}

async function loadOne<T>(
  key: string,
  url: string,
  parser: (csv: string) => T[],
): Promise<T[]> {
  const cached = readCache<T>(key)
  if (cached) return cached
  const csv = await fetchCsvLatin1(url)
  const rows = parser(csv)
  writeCache(key, rows)
  return rows
}

export async function loadAllDatasets(): Promise<Datasets> {
  const [papeleras, areas, parques, vets] = await Promise.all([
    loadOne('papeleras', DATASETS.papeleras.url, parsePapeleras),
    loadOne('areas', DATASETS.areas.url, parseAreas),
    loadOne('parques', DATASETS.parques.url, parseParques),
    loadOne('vets', DATASETS.vets.url, parseVets),
  ])
  return { papeleras, areas, parques, vets }
}
