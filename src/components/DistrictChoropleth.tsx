import { useEffect, useRef, useState } from 'react'
import maplibregl, { Map as MlMap, type GeoJSONSource } from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import type { Locale } from '../types'
import type { DistrictAggregate } from '../types'

const MADRID_CENTER: [number, number] = [-3.7038, 40.4168]
const STYLE: maplibregl.StyleSpecification = {
  version: 8,
  sources: {
    base: {
      type: 'raster',
      tiles: [
        'https://a.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}@2x.png',
        'https://b.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}@2x.png',
        'https://c.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}@2x.png',
      ],
      tileSize: 256,
      attribution: '© OpenStreetMap contributors © CARTO',
      maxzoom: 19,
    },
  },
  layers: [{ id: 'base', type: 'raster', source: 'base' }],
}

interface Props {
  metric: 'papeleras' | 'areasCaninas' | 'parques'
  aggregates: DistrictAggregate[]
  locale: Locale
  metricLabel: string
}

function normaliseDistrito(d: string): string {
  return d
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toUpperCase()
    .trim()
}

const RAMP = [
  '#fef3c7',
  '#fed7aa',
  '#fdba74',
  '#fb923c',
  '#f97316',
  '#ea580c',
  '#c2410c',
  '#9a3412',
] as const

export default function DistrictChoropleth({ metric, aggregates, locale, metricLabel }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<MlMap | null>(null)
  const popupRef = useRef<maplibregl.Popup | null>(null)
  const [geojson, setGeojson] = useState<GeoJSON.FeatureCollection | null>(null)

  useEffect(() => {
    fetch('/data/distritos.geojson')
      .then((r) => r.json())
      .then(setGeojson)
      .catch(() => setGeojson(null))
  }, [])

  // Build a metric → district map for fast lookup.
  const valueByDistrito = new Map<string, number>()
  for (const a of aggregates) valueByDistrito.set(normaliseDistrito(a.distrito), a[metric])
  const max = Math.max(1, ...Array.from(valueByDistrito.values()))

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return
    const map = new maplibregl.Map({
      container: containerRef.current,
      style: STYLE,
      center: MADRID_CENTER,
      zoom: 10.2,
      attributionControl: { compact: true },
    })
    mapRef.current = map
    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !geojson) return
    const apply = () => {
      const enriched = {
        ...geojson,
        features: geojson.features.map((f) => {
          const props = (f.properties ?? {}) as Record<string, unknown>
          const name = String(props.NOMBRE ?? props.nombre ?? props.NOM_DIS ?? '').trim()
          const value = valueByDistrito.get(normaliseDistrito(name)) ?? 0
          const ratio = value / max
          const colorIdx = Math.min(RAMP.length - 1, Math.floor(ratio * RAMP.length))
          return {
            ...f,
            properties: {
              name,
              value,
              color: RAMP[Math.max(0, colorIdx)],
            },
          }
        }),
      }
      const src = map.getSource('distritos') as GeoJSONSource | undefined
      if (src) {
        src.setData(enriched as GeoJSON.FeatureCollection)
      } else {
        map.addSource('distritos', { type: 'geojson', data: enriched as GeoJSON.FeatureCollection })
        map.addLayer({
          id: 'distritos-fill',
          type: 'fill',
          source: 'distritos',
          paint: {
            'fill-color': ['get', 'color'],
            'fill-opacity': 0.8,
          },
        })
        map.addLayer({
          id: 'distritos-line',
          type: 'line',
          source: 'distritos',
          paint: {
            'line-color': '#ffffff',
            'line-width': 1.2,
          },
        })

        map.on('mousemove', 'distritos-fill', (e) => {
          map.getCanvas().style.cursor = 'pointer'
          const f = e.features?.[0]
          if (!f) return
          const p = f.properties as { name: string; value: number }
          if (popupRef.current) popupRef.current.remove()
          popupRef.current = new maplibregl.Popup({ closeButton: false, closeOnClick: false, offset: 6 })
            .setLngLat(e.lngLat)
            .setHTML(
              `<div class="mp-popup" style="width:auto"><div class="mp-popup-bar" style="background:#ed731f"></div><div class="mp-popup-body" style="padding:8px 10px"><div style="font-weight:600;font-size:0.85rem">${escapeText(
                p.name,
              )}</div><div style="font-size:0.75rem;color:#6b7280;margin-top:2px">${escapeText(
                metricLabel,
              )}: <b style="color:#1a1a1a">${p.value.toLocaleString(
                locale === 'es' ? 'es-ES' : 'en-US',
              )}</b></div></div></div>`,
            )
            .addTo(map)
        })
        map.on('mouseleave', 'distritos-fill', () => {
          map.getCanvas().style.cursor = ''
          if (popupRef.current) {
            popupRef.current.remove()
            popupRef.current = null
          }
        })
      }
    }
    if (map.isStyleLoaded()) apply()
    else map.once('load', apply)
  }, [geojson, metric, metricLabel, max])

  return (
    <div className="relative w-full h-[460px] rounded-lg overflow-hidden">
      <div ref={containerRef} className="absolute inset-0" />
      {/* Legend */}
      <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur rounded-lg shadow border border-stone-200 p-2 text-xs">
        <div className="font-semibold uppercase text-[10px] text-stone-500 mb-1">
          {locale === 'es' ? 'Intensidad' : 'Intensity'}
        </div>
        <div className="flex items-center gap-1">
          <span className="text-stone-500">{locale === 'es' ? 'menos' : 'less'}</span>
          {RAMP.map((c) => (
            <span key={c} className="w-4 h-3 rounded-sm" style={{ background: c }} />
          ))}
          <span className="text-stone-500">{locale === 'es' ? 'más' : 'more'}</span>
        </div>
      </div>
    </div>
  )
}

function escapeText(s: string): string {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}
