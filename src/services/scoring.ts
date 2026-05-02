import type { BarrioScore, Datasets, DistrictAggregate } from '../types'

const EARTH_R_M = 6_371_000

export function distanceMeters(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): number {
  const toRad = (d: number) => (d * Math.PI) / 180
  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)
  const lat1 = toRad(a.lat)
  const lat2 = toRad(b.lat)
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2
  return 2 * EARTH_R_M * Math.asin(Math.sqrt(h))
}

const WALK_SPEED_M_PER_MIN = 80

export function radiusForMinutes(min: number): number {
  return min * WALK_SPEED_M_PER_MIN
}

export function scoreBarrio(
  point: { lat: number; lng: number },
  data: Datasets,
  withinMin = 10,
): BarrioScore {
  const radius = radiusForMinutes(withinMin)
  const papelerasNear = data.papeleras.filter(
    (p) => distanceMeters(point, p) <= radius,
  ).length
  const areasNear = data.areas.filter(
    (a) => distanceMeters(point, a) <= radius,
  ).length
  const parquesNear = data.parques.filter(
    (p) => distanceMeters(point, p) <= radius,
  ).length

  const distritoVecino = nearestDistrito(point, data)
  const vetsDist = data.vets.filter(
    (v) => normaliseDistrito(v.distrito) === distritoVecino,
  ).length

  // Heuristic 0-100. Caps so a single feature can't dominate.
  const papelerasPts = Math.min(papelerasNear / 30, 1) * 40
  const areasPts = Math.min(areasNear / 3, 1) * 30
  const parquesPts = Math.min(parquesNear / 4, 1) * 20
  const vetsPts = Math.min(vetsDist / 30, 1) * 10
  const score = Math.round(papelerasPts + areasPts + parquesPts + vetsPts)

  let label: BarrioScore['scoreLabel']
  if (score >= 80) label = 'excelente'
  else if (score >= 60) label = 'bueno'
  else if (score >= 35) label = 'mejorable'
  else label = 'pobre'

  return {
    papeleras: papelerasNear,
    areasCaninas: areasNear,
    parques: parquesNear,
    veterinariosDistrito: vetsDist,
    scoreOver100: score,
    scoreLabel: label,
  }
}

export function normaliseDistrito(d: string): string {
  return d
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toUpperCase()
    .replace(/\s*-\s*/g, '-')
    .replace(/\s+/g, ' ')
    .trim()
}

const INVALID_DISTRITO_NAMES = new Set(['', 'DISTRITO', 'CARABANCHEL-LATINA'])

function isValidDistrito(d: string): boolean {
  return !INVALID_DISTRITO_NAMES.has(normaliseDistrito(d))
}

function nearestDistrito(
  point: { lat: number; lng: number },
  data: Datasets,
): string {
  let best = ''
  let bestDist = Infinity
  for (const p of data.papeleras) {
    const d = distanceMeters(point, p)
    if (d < bestDist) {
      bestDist = d
      best = normaliseDistrito(p.distrito)
    }
  }
  return best
}

export function aggregateByDistrict(data: Datasets): DistrictAggregate[] {
  const map = new Map<string, DistrictAggregate>()
  const ensure = (d: string): DistrictAggregate => {
    const key = normaliseDistrito(d)
    if (!map.has(key)) {
      map.set(key, {
        distrito: titleCase(key),
        papeleras: 0,
        areasCaninas: 0,
        parques: 0,
        veterinarios: 0,
        superficieAreasM2: 0,
        perros: 0,
      })
    }
    return map.get(key)!
  }
  for (const p of data.papeleras) {
    if (!p.distrito) continue
    ensure(p.distrito).papeleras += 1
  }
  for (const a of data.areas) {
    if (!a.distrito) continue
    const r = ensure(a.distrito)
    r.areasCaninas += 1
    r.superficieAreasM2 += a.superficieM2
  }
  for (const pk of data.parques) {
    if (!pk.distrito) continue
    ensure(pk.distrito).parques += 1
  }
  for (const v of data.vets) {
    if (!v.distrito) continue
    ensure(v.distrito).veterinarios += 1
  }
  for (const dp of data.perros.distritos) {
    if (!dp.distrito) continue
    ensure(dp.distrito).perros = dp.perros
  }
  return Array.from(map.values()).sort(
    (a, b) => b.papeleras - a.papeleras,
  )
}

function titleCase(s: string): string {
  return s
    .toLowerCase()
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}
