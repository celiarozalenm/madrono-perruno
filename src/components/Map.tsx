import { useEffect, useRef } from 'react'
import maplibregl, { Map as MlMap, type GeoJSONSource } from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import type { Datasets, LayerKey, Locale } from '../types'
import type { RouteResult } from '../services/routing'
import { renderPopupHtml } from './MarkerPopup'
import { buildPapeleraPopupContent } from './PapeleraPopup'

const MADRID_CENTER: [number, number] = [-3.7038, 40.4168]
const OSM_STYLE: maplibregl.StyleSpecification = {
  version: 8,
  sources: {
    osm: {
      type: 'raster',
      tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
      tileSize: 256,
      attribution: '© OpenStreetMap contributors',
      maxzoom: 19,
    },
  },
  layers: [{ id: 'osm', type: 'raster', source: 'osm' }],
}

interface Props {
  data: Datasets
  visibleLayers: Record<LayerKey, boolean>
  showHeat: boolean
  highlight: { lat: number; lng: number } | null
  route: RouteResult | null
  locale: Locale
  onMapClick?: (coords: { lat: number; lng: number }) => void
}

export default function Map({
  data,
  visibleLayers,
  showHeat,
  highlight,
  route,
  locale,
  onMapClick,
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<MlMap | null>(null)
  const popupRef = useRef<maplibregl.Popup | null>(null)
  const highlightMarkerRef = useRef<maplibregl.Marker | null>(null)

  // Init map once
  useEffect(() => {
    const container = containerRef.current
    if (!container || mapRef.current) return
    const map = new maplibregl.Map({
      container,
      style: OSM_STYLE,
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
      setLayerVis(map, 'heat', showHeat && visibleLayers.papeleras)
    }
    if (map.isStyleLoaded()) apply()
    else map.once('load', apply)
  }, [visibleLayers, showHeat])

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
      popupRef.current = new maplibregl.Popup({ offset: 12 })
        .setLngLat(e.lngLat)
        .setHTML(
          renderPopupHtml('area', {
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
          }),
        )
        .addTo(map)
    }
    const onParqueClick = (e: maplibregl.MapLayerMouseEvent) => {
      const f = e.features?.[0]
      if (!f) return
      const props = f.properties as Record<string, string>
      if (popupRef.current) popupRef.current.remove()
      popupRef.current = new maplibregl.Popup({ offset: 12, maxWidth: '300px' })
        .setLngLat(e.lngLat)
        .setHTML(
          renderPopupHtml('parque', {
            title: props.nombre || (locale === 'es' ? 'Parque' : 'Park'),
            address: props.direccion ?? '',
            district: props.distrito ?? '',
            extra: '',
            url: props.url || undefined,
            lat: e.lngLat.lat,
            lng: e.lngLat.lng,
            locale,
          }),
        )
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
    map.on('click', 'papeleras-cluster', onClusterClick)
    for (const layer of ['papeleras-points', 'areas-points', 'parques-points', 'papeleras-cluster']) {
      map.on('mouseenter', layer, setPointer(true))
      map.on('mouseleave', layer, setPointer(false))
    }

    return () => {
      map.off('click', 'papeleras-points', onPapeleraClick)
      map.off('click', 'areas-points', onAreaClick)
      map.off('click', 'parques-points', onParqueClick)
      map.off('click', 'papeleras-cluster', onClusterClick)
    }
  }, [locale])

  return <div ref={containerRef} className="absolute inset-0" aria-label="Mapa de Madrid" />
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
}

function updateSources(map: MlMap, data: Datasets) {
  ;(map.getSource('papeleras') as GeoJSONSource | undefined)?.setData(papelerasGeoJson(data))
  ;(map.getSource('areas') as GeoJSONSource | undefined)?.setData(areasGeoJson(data))
  ;(map.getSource('parques') as GeoJSONSource | undefined)?.setData(parquesGeoJson(data))
}

function addLayers(map: MlMap) {
  map.addLayer({
    id: 'heat',
    type: 'heatmap',
    source: 'papeleras',
    maxzoom: 15,
    paint: {
      'heatmap-weight': 1,
      'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 8, 1, 15, 3],
      'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 8, 6, 15, 25],
      'heatmap-opacity': ['interpolate', ['linear'], ['zoom'], 12, 0.7, 15, 0.2],
      'heatmap-color': [
        'interpolate',
        ['linear'],
        ['heatmap-density'],
        0,
        'rgba(237,115,31,0)',
        0.2,
        'rgba(253,236,214,0.6)',
        0.4,
        'rgba(246,184,120,0.7)',
        0.7,
        'rgba(237,115,31,0.8)',
        1,
        'rgba(184,67,20,0.9)',
      ],
    },
    layout: { visibility: 'none' },
  })

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
}
