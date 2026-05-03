import { useEffect, useState } from 'react'
import {
  fetchComments,
  submitComment,
  type Comment,
  type EntityType,
} from '../../services/comments'
import { formatRelativeTime } from '../reportsTime'
import { t } from '../../i18n'
import type { Locale } from '../../types'

interface Props {
  entityType: EntityType
  entityId: string
  locale: Locale
  meta?: { name?: string; lat?: number; lng?: number; distrito?: string }
}

type Sentiment = 'good' | 'bad' | null
type Flash = { kind: 'ok' | 'error'; text: string } | null

export default function EntityCommentForm({ entityType, entityId, locale, meta }: Props) {
  const [comments, setComments] = useState<Comment[] | null>(null)
  const [chosen, setChosen] = useState<Sentiment>(null)
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)
  const [flash, setFlash] = useState<Flash>(null)

  async function load() {
    try {
      const summary = await fetchComments(entityType, entityId)
      setComments(summary.comments)
    } catch {
      setComments([])
    }
  }

  useEffect(() => {
    setComments(null)
    setChosen(null)
    setText('')
    setFlash(null)
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entityType, entityId])

  async function send() {
    setFlash(null)
    if (!chosen) {
      setFlash({ kind: 'error', text: t(locale, 'participar.commentSelectFirst') })
      return
    }
    setBusy(true)
    const result = await submitComment(entityType, entityId, chosen, text, meta)
    if ('error' in result) {
      setFlash({
        kind: 'error',
        text:
          result.error === 'rate_limited'
            ? t(locale, 'participar.commentRateLimit')
            : t(locale, 'participar.commentError'),
      })
      setBusy(false)
      return
    }
    setFlash({ kind: 'ok', text: t(locale, 'participar.commentThanks') })
    setText('')
    setChosen(null)
    await load()
    setTimeout(() => setBusy(false), 600)
  }

  const goodActive = chosen === 'good'
  const badActive = chosen === 'bad'

  return (
    <div className="flex flex-col gap-3">
      <div>
        <div className="text-xs font-semibold text-stone-700 mb-1.5">
          {t(locale, 'participar.recentComments')}
        </div>
        {comments === null ? (
          <div className="text-xs text-stone-400">{t(locale, 'participar.loading')}</div>
        ) : comments.length === 0 ? (
          <div className="text-xs text-stone-400 italic">
            {t(locale, 'participar.noComments')}
          </div>
        ) : (
          <ul className="flex flex-col gap-1.5 max-h-48 overflow-y-auto pr-1">
            {comments.map((c, i) => (
              <li
                key={`${c.ts}-${i}`}
                className={`text-xs rounded-md border-l-2 px-2 py-1.5 ${
                  c.sentiment === 'good'
                    ? 'bg-emerald-50 border-emerald-500'
                    : 'bg-rose-50 border-rose-500'
                }`}
              >
                <div className="flex items-center gap-1.5 text-[11px] text-stone-500">
                  <span>{c.sentiment === 'good' ? '👍' : '👎'}</span>
                  <span>{formatRelativeTime(c.ts, locale)}</span>
                </div>
                {c.text && <div className="mt-0.5 text-stone-800">{c.text}</div>}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex flex-col gap-2 border-t border-stone-100 pt-3">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setChosen(goodActive ? null : 'good')}
            aria-pressed={goodActive}
            disabled={busy}
            className={`flex-1 px-3 py-1.5 rounded-md text-xs font-medium border transition-colors ${
              goodActive
                ? 'bg-emerald-500 text-white border-emerald-500'
                : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
            }`}
          >
            {t(locale, 'participar.commentGood')}
          </button>
          <button
            type="button"
            onClick={() => setChosen(badActive ? null : 'bad')}
            aria-pressed={badActive}
            disabled={busy}
            className={`flex-1 px-3 py-1.5 rounded-md text-xs font-medium border transition-colors ${
              badActive
                ? 'bg-rose-500 text-white border-rose-500'
                : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
            }`}
          >
            {t(locale, 'participar.commentBad')}
          </button>
        </div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={140}
          rows={2}
          placeholder={t(locale, 'participar.commentPlaceholder')}
          disabled={busy}
          className="w-full px-2.5 py-1.5 rounded-md border border-stone-200 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 disabled:bg-stone-50"
        />
        <button
          type="button"
          onClick={send}
          disabled={busy}
          className="self-end px-3 py-1.5 rounded-md bg-brand-500 text-white text-xs font-medium hover:bg-brand-600 disabled:opacity-50 transition-colors"
        >
          {t(locale, 'participar.commentSubmit')}
        </button>
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
