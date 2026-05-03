// Helpers for evaluating air-quality readings against WHO / EU thresholds
// and surfacing them to the user as a single qualitative level.

import type { AirStation } from '../types'
import { distanceMeters } from './scoring'

export type AirLevel = 'good' | 'fair' | 'poor' | 'bad'

export interface AirAssessment {
  level: AirLevel
  driver: 'no2' | 'pm25' | 'pm10' | 'o3' | 'unknown'
  driverValue: number
  driverLabel: string
  driverUnits: string
  hour: number | null
  message: string
  messageEn: string
}

export const AIR_LEVEL_COLORS: Record<AirLevel, string> = {
  good: '#3d6e3a',
  fair: '#a3851a',
  poor: '#ed731f',
  bad: '#b8431b',
}

export const AIR_LEVEL_LABELS: Record<AirLevel, { es: string; en: string }> = {
  good: { es: 'Buena', en: 'Good' },
  fair: { es: 'Aceptable', en: 'Fair' },
  poor: { es: 'Mala', en: 'Poor' },
  bad: { es: 'Muy mala', en: 'Very bad' },
}

// Convert a numeric reading into a 0-3 ordinal level. WHO 2021 daily guidelines
// for outdoor air quality. Values are µg/m³ unless noted.
function levelFor(metric: 'no2' | 'pm25' | 'pm10' | 'o3', value: number): number {
  switch (metric) {
    case 'no2':
      if (value <= 25) return 0
      if (value <= 50) return 1
      if (value <= 100) return 2
      return 3
    case 'pm25':
      if (value <= 15) return 0
      if (value <= 25) return 1
      if (value <= 50) return 2
      return 3
    case 'pm10':
      if (value <= 45) return 0
      if (value <= 75) return 1
      if (value <= 150) return 2
      return 3
    case 'o3':
      if (value <= 100) return 0
      if (value <= 140) return 1
      if (value <= 180) return 2
      return 3
  }
}

const ORDINAL_TO_LEVEL: AirLevel[] = ['good', 'fair', 'poor', 'bad']

export function assessStation(station: AirStation): AirAssessment {
  let worstOrdinal = -1
  let driver: AirAssessment['driver'] = 'unknown'
  let driverValue = 0
  let driverLabel = ''
  let driverUnits = ''
  for (const metric of ['no2', 'pm25', 'pm10', 'o3'] as const) {
    const reading = station.readings[metric]
    if (!reading) continue
    const ord = levelFor(metric, reading.value)
    if (ord > worstOrdinal) {
      worstOrdinal = ord
      driver = metric
      driverValue = reading.value
      driverLabel = reading.label
      driverUnits = reading.units
    }
  }
  if (worstOrdinal === -1) {
    return {
      level: 'good',
      driver: 'unknown',
      driverValue: 0,
      driverLabel: '',
      driverUnits: '',
      hour: null,
      message: 'Sin datos en esta estación.',
      messageEn: 'No data at this station.',
    }
  }
  const level = ORDINAL_TO_LEVEL[worstOrdinal]
  const hour =
    driver !== 'unknown' ? station.readings[driver]?.hour ?? null : null
  const message = (() => {
    switch (level) {
      case 'good':
        return 'Aire limpio. Buen momento para un paseo largo.'
      case 'fair':
        return 'Aire aceptable. Paseo normal sin problema.'
      case 'poor':
        return 'Aire cargado. Evita zonas de tráfico denso si puedes.'
      case 'bad':
        return 'Aire muy contaminado. Mejor un paseo corto y por zona verde.'
    }
  })()
  const messageEn = (() => {
    switch (level) {
      case 'good':
        return 'Clean air. Great time for a long walk.'
      case 'fair':
        return 'Air is fair. A normal walk is fine.'
      case 'poor':
        return 'Air is loaded. Avoid heavy-traffic spots if you can.'
      case 'bad':
        return 'Air is very polluted. Keep walks short and stick to green areas.'
    }
  })()
  return { level, driver, driverValue, driverLabel, driverUnits, hour, message, messageEn }
}

export function nearestStation(
  point: { lat: number; lng: number },
  stations: AirStation[],
): AirStation | null {
  let best: AirStation | null = null
  let bestDist = Infinity
  for (const s of stations) {
    if (Object.keys(s.readings).length === 0) continue
    const d = distanceMeters(point, s)
    if (d < bestDist) {
      bestDist = d
      best = s
    }
  }
  return best
}
