import { useEffect, useState } from 'react'
import { fetchReports, submitReport, type BinReportsSummary } from '../../services/reports'
import { formatRelativeTime } from '../reportsTime'
import { t } from '../../i18n'
import type { Locale } from '../../types'

interface Props {
  binId: string
  locale: Locale
}

type Flash = { kind: 'ok' | 'error'; text: string } | null

export default function PapeleraReportForm({ binId, locale }: Props) {
  const [summary, setSummary] = useState<BinReportsSummary | null>(null)
  const [busy, setBusy] = useState(false)
  const [flash, setFlash] = useState<Flash>(null)

  async function load() {
    try {
      const s = await fetchReports(binId)
      setSummary(s)
    } catch {
      setSummary({ binId, reports: [], count: 0, latest: null })
    }
  }

  useEffect(() => {
    setSummary(null)
    setFlash(null)
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [binId])

  async function vote(hasBags: boolean) {
    setFlash(null)
    setBusy(true)
    const result = await submitReport(binId, hasBags)
    if ('error' in result) {
      setFlash({
        kind: 'error',
        text:
          result.error === 'rate_limited'
            ? t(locale, 'participar.papeleraRateLimit')
            : t(locale, 'participar.papeleraError'),
      })
      setBusy(false)
      return
    }
    setFlash({ kind: 'ok', text: t(locale, 'participar.papeleraThanks') })
    await load()
    setTimeout(() => setBusy(false), 600)
  }

  const yesCount = summary?.reports.filter((r) => r.hasBags).length ?? 0
  const noCount = (summary?.reports.length ?? 0) - yesCount

  return (
    <div className="flex flex-col gap-3">
      <div>
        <div className="text-xs font-semibold text-stone-700 mb-1.5">
          {t(locale, 'participar.papeleraRecentReports')}
        </div>
        {summary === null ? (
          <div className="text-xs text-stone-400">{t(locale, 'participar.loading')}</div>
        ) : summary.latest === null ? (
          <div className="text-xs text-stone-400 italic">
            {t(locale, 'participar.papeleraNoReports')}
          </div>
        ) : (
          <div className="flex flex-col gap-1.5">
            <div
              className={`flex items-center justify-between rounded-md px-2 py-1.5 text-xs border-l-2 ${
                summary.latest.hasBags
                  ? 'bg-emerald-50 border-emerald-500'
                  : 'bg-rose-50 border-rose-500'
              }`}
            >
              <span className="text-[11px] text-stone-500">
                {formatRelativeTime(summary.latest.ts, locale)}
              </span>
              <span className="font-medium text-stone-800">
                {summary.latest.hasBags
                  ? t(locale, 'participar.papeleraHasBags')
                  : t(locale, 'participar.papeleraNoBags')}
              </span>
            </div>
            <div className="flex items-center gap-3 text-[11px] text-stone-500 px-1">
              <span className="text-emerald-600 font-medium">✓ {yesCount}</span>
              <span className="text-rose-600 font-medium">✗ {noCount}</span>
              <span>· {summary.reports.length}</span>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2 border-t border-stone-100 pt-3">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => vote(true)}
            disabled={busy}
            className="flex-1 px-3 py-1.5 rounded-md text-xs font-medium border border-emerald-200 bg-white text-emerald-700 hover:bg-emerald-50 disabled:opacity-50 transition-colors"
          >
            {t(locale, 'participar.papeleraHasBags')}
          </button>
          <button
            type="button"
            onClick={() => vote(false)}
            disabled={busy}
            className="flex-1 px-3 py-1.5 rounded-md text-xs font-medium border border-rose-200 bg-white text-rose-700 hover:bg-rose-50 disabled:opacity-50 transition-colors"
          >
            {t(locale, 'participar.papeleraNoBags')}
          </button>
        </div>
        {flash && (
          <div
            className={`text-xs ${
              flash.kind === 'ok' ? 'text-emerald-600' : 'text-rose-600'
            }`}
            role="status"
          >
            {flash.text}
          </div>
        )}
      </div>
    </div>
  )
}

