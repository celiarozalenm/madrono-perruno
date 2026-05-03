import { useEffect, useRef } from 'react'
import maplibregl, { Map as MlMap } from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'

const STYLE: maplibregl.StyleSpecification = {
  version: 8,
  sources: {
    base: {
      type: 'raster',
      tiles: [
        'https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png',
        'https://b.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png',
        'https://c.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png',
      ],
      tileSize: 256,
      attribution: '© OpenStreetMap contributors © CARTO',
      maxzoom: 19,
    },
  },
  layers: [{ id: 'base', type: 'raster', source: 'base' }],
}

interface Props {
  lat: number
  lng: number
  zoom?: number
}

export default function InlineLocationMap({ lat, lng, zoom = 16 }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<MlMap | null>(null)
  const markerRef = useRef<maplibregl.Marker | null>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container || mapRef.current) return
    const map = new maplibregl.Map({
      container,
      style: STYLE,
      center: [lng, lat],
      zoom,
      attributionControl: { compact: true },
    })
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right')
    markerRef.current = new maplibregl.Marker({ color: '#ed731f' })
      .setLngLat([lng, lat])
      .addTo(map)
    mapRef.current = map
    map.on('load', () => requestAnimationFrame(() => map.resize()))
    const ro = new ResizeObserver(() => map.resize())
    ro.observe(container)
    return () => {
      ro.disconnect()
      markerRef.current?.remove()
      markerRef.current = null
      map.remove()
      mapRef.current = null
    }
    // Coords are captured on mount; the parent re-mounts this component
    // (key={id}) when switching items, so we don't need to react to changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="relative w-full h-[260px] rounded-md overflow-hidden border border-stone-200">
      <div ref={containerRef} className="w-full h-full" />
    </div>
  )
}
