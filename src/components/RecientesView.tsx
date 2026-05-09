import { useEffect, useRef, useState } from 'react'
import {
  Activity,
  ChevronLeft,
  ChevronRight,
  Loader2,
  MapPin,
  RefreshCw,
  ThumbsUp,
  ThumbsDown,
  AlertCircle,
  CheckCircle,
} from 'lucide-react'
import type { Locale } from '../types'
import { t } from '../i18n'
import { fetchFeed, type FeedEntry } from '../services/feed'
import { formatRelativeTime } from './reportsTime'

interface Props {
  locale: Locale
}

const POLL_INTERVAL_MS = 30_000
const PAGE_SIZE = 20

export default function RecientesView({ locale }: Props) {
  const [entries, setEntries] = useState<FeedEntry[] | null>(null)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const headerRef = useRef<HTMLDivElement>(null)

  async function load(targetPage = page) {
    setRefreshing(true)
    try {
      const res = await fetchFeed(PAGE_SIZE, targetPage * PAGE_SIZE)
      setEntries(res.entries)
      setTotal(res.total)
      setError(null)
    } catch {
      setError(t(locale, 'recientes.error'))
    } finally {
      setRefreshing(false)
    }
  }

  // Initial load + reload when page changes
  useEffect(() => {
    load(page)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page])

  // Auto-refresh only on the first page so older pages don't shift under the user
  useEffect(() => {
    if (page !== 0) return
    const id = setInterval(() => load(0), POLL_INTERVAL_MS)
    return () => clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page])

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const canPrev = page > 0
  const canNext = page < totalPages - 1

  function goTo(next: number) {
    const clamped = Math.max(0, Math.min(totalPages - 1, next))
    if (clamped === page) return
    setPage(clamped)
    headerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const pageInfo = t(locale, 'recientes.pageInfo')
    .replace('{page}', String(page + 1))
    .replace('{total}', String(totalPages))

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <header ref={headerRef} className="mb-5 sm:mb-7 scroll-mt-4">
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
        <div className="mt-3 flex items-center gap-3 text-xs text-stone-500 flex-wrap">
          <button
            type="button"
            onClick={() => load(page)}
            disabled={refreshing}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-stone-200 bg-white hover:bg-stone-50 disabled:opacity-50 transition-colors"
          >
            <RefreshCw size={12} className={refreshing ? 'animate-spin' : ''} />
            {t(locale, 'recientes.refresh')}
          </button>
          <span>
            {page === 0
              ? t(locale, 'recientes.autorefresh')
              : t(locale, 'recientes.autorefreshPaused')}
          </span>
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
        <>
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

          {totalPages > 1 && (
            <nav
              className="mt-6 flex items-center justify-between gap-3"
              aria-label="Pagination"
            >
              <button
                type="button"
                onClick={() => goTo(page - 1)}
                disabled={!canPrev || refreshing}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-stone-200 bg-white text-sm text-stone-700 hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={14} />
                {t(locale, 'recientes.prev')}
              </button>
              <span className="text-xs text-stone-500" aria-live="polite">
                {pageInfo}
              </span>
              <button
                type="button"
                onClick={() => goTo(page + 1)}
                disabled={!canNext || refreshing}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-stone-200 bg-white text-sm text-stone-700 hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {t(locale, 'recientes.next')}
                <ChevronRight size={14} />
              </button>
            </nav>
          )}
        </>
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
