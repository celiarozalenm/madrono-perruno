import { useState } from 'react'
import { Search, MapPin, Loader2, AlertCircle, Footprints, RotateCcw, Trash2, Dog } from 'lucide-react'
import type { Datasets, Locale } from '../types'
import { buildBagFriendlyRoute, type RouteResult } from '../services/routing'
import { useGeolocation } from '../hooks/useGeolocation'

interface Props {
  data: Datasets
  locale: Locale
  onRoute: (r: RouteResult | null) => void
  onLocate: (coords: { lat: number; lng: number }) => void
}

const DURATIONS = [15, 30, 45, 60] as const

interface Geocoded {
  lat: number
  lng: number
  label: string
}

async function geocode(query: string): Promise<Geocoded | null> {
  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&accept-language=es&q=${encodeURIComponent(
    query + ', Madrid, España',
  )}`
  const res = await fetch(url, { headers: { 'Accept-Language': 'es' } })
  if (!res.ok) return null
  const arr = (await res.json()) as { lat: string; lon: string; display_name: string }[]
  const r = arr[0]
  if (!r) return null
  return { lat: Number(r.lat), lng: Number(r.lon), label: r.display_name }
}

export default function RouteBuilder({ data, locale, onRoute, onLocate }: Props) {
  const [address, setAddress] = useState('')
  const [duration, setDuration] = useState<typeof DURATIONS[number]>(30)
  const [start, setStart] = useState<Geocoded | null>(null)
  const [route, setRoute] = useState<RouteResult | null>(null)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const geo = useGeolocation()

  async function handleBuild(e?: React.FormEvent) {
    e?.preventDefault()
    setError(null)

    let starting = start
    if (!starting && geo.coords) {
      starting = { ...geo.coords, label: locale === 'es' ? 'Mi ubicación' : 'My location' }
      setStart(starting)
    }
    if (!starting && address.trim()) {
      setPending(true)
      try {
        const g = await geocode(address.trim())
        if (!g) {
          setError(locale === 'es' ? 'No se ha encontrado esa dirección' : 'Address not found')
          setPending(false)
          return
        }
        starting = g
        setStart(g)
        onLocate({ lat: g.lat, lng: g.lng })
      } catch {
        setError(locale === 'es' ? 'Error buscando la dirección' : 'Search error')
        setPending(false)
        return
      }
    }
    if (!starting) {
      setError(
        locale === 'es'
          ? 'Introduce una dirección o usa tu ubicación'
          : 'Enter an address or use your location',
      )
      return
    }

    setPending(true)
    try {
      const r = await buildBagFriendlyRoute({
        start: { lat: starting.lat, lng: starting.lng },
        durationMin: duration,
        papeleras: data.papeleras,
        areas: data.areas,
      })
      setRoute(r)
      onRoute(r)
    } catch {
      setError(locale === 'es' ? 'Error generando la ruta' : 'Route error')
    } finally {
      setPending(false)
    }
  }

  function useMyLocation() {
    geo.request()
  }
  function reset() {
    setRoute(null)
    setStart(null)
    setAddress('')
    onRoute(null)
  }

  if (geo.coords && !start) {
    setStart({ ...geo.coords, label: locale === 'es' ? 'Mi ubicación' : 'My location' })
    onLocate(geo.coords)
  }

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6 space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-stone-900 flex items-center gap-2">
          <Footprints className="text-brand-500" />
          {locale === 'es' ? 'Ruta bolsa-amigable' : 'Bag-friendly walk'}
        </h1>
        <p className="text-sm text-stone-600 mt-1">
          {locale === 'es'
            ? 'Genera un paseo en bucle que pasa por papeleras y áreas caninas cercanas. Ideal para sacar al perro sin acabar a oscuras lejos de casa.'
            : 'Generate a loop walk passing through nearby bins and dog areas. Perfect for an evening walk without ending far from home.'}
        </p>
      </div>

      <form onSubmit={handleBuild} className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex-1 relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none"
            />
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder={locale === 'es' ? 'Calle Gran Vía 1, Madrid' : 'Calle Gran Vía 1, Madrid'}
              className="w-full pl-9 pr-3 py-2.5 border border-stone-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none"
            />
          </div>
          <button
            type="button"
            onClick={useMyLocation}
            className="border border-stone-300 hover:bg-stone-50 px-4 py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-2 text-stone-700"
          >
            <MapPin size={16} />
            {locale === 'es' ? 'Mi ubicación' : 'My location'}
          </button>
        </div>

        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-stone-500 mb-2">
            {locale === 'es' ? 'Duración del paseo' : 'Walk duration'}
          </div>
          <div className="flex bg-stone-100 rounded-lg p-1 text-sm">
            {DURATIONS.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDuration(d)}
                aria-pressed={duration === d}
                className={`flex-1 px-3 py-1.5 rounded-md font-medium transition-colors ${
                  duration === d
                    ? 'bg-white text-stone-900 shadow-sm'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {d} min
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={pending}
            className="flex-1 bg-brand-500 hover:bg-brand-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {pending ? <Loader2 size={16} className="animate-spin" /> : <Footprints size={16} />}
            {locale === 'es' ? 'Generar ruta' : 'Build route'}
          </button>
          {route && (
            <button
              type="button"
              onClick={reset}
              className="border border-stone-300 hover:bg-stone-50 px-3 py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-2 text-stone-700"
            >
              <RotateCcw size={16} />
              {locale === 'es' ? 'Limpiar' : 'Clear'}
            </button>
          )}
        </div>
      </form>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg px-3 py-2 text-sm flex items-center gap-2">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {route && (
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
          <div className="bg-brand-500 text-white p-4">
            <div className="flex items-baseline gap-3">
              <div className="text-3xl font-bold tabular-nums">
                {(route.distanceMeters / 1000).toFixed(1)}
              </div>
              <div className="text-sm opacity-90">km</div>
              <div className="text-3xl font-bold tabular-nums ml-2">{route.estimatedMinutes}</div>
              <div className="text-sm opacity-90">min</div>
            </div>
            <div className="text-xs opacity-90 mt-1">
              {route.source === 'osrm'
                ? locale === 'es'
                  ? 'Ruta peatonal calculada con OSRM (calles reales)'
                  : 'Walking route via OSRM (street-level)'
                : locale === 'es'
                ? 'Ruta aproximada (línea recta entre puntos)'
                : 'Approximate route (straight line between points)'}
            </div>
          </div>
          <div className="p-4">
            <div className="flex gap-4 text-sm mb-3">
              <div className="flex items-center gap-1.5">
                <Trash2 size={14} className="text-brand-600" />
                <span className="font-bold tabular-nums">{route.papelerasCount}</span>
                <span className="text-stone-600">
                  {locale === 'es' ? 'papeleras' : 'bins'}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Dog size={14} className="text-green-700" />
                <span className="font-bold tabular-nums">{route.areasCount}</span>
                <span className="text-stone-600">
                  {locale === 'es' ? 'áreas caninas' : 'dog areas'}
                </span>
              </div>
            </div>
            <ol className="space-y-2 text-sm">
              {route.waypoints.slice(1).map((wp, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-3 p-2 rounded-lg hover:bg-stone-50"
                >
                  <span className="bg-brand-500 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center font-bold tabular-nums shrink-0">
                    {idx + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-stone-900 truncate">{wp.label}</div>
                    <div className="text-xs text-stone-500">
                      {wp.type === 'area'
                        ? locale === 'es'
                          ? 'Área canina'
                          : 'Dog area'
                        : locale === 'es'
                        ? 'Papelera'
                        : 'Bin'}
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      )}
    </div>
  )
}
