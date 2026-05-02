import type { Papelera, AreaCanina } from '../types'
import { distanceMeters } from './scoring'

export interface RouteWaypoint {
  lat: number
  lng: number
  type: 'start' | 'papelera' | 'area'
  label: string
  ref?: Papelera | AreaCanina
}

export interface RouteResult {
  waypoints: RouteWaypoint[]
  geometry: [number, number][] // [lng, lat] pairs (GeoJSON LineString-style)
  distanceMeters: number
  estimatedMinutes: number
  papelerasCount: number
  areasCount: number
  source: 'osrm' | 'straight'
}

const WALK_SPEED_M_PER_MIN = 80

interface BuildOpts {
  start: { lat: number; lng: number }
  durationMin: number
  papeleras: Papelera[]
  areas: AreaCanina[]
}

export async function buildBagFriendlyRoute(opts: BuildOpts): Promise<RouteResult> {
  const targetMeters = opts.durationMin * WALK_SPEED_M_PER_MIN
  const maxFromStart = targetMeters / 2

  const candidates: RouteWaypoint[] = []
  for (const p of opts.papeleras) {
    const d = distanceMeters(opts.start, p)
    if (d <= maxFromStart) {
      candidates.push({
        lat: p.lat,
        lng: p.lng,
        type: 'papelera',
        label: p.direccion || 'Papelera',
        ref: p,
      })
    }
  }
  for (const a of opts.areas) {
    const d = distanceMeters(opts.start, a)
    if (d <= maxFromStart) {
      candidates.push({
        lat: a.lat,
        lng: a.lng,
        type: 'area',
        label: a.direccion || 'Área canina',
        ref: a,
      })
    }
  }

  const ordered = greedyLoopOrder(opts.start, candidates, targetMeters)

  const waypoints: RouteWaypoint[] = [
    { ...opts.start, type: 'start', label: 'Inicio' },
    ...ordered,
  ]

  let geometry: [number, number][] = waypoints.map((w) => [w.lng, w.lat])
  geometry.push([opts.start.lng, opts.start.lat])

  let totalMeters = straightLineDistance(waypoints, opts.start)
  let source: RouteResult['source'] = 'straight'

  try {
    const osrm = await tryOsrmRoute(waypoints, opts.start)
    if (osrm) {
      geometry = osrm.geometry
      totalMeters = osrm.distance
      source = 'osrm'
    }
  } catch {
    // OSRM failed; keep straight-line fallback.
  }

  const papelerasCount = ordered.filter((w) => w.type === 'papelera').length
  const areasCount = ordered.filter((w) => w.type === 'area').length

  return {
    waypoints,
    geometry,
    distanceMeters: totalMeters,
    estimatedMinutes: Math.round(totalMeters / WALK_SPEED_M_PER_MIN),
    papelerasCount,
    areasCount,
    source,
  }
}

function greedyLoopOrder(
  start: { lat: number; lng: number },
  candidates: RouteWaypoint[],
  budgetMeters: number,
): RouteWaypoint[] {
  // Score: prefer áreas caninas (more interesting waypoint) + papeleras spread out.
  // Greedy: from current point, pick nearest unvisited candidate, until budget consumed.
  const remaining = [...candidates]
  const ordered: RouteWaypoint[] = []
  let current = start
  let consumed = 0

  while (remaining.length > 0) {
    remaining.sort((a, b) => distanceMeters(current, a) - distanceMeters(current, b))
    const next = remaining[0]
    const legToNext = distanceMeters(current, next)
    const legBack = distanceMeters(next, start)
    if (consumed + legToNext + legBack > budgetMeters) break
    ordered.push(next)
    consumed += legToNext
    current = next
    remaining.shift()

    // Cap waypoints to keep route readable.
    if (ordered.length >= 8) break
  }
  return ordered
}

function straightLineDistance(
  waypoints: RouteWaypoint[],
  start: { lat: number; lng: number },
): number {
  let total = 0
  for (let i = 0; i < waypoints.length - 1; i++) {
    total += distanceMeters(waypoints[i], waypoints[i + 1])
  }
  if (waypoints.length > 0) {
    total += distanceMeters(waypoints[waypoints.length - 1], start)
  }
  return total
}

async function tryOsrmRoute(
  waypoints: RouteWaypoint[],
  start: { lat: number; lng: number },
): Promise<{ geometry: [number, number][]; distance: number } | null> {
  if (waypoints.length < 2) return null
  const coords = [...waypoints, start]
    .map((w) => `${w.lng.toFixed(6)},${w.lat.toFixed(6)}`)
    .join(';')
  const url = `https://router.project-osrm.org/route/v1/foot/${coords}?overview=full&geometries=geojson`
  const res = await fetch(url, { mode: 'cors' })
  if (!res.ok) return null
  const json = (await res.json()) as {
    routes?: { geometry: { coordinates: [number, number][] }; distance: number }[]
  }
  const route = json.routes?.[0]
  if (!route) return null
  return { geometry: route.geometry.coordinates, distance: route.distance }
}
