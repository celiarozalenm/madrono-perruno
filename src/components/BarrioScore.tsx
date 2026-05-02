import { useState } from 'react'
import { Search, MapPin, Loader2, AlertCircle, Lock, Wind } from 'lucide-react'
import type { Datasets, Locale } from '../types'
import { t } from '../i18n'
import { scoreBarrio } from '../services/scoring'
import { useGeolocation } from '../hooks/useGeolocation'
import { assessStation, nearestStation, AIR_LEVEL_COLORS, AIR_LEVEL_LABELS } from '../services/air'

interface Props {
  data: Datasets
  locale: Locale
  onLocate: (coords: { lat: number; lng: number }) => void
}

interface Geocoded {
  lat: number
  lng: number
  label: string
}

const SCORE_COLOR: Record<string, string> = {
  excelente: '#2f7d3a',
  bueno: '#65a30d',
  mejorable: '#d97706',
  pobre: '#b8431b',
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

export default function BarrioScore({ data, locale, onLocate }: Props) {
  const [address, setAddress] = useState('')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [point, setPoint] = useState<Geocoded | null>(null)
  const geo = useGeolocation()

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (!address.trim()) return
    setPending(true)
    setError(null)
    try {
      const result = await geocode(address.trim())
      if (!result) {
        setError(locale === 'es' ? 'No se ha encontrado esa dirección' : 'Address not found')
        return
      }
      setPoint(result)
      onLocate({ lat: result.lat, lng: result.lng })
    } catch {
      setError(locale === 'es' ? 'Error buscando la dirección' : 'Search error')
    } finally {
      setPending(false)
    }
  }

  function useMyLocation() {
    geo.request()
  }

  if (geo.coords && (!point || (point.lat !== geo.coords.lat && point.lng !== geo.coords.lng))) {
    setPoint({ ...geo.coords, label: locale === 'es' ? 'Mi ubicación' : 'My location' })
    onLocate(geo.coords)
  }

  const score5 = point ? scoreBarrio(point, data, 5) : null
  const score10 = point ? scoreBarrio(point, data, 10) : null
  const score15 = point ? scoreBarrio(point, data, 15) : null
  const main = score10

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6 space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">{t(locale, 'barrio.title')}</h1>
        <p className="text-sm text-stone-600 mt-1">{t(locale, 'barrio.intro')}</p>
        <div className="text-xs text-stone-500 mt-2 flex items-start gap-1.5">
          <Lock size={12} className="mt-0.5 shrink-0" />
          <span>{t(locale, 'barrio.privacy')}</span>
        </div>
      </div>

      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2">
        <label className="sr-only" htmlFor="address-input">
          {t(locale, 'barrio.address')}
        </label>
        <div className="flex-1 relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none"
          />
          <input
            id="address-input"
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder={t(locale, 'barrio.placeholder')}
            className="w-full pl-9 pr-3 py-2.5 border border-stone-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none"
          />
        </div>
        <button
          type="submit"
          disabled={pending}
          className="bg-brand-500 hover:bg-brand-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {pending ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
          {t(locale, 'barrio.search')}
        </button>
        <button
          type="button"
          onClick={useMyLocation}
          className="border border-stone-300 hover:bg-stone-50 px-4 py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-2 text-stone-700"
        >
          <MapPin size={16} />
          {t(locale, 'btn.locate')}
        </button>
      </form>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg px-3 py-2 text-sm flex items-center gap-2">
          <AlertCircle size={16} /> {error}
        </div>
      )}
      {geo.error && !error && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-lg px-3 py-2 text-sm flex items-center gap-2">
          <AlertCircle size={16} /> {geo.error}
        </div>
      )}

      {point && main && score5 && score15 && (
        <div className="space-y-4">
          <div className="text-sm text-stone-600 truncate">{point.label}</div>

          <div
            className="rounded-2xl p-5 text-white shadow-lg"
            style={{ background: SCORE_COLOR[main.scoreLabel] ?? '#ed731f' }}
          >
            <div className="flex items-end gap-3">
              <div className="text-5xl font-bold tabular-nums">{main.scoreOver100}</div>
              <div className="text-lg pb-1">/ 100</div>
            </div>
            <div className="text-base font-medium mt-1">
              {t(locale, `barrio.label.${main.scoreLabel}` as 'barrio.label.bueno')}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { label: t(locale, 'barrio.within5'), s: score5 },
              { label: t(locale, 'barrio.within10'), s: score10 },
              { label: t(locale, 'barrio.within15'), s: score15 },
            ].map((row) => (
              <div
                key={row.label}
                className="bg-white rounded-xl border border-stone-200 p-4 space-y-2"
              >
                <div className="text-xs font-semibold uppercase tracking-wide text-stone-500">
                  {row.label}
                </div>
                <Row n={row.s.papeleras} label={t(locale, 'barrio.papeleras')} dot="#ed731f" />
                <Row n={row.s.areasCaninas} label={t(locale, 'barrio.areas')} dot="#2f7d3a" />
                <Row n={row.s.parques} label={t(locale, 'barrio.parques')} dot="#5b3a1e" />
              </div>
            ))}
          </div>

          <div className="bg-white rounded-xl border border-stone-200 p-4 text-sm text-stone-700">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-700" aria-hidden />
              <span className="font-medium">{main.veterinariosDistrito}</span>
              <span>{t(locale, 'barrio.vets')}</span>
            </div>
          </div>

          {/* Air quality at the nearest station to the searched point */}
          {(() => {
            const station = nearestStation(point, data.air)
            if (!station) return null
            const a = assessStation(station)
            return (
              <div
                className="rounded-xl border p-4 text-sm flex items-start gap-3"
                style={{
                  background: AIR_LEVEL_COLORS[a.level] + '14',
                  borderColor: AIR_LEVEL_COLORS[a.level] + '55',
                }}
              >
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center text-white shrink-0"
                  style={{ background: AIR_LEVEL_COLORS[a.level] }}
                >
                  <Wind size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <span className="font-semibold text-stone-900">
                      {locale === 'es' ? 'Calidad del aire' : 'Air quality'}:
                    </span>
                    <span
                      className="font-bold"
                      style={{ color: AIR_LEVEL_COLORS[a.level] }}
                    >
                      {AIR_LEVEL_LABELS[a.level][locale]}
                    </span>
                    {a.driverLabel && (
                      <span className="text-xs text-stone-600">
                        ({a.driverLabel} {a.driverValue} {a.driverUnits})
                      </span>
                    )}
                  </div>
                  <div className="text-stone-700 mt-1">
                    {locale === 'es' ? a.message : a.messageEn}
                  </div>
                  <div className="text-xs text-stone-500 mt-1.5">
                    {locale === 'es' ? 'Estación más cercana: ' : 'Nearest station: '}
                    {station.name}
                  </div>
                </div>
              </div>
            )
          })()}
        </div>
      )}
    </div>
  )
}

function Row({ n, label, dot }: { n: number; label: string; dot: string }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <span
        className="w-2.5 h-2.5 rounded-full shrink-0"
        style={{ background: dot }}
        aria-hidden
      />
      <span className="font-medium tabular-nums w-8 text-right">{n}</span>
      <span className="text-stone-600 truncate">{label}</span>
    </div>
  )
}
