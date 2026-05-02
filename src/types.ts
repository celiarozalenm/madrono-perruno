export type Locale = 'es' | 'en'

export type LayerKey = 'papeleras' | 'areas' | 'parques' | 'vets' | 'air'

export interface Papelera {
  id: string
  lat: number
  lng: number
  direccion: string
  distrito: string
  barrio: string
  modelo: string
}

export interface AreaCanina {
  id: string
  lat: number
  lng: number
  direccion: string
  distrito: string
  superficieM2: number
  juegos: boolean
}

export interface Parque {
  id: string
  lat: number
  lng: number
  nombre: string
  direccion: string
  distrito: string
  barrio: string
  url?: string
  email?: string
}

export interface Veterinario {
  id: string
  lat?: number
  lng?: number
  direccion: string
  distrito: string
  epigrafe: string
  fechaInspeccion: string
}

export interface AirReading {
  value: number
  hour: number
  label: string
  units: string
}

export interface AirStation {
  id: string
  name: string
  address: string
  lat: number
  lng: number
  readings: {
    no2?: AirReading
    pm25?: AirReading
    pm10?: AirReading
    o3?: AirReading
  }
  lastUpdate: string | null
}

export interface DistritoPerros {
  distrito: string
  perros: number
  gatos: number
}

export interface PerrosCensus {
  year: number | null
  distritos: DistritoPerros[]
}

export interface Datasets {
  papeleras: Papelera[]
  areas: AreaCanina[]
  parques: Parque[]
  vets: Veterinario[]
  air: AirStation[]
  perros: PerrosCensus
}

export interface BarrioScore {
  papeleras: number
  areasCaninas: number
  parques: number
  veterinariosDistrito: number
  scoreOver100: number
  scoreLabel: 'excelente' | 'bueno' | 'mejorable' | 'pobre'
}

export interface DistrictAggregate {
  distrito: string
  papeleras: number
  areasCaninas: number
  parques: number
  veterinarios: number
  superficieAreasM2: number
  perros: number
}
