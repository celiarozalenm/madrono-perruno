import { useEffect, useState } from 'react'
import { Activity, Loader2, MapPin, RefreshCw, ThumbsUp, ThumbsDown, AlertCircle, CheckCircle } from 'lucide-react'
import type { Locale } from '../types'
import { t } from '../i18n'
import { fetchFeed, type FeedEntry } from '../services/feed'
import { formatRelativeTime } from './reportsTime'

interface Props {
  locale: Locale
}

const POLL_INTERVAL_MS = 30_000

export default function RecientesView({ locale }: Props) {
  const [entries, setEntries] = useState<FeedEntry[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  async function load() {
    setRefreshing(true)
    try {
      const res = await fetchFeed(50)
      setEntries(res.entries)
      setError(null)
    } catch {
      setError(t(locale, 'recientes.error'))
    } finally {
      setRefreshing(false)
    }
  }

  useEffect(() => {
    load()
    const id = setInterval(load, POLL_INTERVAL_MS)
    return () => clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <header className="mb-5 sm:mb-7">
        <div className="flex items-center gap-2 text-brand-700 mb-2">
          <Activity size={18} />
          <span className="uppercase tracking-[0.18em] text-[11px] font-bold">
            {t(locale, 'recientes.tag')}
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 leading-tight">
          {t(locale, 'recientes.title')}
        </h1>
        <p className="text-sm sm:text-base text-stone-600 mt-2 max-w-xl">
          {t(locale, 'recientes.lede')}
        </p>
        <div className="mt-3 flex items-center gap-3 text-xs text-stone-500">
          <button
            type="button"
            onClick={load}
            disabled={refreshing}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-stone-200 bg-white hover:bg-stone-50 disabled:opacity-50 transition-colors"
          >
            <RefreshCw size={12} className={refreshing ? 'animate-spin' : ''} />
            {t(locale, 'recientes.refresh')}
          </button>
          <span>{t(locale, 'recientes.autorefresh')}</span>
        </div>
      </header>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 mb-4 flex items-center gap-2 text-sm text-red-700">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {entries === null ? (
        <div className="flex items-center justify-center gap-2 text-stone-500 py-16">
          <Loader2 className="animate-spin" size={18} />
          <span className="text-sm">{t(locale, 'recientes.loading')}</span>
        </div>
      ) : entries.length === 0 ? (
        <div className="rounded-xl bg-stone-50 border border-stone-200 px-6 py-10 text-center">
          <Activity className="mx-auto text-stone-400 mb-3" size={28} />
          <p className="text-stone-600 text-sm">{t(locale, 'recientes.empty')}</p>
        </div>
      ) : (
        <ul
          className="flex flex-col gap-2.5"
          aria-live="polite"
          aria-relevant="additions"
          aria-busy={refreshing}
        >
          {entries.map((e, idx) => (
            <FeedRow key={`${e.kind}-${e.id}-${e.ts}-${idx}`} entry={e} locale={locale} />
          ))}
        </ul>
      )}
    </div>
  )
}

function FeedRow({ entry, locale }: { entry: FeedEntry; locale: Locale }) {
  const meta = entry.meta
  const place = meta?.name
  const distrito = meta?.distrito

  if (entry.kind === 'report') {
    const positive = entry.hasBags
    return (
      <li className="rounded-xl border border-stone-200 bg-white px-4 py-3 flex gap-3 items-start">
        <div
          className={`shrink-0 mt-0.5 w-9 h-9 rounded-full flex items-center justify-center ${
            positive ? 'bg-verde-100 text-verde-700' : 'bg-red-100 text-red-700'
          }`}
        >
          {positive ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-bold uppercase tracking-wider text-brand-700">
              {t(locale, 'recientes.kind.papelera')}
            </span>
            <span
              className={`text-xs font-semibold ${
                positive ? 'text-verde-700' : 'text-red-700'
              }`}
            >
              {positive
                ? t(locale, 'recientes.report.hasBags')
                : t(locale, 'recientes.report.noBags')}
            </span>
            <span className="text-xs text-stone-400">·</span>
            <span className="text-xs text-stone-500">
              {formatRelativeTime(entry.ts, locale)}
            </span>
          </div>
          <div className="text-sm text-stone-800 mt-1 truncate">
            {place ?? t(locale, 'recientes.unknownPlace')}
          </div>
          {distrito && (
            <div className="flex items-center gap-1 text-xs text-stone-500 mt-0.5">
              <MapPin size={11} />
              {distrito}
            </div>
          )}
        </div>
      </li>
    )
  }

  // comment
  const good = entry.sentiment === 'good'
  const kindLabel =
    entry.entityType === 'parque'
      ? t(locale, 'recientes.kind.parque')
      : entry.entityType === 'area'
        ? t(locale, 'recientes.kind.area')
        : t(locale, 'recientes.kind.fuente')

  return (
    <li className="rounded-xl border border-stone-200 bg-white px-4 py-3 flex gap-3 items-start">
      <div
        className={`shrink-0 mt-0.5 w-9 h-9 rounded-full flex items-center justify-center ${
          good ? 'bg-verde-100 text-verde-700' : 'bg-red-100 text-red-700'
        }`}
      >
        {good ? <ThumbsUp size={18} /> : <ThumbsDown size={18} />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[11px] font-bold uppercase tracking-wider text-brand-700">
            {kindLabel}
          </span>
          <span className="text-xs text-stone-400">·</span>
          <span className="text-xs text-stone-500">
            {formatRelativeTime(entry.ts, locale)}
          </span>
        </div>
        <div className="text-sm text-stone-800 mt-1 truncate">
          {place ?? t(locale, 'recientes.unknownPlace')}
        </div>
        {distrito && (
          <div className="flex items-center gap-1 text-xs text-stone-500 mt-0.5">
            <MapPin size={11} />
            {distrito}
          </div>
        )}
        {entry.text && (
          <div
            className={`mt-2 text-sm rounded-md px-3 py-2 border-l-2 ${
              good
                ? 'bg-verde-50 border-verde-500 text-stone-800'
                : 'bg-red-50 border-red-500 text-stone-800'
            }`}
          >
            “{entry.text}”
          </div>
        )}
      </div>
    </li>
  )
}
