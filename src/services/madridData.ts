import type {
  AirStation,
  AreaCanina,
  Datasets,
  Papelera,
  Parque,
  PerrosCensus,
  Veterinario,
} from '../types'

// Datasets are pre-fetched at build time (scripts/fetch-data.mjs) and served from
// /data/*.json on the same origin to avoid CORS on the redirected download URLs of
// the Madrid Open Data portal.

export const DATASETS = {
  papeleras: {
    label: 'Papeleras con dispensador de bolsas para excrementos caninos',
    portalUrl:
      'https://datos.madrid.es/portal/site/egob/menuitem.c05c1f754a33a9fbe4b2e4b284f1a5a0/?vgnextoid=cad9b9d2c1dde410VgnVCM2000000c205a0aRCRD',
  },
  areas: {
    label: 'Áreas caninas',
    portalUrl:
      'https://datos.madrid.es/portal/site/egob/menuitem.c05c1f754a33a9fbe4b2e4b284f1a5a0/?vgnextoid=49e83d5e3af7a510VgnVCM1000001d4a900aRCRD',
  },
  parques: {
    label: 'Principales parques y jardines',
    portalUrl:
      'https://datos.madrid.es/portal/site/egob/menuitem.754ccd5cc40f9510VgnVCM1000008a4a900aRCRD',
  },
  vets: {
    label: 'Inspecciones a centros de animales de compañía',
    portalUrl:
      'https://datos.madrid.es/portal/site/egob/menuitem.c05c1f754a33a9fbe4b2e4b284f1a5a0/?vgnextoid=46b55cc016f49510VgnVCM1000008a4a900aRCRD',
  },
  perros: {
    label: 'Censo de animales domésticos por distrito',
    portalUrl: 'https://datos.madrid.es/dataset/207118-0-censo-animales',
  },
  air: {
    label: 'Calidad del aire en tiempo real',
    portalUrl: 'https://datos.madrid.es/dataset/212531-0-calidad-aire-tiempo-real',
  },
} as const

async function loadJson<T>(name: string): Promise<T> {
  const res = await fetch(`/data/${name}.json`, { cache: 'force-cache' })
  if (!res.ok) throw new Error(`HTTP ${res.status} loading /data/${name}.json`)
  return (await res.json()) as T
}

const EMPTY_PERROS: PerrosCensus = { year: null, distritos: [] }

export async function loadAllDatasets(): Promise<Datasets> {
  const [papeleras, areas, parques, vets, air, perros] = await Promise.all([
    loadJson<Papelera[]>('papeleras'),
    loadJson<AreaCanina[]>('areas'),
    loadJson<Parque[]>('parques'),
    loadJson<Veterinario[]>('vets'),
    loadJson<AirStation[]>('air').catch(() => [] as AirStation[]),
    loadJson<PerrosCensus>('perros').catch(() => EMPTY_PERROS),
  ])
  return { papeleras, areas, parques, vets, air, perros }
}
