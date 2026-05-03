import { useState } from 'react'
import { Search, MapPin, Loader2, AlertCircle, Lock, Wind, Share2, Download } from 'lucide-react'
import type { Datasets, Locale } from '../types'
import { t } from '../i18n'
import { scoreBarrio } from '../services/scoring'
import { useGeolocation } from '../hooks/useGeolocation'
import { assessStation, nearestStation, AIR_LEVEL_COLORS, AIR_LEVEL_LABELS } from '../services/air'
import { generateShareCard } from '../services/shareCard'
import { PapeleraIcon, AreaCaninaIcon, ParqueIcon, VetIcon } from './icons/CustomIcons'

const EXAMPLES = [
  'Plaza Mayor, Centro',
  'Calle de Alcalá 100, Salamanca',
  'Parque del Retiro',
  'Calle Doctor Esquerdo, Moratalaz',
  'Avenida de la Albufera 50, Vallecas',
]

const INGREDIENTS: { key: 'papeleras' | 'areas' | 'parques' | 'vets'; weight: number }[] = [
  { key: 'papeleras', weight: 40 },
  { key: 'areas', weight: 30 },
  { key: 'parques', weight: 20 },
  { key: 'vets', weight: 10 },
]

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
  excelente: '#3d6e3a',
  bueno: '#7a8a2a',
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

  async function runSearch(query?: string) {
    const q = (query ?? address).trim()
    if (!q) return
    if (query !== undefined) setAddress(query)
    setPending(true)
    setError(null)
    try {
      const result = await geocode(q)
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

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    runSearch()
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

      {!point && !pending && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <article className="rounded-2xl bg-stone-50 border border-stone-900/10 p-5">
            <div className="text-[11px] uppercase tracking-[0.2em] font-bold text-brand-600">
              {t(locale, 'barrio.empty.ingredients.eyebrow')}
            </div>
            <h2 className="text-lg font-extrabold text-madrono-700 mt-1.5 tracking-tight">
              {t(locale, 'barrio.empty.ingredients.title')}
            </h2>
            <ul className="mt-4 space-y-3">
              {INGREDIENTS.map(({ key, weight }) => {
                const icon =
                  key === 'papeleras' ? <PapeleraIcon size={16} /> :
                  key === 'areas' ? <AreaCaninaIcon size={16} /> :
                  key === 'parques' ? <ParqueIcon size={16} /> :
                  <VetIcon size={16} />
                const tone =
                  key === 'papeleras' ? 'bg-brand-100 text-brand-700' :
                  key === 'areas' ? 'bg-verde-100 text-verde-700' :
                  key === 'parques' ? 'bg-madrono-100 text-madrono-700' :
                  'bg-brand-100 text-brand-700'
                return (
                  <li key={key} className="flex items-center gap-3">
                    <span className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${tone}`} aria-hidden>
                      {icon}
                    </span>
                    <span className="flex-1 text-sm text-stone-800">
                      {t(locale, `barrio.empty.ingredients.${key}` as 'barrio.empty.ingredients.papeleras')}
                    </span>
                    <span className="text-sm font-bold tabular-nums text-madrono-700">
                      {weight} pts
                    </span>
                  </li>
                )
              })}
            </ul>
            <p className="text-xs text-stone-500 mt-4 leading-relaxed">
              {t(locale, 'barrio.empty.ingredients.note')}
            </p>
          </article>

          <article className="rounded-2xl bg-brand-50 border border-brand-100 p-5">
            <div className="text-[11px] uppercase tracking-[0.2em] font-bold text-brand-700">
              {t(locale, 'barrio.empty.examples.eyebrow')}
            </div>
            <h2 className="text-lg font-extrabold text-madrono-700 mt-1.5 tracking-tight">
              {t(locale, 'barrio.empty.examples.title')}
            </h2>
            <p className="text-xs text-stone-600 mt-2 leading-relaxed">
              {t(locale, 'barrio.empty.examples.lede')}
            </p>
            <div className="flex flex-wrap gap-2 mt-4">
              {EXAMPLES.map((ex) => (
                <button
                  key={ex}
                  type="button"
                  onClick={() => runSearch(ex)}
                  className="text-xs font-medium px-3 py-1.5 rounded-full bg-white border border-brand-100 text-stone-800 hover:bg-brand-500 hover:text-white hover:border-brand-500 transition-colors"
                >
                  {ex}
                </button>
              ))}
            </div>
          </article>
        </div>
      )}

      {point && main && score5 && score15 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="text-sm text-stone-600 truncate flex-1 min-w-0">{point.label}</div>
            <ShareButton
              score={main}
              locale={locale}
            />
          </div>

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
                <Row n={row.s.areasCaninas} label={t(locale, 'barrio.areas')} dot="#3d6e3a" />
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

function ShareButton({
  score,
  locale,
}: {
  score: import('../types').BarrioScore
  locale: Locale
}) {
  const [busy, setBusy] = useState<'share' | 'download' | null>(null)
  const [done, setDone] = useState<'shared' | 'downloaded' | null>(null)

  const canShare =
    typeof navigator !== 'undefined' &&
    typeof (navigator as Navigator & { share?: unknown }).share === 'function'

  async function shareNative() {
    setBusy('share')
    setDone(null)
    try {
      const blob = await generateShareCard({ score, locale })
      const file = new File([blob], 'mi-barrio-canino.png', { type: 'image/png' })
      const distrito = score.distrito || 'Madrid'
      const text =
        locale === 'es'
          ? `Mi barrio canino (${distrito}): ${score.scoreOver100}/100 — ${score.papeleras} papeleras, ${score.areasCaninas} áreas caninas, ${score.parques} parques cerca. https://madrono-perruno.vercel.app`
          : `My Madrid dog neighbourhood (${distrito}): ${score.scoreOver100}/100 — ${score.papeleras} bins, ${score.areasCaninas} dog areas, ${score.parques} parks nearby. https://madrono-perruno.vercel.app`
      const nav = navigator as Navigator & {
        canShare?: (data: ShareData) => boolean
        share?: (data: ShareData) => Promise<void>
      }
      if (nav.canShare?.({ files: [file] }) && nav.share) {
        await nav.share({ files: [file], title: 'Madroño Perruno', text })
      } else if (nav.share) {
        await nav.share({ title: 'Madroño Perruno', text })
      }
      setDone('shared')
    } catch (err) {
      console.error(err)
    } finally {
      setBusy(null)
      setTimeout(() => setDone(null), 3000)
    }
  }

  async function downloadPng() {
    setBusy('download')
    setDone(null)
    try {
      const blob = await generateShareCard({ score, locale })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'mi-barrio-canino.png'
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
      setDone('downloaded')
    } catch (err) {
      console.error(err)
    } finally {
      setBusy(null)
      setTimeout(() => setDone(null), 3000)
    }
  }

  const baseCls =
    'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border disabled:opacity-50'

  return (
    <div className="flex gap-2">
      {canShare && (
        <button
          type="button"
          onClick={shareNative}
          disabled={busy !== null}
          className={`${baseCls} border-brand-500 bg-brand-500 hover:bg-brand-600 text-white`}
        >
          {busy === 'share' ? <Loader2 size={14} className="animate-spin" /> : <Share2 size={14} />}
          <span>
            {done === 'shared'
              ? locale === 'es' ? '¡Compartido!' : 'Shared!'
              : locale === 'es' ? 'Compartir' : 'Share'}
          </span>
        </button>
      )}
      <button
        type="button"
        onClick={downloadPng}
        disabled={busy !== null}
        className={`${baseCls} border-stone-300 hover:bg-stone-100 text-stone-700`}
      >
        {busy === 'download' ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
        <span>
          {done === 'downloaded'
            ? locale === 'es' ? 'Descargado' : 'Downloaded'
            : locale === 'es' ? 'Descargar' : 'Download'}
        </span>
      </button>
    </div>
  )
}
