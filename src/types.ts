export type Locale = 'es' | 'en'

export type LayerKey = 'papeleras' | 'areas' | 'parques' | 'vets'

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
  direccion: string
  distrito: string
  epigrafe: string
  fechaInspeccion: string
}

export interface Datasets {
  papeleras: Papelera[]
  areas: AreaCanina[]
  parques: Parque[]
  vets: Veterinario[]
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
}
