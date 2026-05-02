import { useEffect, useRef, useState } from 'react'
import maplibregl, { Map as MlMap, type GeoJSONSource } from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import type { Datasets, LayerKey, Locale } from '../types'
import type { RouteResult } from '../services/routing'
import { renderPopupHtml } from './MarkerPopup'
import { buildPapeleraPopupContent } from './PapeleraPopup'
import { buildEntityPopupContent } from './EntityPopup'
import { assessStation, AIR_LEVEL_COLORS, AIR_LEVEL_LABELS } from '../services/air'
import { normaliseDistrito } from '../services/scoring'

// Escala marrón tronco (color del logo) para el coropleta de densidad canina.
const PERROS_RAMP = [
  '#f5f0eb',
  '#e3d5c4',
  '#c9b095',
  '#a98968',
  '#8a6648',
  '#6f4f33',
  '#5a3f2a',
  '#382617',
] as const

const MADRID_CENTER: [number, number] = [-3.7038, 40.4168]
// CARTO Voyager raster tiles — warm cream base, discreet labels, fits the
// madroño / civic-tech palette better than vanilla OSM.
// Free for non-commercial use; OSM + CARTO attribution required.
const MAP_STYLE: maplibregl.StyleSpecification = {
  version: 8,
  sources: {
    base: {
      type: 'raster',
      tiles: [
        'https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png',
        'https://b.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png',
        'https://c.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png',
        'https://d.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png',
      ],
      tileSize: 256,
      attribution:
        '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors © <a href="https://carto.com/attributions">CARTO</a>',
      maxzoom: 19,
    },
  },
  layers: [{ id: 'base', type: 'raster', source: 'base' }],
}

interface Props {
  data: Datasets
  visibleLayers: Record<LayerKey, boolean>
  highlight: { lat: number; lng: number } | null
  route: RouteResult | null
  locale: Locale
  onMapClick?: (coords: { lat: number; lng: number }) => void
}

export default function Map({
  data,
  visibleLayers,
  highlight,
  route,
  locale,
  onMapClick,
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<MlMap | null>(null)
  const popupRef = useRef<maplibregl.Popup | null>(null)
  const highlightMarkerRef = useRef<maplibregl.Marker | null>(null)
  const [distritosGeo, setDistritosGeo] = useState<GeoJSON.FeatureCollection | null>(null)

  // Fetch district polygons once (used by the dog-density choropleth layer).
  useEffect(() => {
    fetch('/data/distritos.geojson')
      .then((r) => (r.ok ? r.json() : null))
      .then((g) => setDistritosGeo(g))
      .catch(() => setDistritosGeo(null))
  }, [])

  // Init map once
  useEffect(() => {
    const container = containerRef.current
    if (!container || mapRef.current) return
    const map = new maplibregl.Map({
      container,
      style: MAP_STYLE,
      center: MADRID_CENTER,
      zoom: 12,
      attributionControl: { compact: true },
    })
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right')
    map.addControl(
      new maplibregl.GeolocateControl({
        positionOptions: { enableHighAccuracy: false },
        trackUserLocation: false,
      }),
      'top-right',
    )
    mapRef.current = map

    map.on('load', () => {
      addSources(map, data)
      addLayers(map)
      // Force a resize after first paint in case the container was hidden
      // when MapLibre initialised (visibility:hidden, display:none, etc.).
      requestAnimationFrame(() => map.resize())
    })

    if (onMapClick) {
      map.on('click', (e) => {
        const features = map.queryRenderedFeatures(e.point, {
          layers: ['papeleras-points', 'areas-points', 'parques-points', 'clusters'],
        })
        if (features.length === 0) {
          onMapClick({ lat: e.lngLat.lat, lng: e.lngLat.lng })
        }
      })
    }

    const ro = new ResizeObserver(() => map.resize())
    ro.observe(container)

    return () => {
      ro.disconnect()
      map.remove()
      mapRef.current = null
    }
  }, [])

  // Update sources when data changes
  useEffect(() => {
    const map = mapRef.current
    if (!map || !map.isStyleLoaded()) return
    updateSources(map, data)
  }, [data])

  // Update visibility
  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    const apply = () => {
      setLayerVis(map, 'papeleras-cluster', visibleLayers.papeleras)
      setLayerVis(map, 'papeleras-cluster-count', visibleLayers.papeleras)
      setLayerVis(map, 'papeleras-points', visibleLayers.papeleras)
      setLayerVis(map, 'areas-points', visibleLayers.areas)
      setLayerVis(map, 'areas-labels', visibleLayers.areas)
      setLayerVis(map, 'parques-points', visibleLayers.parques)
      setLayerVis(map, 'vets-points', visibleLayers.vets)
      setLayerVis(map, 'air-points', visibleLayers.air)
      setLayerVis(map, 'distritos-perros-fill', visibleLayers.perros)
      setLayerVis(map, 'distritos-perros-line', visibleLayers.perros)
    }
    if (map.isStyleLoaded()) apply()
    else map.once('load', apply)
  }, [visibleLayers])

  // Dog-density choropleth (distritos polygons coloured by perros count).
  useEffect(() => {
    const map = mapRef.current
    if (!map || !distritosGeo) return
    const apply = () => {
      const valueByDistrito: Record<string, number> = {}
      for (const d of data.perros?.distritos ?? []) {
        valueByDistrito[normaliseDistrito(d.distrito)] = d.perros
      }
      const values = Object.values(valueByDistrito)
      const max = Math.max(1, ...values)
      const enriched = {
        ...distritosGeo,
        features: distritosGeo.features.map((f) => {
          const props = (f.properties ?? {}) as Record<string, unknown>
          const name = String(props.NOMBRE ?? props.nombre ?? props.NOM_DIS ?? '').trim()
          const value = valueByDistrito[normaliseDistrito(name)] ?? 0
          const ratio = value / max
          const colorIdx = Math.min(
            PERROS_RAMP.length - 1,
            Math.max(0, Math.floor(ratio * PERROS_RAMP.length)),
          )
          return {
            ...f,
            properties: { name, value, color: PERROS_RAMP[colorIdx] },
          }
        }),
      }
      const src = map.getSource('distritos-perros') as GeoJSONSource | undefined
      if (src) {
        src.setData(enriched as GeoJSON.FeatureCollection)
        return
      }
      // Insert below the first point layer so markers stay clickable on top.
      const beforeId = map.getLayer('papeleras-cluster') ? 'papeleras-cluster' : undefined
      map.addSource('distritos-perros', {
        type: 'geojson',
        data: enriched as GeoJSON.FeatureCollection,
      })
      map.addLayer(
        {
          id: 'distritos-perros-fill',
          type: 'fill',
          source: 'distritos-perros',
          paint: { 'fill-color': ['get', 'color'], 'fill-opacity': 0.6 },
          layout: { visibility: visibleLayers.perros ? 'visible' : 'none' },
        },
        beforeId,
      )
      map.addLayer(
        {
          id: 'distritos-perros-line',
          type: 'line',
          source: 'distritos-perros',
          paint: { 'line-color': '#ffffff', 'line-width': 1.2 },
          layout: { visibility: visibleLayers.perros ? 'visible' : 'none' },
        },
        beforeId,
      )

      map.on('click', 'distritos-perros-fill', (e) => {
        const f = e.features?.[0]
        if (!f) return
        const p = f.properties as { name: string; value: number }
        if (popupRef.current) popupRef.current.remove()
        const label = locale === 'es' ? 'Perros censados' : 'Registered dogs'
        popupRef.current = new maplibregl.Popup({ offset: 6, maxWidth: '260px' })
          .setLngLat(e.lngLat)
          .setHTML(
            `<div class="mp-popup"><div class="mp-popup-bar" style="background:#1f4d7a"></div><div class="mp-popup-body" style="padding:8px 10px"><div style="font-weight:600;font-size:0.9rem">${escapeText(
              p.name,
            )}</div><div style="font-size:0.8rem;color:#6b7280;margin-top:2px">${escapeText(
              label,
            )}: <b style="color:#1a1a1a">${p.value.toLocaleString(
              locale === 'es' ? 'es-ES' : 'en-US',
            )}</b></div></div></div>`,
          )
          .addTo(map)
      })
    }
    if (map.isStyleLoaded()) apply()
    else map.once('load', apply)
  }, [distritosGeo, data.perros, visibleLayers.perros, locale])

  // Highlight marker
  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    if (highlightMarkerRef.current) {
      highlightMarkerRef.current.remove()
      highlightMarkerRef.current = null
    }
    if (highlight) {
      const el = document.createElement('div')
      el.className = 'mp-highlight-pin'
      el.setAttribute('aria-label', 'Ubicación seleccionada')
      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([highlight.lng, highlight.lat])
        .addTo(map)
      highlightMarkerRef.current = marker
      map.flyTo({ center: [highlight.lng, highlight.lat], zoom: 15, essential: true })
    }
  }, [highlight])

  // Route line
  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    const apply = () => {
      const src = map.getSource('route') as GeoJSONSource | undefined
      if (!route) {
        if (src) src.setData({ type: 'FeatureCollection', features: [] })
        return
      }
      const fc = {
        type: 'FeatureCollection' as const,
        features: [
          {
            type: 'Feature' as const,
            properties: {},
            geometry: { type: 'LineString' as const, coordinates: route.geometry },
          },
        ],
      }
      if (!src) {
        map.addSource('route', { type: 'geojson', data: fc })
        map.addLayer({
          id: 'route-line',
          type: 'line',
          source: 'route',
          paint: {
            'line-color': '#ed731f',
            'line-width': 5,
            'line-opacity': 0.85,
          },
          layout: { 'line-join': 'round', 'line-cap': 'round' },
        })
      } else {
        src.setData(fc)
      }
      const bounds = new maplibregl.LngLatBounds()
      for (const c of route.geometry) bounds.extend(c)
      map.fitBounds(bounds, { padding: 60, maxZoom: 16 })
    }
    if (map.isStyleLoaded()) apply()
    else map.once('load', apply)
  }, [route])

  // Click handlers for popups
  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    const onPapeleraClick = (e: maplibregl.MapLayerMouseEvent) => {
      const f = e.features?.[0]
      if (!f) return
      const props = f.properties as Record<string, string>
      if (popupRef.current) popupRef.current.remove()
      const node = buildPapeleraPopupContent({
        binId: props.id ?? `unknown-${e.lngLat.lng.toFixed(5)}-${e.lngLat.lat.toFixed(5)}`,
        title: locale === 'es' ? 'Papelera con bolsas' : 'Bag dispenser',
        address: props.direccion ?? '',
        district: props.distrito ?? '',
        modelo: props.modelo ?? '',
        lat: e.lngLat.lat,
        lng: e.lngLat.lng,
        locale,
      })
      popupRef.current = new maplibregl.Popup({ offset: 12, maxWidth: '320px' })
        .setLngLat(e.lngLat)
        .setDOMContent(node)
        .addTo(map)
    }
    const onAreaClick = (e: maplibregl.MapLayerMouseEvent) => {
      const f = e.features?.[0]
      if (!f) return
      const props = f.properties as Record<string, string>
      if (popupRef.current) popupRef.current.remove()
      const node = buildEntityPopupContent({
        entityType: 'area',
        entityId: props.id ?? `area-${e.lngLat.lng.toFixed(5)}-${e.lngLat.lat.toFixed(5)}`,
        title: locale === 'es' ? 'Área canina' : 'Dog area',
        address: props.direccion ?? '',
        district: props.distrito ?? '',
        extra:
          (locale === 'es' ? 'Superficie: ' : 'Area: ') +
          `${props.superficie ?? '?'} m²` +
          (props.juegos === 'true'
            ? locale === 'es'
              ? ' · con juegos'
              : ' · with playground'
            : ''),
        lat: e.lngLat.lat,
        lng: e.lngLat.lng,
        locale,
      })
      popupRef.current = new maplibregl.Popup({ offset: 12, maxWidth: '320px' })
        .setLngLat(e.lngLat)
        .setDOMContent(node)
        .addTo(map)
    }
    const onAirClick = (e: maplibregl.MapLayerMouseEvent) => {
      const f = e.features?.[0]
      if (!f) return
      const props = f.properties as Record<string, string>
      const lvl = (props.level as keyof typeof AIR_LEVEL_LABELS) || 'good'
      const levelLabel = AIR_LEVEL_LABELS[lvl][locale]
      const driverText = props.driverLabel
        ? `${props.driverLabel}: ${props.driverValue} ${props.driverUnits}`
        : ''
      const hour =
        props.hour && props.hour !== ''
          ? ` · ${locale === 'es' ? 'medido a las' : 'measured at'} ${String(props.hour).padStart(2, '0')}:00 h`
          : ''
      const message = locale === 'es' ? props.message : props.messageEn
      if (popupRef.current) popupRef.current.remove()
      popupRef.current = new maplibregl.Popup({ offset: 18, maxWidth: '280px' })
        .setLngLat(e.lngLat)
        .setHTML(
          `<div class="mp-popup">
            <div class="mp-popup-bar" style="background:${props.color}"></div>
            <div class="mp-popup-body">
              <div class="mp-popup-title">${escapeText(props.name || 'Estación')}</div>
              ${props.address ? `<div class="mp-popup-row">${escapeText(props.address)}</div>` : ''}
              <div class="mp-popup-row mp-popup-meta" style="color:${props.color};font-weight:700">
                ${locale === 'es' ? 'Calidad del aire' : 'Air quality'}: ${levelLabel}
              </div>
              ${driverText ? `<div class="mp-popup-row mp-popup-meta">${driverText}${hour}</div>` : ''}
              <div class="mp-popup-row" style="margin-top:8px">${escapeText(message)}</div>
            </div>
          </div>`,
        )
        .addTo(map)
    }

    const onVetClick = (e: maplibregl.MapLayerMouseEvent) => {
      const f = e.features?.[0]
      if (!f) return
      const props = f.properties as Record<string, string>
      if (popupRef.current) popupRef.current.remove()
      popupRef.current = new maplibregl.Popup({ offset: 12 })
        .setLngLat(e.lngLat)
        .setHTML(
          renderPopupHtml('parque', {
            title: locale === 'es' ? 'Centro veterinario' : 'Vet centre',
            address: props.direccion ?? '',
            district: props.distrito ?? '',
            extra: props.epigrafe ?? '',
            lat: e.lngLat.lat,
            lng: e.lngLat.lng,
            locale,
          }),
        )
        .addTo(map)
    }
    const onParqueClick = (e: maplibregl.MapLayerMouseEvent) => {
      const f = e.features?.[0]
      if (!f) return
      const props = f.properties as Record<string, string>
      if (popupRef.current) popupRef.current.remove()
      const node = buildEntityPopupContent({
        entityType: 'parque',
        entityId: props.id ?? `parque-${e.lngLat.lng.toFixed(5)}-${e.lngLat.lat.toFixed(5)}`,
        title: props.nombre || (locale === 'es' ? 'Parque' : 'Park'),
        address: props.direccion ?? '',
        district: props.distrito ?? '',
        extra: '',
        url: props.url || undefined,
        lat: e.lngLat.lat,
        lng: e.lngLat.lng,
        locale,
      })
      popupRef.current = new maplibregl.Popup({ offset: 12, maxWidth: '320px' })
        .setLngLat(e.lngLat)
        .setDOMContent(node)
        .addTo(map)
    }
    const onClusterClick = async (e: maplibregl.MapLayerMouseEvent) => {
      const features = map.queryRenderedFeatures(e.point, { layers: ['papeleras-cluster'] })
      const clusterId = features[0]?.properties?.cluster_id as number | undefined
      if (clusterId == null) return
      const src = map.getSource('papeleras') as GeoJSONSource
      const zoom = await src.getClusterExpansionZoom(clusterId)
      map.easeTo({ center: e.lngLat, zoom })
    }
    const setPointer = (val: boolean) => () => {
      map.getCanvas().style.cursor = val ? 'pointer' : ''
    }

    map.on('click', 'papeleras-points', onPapeleraClick)
    map.on('click', 'areas-points', onAreaClick)
    map.on('click', 'parques-points', onParqueClick)
    map.on('click', 'vets-points', onVetClick)
    map.on('click', 'air-points', onAirClick)
    map.on('click', 'papeleras-cluster', onClusterClick)
    for (const layer of ['papeleras-points', 'areas-points', 'parques-points', 'vets-points', 'air-points', 'papeleras-cluster']) {
      map.on('mouseenter', layer, setPointer(true))
      map.on('mouseleave', layer, setPointer(false))
    }

    return () => {
      map.off('click', 'papeleras-points', onPapeleraClick)
      map.off('click', 'areas-points', onAreaClick)
      map.off('click', 'parques-points', onParqueClick)
      map.off('click', 'vets-points', onVetClick)
      map.off('click', 'air-points', onAirClick)
      map.off('click', 'papeleras-cluster', onClusterClick)
    }
  }, [locale])

  return (
    <div
      ref={containerRef}
      className="absolute inset-0"
      style={{ width: '100%', height: '100%', minHeight: '300px' }}
      aria-label="Mapa de Madrid"
    />
  )
}

function escapeText(s: string): string {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function setLayerVis(map: MlMap, id: string, visible: boolean) {
  if (!map.getLayer(id)) return
  map.setLayoutProperty(id, 'visibility', visible ? 'visible' : 'none')
}

function papelerasGeoJson(data: Datasets) {
  return {
    type: 'FeatureCollection' as const,
    features: data.papeleras.map((p) => ({
      type: 'Feature' as const,
      properties: { id: p.id, direccion: p.direccion, distrito: p.distrito, modelo: p.modelo },
      geometry: { type: 'Point' as const, coordinates: [p.lng, p.lat] },
    })),
  }
}
function areasGeoJson(data: Datasets) {
  return {
    type: 'FeatureCollection' as const,
    features: data.areas.map((a) => ({
      type: 'Feature' as const,
      properties: {
        id: a.id,
        direccion: a.direccion,
        distrito: a.distrito,
        superficie: a.superficieM2,
        juegos: a.juegos ? 'true' : 'false',
      },
      geometry: { type: 'Point' as const, coordinates: [a.lng, a.lat] },
    })),
  }
}
function parquesGeoJson(data: Datasets) {
  return {
    type: 'FeatureCollection' as const,
    features: data.parques.map((p) => ({
      type: 'Feature' as const,
      properties: {
        id: p.id,
        nombre: p.nombre,
        direccion: p.direccion,
        distrito: p.distrito,
        url: p.url ?? '',
      },
      geometry: { type: 'Point' as const, coordinates: [p.lng, p.lat] },
    })),
  }
}

function vetsGeoJson(data: Datasets) {
  return {
    type: 'FeatureCollection' as const,
    features: data.vets
      .filter((v) => typeof v.lat === 'number' && typeof v.lng === 'number')
      .map((v) => ({
        type: 'Feature' as const,
        properties: {
          id: v.id,
          direccion: v.direccion,
          distrito: v.distrito,
          epigrafe: v.epigrafe,
          fechaInspeccion: v.fechaInspeccion,
        },
        geometry: { type: 'Point' as const, coordinates: [v.lng as number, v.lat as number] },
      })),
  }
}

function airGeoJson(data: Datasets) {
  return {
    type: 'FeatureCollection' as const,
    features: (data.air ?? []).map((s) => {
      const a = assessStation(s)
      return {
        type: 'Feature' as const,
        properties: {
          id: s.id,
          name: s.name,
          address: s.address,
          level: a.level,
          color: AIR_LEVEL_COLORS[a.level],
          driver: a.driver,
          driverValue: a.driverValue,
          driverLabel: a.driverLabel,
          driverUnits: a.driverUnits,
          hour: a.hour ?? '',
          message: a.message,
          messageEn: a.messageEn,
        },
        geometry: { type: 'Point' as const, coordinates: [s.lng, s.lat] },
      }
    }),
  }
}

function addSources(map: MlMap, data: Datasets) {
  map.addSource('papeleras', {
    type: 'geojson',
    data: papelerasGeoJson(data),
    cluster: true,
    clusterMaxZoom: 14,
    clusterRadius: 50,
  })
  map.addSource('areas', { type: 'geojson', data: areasGeoJson(data) })
  map.addSource('parques', { type: 'geojson', data: parquesGeoJson(data) })
  map.addSource('vets', { type: 'geojson', data: vetsGeoJson(data) })
  map.addSource('air', { type: 'geojson', data: airGeoJson(data) })
}

function updateSources(map: MlMap, data: Datasets) {
  ;(map.getSource('papeleras') as GeoJSONSource | undefined)?.setData(papelerasGeoJson(data))
  ;(map.getSource('areas') as GeoJSONSource | undefined)?.setData(areasGeoJson(data))
  ;(map.getSource('parques') as GeoJSONSource | undefined)?.setData(parquesGeoJson(data))
  ;(map.getSource('vets') as GeoJSONSource | undefined)?.setData(vetsGeoJson(data))
  ;(map.getSource('air') as GeoJSONSource | undefined)?.setData(airGeoJson(data))
}

function addLayers(map: MlMap) {
  map.addLayer({
    id: 'papeleras-cluster',
    type: 'circle',
    source: 'papeleras',
    filter: ['has', 'point_count'],
    paint: {
      'circle-color': '#ed731f',
      'circle-radius': ['step', ['get', 'point_count'], 16, 25, 22, 100, 28, 500, 36],
      'circle-opacity': 0.85,
      'circle-stroke-width': 2,
      'circle-stroke-color': '#fff',
    },
  })
  map.addLayer({
    id: 'papeleras-cluster-count',
    type: 'symbol',
    source: 'papeleras',
    filter: ['has', 'point_count'],
    layout: {
      'text-field': ['get', 'point_count_abbreviated'],
      'text-size': 12,
      'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
    },
    paint: { 'text-color': '#fff' },
  })
  map.addLayer({
    id: 'papeleras-points',
    type: 'circle',
    source: 'papeleras',
    filter: ['!', ['has', 'point_count']],
    paint: {
      'circle-color': '#ed731f',
      'circle-radius': 5,
      'circle-stroke-width': 1.5,
      'circle-stroke-color': '#fff',
    },
  })

  map.addLayer({
    id: 'areas-points',
    type: 'circle',
    source: 'areas',
    paint: {
      'circle-color': '#2f7d3a',
      'circle-radius': 8,
      'circle-stroke-width': 2,
      'circle-stroke-color': '#fff',
    },
  })

  map.addLayer({
    id: 'parques-points',
    type: 'circle',
    source: 'parques',
    paint: {
      'circle-color': '#5b3a1e',
      'circle-radius': 6,
      'circle-stroke-width': 1.5,
      'circle-stroke-color': '#fff',
    },
  })

  map.addLayer({
    id: 'vets-points',
    type: 'circle',
    source: 'vets',
    paint: {
      'circle-color': '#0e7490',
      'circle-radius': 5,
      'circle-stroke-width': 1.5,
      'circle-stroke-color': '#fff',
    },
    layout: { visibility: 'none' },
  })

  // Air-quality stations: large coloured discs whose colour reflects the
  // current worst-pollutant level (good/fair/poor/bad).
  map.addLayer({
    id: 'air-points',
    type: 'circle',
    source: 'air',
    paint: {
      'circle-color': ['get', 'color'],
      'circle-radius': 14,
      'circle-stroke-width': 3,
      'circle-stroke-color': '#fff',
      'circle-opacity': 0.92,
    },
    layout: { visibility: 'none' },
  })
}
